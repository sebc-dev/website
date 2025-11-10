# **Rapport d'Expertise : Maîtriser l'Écosystème d'Extension de Claude Code – Un Guide Stratégique pour Développeurs**

## **Introduction : Au-delà des Prompts – Une Architecture pour l'Expertise Agentique**

Claude Code se distingue des assistants de codage traditionnels en se positionnant non pas comme une simple fenêtre de dialogue, mais comme un environnement de développement agentique, composable et extensible. Il est conçu pour s'intégrer profondément dans le terminal et l'IDE, là où les développeurs travaillent déjà, en adoptant la philosophie Unix de composabilité et de scriptabilité.1 Pour atteindre ce niveau d'intégration, Claude Code propose un écosystème d'extension articulé autour de quatre piliers fondamentaux : les commandes personnalisées (Custom Commands), les compétences (Skills), les sous-agents (Subagents) et les hooks.  
Ces quatre outils ne sont pas des fonctionnalités isolées ; ils forment un continuum architectural offrant différents niveaux de contrôle et d'autonomie.

- Les **Custom Commands** représentent l'automatisation manuelle, initiée par l'utilisateur, offrant un contrôle total et déterministe.2
- Les **Skills** incarnent le savoir-faire autonome, invoqué par l'agent lui-même en fonction du contexte, introduisant une dimension de raisonnement non déterministe.4
- Les **Subagents** permettent une délégation spécialisée, isolant des tâches complexes dans des contextes dédiés pour préserver la clarté de la conversation principale.6
- Les **Hooks** agissent comme des garde-fous déterministes, supervisant le processus de l'agent et appliquant des règles non négociables à des moments clés de son cycle de vie.8

L'ensemble de ces composants peut être packagé et distribué via des **Plugins**. Les plugins constituent le mécanisme de distribution unifié, permettant aux équipes de standardiser et de partager leurs configurations, workflows et meilleures pratiques, transformant ainsi Claude Code en un environnement de développement sur mesure.10  
Comprendre ce spectre, allant du contrôle manuel à l'autonomie agentique supervisée, est essentiel pour tout développeur ou architecte souhaitant exploiter pleinement le potentiel de Claude Code. Le choix de l'outil approprié pour une tâche donnée n'est pas une question de préférence, mais une décision architecturale qui dépend directement du niveau de contrôle humain, de déterminisme et d'autonomie requis.

## **Partie 1 : Les Outils d'Exécution de Tâches – Manuels et Autonomes**

Cette première partie se concentre sur les outils dont la fonction principale est de réaliser une tâche ou d'exécuter un workflow : les commandes, qui sont invoquées manuellement, et les compétences, qui sont utilisées de manière autonome par l'agent.

### **Section 1.1 : Custom Slash Commands – L'Automatisation à la Demande**

#### **Principe Fondamental**

Les commandes personnalisées (Custom Slash Commands) sont des raccourcis pour des prompts fréquemment utilisés, stockés sous forme de fichiers Markdown et invoqués manuellement par l'utilisateur via une syntaxe simple (/\<nom-de-la-commande\>). Elles fonctionnent comme des alias de shell ou des extraits de code (snippets), mais pour interagir avec l'IA, garantissant une exécution rapide et déterministe de tâches répétitives.2

#### **Architecture et Implémentation**

La mise en place des commandes personnalisées est simple et s'intègre naturellement dans un workflow de développement.

- **Structure de Fichiers** : Chaque commande est un fichier Markdown (.md). Le nom du fichier, sans l'extension, devient le nom de la commande invocable.2
- **Portée (Scope)** : Une distinction fondamentale réside dans leur portée, ce qui affecte leur disponibilité et leur mode de partage 3 :
  - **Commandes de Projet** : Situées dans le répertoire .claude/commands/ à la racine d'un projet, elles sont versionnées avec le code source via Git. Cela permet de les partager avec toute l'équipe, assurant que tous les membres disposent des mêmes workflows standardisés.
  - **Commandes Personnelles** : Situées dans \~/.claude/commands/ dans le répertoire personnel de l'utilisateur, elles sont disponibles dans tous les projets sur la machine de l'utilisateur, servant de raccourcis de productivité personnels.
- **Fonctionnalités Clés** :
  - **Arguments** : Pour rendre les commandes dynamiques, elles acceptent des arguments. Le placeholder $ARGUMENTS capture l'ensemble des arguments fournis, tandis que les placeholders positionnels ($1, $2, etc.) permettent un accès plus structuré, similaire aux scripts shell.2
  - **Frontmatter YAML** : Chaque fichier de commande peut inclure un en-tête YAML pour configurer ses métadonnées et son comportement. Les champs les plus importants incluent description (affichée dans l'aide /help), argument-hint (fournit des indications pour l'autocomplétion), allowed-tools (restreint les outils que la commande peut utiliser) et model (permet de forcer l'utilisation d'un modèle spécifique pour des tâches particulières).2
  - **Intégration Shell** : En préfixant une ligne par \!, il est possible d'exécuter une commande shell et d'injecter son résultat directement dans le contexte du prompt. Ceci est particulièrement puissant pour fournir un contexte dynamique à l'IA, comme l'état actuel de Git (\!git status).2

#### **Cas d'Usage Stratégiques**

- **Workflows Git** : Créer une commande /commit qui guide l'IA pour générer un message de commit respectant la norme "Conventional Commits" en analysant les changements (git diff).3
- **Scaffolding de Code** : Définir une commande /new-component \<name\> qui génère l'arborescence de fichiers standard pour un nouveau composant React, y compris le fichier de test et de style, assurant la cohérence à travers le projet.15
- **Checklists Standardisées** : Implémenter une commande /security-review @file.js qui instruit Claude d'appliquer une liste de vérification de sécurité prédéfinie au fichier spécifié, formalisant ainsi les revues de sécurité.3

#### **Exemple Concret : Commande /git-diff**

Un excellent exemple de la puissance des commandes est la création d'une commande /git-diff pour expliquer les changements en attente. Ce cas d'usage combine plusieurs fonctionnalités avancées.

| Élément                  | Contenu                                                                                                                                    |
| :----------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| **Nom du fichier**       | .claude/commands/git-diff.md                                                                                                               |
| **Frontmatter**          | \--- allowed-tools: Bash(git status:\*), Bash(git diff:\*), Bash(git log:\*) description: Explain the git diff \---                        |
| **Corps de la commande** | \# Context \- Current git status:\!git status \- Current git diff:\!git diff HEAD \# Task Based on the above changes, explain the git diff |

Source : 12  
Cette commande, lorsqu'elle est invoquée, exécute d'abord git status et git diff HEAD, injecte leurs sorties dans le prompt, puis demande à Claude de synthétiser ces informations. Le frontmatter allowed-tools est crucial ici, car il autorise explicitement l'exécution de ces commandes shell spécifiques.  
Les commandes personnalisées ne sont pas de simples prompts sauvegardés ; elles constituent une interface de programmation d'application (API) déterministe et versionnable que les développeurs construisent pour interagir avec l'IA. Un prompt en langage naturel tel que "fais un commit de mes changements" est sujet à l'interprétation de l'IA, qui peut varier à chaque exécution. En revanche, une commande /commit "feat: add user login" est un appel structuré. Le fichier commit.md sous-jacent contient des instructions précises et non ambiguës.14 En versionnant ces commandes dans Git, une équipe ne partage pas seulement du code, mais aussi un langage et des processus standardisés pour collaborer avec son copilote IA, ce qui est fondamental pour la maintenabilité et la scalabilité des workflows assistés par l'IA.

### **Section 1.2 : Agent Skills – Le Savoir-Faire Agentique et Autonome**

#### **Principe Fondamental**

Les compétences (Agent Skills) représentent un changement de paradigme par rapport aux commandes. Ce sont des "manuels d'instruction" ou des "recettes" que Claude peut découvrir et utiliser de manière autonome lorsqu'une tâche soumise par l'utilisateur correspond sémantiquement à la description de la compétence. Le mécanisme fondamental n'est pas un appel de fonction direct, mais une **expansion de prompt** et une **modification du contexte** : la compétence prépare l'agent à accomplir une tâche plutôt que de l'exécuter directement.4

#### **Architecture et Implémentation**

- **Structure de Dossiers** : Une compétence est un dossier. Son composant principal est le fichier SKILL.md, qui contient un frontmatter YAML et des instructions en Markdown. Ce dossier peut également inclure des sous-dossiers structurés : /scripts (pour le code exécutable), /references (pour les documents de référence) et /assets (pour les fichiers binaires comme les images ou les modèles).4
- **Mécanisme de Découverte et d'Invocation** : Le processus de sélection d'une compétence repose entièrement sur le raisonnement de l'LLM. Au début d'une session, Claude reçoit une liste de toutes les compétences disponibles, chacune représentée par son nom et sa description. Lorsqu'un utilisateur soumet une requête, Claude analyse cette liste et, s'il trouve une correspondance sémantique, il invoque l'outil Skill avec le nom de la compétence correspondante. Il n'y a pas de routage algorithmique, de classification d'intention ou de recherche par similarité vectorielle ; la décision est un pur acte de raisonnement linguistique.5
- **Le Rôle Crucial de la description** : La qualité et la clarté du champ description dans le frontmatter du SKILL.md sont le facteur le plus critique pour une invocation fiable. Une description bien rédigée doit indiquer explicitement ce que fait la compétence et, surtout, dans quel contexte elle doit être utilisée.5
- **Processus d'Exécution** : Une fois invoquée, la compétence injecte le contenu de son fichier SKILL.md dans l'historique de la conversation, comme s'il s'agissait d'un nouveau message de l'utilisateur. Cela enrichit le contexte de l'agent avec des instructions détaillées, des exemples et des procédures, le préparant à exécuter la tâche demandée avec une expertise nouvellement acquise.5

#### **Cas d'Usage Stratégiques**

- **Génération de Documents Complexes** : Créer des présentations PowerPoint, des feuilles de calcul Excel ou des documents Word qui respectent une charte graphique d'entreprise, en incluant des modèles, des polices et des logos spécifiques.4
- **Workflows Spécifiques à un Domaine** : Implémenter des processus métier complexes, comme l'analyse de données financières selon des ratios spécifiques, la génération de campagnes marketing suivant une méthodologie précise, ou l'application de procédures de conformité réglementaire.4
- **Encapsulation de Connaissances Complexes** : Intégrer la documentation d'une API interne ou d'un processus de déploiement complexe dans une compétence. Ainsi, un développeur peut simplement demander "déploie le service X en production" et Claude utilisera la compétence pour suivre la procédure exacte, sans nécessiter d'explication à chaque fois.21

#### **Exemple Concret : Skill brand-guidelines**

Imaginons une compétence nommée brand-guidelines. Son dossier contiendrait un fichier SKILL.md décrivant les couleurs primaires et secondaires, les typographies et les règles d'utilisation du logo de l'entreprise. Le sous-dossier /assets contiendrait les fichiers .png et .svg du logo. Lorsqu'un utilisateur demande "prépare une présentation sur les résultats trimestriels", Claude, voyant le mot "présentation", identifie la compétence brand-guidelines comme pertinente grâce à sa description ("À utiliser pour appliquer la charte graphique de l'entreprise aux documents et présentations"). Il l'invoque, chargeant ainsi les instructions et les ressources nécessaires pour générer un fichier PowerPoint parfaitement conforme à l'identité visuelle de l'entreprise.16  
Les compétences offrent une solution élégante au défi de la saturation de la fenêtre de contexte. Les systèmes d'IA sont limités par la quantité d'informations qu'ils peuvent traiter simultanément. Charger de vastes fichiers de contexte, comme un CLAUDE.md très détaillé, au début de chaque session consomme de précieux tokens et peut diluer l'attention du modèle sur la tâche immédiate.22 Les compétences implémentent une forme de **chargement paresseux (lazy loading) du contexte**. Au lieu de tout charger au départ, seule la brève description de chaque compétence est incluse dans le contexte initial.5 Ce n'est que lorsque l'agent détermine qu'une compétence spécifique est nécessaire que son contenu complet est injecté dans la conversation. Cette approche "juste-à-temps" permet de construire des agents dotés d'une base de connaissances potentielle très étendue, tout en maintenant un contexte de travail léger et focalisé, ce qui est une primitive architecturale essentielle pour la gestion de workflows longs et complexes.

### **Section 1.3 : Synthèse et Décision – Command vs. Skill**

La distinction fondamentale entre une commande et une compétence réside dans leur mode d'invocation : une commande est un outil **activé par l'utilisateur**, tandis qu'une compétence est une ressource **invoquée par l'agent**.23 Cette différence dicte leurs cas d'usage respectifs.  
Le tableau suivant synthétise les critères de décision pour choisir entre ces deux outils. Il constitue un guide pratique pour répondre à la question "quand utiliser quoi?".

| Critère                   | Custom Slash Command                                               | Agent Skill                                                               |
| :------------------------ | :----------------------------------------------------------------- | :------------------------------------------------------------------------ |
| **Mode d'Invocation**     | Manuel (par l'utilisateur via /\<commande\>)                       | Autonome (par l'agent IA basé sur la sémantique)                          |
| **Déterminisme**          | Élevé (toujours exécutée quand appelée)                            | Faible (dépend du raisonnement de l'IA pour l'invoquer)                   |
| **Cas d'Usage Principal** | Raccourcis, tâches répétitives, workflows déterministes            | Workflows complexes, encapsulation de connaissances, tâches contextuelles |
| **Gestion du Contexte**   | Injection ponctuelle pour un seul tour de conversation             | Chargement "juste-à-temps" du contexte pertinent                          |
| **Complexité Idéale**     | Faible à moyenne (une seule action ou un script linéaire)          | Moyenne à élevée (processus multi-étapes, raisonnement)                   |
| **Découvrabilité**        | L'utilisateur doit connaître la commande (via /help ou la mémoire) | L'agent découvre la compétence via sa description                         |

Il est également possible de combiner les deux approches pour obtenir le meilleur des deux mondes. On peut créer une commande personnalisée qui instruit explicitement Claude d'utiliser une compétence spécifique. Par exemple, une commande /generate-report pourrait contenir le prompt : "Utilise la compétence financial-reporting pour analyser les données dans le fichier @data.csv". Cela fournit un point d'entrée manuel et déterministe pour un workflow complexe et autonome, offrant à la fois contrôle et puissance.23

## **Partie 2 : Les Architectures d'Exécution – Spécialistes Isolés et Garde-fous Déterministes**

Cette seconde partie analyse les outils qui ne se contentent pas d'exécuter des tâches, mais qui structurent et contrôlent la manière dont elles sont exécutées. Il s'agit des sous-agents, qui permettent la spécialisation et l'isolation, et des hooks, qui imposent des règles et des garanties.

### **Section 2.1 : Subagents – L'Équipe de Spécialistes Dédiés**

#### **Principe Fondamental**

Les sous-agents (Subagents) sont des instances d'IA spécialisées et autonomes, chacune opérant dans sa propre fenêtre de contexte, isolée de la conversation principale. Ils peuvent être vus comme des "experts" ou des "travailleurs" auxquels l'agent principal (l'orchestrateur) délègue des tâches complexes. L'objectif principal est de préserver le contexte de l'agent principal de la "pollution" générée par les détails d'une tâche longue ou complexe, tout en permettant une spécialisation poussée.21

#### **Architecture et Implémentation**

- **Structure de Fichiers** : Tout comme les commandes, les sous-agents sont définis par des fichiers Markdown (.md) contenant un frontmatter YAML et un corps de texte. Le frontmatter définit le name, la description (essentielle pour la délégation), les tools autorisés et le model à utiliser. Le corps du fichier constitue le prompt système détaillé qui dote le sous-agent de son expertise.2
- **Portée** : Ils suivent la même logique de portée que les commandes, avec des agents de projet partageables dans .claude/agents/ et des agents personnels dans \~/.claude/agents/.6
- **Mécanisme de Délégation** : L'agent principal invoque un sous-agent via l'outil Task. La décision de déléguer une tâche peut être prise de manière autonome par l'agent principal si la requête de l'utilisateur correspond à la description d'un sous-agent disponible. L'utilisateur peut également forcer cette délégation de manière explicite (par exemple, "Utilise le sous-agent code-reviewer pour vérifier mes changements").7

#### **Cas d'Usage Stratégiques**

- **Analyse de Code Multi-fichiers** : Un sous-agent code-reviewer peut être chargé d'analyser l'ensemble des fichiers modifiés dans une Pull Request. Son contexte isolé lui permet de charger tous les fichiers pertinents et de raisonner sur leurs interactions sans surcharger la conversation principale de l'utilisateur.28
- **Refactoring Complexe** : Pour une tâche de refactoring d'une base de code legacy, un sous-agent refactor-expert peut se concentrer exclusivement sur cette mission, en gardant en mémoire toutes les dépendances et les impacts potentiels, une tâche qui serait trop "bruyante" pour le contexte principal.30
- **Parallélisation** : L'agent principal peut lancer plusieurs sous-agents en parallèle pour effectuer des recherches ou des analyses sur différents aspects d'un problème, puis synthétiser leurs résultats. Cela permet d'accélérer considérablement les tâches d'investigation.26

#### **Design Patterns Avancés**

- **Orchestration de Sous-agents (Chaining)** : Pour des workflows très complexes, il est possible de créer des chaînes de sous-agents où la sortie d'un agent devient l'entrée du suivant. Par exemple, un workflow de développement de fonctionnalité pourrait suivre la séquence : architect-reviewer (produit un plan d'architecture) → implementer-tester (écrit le code et les tests) → documentation-writer (met à jour la documentation).32
- **Pattern "Lead Agent / Specialist Agent"** : Une stratégie d'optimisation avancée consiste à utiliser un modèle puissant et coûteux (comme Claude 3.5 Opus) comme agent principal ("Lead Agent") pour décomposer un problème complexe en sous-tâches. Ces sous-tâches sont ensuite déléguées à des sous-agents utilisant des modèles plus rapides et moins chers (comme Claude 3.5 Sonnet ou Haiku), qui sont suffisants pour des tâches bien définies. Cette approche optimise à la fois les performances et les coûts.31

#### **Exemples Concrets**

Des collections de sous-agents open-source démontrent leur puissance. Par exemple, un agent tech-debt-finder-fixer peut orchestrer une analyse en deux phases : cinq agents parallèles analysent le code sous différents angles (duplication, complexité, code mort), puis des agents de correction spécialisés appliquent les refactorings de manière sécurisée.30 De même, un architect-reviewer peut analyser une architecture, détecter les anti-patterns et même générer des diagrammes visuels.28  
Le choix entre un sous-agent et une compétence est l'une des décisions architecturales les plus importantes dans Claude Code. Il ne s'agit pas simplement de la complexité de la tâche, mais de la **stratégie de gestion du contexte**. Une compétence **augmente** le contexte de l'agent principal en y injectant de nouvelles connaissances.5 C'est utile lorsque l'agent doit apprendre quelque chose de nouveau pour poursuivre la conversation. Un sous-agent, à l'inverse, **isole** le contexte.24 Il travaille dans une "boîte noire" et ne retourne que le résultat final, protégeant ainsi la conversation principale des détails intermédiaires. Cette distinction explique pourquoi, actuellement, les sous-agents ne peuvent pas utiliser de compétences : cela créerait un conflit de design en mélangeant isolation et augmentation.24 La bonne approche est que l'agent principal, en tant qu'orchestrateur, utilise une compétence pour acquérir un savoir, puis passe ce savoir en tant que contexte à un sous-agent pour exécution. Il faut donc choisir une compétence pour "enseigner" quelque chose à l'agent principal, et un sous-agent pour "déléguer" une tâche sans être distrait par son exécution.

### **Section 2.2 : Hooks – Les Garde-fous Déterministes du Workflow**

#### **Principe Fondamental**

Les hooks sont des déclencheurs automatiques qui exécutent des commandes shell à des points prédéfinis du cycle de vie de l'agent (par exemple, avant ou après l'utilisation d'un outil). Leur objectif principal est d'imposer un contrôle **déterministe** sur un système fondamentalement **probabiliste** (l'LLM). Ils transforment des "suggestions" polies dans un prompt en "actions garanties" par le système.8

#### **Architecture et Implémentation**

- **Configuration** : Les hooks sont définis dans les fichiers settings.json (avec une portée utilisateur, projet ou locale), ce qui permet de les partager et de les standardiser au sein d'une équipe.8
- **Événements Clés** : Le système de hooks s'articule autour d'événements spécifiques qui couvrent l'ensemble du cycle de vie de l'agent. Les plus importants sont 7 :
  - SessionStart : Au début d'une session, pour préparer l'environnement.
  - UserPromptSubmit : Avant que le prompt de l'utilisateur ne soit traité, pour validation ou injection de contexte.
  - PreToolUse : Avant qu'un outil (comme Edit ou Bash) ne soit exécuté, pour des contrôles de sécurité.
  - PostToolUse : Après qu'un outil a été exécuté avec succès, pour des actions de post-traitement.
  - Stop / SubagentStop : Lorsque l'agent principal ou un sous-agent a terminé sa tâche, pour des actions de finalisation.
- **Contrôle du Flux** : Les hooks ne sont pas de simples notifications ; ils peuvent activement influencer le workflow. En utilisant des codes de sortie spécifiques (par exemple, un code de sortie 2 est une erreur bloquante), un hook peut annuler une action (comme un PreToolUse bloquant une commande dangereuse), fournir un feedback correctif à l'IA, ou injecter du contexte supplémentaire.7

#### **Cas d'Usage Stratégiques**

- **Qualité du Code** : C'est le cas d'usage le plus courant. Un hook PostToolUse configuré pour s'exécuter après chaque utilisation des outils Edit ou Write peut automatiquement lancer un formateur de code comme Prettier ou Black, garantissant que tout le code produit par l'IA est conforme aux standards de l'équipe.8
- **Tests Automatisés** : De la même manière, un hook PostToolUse peut déclencher l'exécution des tests unitaires pertinents après la modification d'un fichier, fournissant un feedback immédiat sur d'éventuelles régressions.8
- **Intégration Git Avancée** : Des outils comme GitButler s'intègrent via les hooks pour automatiser entièrement le processus de gestion de branches et de commits. Des hooks sur PreToolUse, PostToolUse et Stop permettent à GitButler de suivre le travail de l'agent, d'isoler les changements dans des branches virtuelles et de générer des commits sophistiqués à la fin de la tâche.36
- **Sécurité** : Un hook PreToolUse peut agir comme un pare-feu. Il peut inspecter les commandes que l'agent s'apprête à exécuter et bloquer celles qui sont jugées dangereuses (comme rm \-rf) ou qui tentent d'accéder à des fichiers sensibles (comme .env ou package-lock.json).35

#### **Exemple Concret : Configuration d'un Hook de Formatage**

Voici un exemple de configuration JSON pour un hook qui formate automatiquement les fichiers TypeScript après chaque modification. Ce snippet serait placé dans le fichier .claude/settings.json du projet.

JSON

{  
 "hooks": {  
 "PostToolUse":\]; then prettier \--write \\"$CLAUDE_FILE_PATHS\\"; fi"  
 }  
 \]  
 }  
 \]  
 }  
}

Sources : 22  
Cet exemple montre comment le matcher cible spécifiquement les outils de modification de fichiers. La commande shell utilise ensuite la variable d'environnement $CLAUDE_FILE_PATHS fournie par Claude Code pour n'appliquer prettier qu'aux fichiers pertinents.  
Les hooks représentent la couche de gouvernance de l'écosystème Claude Code. Alors que les prompts et les instructions (dans les commandes ou les compétences) sont des suggestions que l'IA peut interpréter, les hooks sont des règles impératives. Ils permettent aux responsables techniques (engineering leaders) de traduire les politiques de l'équipe (standards de codage, procédures de sécurité, workflows de test) en automatismes non négociables. En déplaçant ces règles du domaine probabiliste du langage naturel vers le domaine déterministe des scripts shell, les hooks garantissent que, quelle que soit l'autonomie accordée à l'agent, les standards de qualité et de sécurité de l'équipe seront systématiquement respectés.8

## **Partie 3 : Le Cadre de Décision Holistique – Quand Utiliser Quoi?**

Après avoir analysé chaque outil individuellement, cette dernière partie synthétise les connaissances pour fournir un cadre de décision complet, permettant de choisir et d'orchestrer ces composants de manière stratégique.

### **Section 3.1 : Le Grand Tableau Comparatif**

Ce tableau offre une vue d'ensemble comparative des quatre outils, en les évaluant selon des axes de décision clés. Il sert de guide de référence rapide pour sélectionner l'outil le plus approprié en fonction des caractéristiques d'une tâche donnée.

| Axe de Décision           | Custom Slash Command                       | Agent Skill                                                       | Subagent                                                        | Hook                                                                      |
| :------------------------ | :----------------------------------------- | :---------------------------------------------------------------- | :-------------------------------------------------------------- | :------------------------------------------------------------------------ |
| **Déclencheur Principal** | Utilisateur (Manuel)                       | Agent IA (Autonome)                                               | Agent IA / Utilisateur                                          | Événement Système                                                         |
| **Déterminisme**          | Très Élevé                                 | Faible (Probabiliste)                                             | Moyen (Délégation)                                              | Très Élevé (Automatique)                                                  |
| **Gestion du Contexte**   | Injection Ponctuelle                       | Augmentation / Chargement "Just-in-Time"                          | Isolation Totale                                                | Injection / Validation                                                    |
| **Objectif Principal**    | Raccourci / Automatisation de tâche simple | Encapsulation de savoir-faire / Workflow complexe                 | Délégation de tâche complexe / Parallélisation                  | Application de règles / Contrôle déterministe                             |
| **Complexité Idéale**     | Faible                                     | Moyenne à Élevée                                                  | Élevée                                                          | Faible à Moyenne                                                          |
| **Métaphore**             | Alias de Shell                             | Manuel d'Instruction                                              | Expert Spécialisé                                               | Garde-fou / Trigger                                                       |
| **Quand l'utiliser?**     | Tâches fréquentes et déterministes.        | Processus réutilisables que l'IA doit appliquer contextuellement. | Tâches longues, multi-fichiers ou nécessitant un focus intense. | Pour imposer des standards (qualité, sécurité) de manière non négociable. |

### **Section 3.2 : Arbres de Décision et Scénarios d'Orchestration**

Pour aller au-delà d'une simple comparaison, les arbres de décision suivants proposent un cheminement logique pour guider le choix de l'outil.

#### **Arbre de Décision**

1. **L'action doit-elle être déclenchée manuellement par un utilisateur à un moment précis?**
   - **Oui** : Utiliser une **Custom Slash Command**. C'est l'outil idéal pour les actions à la demande.
2. **Si non, l'action doit-elle être une garantie absolue, appliquée systématiquement et indépendamment du raisonnement de l'IA?**
   - **Oui** : Utiliser un **Hook**. C'est le seul outil qui offre un contrôle déterministe basé sur des événements système.
3. **Si non, la tâche est-elle longue, nécessite-t-elle de manipuler de nombreux fichiers, ou risque-t-elle de "polluer" la conversation principale avec des détails superflus?**
   - **Oui** : Utiliser un **Subagent**. L'isolation du contexte est ici le critère déterminant.
4. **Sinon, la tâche représente-t-elle une connaissance, un processus ou une méthode que l'IA devrait connaître et appliquer de manière autonome lorsque le contexte est pertinent?**
   - **Oui** : Utiliser une **Skill**. C'est l'outil d'encapsulation de savoir-faire par excellence.

#### **Scénarios d'Orchestration Complexes**

La véritable puissance de l'écosystème de Claude Code se révèle dans l'orchestration de ces différents outils.

- **Scénario 1 : Développer une nouvelle fonctionnalité de A à Z**
  1. **Déclenchement** : Le développeur initie le processus avec une **Custom Slash Command** : /new-feature "Authentification utilisateur".
  2. **Planification** : La commande instruit l'agent principal de déléguer la phase d'architecture à un **Subagent** architect-reviewer. Ce dernier analyse les besoins et produit un plan détaillé.
  3. **Implémentation** : Une fois le plan validé par l'utilisateur, l'agent principal délègue la phase de codage à un **Subagent** implementer-tester.
  4. **Contrôle Qualité** : Pendant que le sous-agent implementer-tester modifie des fichiers, un **Hook** PostToolUse se déclenche à chaque écriture pour exécuter automatiquement le formateur de code (Prettier) et le linter (ESLint), garantissant la conformité du code en temps réel.
  5. **Savoir-faire Spécifique** : Si l'implémentation requiert la génération d'un rapport de conformité RGPD, le sous-agent peut demander à l'agent principal d'invoquer une **Skill** gdpr-report-generator, qui contient la connaissance et la procédure pour cette tâche spécifique.
  6. **Finalisation** : Lorsqu'un sous-agent termine sa mission, un **Hook** SubagentStop peut être utilisé pour envoyer une notification (par exemple, sur Slack) ou déclencher une action de suivi.
- **Scénario 2 : Standardiser les Pull Requests de l'équipe**
  1. **Déclenchement** : Un développeur utilise la commande /create-pr "fix: corriger le bug de connexion".
  2. **Validation** : Un **Hook** UserPromptSubmit intercepte la commande et valide que le message de commit fourni respecte bien le format "Conventional Commits". S'il n'est pas conforme, le hook bloque l'exécution et renvoie un message d'erreur à l'utilisateur.
  3. **Analyse** : La commande demande à l'agent principal de déléguer l'analyse du code modifié à un **Subagent** code-reviewer.
  4. **Savoir-faire** : Le sous-agent code-reviewer utilise une **Skill** team-coding-standards qui encapsule les guides de style et les meilleures pratiques de l'équipe pour effectuer sa revue.
  5. **Finalisation** : Le sous-agent retourne un résumé de la revue de code, que la commande /create-pr utilise ensuite pour remplir automatiquement la description de la Pull Request sur GitHub.

## **Conclusion : Vers une Maîtrise de la Programmation Agentique**

L'analyse approfondie de l'écosystème d'extension de Claude Code révèle une architecture sophistiquée qui va bien au-delà de la simple interaction par prompt. La maîtrise de cet environnement ne réside pas dans l'utilisation isolée d'un seul outil, mais dans leur orchestration intelligente. Le choix entre une commande, une compétence, un sous-agent ou un hook est une décision architecturale fondamentale qui doit être guidée par une analyse précise des besoins en matière de contrôle, d'autonomie, de déterminisme et de gestion du contexte.  
Pour une adoption efficace, une approche progressive est recommandée :

1. **Commencer par les Custom Commands** pour automatiser les tâches quotidiennes les plus fréquentes et se familiariser avec le système.
2. **Introduire les Hooks** pour garantir la qualité du code (formatage, linting), car ils offrent un retour sur investissement immédiat en matière de standardisation.
3. **Développer des Skills** pour encapsuler les connaissances et les processus les plus importants du projet, transformant progressivement Claude en un véritable expert du domaine.
4. **Utiliser les Subagents** pour les workflows les plus complexes, en s'inspirant des nombreux exemples et design patterns partagés par la communauté pour structurer des systèmes multi-agents robustes.

Cette approche modulaire et composable préfigure l'avenir du développement logiciel assisté par IA. Le rôle du développeur évolue : il n'est plus seulement celui qui écrit le code, mais devient l'architecte et l'orchestrateur d'une équipe d'agents IA spécialisés, qu'il configure, guide et supervise pour démultiplier sa productivité et sa créativité.

#### **Sources des citations**

1. Claude Code overview, consulté le octobre 31, 2025, [https://docs.claude.com/en/docs/claude-code/overview](https://docs.claude.com/en/docs/claude-code/overview)
2. Slash commands \- Claude Docs, consulté le octobre 31, 2025, [https://docs.claude.com/en/docs/claude-code/slash-commands](https://docs.claude.com/en/docs/claude-code/slash-commands)
3. Your complete guide to slash commands Claude Code \- eesel AI, consulté le octobre 31, 2025, [https://www.eesel.ai/blog/slash-commands-claude-code](https://www.eesel.ai/blog/slash-commands-claude-code)
4. Claude Skills: Customize AI for your workflows \- Anthropic, consulté le octobre 31, 2025, [https://www.anthropic.com/news/skills](https://www.anthropic.com/news/skills)
5. Claude Agent Skills: A First Principles Deep Dive \- Han Lee, consulté le octobre 31, 2025, [https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)
6. Claude Code settings, consulté le octobre 31, 2025, [https://docs.claude.com/en/docs/claude-code/settings](https://docs.claude.com/en/docs/claude-code/settings)
7. disler/claude-code-hooks-mastery \- GitHub, consulté le octobre 31, 2025, [https://github.com/disler/claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery)
8. A complete guide to hooks in Claude Code: Automating your development workflow, consulté le octobre 31, 2025, [https://www.eesel.ai/blog/hooks-in-claude-code](https://www.eesel.ai/blog/hooks-in-claude-code)
9. Hooks reference \- Claude Docs, consulté le octobre 31, 2025, [https://docs.claude.com/en/docs/claude-code/hooks](https://docs.claude.com/en/docs/claude-code/hooks)
10. Customize Claude Code with plugins \- Anthropic, consulté le octobre 31, 2025, [https://www.anthropic.com/news/claude-code-plugins](https://www.anthropic.com/news/claude-code-plugins)
11. Reverse Engineering Claude Code: How Skills different from Agents, Commands and Styles, consulté le octobre 31, 2025, [https://levelup.gitconnected.com/reverse-engineering-claude-code-how-skills-different-from-agents-commands-and-styles-b94f8c8f9245](https://levelup.gitconnected.com/reverse-engineering-claude-code-how-skills-different-from-agents-commands-and-styles-b94f8c8f9245)
12. How to Create Custom Slash Commands in Claude Code ..., consulté le octobre 31, 2025, [https://en.bioerrorlog.work/entry/claude-code-custom-slash-command](https://en.bioerrorlog.work/entry/claude-code-custom-slash-command)
13. How to Add Custom Slash Commands in Claude Code \- AI Engineer Guide, consulté le octobre 31, 2025, [https://aiengineerguide.com/blog/claude-code-custom-command/](https://aiengineerguide.com/blog/claude-code-custom-command/)
14. Claude Code Slash Commands: Boost Your Productivity with Custom Automation, consulté le octobre 31, 2025, [https://alexop.dev/tils/claude-code-slash-commands-boost-productivity/](https://alexop.dev/tils/claude-code-slash-commands-boost-productivity/)
15. My 7 essential Claude Code best practices for production-ready AI in 2025, consulté le octobre 31, 2025, [https://www.eesel.ai/blog/claude-code-best-practices](https://www.eesel.ai/blog/claude-code-best-practices)
16. How to create custom Skills | Claude Help Center, consulté le octobre 31, 2025, [https://support.claude.com/en/articles/12512198-how-to-create-custom-skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)
17. How to Create and Use Claude Skills? Detailed Guide of 3 methods！ \- CometAPI, consulté le octobre 31, 2025, [https://www.cometapi.com/how-to-create-and-use-claudes-skills/](https://www.cometapi.com/how-to-create-and-use-claudes-skills/)
18. 10 Claude Skills that actually changed how I work (no fluff) : r/ClaudeAI \- Reddit, consulté le octobre 31, 2025, [https://www.reddit.com/r/ClaudeAI/comments/1ojuqhm/10_claude_skills_that_actually_changed_how_i_work/](https://www.reddit.com/r/ClaudeAI/comments/1ojuqhm/10_claude_skills_that_actually_changed_how_i_work/)
19. Claude Skills Tutorial: AI Update \#1 \- Product Growth | Aakash Gupta, consulté le octobre 31, 2025, [https://www.news.aakashg.com/p/claude-skills-tutorial](https://www.news.aakashg.com/p/claude-skills-tutorial)
20. alirezarezvani/claude-code-skill-factory: A comprehensive ... \- GitHub, consulté le octobre 31, 2025, [https://github.com/alirezarezvani/claude-code-skill-factory](https://github.com/alirezarezvani/claude-code-skill-factory)
21. Claude Code Skills vs Subagents \- When to Use What? \- DEV ..., consulté le octobre 31, 2025, [https://dev.to/nunc/claude-code-skills-vs-subagents-when-to-use-what-4d12](https://dev.to/nunc/claude-code-skills-vs-subagents-when-to-use-what-4d12)
22. How I use Claude Code (+ my best tips) \- Builder.io, consulté le octobre 31, 2025, [https://www.builder.io/blog/claude-code](https://www.builder.io/blog/claude-code)
23. Claude Skills Compared to Slash Commands | egghead.io, consulté le octobre 31, 2025, [https://egghead.io/claude-skills-compared-to-slash-commands\~lhdor](https://egghead.io/claude-skills-compared-to-slash-commands~lhdor)
24. Understanding Claude Skills vs. Subagents. It's not that confusing : r/ClaudeAI \- Reddit, consulté le octobre 31, 2025, [https://www.reddit.com/r/ClaudeAI/comments/1obq6wq/understanding_claude_skills_vs_subagents_its_not/](https://www.reddit.com/r/ClaudeAI/comments/1obq6wq/understanding_claude_skills_vs_subagents_its_not/)
25. Claude Skills vs Subagent: What's the difference? \- eesel AI, consulté le octobre 31, 2025, [https://www.eesel.ai/blog/skills-vs-subagent](https://www.eesel.ai/blog/skills-vs-subagent)
26. Building agents with the Claude Agent SDK \- Anthropic, consulté le octobre 31, 2025, [https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
27. Agent design lessons from Claude Code | Jannes' Blog, consulté le octobre 31, 2025, [https://jannesklaas.github.io/ai/2025/07/20/claude-code-agent-design.html](https://jannesklaas.github.io/ai/2025/07/20/claude-code-agent-design.html)
28. VoltAgent/awesome-claude-code-subagents: Production ... \- GitHub, consulté le octobre 31, 2025, [https://github.com/VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)
29. Claude Code Subagents & Commands Collection \+ CLI Tool \- GitHub, consulté le octobre 31, 2025, [https://github.com/davepoon/claude-code-subagents-collection](https://github.com/davepoon/claude-code-subagents-collection)
30. derek-opdee/subagent-example-script: Claude Sub Agent Test Generator Command \- GitHub, consulté le octobre 31, 2025, [https://github.com/derek-opdee/subagent-example-script](https://github.com/derek-opdee/subagent-example-script)
31. How we built our multi-agent research system \- Anthropic, consulté le octobre 31, 2025, [https://www.anthropic.com/engineering/multi-agent-research-system](https://www.anthropic.com/engineering/multi-agent-research-system)
32. lst97/claude-code-sub-agents: Collection of specialized AI subagents for Claude Code for personal use (full-stack development). \- GitHub, consulté le octobre 31, 2025, [https://github.com/lst97/claude-code-sub-agents](https://github.com/lst97/claude-code-sub-agents)
33. Best practices for Claude Code subagents \- PubNub, consulté le octobre 31, 2025, [https://www.pubnub.com/blog/best-practices-for-claude-code-sub-agents/](https://www.pubnub.com/blog/best-practices-for-claude-code-sub-agents/)
34. Introducing computer use, a new Claude 3.5 Sonnet, and Claude 3.5 Haiku \- Anthropic, consulté le octobre 31, 2025, [https://www.anthropic.com/news/3-5-models-and-computer-use](https://www.anthropic.com/news/3-5-models-and-computer-use)
35. The Ultimate Claude Code Guide: Every Hidden Trick, Hack, and Power Feature You Need to Know, consulté le octobre 31, 2025, [https://dev.to/holasoymalva/the-ultimate-claude-code-guide-every-hidden-trick-hack-and-power-feature-you-need-to-know-2l45](https://dev.to/holasoymalva/the-ultimate-claude-code-guide-every-hidden-trick-hack-and-power-feature-you-need-to-know-2l45)
36. Claude Code Hooks | GitButler Docs, consulté le octobre 31, 2025, [https://docs.gitbutler.com/features/ai-integration/claude-code-hooks](https://docs.gitbutler.com/features/ai-integration/claude-code-hooks)
37. Get started with Claude Code hooks, consulté le octobre 31, 2025, [https://docs.claude.com/en/docs/claude-code/hooks-guide](https://docs.claude.com/en/docs/claude-code/hooks-guide)
