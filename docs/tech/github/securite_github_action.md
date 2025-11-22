# **Architecture de Sécurité Avancée pour GitHub Actions : Stratégies de Défense en Profondeur et Gouvernance des Pipelines CI/CD**

## **Résumé Exécutif**

L'évolution des pratiques DevOps a transformé le pipeline d'Intégration Continue et de Déploiement Continu (CI/CD) en une infrastructure critique, agissant comme le système nerveux central de la production logicielle moderne. GitHub Actions, en raison de son intégration native et de sa flexibilité événementielle, est devenu un standard industriel. Cependant, cette ubiquité s'accompagne d'une surface d'attaque considérablement élargie. Une compromission au niveau du workflow ne représente plus simplement une interruption de service ; elle constitue une passerelle directe vers les environnements cloud, un vecteur de contamination de la chaîne logistique logicielle (Supply Chain Attack) et un point de pivot idéal pour les mouvements latéraux au sein du réseau d'entreprise.  
Ce rapport propose une analyse exhaustive de la posture de sécurité nécessaire pour opérer GitHub Actions à l'échelle. Il dépasse les simples listes de contrôle pour examiner la mécanique profonde des vulnérabilités, telles que les injections de scripts via l'interpolation de contextes, les subtilités de l'escalade de privilèges via les dépôts "forkés", et les impératifs architecturaux liés à l'identité fédérée (OIDC). L'analyse s'appuie sur des données techniques, la documentation officielle et des recherches en sécurité offensives pour définir une doctrine de défense rigoureuse.

## **1\. Le Paysage des Menaces dans l'Écosystème CI/CD**

La sécurité d'une implémentation GitHub Actions est déterminée par la convergence de trois vecteurs critiques : l'intégrité de la définition du workflow (le code YAML), la sécurité de l'environnement d'exécution (le runner), et la fiabilité des dépendances tierces (les Actions). Historiquement, les efforts de sécurité se concentraient sur l'environnement de production ("Right of the boom"). Désormais, les attaquants ont opéré un "Shift Left" stratégique. En compromettant le pipeline CI/CD, les adversaires peuvent injecter du code malveillant avant même que le logiciel ne soit signé ou déployé, rendant caduques les protections en aval.  
Dans le contexte spécifique de GitHub Actions, les menaces primaires se catégorisent ainsi :

1. **Exfiltration de Secrets :** Le vol de clés API, d'identifiants cloud ou de certificats de signature stockés dans les secrets du dépôt.1
2. **Détournement de Ressources (Cryptojacking) :** L'utilisation illicite de la puissance de calcul des runners pour le minage de cryptomonnaies, souvent via des Pull Requests malveillantes sur des projets publics.2
3. **Altération de Code (Code Tampering) :** L'injection de portes dérobées (backdoors) dans les artefacts de construction durant le processus de compilation, invisible lors de la revue de code statique.
4. **Mouvement Latéral :** L'exploitation des privilèges élevés du système CI/CD (souvent administrateur sur le cloud) pour pivoter vers des environnements AWS, Azure ou GCP.2

Il est impératif de comprendre que le pipeline CI/CD possède souvent les "clés du royaume". Une compromission ici équivaut à une compromission totale de l'infrastructure de production.

## **2\. Gestion des Entrées et Vulnérabilités d'Injection de Script**

L'une des vulnérabilités les plus pernicieuses et pourtant les plus répandues dans les workflows GitHub Actions est l'injection de script. Cette classe de vulnérabilité émerge d'une incompréhension fondamentale de la manière dont GitHub évalue les expressions de workflow (${{... }}) par rapport à la manière dont les scripts shell exécutent les commandes.

### **2.1 La Mécanique de l'Évaluation et de la Substitution**

Les workflows GitHub Actions sont définis en YAML. Lorsqu'une exécution de workflow est déclenchée, l'orchestrateur de GitHub analyse ce fichier. Un point crucial, souvent ignoré par les développeurs, est que la substitution des expressions se produit _avant_ que le script ne soit transmis au shell du runner pour exécution. Si un utilisateur contrôle une variable—telle que le titre d'une Pull Request, le corps d'une issue, ou le nom d'une branche—et que cette variable est interpolée directement dans une commande shell, l'utilisateur peut échapper au contexte de la chaîne de caractères et exécuter des commandes arbitraires.4  
Considérons la configuration vulnérable suivante, identifiée fréquemment dans les audits de sécurité 4 :

YAML

\- name: Vérifier le titre de la PR  
 run: |  
 title="${{ github.event.pull\_request.title }}"  
 if \[\[ $title \=\~ ^octocat \]\]; then  
 echo "Titre Valide"  
 fi

Dans ce scénario, le développeur présume que le titre est une simple chaîne alphanumérique. Cependant, un attaquant peut créer une Pull Request avec le titre spécifiquement forgé : a"; ls $GITHUB_WORKSPACE".  
Puisque GitHub substitue la valeur _avant_ que le shell ne la voie, le runner reçoit et exécute la commande suivante :

Bash

title="a"; ls $GITHUB_WORKSPACE""

Le shell interprète le premier guillemet comme la fermeture de la chaîne, exécute ls $GITHUB_WORKSPACE (révélant le contenu du répertoire, et potentiellement des fichiers sensibles), puis continue. Un attaquant sophistiqué remplacerait ls par des commandes pour exfiltrer le contenu des variables d'environnement (incluant potentiellement le GITHUB_TOKEN ou d'autres secrets) vers un serveur externe via curl.4

### **2.2 Stratégies de Mitigation par Variables d'Environnement Intermédiaires**

L'architecture défensive requise pour neutraliser cette vulnérabilité consiste à découpler l'injection de données de la génération de script. En mappant les entrées non fiables à des variables d'environnement intermédiaires, la donnée est stockée dans la mémoire du processus du runner et référencée en tant que variable par le shell. Cela empêche structurellement le shell d'interpréter le contenu comme du code exécutable.4  
L'implémentation sécurisée de l'exemple précédent se présente ainsi :

YAML

\- name: Vérifier le titre de la PR  
 env:  
 TITLE: ${{ github.event.pull\_request.title }}  
 run: |  
 if\]; then  
 echo "Titre Valide"  
 fi

Dans cette configuration durcie, si l'attaquant envoie la charge utile malveillante, la variable d'environnement TITLE contiendra simplement la chaîne littérale a"; ls $GITHUB_WORKSPACE". Le shell traite cela comme de la donnée brute, neutralisant l'attaque. Ce principe de "sanitization" par l'environnement doit s'appliquer à toutes les entrées non fiables, incluant github.event.issue.body, github.event.pull_request.head.ref, et github.event.comment.body.4

### **2.3 Injections dans les Actions Personnalisées**

Le risque ne se limite pas aux scripts "inline". Il s'étend aux Actions Personnalisées (Custom Actions) et aux Actions Composites. Si une action personnalisée accepte une entrée et la passe à une commande shell via des fonctions comme exec() sans sanitization adéquate, elle crée une vulnérabilité en aval pour chaque utilisateur de cette Action.1 Les directives de l'OWASP et la documentation de sécurité de GitHub recommandent fortement l'utilisation d'actions JavaScript qui traitent les valeurs de contexte comme des arguments typés plutôt que de générer des scripts shell, car le passage d'arguments est intrinsèquement plus sûr contre les attaques par expansion de shell.1

## **3\. Gestion des Déclencheurs et le Risque de "Pwn Request"**

La distinction entre les événements pull_request et pull_request_target est sans doute l'aspect le plus mal compris et le plus dangereux de la sécurité GitHub Actions. Une mauvaise configuration de ces déclencheurs dans des dépôts publics est la cause principale des attaques par escalade de privilèges, souvent désignées sous le terme de "Pwn Requests".

### **3.1 Le Modèle de Sécurité des Forks**

Dans un dépôt public, le modèle open-source permet à quiconque de "forker" le code, de le modifier, et de soumettre une Pull Request (PR). Pour empêcher des PR malveillantes de voler des secrets (comme AWS_SECRET_KEY) ou de corrompre le dépôt, GitHub impose des restrictions strictes par défaut sur les workflows déclenchés par des événements pull_request provenant de forks :

1. **Jeton en Lecture Seule :** Le GITHUB_TOKEN fourni au runner possède des permissions strictement limitées à la lecture.
2. **Absence de Secrets :** Le runner n'a aucun accès aux secrets configurés dans le dépôt.7

Ce modèle est efficace pour les tests d'intégration standard (CI). Cependant, il échoue pour les tâches opérationnelles nécessitant des droits d'écriture, comme l'ajout automatique de labels, le commentaire par un bot, ou le déploiement d'environnements de prévisualisation.

### **3.2 La Dangerosité Intrinsèque de pull_request_target**

Pour répondre à ce besoin, GitHub a introduit pull_request_target. Ce déclencheur exécute le workflow dans le contexte du dépôt **de base** (la cible), et non dans le contexte du commit de fusion. Par conséquent, il confère des privilèges considérablement accrus :

- Il a accès aux secrets du dépôt cible.
- Il utilise un GITHUB_TOKEN avec des permissions de lecture/écriture.7

La vulnérabilité critique survient lorsqu'un développeur utilise pull_request_target (pour obtenir les privilèges) mais effectue ensuite un checkout du code provenant de la PR entrante (code non fiable).  
**Le Scénario d'Attaque "Pwn Request" :**

1. Un dépôt possède un workflow utilisant pull_request_target pour exécuter un linter ou une étape de build.
2. Le workflow inclut une étape \- uses: actions/checkout avec une référence explicite au code de l'attaquant : ref: ${{ github.event.pull\_request.head.sha }}.
3. L'attaquant forke le dépôt et modifie des fichiers exécutés lors du build, comme le Makefile, ou les scripts preinstall dans package.json. Le script malveillant est conçu pour afficher le GITHUB_TOKEN ou envoyer les secrets vers un serveur externe.8
4. L'attaquant ouvre une PR.
5. Le workflow se déclenche dans le contexte _cible_ (privilégié), récupère le code de l'attaquant, et exécute le script de build malveillant.
6. L'attaquant obtient un accès en écriture au dépôt ou exfiltre les identifiants cloud.

Il est crucial de noter que GitHub met à jour le comportement de pull_request_target pour réduire certains risques liés aux règles de protection de branche d'environnement, mais le risque fondamental lié à l'exécution de code non fiable demeure.10

### **3.3 Stratégies de Mitigation et Architecture workflow_run**

Pour prévenir les "Pwn Requests", les organisations doivent adhérer strictement à des frontières architecturales concernant le contexte et les privilèges.  
**Tableau 1 : Comparaison des Déclencheurs de Workflow et Risques Associés**

| Déclencheur         | Contexte d'Exécution  | Accès aux Secrets | Privilèges du Token | Cas d'Usage Recommandé          | Niveau de Risque                                   |
| :------------------ | :-------------------- | :---------------- | :------------------ | :------------------------------ | :------------------------------------------------- |
| pull_request        | Merge Commit (Test)   | Non               | Lecture Seule       | CI/CD, Tests unitaires, Linting | **Faible** (Sécurisé pour les forks)               |
| pull_request_target | Dépôt de Base (Cible) | Oui               | Lecture/Écriture    | Labeling, Triage, Commentaires  | **Critique** (Extrêmement dangereux avec checkout) |
| workflow_run        | Branche par Défaut    | Oui               | Lecture/Écriture    | Traitement des artefacts de PR  | **Moyen** (Sécurisé si les entrées sont validées)  |

La Méthode Privilégiée : Le Modèle workflow_run  
L'approche recommandée par les experts en sécurité 9 consiste à séparer les contextes privilégiés et non privilégiés en deux workflows distincts :

1. **Workflow 1 (Non Fiable) :** Déclenché par pull_request. Il exécute le build/test sur le code non fiable. Il ne possède aucun secret et un accès en lecture seule. Il génère des résultats (ex: rapport de couverture, fichier de linting) et les upload en tant qu'artefact.
2. **Workflow 2 (Privilégié) :** Déclenché par workflow_run (spécifiquement, à la complétion du Workflow 1). Ce workflow s'exécute dans le contexte de la branche par défaut avec des privilèges complets. Il télécharge l'artefact sécurisé du Workflow 1 et le traite (ex: poster un commentaire avec le résumé des tests). Puisqu'il n'exécute jamais le code de la PR, le risque est neutralisé.

Si l'utilisation de pull_request_target est inévitable (par exemple pour du labeling simple), le workflow ne doit **jamais** effectuer de checkout ou exécuter de code provenant de la PR. Il doit opérer uniquement sur les métadonnées de la PR via l'API GitHub.8

## **4\. Gestion de l'Identité et Fédération OIDC**

La gestion des identifiants est la colonne vertébrale de la sécurité du pipeline. La méthode traditionnelle consistant à stocker des identifiants à longue durée de vie (comme les Clés d'Accès AWS) dans les Secrets GitHub constitue un anti-patron introduisant un risque opérationnel majeur.

### **4.1 Le Risque des Secrets Statiques**

Stocker AWS_ACCESS_KEY_ID et AWS_SECRET_ACCESS_KEY en tant que secrets de dépôt crée une surface d'attaque statique. Si un workflow est compromis (via injection ou détournement de runner), ces clés peuvent être exfiltrées. Une fois volées, elles restent valides jusqu'à leur rotation manuelle—un processus souvent négligé jusqu'à ce qu'une brèche soit détectée.11 De plus, bien que les secrets soient masqués dans les logs, ce masquage est imparfait. Les données structurées (JSON) utilisées comme secrets échouent souvent à la rédaction automatique, et des attaquants sophistiqués peuvent manipuler la sortie pour contourner les filtres (par exemple, en encodant le secret en base64 ou en insérant des espaces).1

### **4.2 OpenID Connect (OIDC) et l'Authentification Sans Clé**

Le standard moderne pour l'authentification cloud dans GitHub Actions est OpenID Connect (OIDC). Ce mécanisme élimine efficacement le besoin de secrets à longue durée de vie.  
**Le Mécanisme OIDC dans GitHub Actions :**

1. **Relation de Confiance :** Un administrateur configure le fournisseur cloud (AWS, Azure, GCP) pour faire confiance au Fournisseur d'Identité OIDC de GitHub (token.actions.githubusercontent.com).12
2. **Demande de Jeton :** Lorsqu'un workflow s'exécute, il demande un Jeton Web JSON (JWT) à GitHub. Ce jeton est signé cryptographiquement et contient des "claims" (revendications) sur le workflow (nom du dépôt, branche, événement déclencheur, acteur).
3. **Échange :** Le workflow envoie ce JWT au fournisseur cloud.
4. **Vérification :** Le fournisseur cloud valide la signature et les claims (ex: "Le sujet repo:mon-org/mon-repo:ref:refs/heads/main est-il autorisé à assumer ce rôle?").
5. **Accès :** Si la validation réussit, le fournisseur cloud émet un jeton d'accès temporaire à courte durée de vie au runner.3

Pour activer cela, le workflow doit impérativement posséder la permission id-token: write.11

YAML

permissions:  
 id-token: write  
 contents: read

steps:  
 \- name: Configurer les Identifiants AWS  
 uses: aws-actions/configure-aws-credentials@v4  
 with:  
 role-to-assume: arn:aws:iam::123456789012:role/mon-role-github  
 aws-region: us-east-1

Cette approche garantit que même si un runner est compromis, l'attaquant n'obtient qu'un jeton qui expire automatiquement (généralement sous une heure) et qui est strictement scopé aux permissions du rôle assumé.14

### **4.3 Le Principe de Moindre Privilège (GITHUB_TOKEN)**

Le GITHUB_TOKEN par défaut est généré automatiquement pour chaque exécution. Historiquement, ce jeton possédait des permissions étendues de Lecture/Écriture. Cela signifiait qu'un workflow compromis pouvait pousser du code, créer des releases ou modifier les paramètres du dépôt.  
Les organisations doivent appliquer le principe de **Moindre Privilège** en définissant les permissions par défaut des workflows sur read-only au niveau de l'organisation ou du dépôt.1 Au sein du YAML, les permissions doivent être déclarées explicitement. Si un job a seulement besoin de lire le contenu, il ne doit pas avoir accès en écriture aux issues ou aux déploiements :

YAML

\# Bonne Pratique : Définition explicite des permissions minimales  
permissions:  
 contents: read  
 pull-requests: write \# Uniquement si nécessaire pour commenter

Cette pratique limite drastiquement le "rayon d'explosion" (blast radius) si le jeton est récupéré par un attaquant.17

## **5\. Sécurité de la Chaîne d'Approvisionnement : Le Dilemme des Dépendances**

Un workflow GitHub Actions est rarement un script autonome. Il est un assemblage d'Actions tierces (dépendances) tirées de la Marketplace GitHub. Cela introduit un risque majeur de chaîne d'approvisionnement (Supply Chain Risk). Si le mainteneur d'une Action populaire est compromis, ou s'il vend l'Action à un acteur malveillant, la mise à jour se propage instantanément à tous les consommateurs utilisant des tags mutables.

### **5.1 La Fallacie des Tags de Version**

La majorité des workflows référencent les Actions via des tags de version sémantique, tels que uses: actions/checkout@v3. Bien que pratique, cette méthode est dangereuse car les tags sont **mutables**. Un mainteneur peut déplacer le tag v3 d'un commit sûr vers un commit malveillant à tout moment. Il n'existe aucune garantie cryptographique que le code exécuté aujourd'hui soit le même que celui d'hier sous le même tag.20

### **5.2 Épinglage par SHA (Pinning) et Immuabilité**

La seule méthode garantissant l'immuabilité est d'épingler les Actions à leur SHA de commit complet. Le SHA est un hachage cryptographique de l'état du code ; il ne peut être falsifié sans générer une collision (ce qui est computationnellement infaisable dans ce contexte).20  
**Configuration Sécurisée :**

YAML

\- uses: actions/checkout@f43a0e5ff2bd294095638e18286ca9a3d1956744 \# v3.6.0

L'épinglage assure que même si le tag v3 est détourné ou le dépôt compromis, le workflow continue d'utiliser la version connue et vérifiée du code.20

### **5.3 Automatisation de la Gestion des Dépendances**

L'inconvénient de l'épinglage par SHA est que le workflow ne bénéficie plus automatiquement des correctifs de sécurité. Pour résoudre ce problème, les organisations doivent employer des outils d'automatisation comme **Dependabot** ou **Renovate**. Dependabot peut être configuré pour surveiller les Actions référencées. Lorsqu'une nouvelle version est publiée, Dependabot crée une Pull Request qui met à jour le SHA vers la nouvelle version. Cela offre le meilleur des deux mondes : la sécurité des références immuables et l'hygiène des mises à jour régulières.1  
**Tableau 2 : Méthodes de Référencement des Dépendances**

| Méthode     | Syntaxe                        | Sécurité                                    | Maintenabilité                               | Recommandation                             |
| :---------- | :----------------------------- | :------------------------------------------ | :------------------------------------------- | :----------------------------------------- |
| **Tag**     | uses: actions/checkout@v3      | **Faible** (Mutable, sujet au détournement) | **Élevée** (Mises à jour mineures auto)      | À éviter pour les workflows critiques      |
| **Branche** | uses: actions/checkout@main    | **Très Faible** (Instable et mutable)       | **Élevée** (Toujours à jour)                 | Ne jamais utiliser                         |
| **SHA**     | uses: actions/checkout@f43a... | **Élevée** (Immuable, vérifiable)           | **Faible** (Mises à jour manuelles requises) | **Fortement Recommandé** (avec Dependabot) |

## **6\. Sécurité de l'Infrastructure d'Exécution : Runners Hébergés vs Auto-Hébergés**

L'environnement où le code s'exécute—le runner—est une frontière de sécurité critique. GitHub propose deux modes principaux : les runners hébergés par GitHub et les runners auto-hébergés (Self-hosted). Les implications de sécurité de ce choix sont profondes.

### **6.1 Runners Hébergés par GitHub**

Les runners hébergés par GitHub sont des machines virtuelles (VM) éphémères. Pour chaque job, GitHub provisionne une VM vierge. Lorsque le job est terminé, la VM est détruite.

- **Isolation :** Élevée. Chaque job s'exécute dans un environnement propre.
- **Persistance :** Aucune. Les malwares ne peuvent persister entre les jobs.
- **Contamination croisée :** Impossible. Les données d'un client/job ne peuvent fuir vers un autre.18

### **6.2 Runners Auto-Hébergés et Risques de Persistance**

Les runners auto-hébergés sont des machines (VM ou serveurs physiques) gérées par l'utilisateur, connectées à GitHub via un agent. Ils sont persistants par défaut.  
**Risques de Sécurité Majeurs :**

1. **Persistance :** Si un workflow malveillant s'exécute sur un runner auto-hébergé, il peut installer des malwares, des portes dérobées ou des enregistreurs de frappe qui persistent pour les jobs futurs.18
2. **Mouvement Latéral :** Les runners auto-hébergés sont souvent déployés à l'intérieur du VPC de l'entreprise. Un runner compromis peut être utilisé comme tête de pont pour scanner le réseau interne, accéder aux bases de données, ou interroger les services de métadonnées cloud (ex: http://169.254.169.254) pour voler les identifiants de l'instance.23
3. **Évasion de Sandbox :** Contrairement aux VM éphémères, les runners auto-hébergés utilisent souvent Docker ou une exécution shell locale. S'échapper d'une action conteneurisée vers l'OS hôte est un vecteur d'attaque viable.

Le Danger des Dépôts Publics :  
La documentation avertit explicitement : Ne jamais utiliser de runners auto-hébergés sur des dépôts publics.24 Dans un dépôt public, n'importe quel fork peut déclencher un workflow. Si ce workflow s'exécute sur un runner auto-hébergé, l'attaquant obtient effectivement un accès shell à un serveur situé à l'intérieur de votre réseau privé.

### **6.3 Durcissement des Runners Auto-Hébergés**

Si des runners auto-hébergés sont requis (par exemple pour du matériel spécialisé ou un accès réseau privé), ils doivent être durcis :

- **Mode Éphémère :** Utiliser des runners "Just-in-Time" (JIT) ou une automatisation qui réinitialise l'image du runner après chaque job pour imiter la nature éphémère des runners hébergés.18
- **Segmentation Réseau :** Isoler le runner dans une DMZ. Bloquer l'accès au service de métadonnées de l'instance et aux ressources internes, sauf si explicitement requis.
- **Groupes de Runners :** Utiliser des Groupes de Runners pour restreindre quels dépôts peuvent accéder à quels runners, empêchant un projet à faible sécurité d'accéder à un runner conçu pour le déploiement en production.24

## **7\. Menaces Avancées : Empoisonnement du Cache**

Un vecteur d'attaque moins évident mais hautement sophistiqué implique le cache de GitHub Actions (actions/cache). Le cache est utilisé pour stocker des dépendances (comme node_modules) afin d'accélérer les builds.  
Le Mécanisme :  
Les caches sont scopés par clé et par branche. Cependant, un workflow exécuté sur la branche par défaut peut typiquement lire les caches créés par d'autres branches. Plus critique encore, si un attaquant parvient à empoisonner une entrée de cache (par exemple, en injectant une bibliothèque malveillante dans node_modules et en la sauvegardant dans le cache), les exécutions de workflow ultérieures qui restaurent cette clé de cache ingéreront le code malveillant.26  
Mouvement Latéral via le Cache :  
La recherche indique que l'empoisonnement de cache peut faciliter le mouvement latéral. Si un workflow à faible privilège (susceptible à l'injection) est utilisé pour empoisonner le cache, un workflow de release à haut privilège qui partage la même portée de cache pourrait restaurer l'artefact empoisonné. Cela permet à l'attaquant de compromettre le processus de release sans avoir directement accès en écriture au fichier de workflow de release.6 Pour mitiger cela, il est crucial d'utiliser des clés de cache précises (hash de package-lock.json) et de se méfier de la restauration de caches dans des workflows hautement privilégiés si la clé a pu être générée par un processus moins fiable.

## **8\. Outillage Défensif, Audit et Analyse Statique**

Pour gérer la complexité de la sécurité GitHub Actions, les organisations doivent s'appuyer sur un outillage automatisé pour l'analyse statique et la protection à l'exécution.

### **8.1 Analyse Statique : Zizmor**

Zizmor est un outil d'analyse statique spécifiquement conçu pour auditer les workflows GitHub Actions. Il analyse les fichiers YAML pour identifier les modèles non sécurisés avant qu'ils ne soient commis.28  
Les capacités incluent la détection de :

- Risques d'injection de script (interpolation d'entrées utilisateur).
- Actions non épinglées (utilisation de tags mutables).
- Déclencheurs dangereux (pull_request_target).
- Secrets codés en dur.  
  Intégrer Zizmor dans le pipeline CI lui-même sert de barrière de qualité (Quality Gate), empêchant les configurations non sécurisées d'entrer dans la branche principale.30

### **8.2 Métriques de Santé de Sécurité : OSSF Scorecard**

L'**OpenSSF Scorecard** fournit une évaluation holistique de la sécurité des dépôts. Il évalue des heuristiques telles que l'activation de la protection de branche, l'épinglage des dépendances, et l'obligation de revue de code. L'implémentation de l'Action OSSF Scorecard permet aux organisations de surveiller leur posture de conformité en continu et de recevoir des alertes si le score de sécurité chute.32

### **8.3 Protection à l'Exécution : Harden-Runner**

Tandis que Zizmor analyse le code, **StepSecurity Harden-Runner** protège l'environnement d'exécution. Il agit comme un agent à l'intérieur du runner, surveillant les sorties réseau et l'activité des fichiers.35

- **Filtrage des Sorties (Egress Filtering) :** Il peut bloquer les connexions sortantes vers des domaines non autorisés. Si une attaque par injection de script tente de télécharger une charge utile depuis un serveur de commande et contrôle (C2), Harden-Runner peut bloquer la connexion.
- **Intégrité des Fichiers :** Il surveille les écrasements de fichiers, détectant potentiellement l'altération du code source ou des artefacts de build durant l'exécution du workflow.

## **9\. Gouvernance et Anti-Patrons**

Les contrôles techniques doivent être soutenus par une gouvernance organisationnelle. Les anti-patrons suivants sapent les efforts de sécurité et doivent être éliminés :

1. **Permissions "Allow All" :** Laisser les permissions par défaut du GITHUB_TOKEN en Lecture/Écriture dans les paramètres de l'organisation.17
2. **Secrets "Inline" :** Coder en dur des secrets dans le YAML ou le code, en supposant que le dépôt est privé. Les dépôts privés peuvent devenir publics, ou être accessibles par des contractants/collaborateurs.13
3. **Ignorer les CODEOWNERS :** Autoriser les changements dans .github/workflows sans revue spécifique de l'équipe sécurité ou DevOps. Le fichier CODEOWNERS doit mandater que tout changement aux définitions de pipeline nécessite l'approbation d'un groupe de sécurité désigné.1
4. **Réutilisation de Tokens :** Utiliser le même Personal Access Token (PAT) pour plusieurs workflows ou services. Si l'un est compromis, tous le sont. Privilégier OIDC ou les tokens d'application fine-grained.

Enfin, la **Protection de Branche** constitue la dernière ligne de défense. Elle garantit qu'aucun code n'entre dans la branche de production sans passer les vérifications nécessaires (revues de PR, passage des tests de sécurité Zizmor/CodeQL, restriction des droits de merge).

## **Conclusion**

Sécuriser GitHub Actions exige un changement de perspective radical : le pipeline CI/CD doit être traité comme un environnement de production critique, doté de ses propres protocoles de gestion d'identité, de sécurité réseau et de contrôle d'accès. La voie vers un pipeline durci implique la sanitization rigoureuse des entrées, la séparation stricte des privilèges, la fédération d'identité via OIDC, la rigueur dans la chaîne d'approvisionnement via l'épinglage par SHA, et une vigilance à l'exécution via des outils comme Zizmor et Harden-Runner. En implémentant ces garde-fous architecturaux, les organisations peuvent exploiter la puissance de l'automatisation GitHub Actions tout en neutralisant efficacement les risques de compromission de la chaîne logistique et de mouvement latéral.

#### **Sources des citations**

1. Secure use reference \- GitHub Docs, consulté le novembre 22, 2025, [https://docs.github.com/en/actions/reference/security/secure-use](https://docs.github.com/en/actions/reference/security/secure-use)
2. Github Actions Security Landscape \- OWASP, consulté le novembre 22, 2025, [https://owasp.org/www-chapter-minneapolis-st-paul/download/20240417_OWASP-MSP_Github_Actions_Security_Landscape.pdf](https://owasp.org/www-chapter-minneapolis-st-paul/download/20240417_OWASP-MSP_Github_Actions_Security_Landscape.pdf)
3. How to Configure GitHub Actions OIDC with AWS (Easy Tutorial) \- DevOpsCube, consulté le novembre 22, 2025, [https://devopscube.com/github-actions-oidc-aws/](https://devopscube.com/github-actions-oidc-aws/)
4. Script injections \- GitHub Docs, consulté le novembre 22, 2025, [https://docs.github.com/en/actions/concepts/security/script-injections](https://docs.github.com/en/actions/concepts/security/script-injections)
5. Keeping your GitHub Actions and workflows secure Part 2: Untrusted input, consulté le novembre 22, 2025, [https://securitylab.github.com/resources/github-actions-untrusted-input/](https://securitylab.github.com/resources/github-actions-untrusted-input/)
6. Keeping your GitHub Actions and workflows secure Part 4: New vulnerability patterns and mitigation strategies, consulté le novembre 22, 2025, [https://securitylab.github.com/resources/github-actions-new-patterns-and-mitigations/](https://securitylab.github.com/resources/github-actions-new-patterns-and-mitigations/)
7. Clarify why this needs pull_request_target, rather than \`pull_request\` · Issue \#121 · actions/labeler \- GitHub, consulté le novembre 22, 2025, [https://github.com/actions/labeler/issues/121](https://github.com/actions/labeler/issues/121)
8. pull_request_nightmare Part 1: Exploiting GitHub Actions for RCE and Supply Chain Attacks \- Orca Security, consulté le novembre 22, 2025, [https://orca.security/resources/blog/pull-request-nightmare-github-actions-rce/](https://orca.security/resources/blog/pull-request-nightmare-github-actions-rce/)
9. Keeping your GitHub Actions and workflows secure Part 1 ..., consulté le novembre 22, 2025, [https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/](https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/)
10. Actions pull_request_target and environment branch protections ..., consulté le novembre 22, 2025, [https://github.blog/changelog/2025-11-07-actions-pull_request_target-and-environment-branch-protections-changes/](https://github.blog/changelog/2025-11-07-actions-pull_request_target-and-environment-branch-protections-changes/)
11. Replacing AWS Access Keys with OIDC in GitHub Actions — A Hands-on Guide to Zero Rotation, consulté le novembre 22, 2025, [https://medium.com/@kunalparkhade/replacing-aws-access-keys-with-oidc-in-github-actions-a-hands-on-guide-to-zero-rotation-e528e3c06dcd](https://medium.com/@kunalparkhade/replacing-aws-access-keys-with-oidc-in-github-actions-a-hands-on-guide-to-zero-rotation-e528e3c06dcd)
12. Secure GitHub CI/CD: Use AWS IAM Roles with GitHub OIDC | by Fahim Fahad | JavaToDev, consulté le novembre 22, 2025, [https://medium.com/spring-boot/secure-github-ci-cd-use-aws-iam-roles-with-github-oidc-974090496850](https://medium.com/spring-boot/secure-github-ci-cd-use-aws-iam-roles-with-github-oidc-974090496850)
13. Best Practices for Managing Secrets in GitHub Actions | Blacksmith, consulté le novembre 22, 2025, [https://www.blacksmith.sh/blog/best-practices-for-managing-secrets-in-github-actions](https://www.blacksmith.sh/blog/best-practices-for-managing-secrets-in-github-actions)
14. OpenID Connect \- GitHub Docs, consulté le novembre 22, 2025, [https://docs.github.com/en/actions/concepts/security/openid-connect](https://docs.github.com/en/actions/concepts/security/openid-connect)
15. Configuring OpenID Connect in Azure \- GitHub Docs, consulté le novembre 22, 2025, [https://docs.github.com/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-azure](https://docs.github.com/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-azure)
16. How to Run OpenTofu Pipelines on GitHub Securely (No Access Keys\!), consulté le novembre 22, 2025, [https://medium.com/@sidharthvijayakumar7/how-to-run-opentofu-pipelines-on-github-securely-no-access-keys-f32a0ee52212](https://medium.com/@sidharthvijayakumar7/how-to-run-opentofu-pipelines-on-github-securely-no-access-keys-f32a0ee52212)
17. Secure use reference \- GitHub Enterprise Cloud Docs, consulté le novembre 22, 2025, [https://docs.github.com/en/enterprise-cloud@latest/actions/reference/security/secure-use](https://docs.github.com/en/enterprise-cloud@latest/actions/reference/security/secure-use)
18. Security hardening for GitHub Actions \- GitHub Enterprise Cloud Docs, consulté le novembre 22, 2025, [https://docs.github.com/enterprise-cloud@latest/enterprise-onboarding/github-actions-for-your-enterprise/security-hardening-for-github-actions](https://docs.github.com/enterprise-cloud@latest/enterprise-onboarding/github-actions-for-your-enterprise/security-hardening-for-github-actions)
19. Securing GitHub Actions Workflows, consulté le novembre 22, 2025, [https://wellarchitected.github.com/library/application-security/recommendations/actions-security/](https://wellarchitected.github.com/library/application-security/recommendations/actions-security/)
20. Pinning GitHub Actions for Enhanced Security: Everything You Should Know \- StepSecurity, consulté le novembre 22, 2025, [https://www.stepsecurity.io/blog/pinning-github-actions-for-enhanced-security-a-complete-guide](https://www.stepsecurity.io/blog/pinning-github-actions-for-enhanced-security-a-complete-guide)
21. Why you should pin your GitHub Actions by commit-hash \- Rafael Gonzaga, consulté le novembre 22, 2025, [https://blog.rafaelgss.dev/why-you-should-pin-actions-by-commit-hash](https://blog.rafaelgss.dev/why-you-should-pin-actions-by-commit-hash)
22. How do I pin an action to a specific SHA? \- Stack Overflow, consulté le novembre 22, 2025, [https://stackoverflow.com/questions/78903499/how-do-i-pin-an-action-to-a-specific-sha](https://stackoverflow.com/questions/78903499/how-do-i-pin-an-action-to-a-specific-sha)
23. Is it really unsafe to use a GitHub self-hosted runner on a own public repository if actions are only triggered on push on certain protected branch? \- Stack Overflow, consulté le novembre 22, 2025, [https://stackoverflow.com/questions/77179987/is-it-really-unsafe-to-use-a-github-self-hosted-runner-on-a-own-public-repositor](https://stackoverflow.com/questions/77179987/is-it-really-unsafe-to-use-a-github-self-hosted-runner-on-a-own-public-repositor)
24. Securing Your CI/CD Pipeline: Exploring the Dangers of Self-Hosted Runners, consulté le novembre 22, 2025, [https://www.legitsecurity.com/blog/securing-your-ci/cd-pipeline-exploring-the-dangers-of-self-hosted-agents](https://www.legitsecurity.com/blog/securing-your-ci/cd-pipeline-exploring-the-dangers-of-self-hosted-agents)
25. Adding self-hosted runners \- GitHub Docs, consulté le novembre 22, 2025, [https://docs.github.com/actions/hosting-your-own-runners/adding-self-hosted-runners](https://docs.github.com/actions/hosting-your-own-runners/adding-self-hosted-runners)
26. GitHub Cache Poisoning \- Scribe Blog, consulté le novembre 22, 2025, [https://scribesecurity.com/blog/github-cache-poisoning/](https://scribesecurity.com/blog/github-cache-poisoning/)
27. Mitigating Attack Vectors in GitHub Workflows \- Open Source Security Foundation, consulté le novembre 22, 2025, [https://openssf.org/blog/2024/08/12/mitigating-attack-vectors-in-github-workflows/](https://openssf.org/blog/2024/08/12/mitigating-attack-vectors-in-github-workflows/)
28. GitHub Actions Security. Zizmor auto-fixes for the win\! | by Mostafa Moradian | Medium, consulté le novembre 22, 2025, [https://mostafa.dev/github-actions-security-04cd056ea9c4](https://mostafa.dev/github-actions-security-04cd056ea9c4)
29. zizmorcore/zizmor: Static analysis for GitHub Actions, consulté le novembre 22, 2025, [https://github.com/zizmorcore/zizmor](https://github.com/zizmorcore/zizmor)
30. How to detect vulnerable GitHub Actions at scale with Zizmor | Grafana Labs, consulté le novembre 22, 2025, [https://grafana.com/blog/2025/06/26/how-to-detect-vulnerable-github-actions-at-scale-with-zizmor/](https://grafana.com/blog/2025/06/26/how-to-detect-vulnerable-github-actions-at-scale-with-zizmor/)
31. GitHub action security: zizmor \- Ned Batchelder, consulté le novembre 22, 2025, [https://nedbatchelder.com/blog/202410/github_action_security_zizmor.html](https://nedbatchelder.com/blog/202410/github_action_security_zizmor.html)
32. GitHub Actions Advisor \- StepSecurity, consulté le novembre 22, 2025, [https://docs.stepsecurity.io/actions/github-actions-advisor](https://docs.stepsecurity.io/actions/github-actions-advisor)
33. OpenSSF Scorecard \- Security health metrics for Open Source \- GitHub, consulté le novembre 22, 2025, [https://github.com/ossf/scorecard](https://github.com/ossf/scorecard)
34. OSSF Scorecard action \- GitHub Marketplace, consulté le novembre 22, 2025, [https://github.com/marketplace/actions/ossf-scorecard-action](https://github.com/marketplace/actions/ossf-scorecard-action)
35. step-security/harden-runner: Harden-Runner is a CI/CD ... \- GitHub, consulté le novembre 22, 2025, [https://github.com/step-security/harden-runner](https://github.com/step-security/harden-runner)
