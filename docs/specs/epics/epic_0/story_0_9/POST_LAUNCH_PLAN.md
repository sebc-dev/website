# Story 0.9 - Post-Launch Implementation Plan

**Story**: Configurer Cloudflare WAF
**Epic**: Epic 0 - Socle technique (V1)
**Created**: 2025-11-15
**Status**: ⏸️ DEFERRED (Post-Launch)

---

## 📖 Overview

Ce document planifie l'implémentation des **Phases 2 et 3** de Story 0.9 (Cloudflare WAF Integration) qui ont été intentionnellement reportées jusqu'après le lancement du site.

### Contexte : Phase 1 Minimale

**Phase 1 Minimale** a été complétée le 2025-11-15 avec une stratégie adaptée pour un site "en construction" :

✅ **Ce qui a été fait** :

- Free Managed Ruleset (auto-déployé par Cloudflare)
- Rate Limiting basique (100 req/min par IP)
- Documentation complète (Dashboard access, rollback, troubleshooting)

⏸️ **Ce qui a été reporté** :

- Custom WAF Rules (Commit 3 de Phase 1)
- Phase 2 : Custom Rules & Tuning (nécessite 24-48h de logs de trafic réel)
- Phase 3 : Testing & Validation (nécessite site complet déployé)

### Pourquoi Reporter ?

**Raison technique** :

- Site actuel = page "En construction" uniquement
- Trafic minimal ou inexistant
- Impossible d'analyser les patterns de trafic pour tuner le WAF
- Pas d'endpoints à protéger spécifiquement

**Stratégie** :

- Protection baseline suffisante pour la phase actuelle
- Tuning WAF nécessite des données de trafic réel
- Testing complet nécessite le site fonctionnel avec toutes ses fonctionnalités

---

## 🎯 Déclencheur : Quand Implémenter ?

### Conditions de Déclenchement

Implémenter les Phases 2 & 3 **QUAND** :

✅ **Condition 1** : Site lancé en production avec contenu réel

- Homepage fonctionnelle (pas "en construction")
- Articles publiés et consultables
- Toutes les routes principales actives (`/`, `/articles`, `/admin`, etc.)

✅ **Condition 2** : Trafic utilisateur significatif

- Au moins 24-48 heures de trafic réel accumulé
- Logs WAF disponibles dans Cloudflare Dashboard
- Patterns de trafic identifiables (pages les plus visitées, chemins courants)

✅ **Condition 3** : Équipe prête pour le tuning

- Accès au Cloudflare Dashboard configuré
- Documentation Phase 1 lue et comprise
- Temps disponible pour monitoring et ajustements (prévoir 2-3 jours)

### Indicateurs de Priorisation

**Priorité HAUTE** si :

- 🔴 Attaques détectées dans les logs WAF (XSS, SQLi, etc.)
- 🔴 Trafic suspect ou volumétrique inhabituel
- 🔴 False positives bloquant des utilisateurs légitimes

**Priorité MOYENNE** si :

- 🟡 Lancement officiel du site prévu dans <1 mois
- 🟡 Trafic stable et croissant
- 🟡 Besoin de compliance ou audit de sécurité

**Priorité BASSE** si :

- 🟢 Trafic encore faible (< 100 visites/jour)
- 🟢 Pas d'attaques détectées
- 🟢 Site encore en phase de développement actif

---

## 📦 Phase 2 : Custom Rules & Tuning

### Objectif

Créer des règles WAF personnalisées pour l'application, configurer des exceptions pour les false positives, et affiner la sensibilité pour la production.

### Pré-requis

- ✅ Phase 1 Minimale complète (Free Managed Ruleset + Rate Limiting actifs)
- ✅ 24-48 heures de logs de trafic réel accumulés
- ✅ Site en production avec trafic utilisateur
- ✅ Accès au Cloudflare Dashboard (administrateur)

### Scope de Phase 2

**Configuration Tasks** :

1. **Analyser les Logs de Phase 1** (30-60 min)
   - Examiner Security Events dans Cloudflare Dashboard
   - Identifier les false positives (requêtes légitimes bloquées/loggées)
   - Identifier les vrais positifs (attaques détectées)
   - Documenter les patterns de trafic (endpoints les plus utilisés)

2. **Créer Custom WAF Rules** (1-2h)
   - Règle XSS : Bloquer patterns `<script>`, `javascript:`, etc.
   - Règle SQL Injection : Bloquer patterns `' OR`, `UNION SELECT`, etc.
   - Règle Path Traversal : Bloquer patterns `../`, `..\\`, etc.
   - Règles spécifiques à l'application si nécessaire

3. **Configurer Exceptions** (30-60 min)
   - Whitelister IPs connus (CI/CD, monitoring, équipe dev)
   - Créer exceptions pour false positives identifiés
   - Ajuster sensibilité des règles si nécessaire

4. **Rate Limiting Avancé** (30-60 min)
   - Rate limiting spécifique pour `/api/*` (ex: 20 req/min)
   - Rate limiting strict pour `/admin/*` (ex: 10 req/min)
   - Ajuster le global rate limit si besoin (actuellement 100 req/min)

5. **Passer en Mode "Block"** (15 min + monitoring)
   - Actuellement en "Log" mode (si applicable)
   - Passer progressivement en "Challenge" puis "Block"
   - Option : Garder "Log" si trafic encore faible

**Documentation Tasks** :

- Créer `docs/security/waf-tuning.md` - Décisions de tuning et analyse des logs
- Créer `docs/security/waf-exceptions.md` - Exceptions et whitelisting
- Mettre à jour `docs/security/waf-configuration.md` - Ajouter custom rules
- Mettre à jour `docs/security/rate-limiting-rules.md` - Rate limiting avancé

### Durée Estimée

- **Configuration** : 3-5 heures
- **Documentation** : 2-3 heures
- **Monitoring et ajustements** : 1-2 jours (temps passif, vérifications périodiques)
- **Total** : ~1.5 jours calendaires

### Risques & Mitigation

**Risques** :

- 🟡 Custom rules peuvent introduire false positives
- 🟡 Rate limiting trop strict peut bloquer utilisateurs légitimes
- 🟡 Basculer en "Block" mode peut impacter UX si mal configuré

**Mitigation** :

- Tester custom rules en "Log" mode pendant 24h avant activation
- Utiliser "Challenge" mode (CAPTCHA) avant "Block" mode
- Monitorer intensément pendant 48h après changements
- Documenter procédure de rollback (voir `docs/security/waf-configuration.md`)

### Commits Prévus

**Phase 2 : 4-5 commits**

1. 🔧 `docs(security): analyze Phase 1 logs and identify tuning needs`
2. 🔒 `config(waf): add custom WAF rules (XSS, SQLi, path traversal)`
3. 🔧 `config(waf): configure exceptions and whitelisting`
4. 🔧 `config(waf): add advanced rate limiting (API, admin routes)`
5. 📝 `docs(security): complete Phase 2 tuning documentation`

---

## 📦 Phase 3 : Testing & Validation

### Objectif

Validation complète de la sécurité WAF : tests positifs (trafic légitime passe), tests négatifs (attaques bloquées), scanning de sécurité, et monitoring opérationnel.

### Pré-requis

- ✅ Phase 2 complète (Custom rules configurées, WAF en mode Block/Challenge)
- ✅ Site en production avec toutes les fonctionnalités déployées
- ✅ Trafic stable et monitoring actif

### Scope de Phase 3

**Testing Tasks** :

1. **Tests Positifs** (1-2h)
   - Homepage charge correctement (200 OK)
   - Navigation site (articles, catégories, recherche)
   - API endpoints fonctionnent
   - Formulaires de contact/commentaires
   - Tests E2E Playwright passent tous ✅

2. **Tests Négatifs - Attack Simulation** (2-3h)
   - XSS payloads bloqués : `<script>alert('xss')</script>`
   - SQL injection bloqué : `' OR 1=1 --`, `UNION SELECT`
   - Path traversal bloqué : `../../../etc/passwd`
   - Command injection bloqué : `; ls -la`
   - Rate limiting testé : boucle de requêtes dépasse limite

3. **Security Scanning** (2-3h)
   - OWASP ZAP scan complet
   - Vérifier que Top 10 OWASP est protégé
   - Analyser rapport de scan
   - Documenter résultats et améliorations

4. **Performance Validation** (1h)
   - Mesurer latence avec/sans WAF
   - Objectif : <10ms d'impact sur p95 latency
   - Lighthouse score maintenu
   - Page load metrics (LCP, INP, CLS) non dégradés

5. **Monitoring & Alerts Setup** (1-2h)
   - Configurer alertes Cloudflare (WAF events, rate limiting)
   - Créer bookmarks Dashboard pour accès rapide
   - Tester réception des alertes
   - Former l'équipe sur procédures de réponse

**Documentation Tasks** :

- Créer `docs/security/waf-testing.md` - Procédures de test et résultats
- Créer `docs/security/waf-monitoring.md` - Guide monitoring et Dashboard
- Créer `docs/security/waf-incident-response.md` - Procédures d'alerte et réponse
- Créer `docs/security/waf-performance-baseline.md` - Métriques de performance
- Créer `tests/security/waf-validation.spec.ts` - Tests Playwright automatisés
- Créer `scripts/security/test-waf-negative.sh` - Script de test d'attaques

### Durée Estimée

- **Testing** : 5-8 heures
- **Documentation** : 3-4 heures
- **Review et formation équipe** : 2-3 heures
- **Total** : ~1.5 jours calendaires

### Risques & Mitigation

**Risques** :

- 🟢 Tests peuvent révéler false positives non détectés en Phase 2
- 🟢 Security scan peut déclencher des blocks WAF
- 🟢 Performance impact peut être plus élevé qu'attendu

**Mitigation** :

- Whitelister temporairement IP du security scanner
- Conduire tests négatifs depuis IP isolée (pas production)
- Mesurer performance AVANT Phase 2 pour avoir baseline
- Budget temps supplémentaire si ajustements nécessaires

### Success Criteria

**Tests** :

- ✅ 100% tests positifs passent (pas de false positives)
- ✅ 100% tests négatifs bloqués (attaques rejetées)
- ✅ Suite E2E Playwright complète passe
- ✅ Security scan montre amélioration vs baseline

**Performance** :

- ✅ Impact latency p95 < 10ms
- ✅ LCP, INP, CLS maintenus
- ✅ Lighthouse score ≥ baseline

**Monitoring** :

- ✅ Dashboard accessible et fonctionnel
- ✅ Alertes configurées et testées
- ✅ Équipe formée sur procédures

### Commits Prévus

**Phase 3 : 4-5 commits**

1. 🧪 `test(security): add positive WAF tests (legitimate traffic)`
2. 🧪 `test(security): add negative WAF tests (attack simulation)`
3. 🔒 `test(security): security scan with OWASP ZAP`
4. 📊 `docs(security): performance validation and monitoring setup`
5. 📝 `docs(security): complete Phase 3 validation documentation`

---

## 📅 Timeline Post-Lancement

### Scénario Typique

```
Jour J : Lancement du site
  ↓
Jour J+1 à J+3 : Monitoring passif (collecter logs WAF)
  ↓
Jour J+4 : Implémenter Phase 2 (Custom Rules & Tuning)
  ↓
Jour J+5 à J+6 : Monitoring actif (vérifier pas de false positives)
  ↓
Jour J+7 : Implémenter Phase 3 (Testing & Validation)
  ↓
Jour J+8 : Story 0.9 COMPLETED ✅
```

**Total post-lancement** : ~8 jours calendaires (incluant monitoring)
**Effort actif** : ~3 jours de travail

### Checklist de Démarrage

Avant de commencer Phase 2, vérifier :

- [ ] Site lancé en production avec contenu réel
- [ ] Au moins 24-48h de trafic réel accumulé
- [ ] Logs WAF accessibles dans Cloudflare Dashboard
- [ ] Aucune alerte critique en cours
- [ ] Équipe disponible pour 2-3 jours de travail WAF
- [ ] Documentation Phase 1 lue et comprise
- [ ] Backup/rollback procedure claire et testée

---

## 🔗 Références

### Documentation Phase 1 (Disponible)

- `docs/security/waf-configuration.md` - Configuration WAF baseline
- `docs/security/rate-limiting-rules.md` - Rate limiting de base
- `docs/security/README.md` - Index documentation sécurité
- `docs/deployment/cloudflare-dashboard-access.md` - Guide accès Dashboard

### Documentation à Créer (Phases 2 & 3)

- `docs/security/waf-tuning.md` - Décisions de tuning Phase 2
- `docs/security/waf-exceptions.md` - Exceptions et whitelisting
- `docs/security/waf-testing.md` - Résultats tests Phase 3
- `docs/security/waf-monitoring.md` - Guide monitoring
- `docs/security/waf-incident-response.md` - Procédures d'alerte
- `docs/security/waf-performance-baseline.md` - Métriques performance

### Specs & Planning

- `docs/specs/epics/epic_0/story_0_9/story_0.9.md` - Story spec complète
- `docs/specs/epics/epic_0/story_0_9/implementation/PHASES_PLAN.md` - Plan 3 phases original
- `docs/specs/epics/epic_0/story_0_9/implementation/phase_1/` - Documentation détaillée Phase 1

### External Links

- [Cloudflare WAF Documentation](https://developers.cloudflare.com/waf/)
- [OWASP Core Rule Set](https://developers.cloudflare.com/waf/managed-rules/reference/owasp-core-ruleset/)
- [Cloudflare Custom Rules](https://developers.cloudflare.com/waf/custom-rules/)
- [Rate Limiting Rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- [OWASP Top 10 (2021)](https://owasp.org/www-project-top-ten/)
- [OWASP ZAP](https://www.zaproxy.org/)

---

## 📝 Notes

### Adaptation Stratégique

Ce plan a été créé suite à une décision stratégique de **reporter Phases 2 & 3** jusqu'après le lancement du site. Cette approche :

✅ **Avantages** :

- Focus sur baseline protection adaptée au contexte actuel ("en construction")
- Économie de temps (pas de tuning sans données réelles)
- Meilleure qualité de tuning avec vrais logs de trafic
- Flexibilité pour ajuster en fonction des besoins réels

⚠️ **Considérations** :

- Baseline protection = suffisante pour site "en construction"
- Tuning final nécessite vraie production et trafic
- Ne pas oublier de revenir aux Phases 2 & 3 post-lancement !

### Rappel : Story 0.9 Status

**Actuellement** :

- Phase 1 Minimale : ✅ COMPLETED
- Phase 2 (Custom Rules & Tuning) : ⏸️ DEFERRED
- Phase 3 (Testing & Validation) : ⏸️ DEFERRED

**Post-Lancement** :

- Phase 2 : À implémenter (1.5j)
- Phase 3 : À implémenter (1.5j)
- Story 0.9 : Sera marquée COMPLETED après Phase 3 ✅

---

**Document Created**: 2025-11-15
**Last Updated**: 2025-11-15
**Status**: ⏸️ DEFERRED - À implémenter post-lancement
**Owner**: DevOps/Security Team
