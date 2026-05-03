# MATRICE NARRATIVE — Analyse Compétitive & Propositions d'Amélioration

*Analyse approfondie réalisée le 3 mai 2026*

---

## 1. PAYSAGE CONCURRENTIEL

### Les acteurs en présence

| Outil | Marché | Force principale | Faiblesse critique |
|-------|--------|-----------------|-------------------|
| **Scrivener** | Roman, non-fiction | Organisation, recherche, compile | Aucune IA, aucun outil cinématographique, anglais uniquement |
| **Final Draft 13** | Scénario Hollywood | Standard industrie, formatage | Aucune intelligence narrative, aucune IA, $250, pas de français |
| **Celtx** | Production pipeline | Breakdowns, planning tournage | Développement narratif superficiel, pas de français |
| **Arc Studio Pro** | Scénario moderne | Interface propre, quelques IA | Pas d'analyse narrative profonde, pas de français, pas de documents pro CNC |
| **Sudowrite** | Roman IA | Génération fluide de prose | Générique, aucune méthodologie structurée, pas de français, pas de documents professionnels |
| **NovelAI** | Écriture créative | Liberté de style | Aucun workflow professionnel, aucun output cinématographique |
| **Dramatron (Google DeepMind)** | Recherche scénario | Architecture hiérarchique innovante | Prototype non production-ready, pas de français, pas d'interface utilisateur |
| **Squibler** | Roman + IA | Templates variés | Superficiel, pas de système de cohérence, pas de français |
| **StoryBeat** | Structure narrative | Blake Snyder / Save the Cat | Rigide, templates fixes, pas d'IA profonde, pas de français |

---

## 2. CE QUE MATRICE NARRATIVE FAIT QU'AUCUN CONCURRENT NE FAIT

### Différenciateurs absolus

**① Le système "Matrice" comme ADN vivant**
Aucun concurrent n'a cette approche : un document structuré qui capture l'intention de l'auteur, et contre lequel *chaque élément du projet est comparé*. Dramatron s'en approche avec son architecture hiérarchique, mais sans interface ni persistance.

**② Analyse contextualisée — l'auteur confronté à son intention**
Sudowrite, NovelAI, Arc Studio Pro analysent le texte de manière générique. Matrice Narrative compare l'extrait écrit à la matrice déclarée. C'est un diagnostic de dérive narrative — unique sur le marché.

**③ Outil francophone natif premium**
Il n'existe pas d'outil de niveau professionnel en français pour les auteurs et cinéastes. L'entièreté du marché francophone est non adressé.

**④ Documents professionnels générés par IA**
- **Note d'Intention** (format CNC/festivals) : introuvable ailleurs
- **Séquencier professionnel** : introuvable ailleurs
- **Dossier de Pitch** complet : seul Celtx en génère, mais sans IA

**⑤ Pipeline complet : idée brute → œuvre réalisable**
Aucun concurrent ne couvre les 5 phases :
```
Idée → Fondations → Structure → Écriture → Publication → Outils Immersion
```
Scrivener couvre l'écriture. Final Draft couvre le scénario. Celtx couvre la production. Aucun ne couvre tout.

**⑥ Outils d'Immersion cinématographique**
Arc de Tension, Écho du Temps, Miroir Artistique, 5 Piliers, Mode Réalisateur, Carnet de Tournage — aucun concurrent n'a d'équivalent.

---

## 3. FORCES ACTUELLES DU PROJET

| Force | Niveau | Détail |
|-------|--------|--------|
| Pipeline narratif complet | ⭐⭐⭐⭐⭐ | 24 modules de l'idée à la publication |
| Intelligence narrative contextuelle | ⭐⭐⭐⭐⭐ | Injection matrice + personnages + skills dans chaque analyse |
| Outils cinématographiques | ⭐⭐⭐⭐⭐ | 11 outils sans équivalent sur le marché |
| Architecture technique | ⭐⭐⭐⭐⭐ | Monorepo propre, TypeScript strict, Drizzle, Express 5 |
| Design et UX | ⭐⭐⭐⭐ | Dark mode premium, violet/indigo, cohérent |
| Performance | ⭐⭐⭐⭐ | Fallbacks déterministes, pas de spinner bloquant |
| Déploiement | ⭐⭐⭐⭐ | Docker complet, VPS-ready |
| Multi-utilisateurs | ⭐ | Un seul utilisateur actuellement — gap critique |
| Collaboration | ⭐ | Aucune collaboration en temps réel |
| Mobile | ⭐ | Pas d'application mobile |

---

## 4. PROPOSITIONS D'AMÉLIORATION — PAR PRIORITÉ

### PRIORITÉ 1 — Impact immédiat sur la valeur produit

#### A. Authentification multi-utilisateurs (Clerk Auth)
**Pourquoi** : C'est le seul vrai blocage à la mise sur le marché. Chaque auteur doit avoir son propre espace, ses propres projets.
**Comment** : Intégrer Clerk (déjà prévu dans le roadmap long terme) — 1 à 2 jours de développement.
**Impact** : Transforme l'outil d'un prototype personnel en produit SaaS.

#### B. Export PDF natif côté serveur
**Pourquoi** : `window.print()` actuel est fragile et peu professionnel. Les documents CNC nécessitent un PDF bien formaté.
**Comment** : Puppeteer headless côté API pour la Note d'Intention et le Séquencier.
**Impact** : Rend les documents générés réellement utilisables pour les dépôts officiels.

#### C. Beat Sheet / Structure en 3 actes visuelle
**Pourquoi** : Tous les concurrents (StoryBeat, Arc Studio, Celtx) proposent des templates structurels. C'est la première chose qu'un scénariste cherche.
**Comment** : Nouveau module "Structure" avec visualisation actes I/II/III, points de bascule, midpoint.
**Impact** : Comble un gap évident entre la Matrice et le Séquencier.

#### D. Mode "Révision" — comparer deux versions d'un passage
**Pourquoi** : Sudowrite et Arc Studio Pro permettent de voir l'évolution entre deux versions. Essentiel pour la réécriture professionnelle.
**Comment** : Deux zones de texte + appel IA comparatif + delta de scores.
**Impact** : Ajoute une dimension temporelle à l'analyse — tu vois si tu t'améliores.

---

### PRIORITÉ 2 — Enrichissement de l'expérience

#### E. Templates par genre narratif
**Pourquoi** : Un thriller psychologique n'a pas les mêmes paramètres qu'une comédie romantique ou un drame historique. Actuellement, tous les modules génèrent de la même façon.
**Comment** : Bibliothèque de 12 templates genre (thriller, drame, comédie, fantastique, historique, sci-fi...) qui ajustent les prompts IA et les structures suggérées.
**Impact** : Génération plus précise et pertinente dès le premier essai.

#### F. Générateur de Loglines alternatives
**Pourquoi** : La logline est l'élément le plus important d'un projet — et le plus difficile à formuler. Même Hemingway disait qu'une histoire tient en une phrase.
**Comment** : Module dédié qui génère 5 à 10 variations de logline depuis la matrice, avec scoring de chaque variante (clarté, tension, originalité).
**Impact** : Aide concrète à un moment-clé du processus créatif.

#### G. Galerie de références visuelles
**Pourquoi** : Arc Studio Pro génère des images de personnages. La Chambre des Atmosphères cite des films de référence mais ne les montre pas.
**Comment** : Intégration d'une API d'images (Unsplash / TMDB) pour illustrer les atmosphères et servir de moodboard directement dans l'outil.
**Impact** : Rend le module Atmosphères visuellement concret et utilisable pour les pitchs.

#### H. Historique de versions ("Snapshots") par module
**Pourquoi** : Scrivener est connu pour ses "snapshots" — photographier l'état d'un texte avant une réécriture majeure. Les auteurs ont besoin de ce filet de sécurité.
**Comment** : Table `module_snapshots` avec timestamp + diff ; interface de comparaison simple.
**Impact** : Rassure les utilisateurs, encourage l'expérimentation.

---

### PRIORITÉ 3 — Expansion du produit

#### I. Application mobile (lecture + annotations)
**Pourquoi** : Les auteurs écrivent partout. Un mode lecture + annotation sur mobile pour consulter la matrice, relire ses personnages, prendre des notes.
**Comment** : Expo React Native — stack déjà maîtrisée dans le monorepo.
**Impact** : Débloque l'usage quotidien hors bureau.

#### J. Mode collaboratif (co-écriture)
**Pourquoi** : Les séries sont écrites en salle. Les films sont souvent co-écrits. Arc Studio Pro et Celtx ont ce mode.
**Comment** : WebSockets + résolution de conflits OT (Operational Transform) ou CRDT.
**Impact** : Adresse le marché des showrunners et des équipes de scénaristes.

#### K. Webhook / API publique
**Pourquoi** : Notion, Obsidian, Scrivener — les auteurs ont leurs outils préférés. Leur permettre d'envoyer des extraits pour analyse sans quitter leur environnement.
**Comment** : API REST publique avec authentification par clé API + documentation OpenAPI.
**Impact** : Intégration dans l'écosystème des outils d'écriture existants.

#### L. Analyse de la structure globale du manuscrit
**Pourquoi** : Actuellement, l'analyse porte sur des extraits. Mais la cohérence d'un roman ou scénario entier est différente. Aucun concurrent ne le fait bien.
**Comment** : Découpage automatique d'un texte long en segments + analyse de la progression structurelle globale.
**Impact** : Transforme l'outil de "lecteur d'extraits" en "dramaturge complet".

---

## 5. ANALYSE DE MARCHÉ — POSITIONNEMENT RECOMMANDÉ

### Positionnement actuel (de facto)
> *"Outil de développement narratif IA pour auteurs francophones — du usage personnel au prototype professionnel"*

### Positionnement cible après améliorations prioritaires
> *"Le seul OS créatif professionnel en français pour cinéastes et romanciers — de l'idée brute aux documents de distribution"*

### Modèle économique recommandé (si commercialisation)

| Tier | Prix | Contenu |
|------|------|---------|
| **Gratuit** | 0€ | 1 projet, modules Fondations uniquement |
| **Auteur** | 9€/mois | 5 projets, tous modules, 50 analyses/mois |
| **Cinéaste Pro** | 19€/mois | Projets illimités, Immersion complète, Note d'Intention + Séquencier illimités, export PDF |
| **Équipe** | 49€/mois | 5 membres, collaboration, API webhook |

### Estimation marché adressable francophone
- France : ~15 000 scénaristes et auteurs professionnels actifs
- Belgique, Suisse, Québec, Maghreb : +30% supplémentaires
- Tarif moyen SaaS créatif : 15–25€/mois
- **TAM (Total Addressable Market)** : ~5M€/an sur la seule France

---

## 6. SCORE MATURITÉ PRODUIT

| Dimension | Score actuel | Score cible post-améliorations |
|-----------|-------------|-------------------------------|
| Fonctionnalités narratives | 9/10 | 10/10 |
| Fonctionnalités cinématographiques | 9/10 | 10/10 |
| Infrastructure technique | 8/10 | 9/10 |
| Multi-utilisateurs | 1/10 | 9/10 |
| Documents professionnels | 7/10 | 9/10 |
| Mobile | 1/10 | 6/10 |
| Collaboration | 1/10 | 7/10 |
| **Score global** | **5.2/10** | **8.6/10** |

Le produit est techniquement excellent mais mono-utilisateur. L'ajout de Clerk Auth + export PDF natif fait passer le score de 5.2 à ~7.5 en 2 jours de développement.

---

*Analyse réalisée sur la base de : Sudowrite, NovelAI, Arc Studio Pro, Final Draft 13, Celtx, Scrivener, Dramatron (Google DeepMind), StoryBeat, Squibler — mai 2026*
