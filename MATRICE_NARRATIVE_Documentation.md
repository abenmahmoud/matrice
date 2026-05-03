# MATRICE NARRATIVE — Documentation Technique & Stratégie

*Studio créatif OS pour auteurs et cinéastes — Version 2.0 (mai 2026)*

---

## TABLE DES MATIÈRES

1. [Vision du projet](#1-vision-du-projet)
2. [Architecture technique](#2-architecture-technique)
3. [Base de données — 20 tables](#3-base-de-données--20-tables)
4. [API Server — Endpoints complets](#4-api-server--endpoints-complets)
5. [Frontend — 33 pages](#5-frontend--33-pages)
6. [Modules Immersion — 11 outils cinématographiques](#6-modules-immersion--11-outils-cinématographiques)
7. [Module d'analyse IA — Cœur du système](#7-module-danalyse-ia--cœur-du-système)
8. [Administration — Tableau de bord secret](#8-administration--tableau-de-bord-secret)
9. [Techniques clés employées](#9-techniques-clés-employées)
10. [Déploiement VPS](#10-déploiement-vps)
11. [Roadmap](#11-roadmap)

---

## 1. VISION DU PROJET

**Matrice Narrative** est un OS créatif premium destiné aux auteurs de romans et aux cinéastes francophones. Il n'est pas un simple éditeur de texte — c'est un système de pensée narratif qui accompagne le créateur de l'idée initiale jusqu'à la cohérence finale de son œuvre, et jusqu'aux documents professionnels pour les producteurs et festivals.

### Philosophie centrale

> *L'IA ne génère pas à la place de l'auteur. Elle analyse, confronte, et révèle ce que l'auteur n'a pas encore vu.*

Trois piliers :

- **La Matrice** : un document vivant qui capture l'ADN narratif d'un projet (logline, conflits, thèmes, règles du monde, personnages pivots, motifs symboliques).
- **L'Analyse IA** : un diagnostic de cohérence qui compare chaque extrait écrit à la matrice déclarée, et note sur 6 dimensions.
- **L'Immersion** : 11 outils cinématographiques avancés pour aller de la structure narrative vers la réalisation concrète (atmosphères, séquencier, note d'intention CNC...).

### Public cible

Auteurs et cinéastes francophones travaillant de manière professionnelle ou semi-professionnelle sur des projets de fiction (roman, scénario, série, pitch) qui souhaitent un outil de réflexion narratif à la hauteur de leur ambition.

---

## 2. ARCHITECTURE TECHNIQUE

### Stack

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Frontend | React 18 + Vite 7 + TypeScript | Interface utilisateur SPA |
| Routing | Wouter | Routeur léger côté client |
| Styling | Tailwind CSS v4 | Système de classes utilitaires |
| UI Components | shadcn/ui (Radix UI) | Composants accessibles primitifs |
| Charts | Recharts | Visualisations (arc de tension) |
| Backend | Express 5 + TypeScript | API REST + streaming IA |
| ORM | Drizzle ORM | Requêtes typesafe PostgreSQL |
| Base de données | PostgreSQL (Replit native) | Persistance principale |
| IA | OpenAI GPT-5.4 (via proxy Replit) | Génération narrative, analyse |
| Monorepo | pnpm workspaces | Gestion multi-packages |
| Validation | Zod v4 | Schémas de validation runtime |
| Logging | Pino | Logger structuré JSON (jamais console.log) |

### Structure monorepo

```
workspace/
├── artifacts/
│   ├── matrice-narrative/       # Frontend React + Vite (port dynamique)
│   │   └── src/
│   │       ├── pages/           # 33 pages (routes)
│   │       ├── components/      # Composants réutilisables
│   │       └── context/         # Contextes React (Admin, etc.)
│   ├── api-server/              # Backend Express 5
│   │   └── src/
│   │       ├── routes/          # 7 fichiers de routes (~80 endpoints)
│   │       └── services/        # generationService.ts (toutes les fonctions IA)
│   └── mockup-sandbox/          # Sandbox Canvas (prévisualisations isolées)
├── lib/
│   ├── db/                      # Schémas Drizzle ORM + connexion PostgreSQL (20 tables)
│   ├── api-spec/                # Spec OpenAPI (contrats API)
│   ├── api-zod/                 # Zod schemas générés
│   ├── api-client-react/        # Hooks React Query générés par Orval
│   └── integrations-openai-ai-server/  # Client OpenAI (proxy Replit AI Integrations)
├── docker-compose.yml           # Déploiement VPS production
├── Dockerfile.api               # Image Docker API server (node:22-alpine, multi-stage)
├── Dockerfile.frontend          # Image Docker frontend (nginx:alpine)
├── nginx.conf                   # Config nginx (reverse proxy, SSL, gzip, cache)
├── .env.example                 # Variables d'environnement à copier
└── DEPLOY.md                    # Guide de déploiement VPS complet
```

### Routage proxy

Un reverse proxy global route le trafic par chemin :

- `/` → Frontend Matrice Narrative
- `/api` → API Server Express
- `/__mockup` → Mockup Sandbox (canvas)

Les chemins ne sont **pas** réécrits. Chaque service gère son propre préfixe de base.

### Communication Frontend ↔ API

- **Requêtes classiques** : `fetch(BASE + "/api/...")` avec `BASE = import.meta.env.BASE_URL.replace(/\/$/, "")`
- **Streaming IA** : les endpoints de génération retournent du JSON directement (pas SSE) — timeout nginx configuré à 120s
- **Authentification admin** : Header `X-Admin-Token` = HMAC-SHA256(ADMIN_PASSWORD, SESSION_SECRET)

---

## 3. BASE DE DONNÉES — 20 TABLES

### Vue d'ensemble

```
projects                  — Projets et métadonnées
narrative_matrices        — Matrice narrative (logline, synopsis, thèmes, lois)
emotional_cores           — Noyau émotionnel du protagoniste
emotional_paths           — Parcours émotionnel structuré
characters                — Personnages (psychologie complète)
relationships             — Relations entre personnages
world_data                — Worldbuilding et chronologie
research_data             — Notes de recherche contextuelles
hpsa_scores               — Scores H.P.S.A. (Heroes/Plausibilité/Stakes/Arc)
book_outlines             — Plan chapitré roman
screenplays               — Scénario formaté
series_data               — Structure série (épisodes, arcs longs)
pitch_documents           — Dossier de pitch (producteurs/éditeurs)
tension_arcs              — Arc de tension dramatique (courbe Recharts)
atmosphere_data           — Chambre des atmosphères (palette, musique, style)
echo_temps                — Écho du temps (résonances mythiques/historiques)
miroir_artistique         — Miroir artistique (réflexion poétique de l'œuvre)
cinq_piliers              — Les 5 piliers dramatiques (humour/suspense/émotion/tendresse/surprise)
sequencier                — Séquencier professionnel (découpage en séquences numérotées)
note_intention            — Note d'intention cinématographique (document CNC/producteurs)
```

### Tables système (laboratoire narratif)

Ces tables sont gérées séparément dans le schéma — elles alimentent le laboratoire de recherche et les skills IA :

```
manuscript_analyses       — Analyses IA des extraits de manuscrit
research_lab_entries      — Entrées du laboratoire narratif (générées par IA)
narrative_skills          — Skills narratifs secrets (injectés dans les prompts)
```

### Table `projects` (détail)

```
id              text PRIMARY KEY (UUID auto)
title           text NOT NULL
rawIdea         text NOT NULL          — idée brute de l'auteur
inputType       text                   — "roman" | "scenario" | "serie" | "pitch"
genre           text NOT NULL
tone            text NOT NULL
targetFormat    text NOT NULL
temporalLogic   text
realityLevel    text
targetAudience  text
artisticAmbition text
progression     real DEFAULT 0         — avancement global (0–100)
createdAt       timestamp
updatedAt       timestamp
```

### Table `narrative_matrices` (détail)

```
centralConcept, logline, shortPitch, longSynopsis
genre, tone
themes[]              — thèmes principaux (jsonb[])
universeLaws[]        — lois de l'univers fictif
temporalRules         — règles temporelles
spatialRules          — règles d'espace
visibleWorld          — monde visible
invisibleForces       — forces invisibles (métaphysiques)
centralConflict       — conflit principal
protagonist, antagonist
emotionalStakes       — enjeux émotionnels
symbolicMotifs[]      — motifs symboliques récurrents
powerObjects[]        — objets de pouvoir narratif
secrets[]             — secrets et révélations prévues
possibleEndings[]     — fins possibles envisagées
coherenceRules[]      — règles de cohérence à respecter
```

### Tables Immersion (détail)

**`sequencier`** :
```
sequences[]  — tableau de séquences avec :
  numero, titre, lieu, momentJournee
  personnagesPresents[], dureeEstimee
  fonctionDramatique   — exposition | développement | climax | résolution | twist
  arcEmotionnel, descriptionAction
  noteRealisation, intensiteDramatique (1–10)
```

**`note_intention`** :
```
vision, partiPris
protagonisteVision     — regard sur le personnage principal
universVisuel          — direction artistique et cinématographie
musiqueEtSon           — univers sonore
positionnement         — positionnement marché / références
pourquoiMaintenant     — ancrage dans l'époque
motFinal               — phrase de conclusion personnelle
```

---

## 4. API SERVER — ENDPOINTS COMPLETS

### `/api/projects` — Gestion des projets (46 endpoints)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/projects` | Liste tous les projets |
| POST | `/api/projects` | Crée un projet |
| GET | `/api/projects/:id` | Projet complet |
| PUT | `/api/projects/:id` | Met à jour les métadonnées |
| DELETE | `/api/projects/:id` | Supprime projet + cascade |
| GET | `/api/projects/:id/status` | Statut de complétion par module |
| GET | `/api/dashboard/summary` | Résumé dashboard |
| POST | `/api/projects/:id/generate-matrix` | Génère la matrice narrative (IA) |
| GET | `/api/projects/:id/matrix` | Matrice narrative |
| PUT | `/api/projects/:id/matrix` | Met à jour la matrice |
| POST | `/api/projects/:id/check-coherence` | Vérifie la cohérence IA |
| POST | `/api/projects/:id/generate-emotional-core` | Génère le noyau émotionnel (IA) |
| GET | `/api/projects/:id/emotional-core` | Noyau émotionnel |
| PUT | `/api/projects/:id/emotional-core` | Met à jour le noyau |
| POST | `/api/projects/:id/generate-emotional-path` | Génère le parcours émotionnel (IA) |
| POST | `/api/projects/:id/generate-characters` | Génère les personnages (IA) |
| GET | `/api/projects/:id/characters` | Liste des personnages |
| POST | `/api/projects/:id/characters` | Ajoute un personnage |
| PUT | `/api/projects/:id/characters/:charId` | Met à jour un personnage |
| DELETE | `/api/projects/:id/characters/:charId` | Supprime un personnage |
| POST | `/api/projects/:id/generate-relationships` | Génère les relations (IA) |
| GET | `/api/projects/:id/relationships` | Relations entre personnages |
| POST | `/api/projects/:id/generate-world` | Génère le worldbuilding (IA) |
| GET | `/api/projects/:id/world` | Données monde & temps |
| PUT | `/api/projects/:id/world` | Met à jour le monde |
| POST | `/api/projects/:id/generate-research-notes` | Génère les notes de recherche (IA) |
| GET | `/api/projects/:id/research` | Notes de recherche |
| PUT | `/api/projects/:id/research` | Met à jour les recherches |
| POST | `/api/projects/:id/generate-hpsa-score` | Génère les scores HPSA (IA) |
| GET | `/api/projects/:id/hpsa` | Scores HPSA |
| POST | `/api/projects/:id/generate-book-outline` | Génère le plan roman (IA) |
| GET | `/api/projects/:id/book` | Plan chapitré |
| PUT | `/api/projects/:id/book` | Met à jour le plan |
| POST | `/api/projects/:id/generate-screenplay` | Génère le scénario (IA) |
| GET | `/api/projects/:id/screenplay` | Scénario |
| PUT | `/api/projects/:id/screenplay` | Met à jour le scénario |
| POST | `/api/projects/:id/generate-series` | Génère la structure série (IA) |
| GET | `/api/projects/:id/series` | Données série |
| PUT | `/api/projects/:id/series` | Met à jour la série |
| POST | `/api/projects/:id/generate-pitch` | Génère le dossier de pitch (IA) |
| GET | `/api/projects/:id/pitch` | Dossier de pitch |
| PUT | `/api/projects/:id/pitch` | Met à jour le pitch |
| GET | `/api/projects/:id/export/:type` | Export (json/txt/md) |
| POST | `/api/projects/:id/generate-tension-arc` | Génère l'arc de tension (IA) |
| GET | `/api/projects/:id/tension-arc` | Arc de tension |
| POST | `/api/projects/:id/generate-atmosphere` | Génère les atmosphères (IA) |
| GET | `/api/projects/:id/atmosphere` | Données atmosphères |
| POST | `/api/projects/:id/characters/:charId/dialogue` | Dialogue incarné d'un personnage (IA) |
| GET | `/api/projects/:id/echo-temps` | Écho du temps |
| POST | `/api/projects/:id/generate-echo-temps` | Génère l'écho du temps (IA) |
| GET | `/api/projects/:id/miroir` | Miroir artistique |
| POST | `/api/projects/:id/generate-miroir` | Génère le miroir (IA) |
| GET | `/api/projects/:id/cinq-piliers` | Les 5 piliers |
| POST | `/api/projects/:id/generate-cinq-piliers` | Génère les 5 piliers (IA) |
| GET | `/api/projects/:id/note-intention` | Note d'intention |
| POST | `/api/projects/:id/generate-note-intention` | Génère la note d'intention (IA) |
| GET | `/api/projects/:id/sequencier` | Séquencier |
| POST | `/api/projects/:id/generate-sequencier` | Génère le séquencier (IA) |
| POST | `/api/projects/:id/director-mode` | Mode réalisateur (IA) |
| POST | `/api/projects/:id/auto-link-skills` | Lie automatiquement les skills |

### `/api/manuscripts` — Analyses IA

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/manuscripts/analyze` | Lance une analyse IA complète (SSE streaming) |
| GET | `/api/manuscripts` | Toutes les analyses (optionnel: `?projectId=`) |
| DELETE | `/api/manuscripts/:id` | Supprime une analyse |

### `/api/research-lab` — Laboratoire narratif (admin)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/research-lab/entries` | Toutes les entrées |
| GET | `/api/research-lab/entries/:id` | Une entrée spécifique |
| DELETE | `/api/research-lab/entries/:id` | Supprime une entrée |
| POST | `/api/research-lab/generate` | Génère une entrée de recherche (IA) |
| POST | `/api/research-lab/daily` | Génération quotidienne automatique (cron) |
| GET | `/api/research-lab/stats` | Statistiques du laboratoire |
| GET | `/api/research-lab/taxonomy` | Taxonomie des catégories |
| GET | `/api/research-lab/dossiers` | Dossiers thématiques |

### `/api/skills` — Skills narratifs

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/skills` | Tous les skills |
| POST | `/api/skills` | Crée un skill manuellement |
| PUT | `/api/skills/:id` | Met à jour un skill |
| DELETE | `/api/skills/:id` | Supprime un skill |
| GET | `/api/projects/:id/skills` | Skills liés à un projet |
| POST | `/api/projects/:id/skills/:skillId` | Lie un skill à un projet |
| DELETE | `/api/projects/:id/skills/:skillId` | Dissocie un skill |

### `/api/admin` — Administration

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/admin/login` | Authentification admin |
| GET | `/api/admin/verify` | Vérifie le token admin |

---

## 5. FRONTEND — 33 PAGES

### Navigation principale

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page |
| Dashboard | `/dashboard` | Vue d'ensemble de tous les projets |
| Nouveau projet | `/new-project` | Création d'un projet avec génération IA |
| Not Found | `*` | Page 404 |

### Pipeline narratif — par projet

#### Phase 1 — Fondations créatives

| Page | Route | Description |
|------|-------|-------------|
| Vue d'ensemble | `/projects/:id/project-overview` | Tableau de bord du projet |
| Matrice Narrative | `/projects/:id/matrix` | ADN narratif complet (éditable) |
| Noyau Émotionnel | `/projects/:id/emotional-core` | Arc émotionnel, catharsis, rythme |

#### Phase 2 — Structure narrative

| Page | Route | Description |
|------|-------|-------------|
| Personnages | `/projects/:id/characters` | Galerie + psychologie complète |
| Relations | `/projects/:id/relationships` | Graphe des relations |
| Monde & Temps | `/projects/:id/world` | Worldbuilding, chronologie, logique temporelle |

#### Phase 3 — Analyse & recherche

| Page | Route | Description |
|------|-------|-------------|
| Recherche | `/projects/:id/research` | Notes de recherche contextuelles |
| Scores H.P.S.A. | `/projects/:id/hpsa` | Heroes / Plausibilité / Stakes / Arc |
| Analyse IA (projet) | `/projects/:id/analyse` | Analyse contextualisée + progression |

#### Phase 4 — Écriture

| Page | Route | Description |
|------|-------|-------------|
| Atelier Roman | `/projects/:id/book` | Plan chapitré complet |
| Atelier Scénario | `/projects/:id/screenplay` | Scénario formaté |
| Atelier Série | `/projects/:id/series` | Structure sérielle, épisodes, arcs longs |

#### Phase 5 — Publication

| Page | Route | Description |
|------|-------|-------------|
| Dossier de Pitch | `/projects/:id/pitch` | Document pour producteurs/éditeurs |
| Exports | `/projects/:id/exports` | Export JSON / TXT / Markdown |

### Section Immersion — 11 outils cinématographiques

| Page | Route | Description |
|------|-------|-------------|
| Arc de Tension | `/projects/:id/tension-arc` | Courbe dramatique Recharts, acte par acte |
| Atmosphères | `/projects/:id/atmosphere` | Palette couleurs, musique, textures, style cinéma |
| Constellation | `/projects/:id/constellation` | Carte SVG interactive personnages + relations |
| Dialogue | `/projects/:id/dialogue` | Chat IA incarnant les personnages dans leur voix |
| Mode Réalisateur | `/projects/:id/director` | Découpe technique (plan, caméra, focale, lumière, son) |
| Carnet de Tournage | `/projects/:id/director-notebook` | Compilation Atmosphères + Arc → PDF imprimable |
| Écho du Temps | `/projects/:id/echo-temps` | Résonances mythiques, historiques, culturelles |
| Miroir Artistique | `/projects/:id/miroir` | Réflexion poétique (thème caché, angles morts, invitations) |
| Les 5 Piliers | `/projects/:id/piliers` | Analyse Humour / Suspense / Émotion / Tendresse / Surprise |
| Séquencier | `/projects/:id/sequencier` | Découpage professionnel en séquences numérotées |
| Note d'Intention | `/projects/:id/note-intention` | Document formel 1ère personne pour CNC/producteurs/festivals |

### Pages globales

| Page | Route | Description |
|------|-------|-------------|
| Analyse standalone | `/analyse` | Analyse IA sans contexte projet |
| Analyse projet | `/project-analyse` | Analyse avec sélection de projet |
| Laboratoire | `/research-lab` | Laboratoire de recherche narratif (admin) |
| Skills | `/skills` | Bibliothèque de skills narratifs (admin) |
| Admin | `/admin` | Tableau de bord administration (protégé) |

---

## 6. MODULES IMMERSION — 11 OUTILS CINÉMATOGRAPHIQUES

### Arc de Tension (`tension-arc`)

Courbe dramatique interactive construite avec Recharts. L'IA génère une analyse acte par acte avec intensité (0–100), type de scène, événement clé, fonction narrative et note de réalisation. Visualisation en courbe smooth avec gradient, points cliquables, et légende colorée par acte.

### Chambre des Atmosphères (`atmosphere`)

Palette visuelle complète d'un projet : couleurs dominantes, ambiance lumineuse, références cinématographiques, univers musical, textures, costumes, décors. Générée par l'IA depuis la matrice narrative.

### Constellation (`constellation`)

Carte SVG interactive des personnages et de leurs relations. Nodes draggables, lignes de relation typées (alliance, conflit, amour, secret...), légende dynamique.

### Dialogue des Personnages (`dialogue`)

Interface de chat IA où chaque personnage répond dans sa propre voix, sa syntaxe, ses obsessions. L'IA incarne le personnage en s'appuyant sur sa psychologie complète (background, motivation, peur, secret, style vocal).

### Mode Réalisateur (`director`)

L'utilisateur colle un passage textuel. L'IA génère une découpe technique complète : type de plan (gros plan, plan américain...), mouvement caméra, focale, éclairage, ambiance sonore, note de réalisation.

### Carnet de Tournage (`director-notebook`)

Document de production imprimable qui compile : atmosphères visuelles, courbe dramatique, notes de réalisation par scène. Export PDF via `window.print()`.

### Écho du Temps (`echo-temps`)

L'IA identifie les résonances du projet avec d'autres civilisations, époques et mythologies. Connexions inattendues qui enrichissent la dimension universelle de l'œuvre.

### Miroir Artistique (`miroir`)

Réflexion poétique de l'œuvre : thème caché (ce que l'auteur dit sans le savoir), angles morts, invitations narratives non exploitées, écho avec l'inconscient collectif.

### Les 5 Piliers (`piliers`)

Analyse des 5 dimensions émotionnelles universelles : Humour, Suspense, Émotion pure, Tendresse, Surprise. Score et recommandations pour chaque pilier — équilibre dramatique global.

### Séquencier (`sequencier`)

Découpage professionnel en séquences numérotées. Chaque séquence contient : numéro, titre, lieu, moment de la journée, personnages présents, durée estimée, **fonction dramatique** (exposition / développement / climax / résolution / twist), arc émotionnel, description de l'action, note de réalisation, et intensité dramatique (1–10). Visualisation en timeline avec codes couleur par fonction.

### Note d'Intention Cinématographique (`note-intention`)

Document formel à la première personne, rédigé par l'IA au nom du cinéaste. Structure en 8 sections : Vision du film, Parti pris de mise en scène, Mon regard sur le protagoniste, Univers visuel et cinématographique, Musique et univers sonore, Positionnement et références, Pourquoi maintenant, Mot final. Destiné au CNC, aux producteurs, aux festivals. Export PDF + copie texte.

---

## 7. MODULE D'ANALYSE IA — CŒUR DU SYSTÈME

### Flux complet

```
Utilisateur colle un extrait
        ↓
Frontend envoie POST /api/manuscripts/analyze
avec { projectId, title, content } et Accept: text/event-stream
        ↓
API charge en parallèle :
  ├── Projet (genre, ton, ambition artistique)
  ├── Matrice narrative (logline, conflit, règles, motifs...)
  ├── Noyau émotionnel (arc émotionnel, catharsis, rythme)
  ├── Personnages principaux (archétypes, motivations, secrets)
  └── Skills actifs (techniques narratives validées par le Laboratoire)
        ↓
Construction du système prompt (context injection)
        ↓
Appel GPT-5.4 (streaming activé)
        ↓
SSE → events { type: "progress", percent, step }
        ↓
Parsing JSON structuré de la réponse
        ↓
Calcul score global pondéré
        ↓
Sauvegarde BDD (manuscript_analyses)
        ↓
SSE → event { type: "done", data: analysisComplete }
        ↓
Frontend affiche les résultats avec anneaux SVG animés
```

### Les 6 dimensions d'analyse

| Score | Poids | Description |
|-------|-------|-------------|
| Structure | 25% | Architecture narrative, actes, tension, rythme |
| Émotion | 25% | Impact émotionnel, résonance, arc lecteur |
| Archétypes | 20% | Figures archétypales, profondeur symbolique |
| Originalité | 15% | Voix unique, subversion des codes, fraîcheur |
| Cohérence | 15% | Fidélité à la matrice déclarée |
| **Global** | — | Moyenne pondérée des 5 scores |

### Page Analyse — vue Résultats

**Onglet Analyser :**
- 6 anneaux SVG de score animés + delta vs session précédente
- Section cohérence : validations (checkmarks verts) + écarts (alertes rouges)
- Forces / Faiblesses avec pistes de correction
- Techniques appliquées + techniques manquantes recommandées
- Œuvres comparables (titre, auteur, pertinence)
- Verdict synthétique

**Onglet Progression :**
- 4 cartes KPI (total sessions, progression, meilleur score, cohérence max)
- Badge "streak" si 3 sessions consécutives en hausse
- Chart SVG Bézier multi-lignes (6 courbes colorées)
- Timeline des sessions avec deltas inter-sessions

---

## 8. ADMINISTRATION — TABLEAU DE BORD SECRET

### Accès

URL : `/admin`
Authentification : mot de passe → HMAC-SHA256(ADMIN_PASSWORD, SESSION_SECRET) → `X-Admin-Token`
Variables `ADMIN_PASSWORD` et `SESSION_SECRET` dans les secrets Replit.

### Fonctionnalités admin

- **Onglet Analyses IA** : stats KPI (5 cartes), chart SVG multi-projets, sparklines par projet, liste filtrée avec suppression
- **Onglet Laboratoire** : génération manuelle de recherches narratives, visualisation du corpus, extraction de skills
- **Onglet Skills** : activation/désactivation, édition, suppression des skills narratifs

### Sécurité HMAC-SHA256

```
token = HMAC-SHA256(key: SESSION_SECRET, message: ADMIN_PASSWORD)
```
Envoyé dans chaque requête admin via `X-Admin-Token`. Jamais stocké côté client — recalculé à chaque session. Pas de JWT, pas de cookie.

---

## 9. TECHNIQUES CLÉS EMPLOYÉES

### Génération IA — pattern `aiJson`

Toutes les générations passent par le helper `aiJson(system, user, fallback)` dans `generationService.ts` :

```typescript
async function aiJson<T>(system: string, user: string, fallback: T): Promise<T> {
  // Appel OpenAI avec response_format: json_object
  // En cas d'échec : retourne le fallback déterministe
  // Modèle : gpt-5.4 (Replit) → gpt-4o (VPS)
}
```

Le fallback est un contenu de haute qualité pré-écrit — jamais de contenu vide ou d'erreur visible.

### Scoring HPSA

Système de métriques narratives custom sur 4 axes :
- **H** (Heroes) : profondeur et complexité des personnages
- **P** (Plausibilité) : cohérence interne du monde
- **S** (Stakes) : enjeux perçus et tension dramatique
- **A** (Arc) : clarté et satisfaction de l'arc narratif

### Injection de contexte (context injection)

Le prompt d'analyse injecte automatiquement :
- Métadonnées projet (genre, ton, ambition, public)
- Logline + synopsis
- Conflit central + protagoniste/antagoniste
- Règles du monde + motifs symboliques
- Arc émotionnel + moments clés
- Personnages (jusqu'à 8, avec archétype, motivation, secret)
- Skills narratifs actifs (techniques validées par le Laboratoire)

### Architecture des routes Express

```typescript
// Pattern standard pour toutes les générations
router.post("/projects/:id/generate-[module]", async (req, res) => {
  const project = await getProjectWithContext(id)
  const generated = await generationService.generate[Module](project)
  await db.insert(table).values(generated).onConflictDoUpdate(...)
  res.json(generated)
})
```

---

## 10. DÉPLOIEMENT VPS

### Prérequis

- VPS Ubuntu 22.04+, Docker + Docker Compose installés
- Clé OpenAI directe (le proxy Replit n'est pas disponible hors Replit)
- Domaine avec DNS configuré (optionnel pour SSL)

### Variables d'environnement requises

```bash
cp .env.example .env
# Remplir :
POSTGRES_PASSWORD=xxxx       # Mot de passe PostgreSQL
SESSION_SECRET=xxxx          # Secret sessions HMAC
ADMIN_PASSWORD=xxxx          # Mot de passe admin
OPENAI_API_KEY=sk-xxxx       # Clé OpenAI directe
```

### Changement de modèle obligatoire sur VPS

```bash
# Le modèle gpt-5.4 est Replit-only — remplacer par gpt-4o sur VPS
grep -rn "gpt-5.4" artifacts/api-server/src/services/
# Puis remplacer toutes les occurrences par "gpt-4o"
```

### Déploiement

```bash
docker compose up -d --build
# Migration BDD au premier démarrage :
docker compose exec api pnpm --filter @workspace/db run push
```

Voir `DEPLOY.md` pour le guide complet (SSL Let's Encrypt, health checks, mises à jour).

---

## 11. ROADMAP

### ✅ Terminé (v2.0 — mai 2026)

#### Fondations
- [x] Matrice Narrative (logline, synopsis, thèmes, lois, motifs, fins)
- [x] Noyau Émotionnel (arc, catharsis, rythme émotionnel)
- [x] Personnages (galerie complète, psychologie profonde, gestion CRUD)
- [x] Relations entre personnages (graphe généré par IA)
- [x] Monde & Temps (worldbuilding, chronologie, logique temporelle)
- [x] Notes de Recherche (contexte documentaire généré par IA)
- [x] Scores H.P.S.A. (4 métriques narratives custom)

#### Ateliers d'écriture
- [x] Atelier Roman (plan chapitré complet)
- [x] Atelier Scénario (scénario formaté)
- [x] Atelier Série (structure sérielle, épisodes, arcs)
- [x] Dossier de Pitch (document producteurs/éditeurs)
- [x] Exports (JSON / TXT / Markdown)

#### Analyse IA
- [x] Analyse IA contextualisée (6 dimensions, injection matrice + personnages + skills)
- [x] Progression inter-sessions (chart Bézier, deltas, streak)
- [x] Analyse standalone (sans contexte projet)

#### Immersion cinématographique
- [x] Arc de Tension (courbe Recharts, acte par acte)
- [x] Chambre des Atmosphères (palette, musique, style cinéma)
- [x] Constellation (carte SVG interactive)
- [x] Dialogue des Personnages (chat IA incarné)
- [x] Mode Réalisateur (découpe technique depuis un passage)
- [x] Carnet de Tournage (compilation PDF imprimable)
- [x] Écho du Temps (résonances mythiques/historiques/culturelles)
- [x] Miroir Artistique (réflexion poétique, thème caché)
- [x] Les 5 Piliers (humour/suspense/émotion/tendresse/surprise)
- [x] **Séquencier** (découpage professionnel en séquences numérotées)
- [x] **Note d'Intention Cinématographique** (document CNC/producteurs/festivals)

#### Laboratoire & Skills
- [x] Laboratoire de recherche narratif (génération de corpus IA)
- [x] Skills narratifs secrets (injectés dans les prompts d'analyse)
- [x] Cron quotidien automatique (enrichissement du corpus)

#### Infrastructure
- [x] Docker + Docker Compose (déploiement VPS)
- [x] Nginx (reverse proxy, SSL, gzip, cache statique)
- [x] Admin sécurisé (HMAC-SHA256, tableau de bord complet)

---

### 🔜 Court terme (prochains sprints)

- [ ] **Export PDF natif** — Note d'Intention et Séquencier en PDF côté serveur (Puppeteer ou jsPDF)
- [ ] **Export CSV des analyses** — archiver et partager avec un éditeur ou script-doctor
- [ ] **Pagination** — listes analyses et projets (après 50+ entrées)
- [ ] **Connexion ateliers → Analyse IA** — analyser directement ce qui a été généré dans les ateliers

### 📅 Moyen terme (1–3 mois)

- [ ] **Analyse comparative** — superposer deux extraits du même projet
- [ ] **Alertes de drift narratif** — notifier si 2 analyses consécutives < 40 en cohérence
- [ ] **Mode lecture éditeur** — vue simplifiée sans scores, juste le feedback qualitatif
- [ ] **Graphe de relations drag & drop** — constellation interactive avec repositionnement
- [ ] **Logline Generator** — générateur de loglines alternatives depuis la matrice
- [ ] **Storyboard texte** — description scène par scène depuis le séquencier

### 🔭 Long terme (6–12 mois)

- [ ] **Multi-utilisateurs** — authentification propre (Clerk Auth), espaces séparés
- [ ] **Webhook API** — intégration Notion / Obsidian / Scrivener
- [ ] **Analyse de structure globale** — pas juste un extrait, mais le projet dans son ensemble
- [ ] **Comparaison inter-projets** — cohérence stylistique entre deux projets
- [ ] **Mode collaboratif** — co-écriture avec partage de la matrice

---

*Document mis à jour le 3 mai 2026 — Matrice Narrative v2.0*
*20 tables PostgreSQL · 33 pages frontend · ~80 endpoints API · 11 outils Immersion*
