# MATRICE NARRATIVE — Documentation Technique & Stratégie

*Studio créatif OS pour auteurs et cinéastes — Version complète*

---

## TABLE DES MATIÈRES

1. [Vision du projet](#1-vision-du-projet)
2. [Architecture technique](#2-architecture-technique)
3. [Base de données — Schéma complet](#3-base-de-données--schéma-complet)
4. [API Server — Endpoints & logique métier](#4-api-server--endpoints--logique-métier)
5. [Frontend — Pages & composants](#5-frontend--pages--composants)
6. [Module d'analyse IA — Cœur du système](#6-module-danalyse-ia--cœur-du-système)
7. [Administration — Tableau de bord secret](#7-administration--tableau-de-bord-secret)
8. [Techniques clés employées](#8-techniques-clés-employées)
9. [Stratégie de mise en place durable](#9-stratégie-de-mise-en-place-durable)
10. [Roadmap prioritaire](#10-roadmap-prioritaire)

---

## 1. VISION DU PROJET

**Matrice Narrative** est un OS créatif premium destiné aux auteurs de romans et aux cinéastes. Il n'est pas un simple éditeur de texte — c'est un système de pensée narratif qui accompagne le créateur de l'idée initiale jusqu'à la cohérence finale de son œuvre.

### Philosophie centrale

> *L'IA ne génère pas à la place de l'auteur. Elle analyse, confronte, et révèle ce que l'auteur n'a pas encore vu.*

Trois piliers :

- **La Matrice** : un document vivant qui capture l'ADN narratif d'un projet (logline, conflits, thèmes, règles du monde, personnages pivots, motifs symboliques).
- **L'Analyse IA** : un diagnostic de cohérence qui compare chaque extrait écrit à la matrice déclarée, et note sur 6 dimensions.
- **La Progression** : un suivi longitudinal de l'évolution des scores session par session, pour mesurer la croissance narrative réelle.

### Public cible

Auteurs francophones de fiction (roman, scénario, série, pitch) qui travaillent de manière professionnelle ou semi-professionnelle et souhaitent un outil de réflexion narratif à la hauteur de leur ambition.

---

## 2. ARCHITECTURE TECHNIQUE

### Stack

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Frontend | React 18 + Vite 5 + TypeScript | Interface utilisateur SPA |
| Routing | Wouter | Routeur léger côté client |
| Styling | Tailwind CSS v4 | Système de classes utilitaires |
| UI Components | shadcn/ui (Radix UI) | Composants accessibles primitifs |
| Backend | Express 5 + TypeScript | API REST + SSE streaming |
| ORM | Drizzle ORM | Requêtes typesafe PostgreSQL |
| Base de données | PostgreSQL (Replit native) | Persistance principale |
| IA | OpenAI GPT-5.4 (via proxy Replit) | Analyse narrative, génération de contexte |
| Monorepo | pnpm workspaces | Gestion multi-packages |
| Validation | Zod v4 | Schémas de validation runtime |

### Structure monorepo

```
workspace/
├── artifacts/
│   ├── matrice-narrative/       # Frontend React + Vite (port dynamique)
│   │   └── src/
│   │       ├── pages/           # 21 pages (routes)
│   │       ├── components/      # Composants réutilisables
│   │       └── context/         # Contextes React (Admin, etc.)
│   ├── api-server/              # Backend Express 5
│   │   └── src/
│   │       └── routes/          # 6 fichiers de routes
│   └── mockup-sandbox/          # Sandbox Canvas (prévisualisations isolées)
├── lib/
│   ├── db/                      # Schémas Drizzle ORM + migrations
│   └── api-client-react/        # Hooks React Query générés par Orval
└── scripts/                     # Utilitaires partagés
```

### Routage proxy

Un reverse proxy global route le trafic par chemin :

- `/` → Frontend Matrice Narrative
- `/api` → API Server Express
- `/preview` → Mockup Sandbox (canvas)

Les chemins ne sont **pas** réécrits. Chaque service gère son propre préfixe de base.

### Communication Frontend ↔ API

- **Requêtes classiques** : `fetch(BASE + "/api/...")` avec `BASE = import.meta.env.BASE_URL.replace(/\/$/, "")`
- **Streaming IA** : Server-Sent Events (SSE) via `Accept: text/event-stream`
- **Authentification admin** : Header `X-Admin-Token` = HMAC-SHA256(ADMIN_PASSWORD, SESSION_SECRET)

---

## 3. BASE DE DONNÉES — SCHÉMA COMPLET

### Table `projects`

Représente un projet créatif (roman, film, série, pitch).

```
id              text PRIMARY KEY (UUID auto)
title           text NOT NULL
rawIdea         text NOT NULL          — idée brute de l'auteur
inputType       text                   — "roman" | "scenario" | "serie" | "pitch"
genre           text NOT NULL          — genre narratif
tone            text NOT NULL          — registre émotionnel
targetFormat    text NOT NULL          — format cible
temporalLogic   text                   — logique temporelle de l'univers
realityLevel    text                   — niveau de réalisme
targetAudience  text                   — public cible
artisticAmbition text                  — ambition déclarée de l'auteur
progression     real DEFAULT 0         — avancement global (0–100)
createdAt       timestamp
updatedAt       timestamp
```

### Table `narrative_matrices`

Le cœur du système — la matrice narrative d'un projet.

```
id                  text PRIMARY KEY
projectId           text REFERENCES projects(id) ON DELETE CASCADE
centralConcept      text      — concept central
logline             text      — pitch en une phrase
shortPitch          text      — pitch court (< 5 phrases)
longSynopsis        text      — synopsis développé
genre, tone         text
themes              jsonb[]   — thèmes principaux
universeLaws        jsonb[]   — lois de l'univers fictif
temporalRules       text      — règles temporelles
spatialRules        text      — règles d'espace
visibleWorld        text      — monde visible
invisibleForces     text      — forces invisibles (métaphysiques, etc.)
centralConflict     text      — conflit principal
protagonist         text      — protagoniste
antagonist          text      — antagoniste
emotionalStakes     text      — enjeux émotionnels
symbolicMotifs      jsonb[]   — motifs symboliques récurrents
powerObjects        jsonb[]   — objets de pouvoir narratif
secrets             jsonb[]   — secrets et révélations prévues
possibleEndings     jsonb[]   — fins possibles envisagées
coherenceRules      jsonb[]   — règles de cohérence à respecter
updatedAt           timestamp
```

### Table `emotional_cores`

Noyau émotionnel du projet — la carte des émotions et de l'arc du lecteur.

```
id                  text PRIMARY KEY
projectId           text REFERENCES projects(id) ON DELETE CASCADE
primaryEmotion      text      — émotion principale visée
emotionalJourney    text      — arc émotionnel du lecteur
keyMoments          jsonb[]   — moments émotionnels clés
contrastedEmotions  jsonb[]   — émotions en opposition
targetFeeling       text      — ressenti final voulu
readerEmpathy       text      — stratégie d'empathie lecteur
catharsis           text      — catharsis visée
emotionalRhythm     text      — rythme émotionnel global
```

### Table `characters`

Personnages du projet avec leurs relations et psychologie.

```
id              text PRIMARY KEY
projectId       text REFERENCES projects(id) ON DELETE CASCADE
name            text NOT NULL
role            text           — protagonist | antagonist | secondary | mentor...
archetype       text           — archétype jungien ou narratif
background      text           — histoire passée
motivation      text           — désir profond
fear            text           — peur centrale
secret          text           — secret porteur de l'arc
relationships   jsonb          — relations avec d'autres personnages
voiceStyle      text           — style de voix/dialogue
physicalTraits  text           — traits physiques distinctifs
psychologicalTraits text       — traits psychologiques
arc             text           — évolution sur l'histoire
```

### Table `manuscript_analyses`

Analyses IA des extraits de manuscrit — le moteur de feedback.

```
id                  text PRIMARY KEY
title               text NOT NULL          — titre donné à l'extrait analysé
projectId           text                   — optionnel (analyse standalone possible)
contentExcerpt      text                   — texte analysé (stocké partiellement)
wordCount           integer DEFAULT 0

-- Scores 0–100
globalScore         integer DEFAULT 0      — score synthétique pondéré
structureScore      integer DEFAULT 0      — structure narrative
emotionScore        integer DEFAULT 0      — impact émotionnel
archetypeScore      integer DEFAULT 0      — usage des archétypes
originalityScore    integer DEFAULT 0      — originalité stylistique
coherenceScore      integer DEFAULT 0      — cohérence vs matrice narrative

-- Tableaux d'analyse
strengths           json[]                 — points forts détectés
weaknesses          json[]                 — faiblesses + pistes de correction
detectedArchetypes  json[]                 — archétypes identifiés
detectedEmotions    json[]                 — émotions identifiées
appliedTechniques   json[]                 — techniques narratives employées
missingTechniques   json[]                 — techniques conseillées absentes
coherenceValidations json[]               — points de cohérence validés vs matrice
coherenceIssues     json[]                 — écarts détectés vs matrice

-- Œuvres comparables
comparableWorks     json[] {title, author, relevance}

-- Analyses longues (texte libre)
structureAnalysis   text                   — analyse structure détaillée
emotionAnalysis     text                   — analyse émotionnelle détaillée
recommendations     text                   — recommandations concrètes
coherenceAnalysis   text                   — analyse cohérence vs matrice
verdict             text                   — verdict synthétique (1 phrase)

createdAt           timestamp
```

### Table `research_lab_entries`

Entrées de recherche narrative générée par IA (Laboratoire).

```
id              text PRIMARY KEY
title           text
researchType    text       — standard | deep | archetype | emotional | cultural | comparative
era             text       — époque historique ou narrative
eraLabel        text
culture         text       — culture principale étudiée
culture2        text       — culture secondaire (comparaison)
customInput     text       — sujet libre saisi par l'admin
summary         text       — synthèse narrative
keyTechniques   json[]     — techniques narratives extraites
notableWorks    json[]     — œuvres de référence
narrativeLessons text      — leçons narratives universelles
themes          json[]     — thèmes traités
universalScore  integer    — score d'universalité narrative (0–100)
skillsExtracted boolean    — si des skills ont été extraits de cette entrée
extractedSkillIds json[]   — IDs des skills générés
createdAt       timestamp
```

### Table `narrative_skills`

Skills narratifs secrets — construits automatiquement depuis les recherches.

```
id              text PRIMARY KEY
name            text NOT NULL
description     text
category        text       — structure | emotion | archetype | style | world | character...
promptContent   text       — contenu injecté dans les prompts IA
isActive        boolean DEFAULT true
isUniversal     boolean DEFAULT false
validationCount integer    — nombre d'entrées qui ont validé ce skill
validationSources json[]   — IDs des entrées sources
createdAt       timestamp
```

---

## 4. API SERVER — ENDPOINTS & LOGIQUE MÉTIER

### `/api/projects` — Gestion des projets

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/projects` | Liste tous les projets |
| POST | `/api/projects` | Crée un projet + génère la matrice initiale via IA (SSE) |
| GET | `/api/projects/:id` | Projet complet avec toutes ses sous-ressources |
| PUT | `/api/projects/:id` | Met à jour les métadonnées du projet |
| DELETE | `/api/projects/:id` | Supprime projet + cascade (matrice, analyses, personnages...) |
| GET | `/api/projects/:id/matrix` | Matrice narrative du projet |
| PUT | `/api/projects/:id/matrix` | Met à jour la matrice |
| GET | `/api/projects/:id/emotional-core` | Noyau émotionnel |
| GET | `/api/projects/:id/characters` | Liste des personnages |
| POST | `/api/projects/:id/characters` | Ajoute un personnage |

### `/api/manuscripts` — Analyses IA

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/manuscripts` | Toutes les analyses (optionnel: `?projectId=`) |
| POST | `/api/manuscripts/analyze` | Lance une analyse IA (SSE streaming) |
| DELETE | `/api/manuscripts/:id` | Supprime une analyse |

**Logique de l'analyse (POST /analyze) :**

1. Récupération du contexte projet en parallèle (projet + matrice + noyau émotionnel + personnages)
2. Récupération des skills narratifs actifs depuis la BDD
3. Construction du prompt système avec injection : matrice complète + skills actifs + personnages
4. Appel GPT-5.4 avec streaming
5. Parsing de la réponse JSON structurée
6. Calcul du score global (pondération : structure ×0.25 + émotion ×0.25 + archétypes ×0.20 + originalité ×0.15 + cohérence ×0.15)
7. Sauvegarde en BDD
8. Émission de l'événement SSE `done` avec les données complètes

### `/api/research-lab` — Laboratoire narratif (admin)

| Méthode | Endpoint | Auth |
|---------|----------|------|
| GET | `/api/research-lab/entries` | Admin |
| POST | `/api/research-lab/generate` | Admin (SSE) |
| POST | `/api/research-lab/daily` | Admin (SSE) |
| GET | `/api/research-lab/stats` | Admin |
| GET | `/api/research-lab/taxonomy` | Admin |
| DELETE | `/api/research-lab/entries/:id` | Admin |

### `/api/skills` — Skills narratifs

| Méthode | Endpoint | Auth |
|---------|----------|------|
| GET | `/api/skills` | Admin |
| PUT | `/api/skills/:id` | Admin |
| DELETE | `/api/skills/:id` | Admin |

---

## 5. FRONTEND — PAGES & COMPOSANTS

### Pages principales (21 routes)

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page (redirection ou accueil) |
| Dashboard | `/dashboard` | Vue d'ensemble de tous les projets |
| New Project | `/new-project` | Création d'un projet avec génération IA |
| Matrix | `/projects/:id/matrix` | Matrice narrative (éditable champ par champ) |
| Emotional Core | `/projects/:id/emotional-core` | Noyau émotionnel |
| Characters | `/projects/:id/characters` | Gestion des personnages |
| Relationships | `/projects/:id/relationships` | Graphe de relations entre personnages |
| World | `/projects/:id/world` | Monde & temporalité |
| HPSA | `/projects/:id/hpsa` | Scores HPSA (métriques narratives custom) |
| Book | `/projects/:id/book` | Atelier livre |
| Screenplay | `/projects/:id/screenplay` | Atelier scénario |
| Series | `/projects/:id/series` | Atelier série |
| Pitch | `/projects/:id/pitch` | Atelier pitch |
| Analyse (standalone) | `/analyse` | Analyse IA sans contexte projet |
| Analyse (projet) | `/projects/:id/analyse` | Analyse IA contextualisée + progression |
| Research | `/projects/:id/research` | Recherches associées au projet |
| Research Lab | `/research-lab` | Laboratoire de recherche narratif |
| Skills | `/skills` | Bibliothèque de skills narratifs |
| Exports | `/projects/:id/exports` | Export du projet |
| Admin | `/admin` | Tableau de bord admin (protégé) |

### Composants clés

**`AppLayout.tsx`** — Layout principal avec sidebar de navigation contextuelle :
- `rootNav` : navigation globale (dashboard, analyser, créer)
- `projectNav` : navigation intra-projet (matrice, personnages, ateliers, analyse...)
- Détection automatique du projet actif par l'URL

**`AdminAnalysesTab.tsx`** — Onglet admin analyses (créé en dernière session) :
- Stats KPI (5 cartes)
- Chart SVG global multi-projets avec axe temporel réel
- Tableau per-projet avec sparklines
- Liste filtrée de toutes les analyses avec suppression

**`EditableField.tsx`** — Champ éditable inline avec sauvegarde automatique

**`GenerationProgress.tsx`** — Barre de progression pour les générations IA (SSE)

**`SectionCard.tsx`** — Carte de section narrative réutilisable

---

## 6. MODULE D'ANALYSE IA — CŒUR DU SYSTÈME

### Vue d'ensemble du flux complet

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
  └── Skills actifs (techniques narratives secrètes validées)
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
Sauvegarde BDD (manuscriptAnalysesTable)
        ↓
SSE → event { type: "done", data: analysisComplete }
        ↓
Frontend met à jour l'UI avec les résultats
```

### Les 6 dimensions d'analyse

| Score | Poids | Description |
|-------|-------|-------------|
| Structure | 25% | Architecture narrative, actes, tension dramatique, rythme |
| Émotion | 25% | Impact émotionnel, résonance, arc émotionnel du lecteur |
| Archétypes | 20% | Usage des figures archétypales, profondeur symbolique |
| Originalité | 15% | Voix unique, subversion des codes, fraîcheur stylistique |
| Cohérence | 15% | Fidélité à la matrice déclarée (genre, ton, motifs, règles) |
| **Global** | — | Moyenne pondérée des 5 scores |

### Injection de contexte (context injection)

Le système prompt injecte automatiquement :

- **Métadonnées projet** : genre, ton, ambition artistique, public cible
- **Logline** et synopsis
- **Conflit central** et protagoniste/antagoniste
- **Règles du monde** (temporelles, spatiales, lois)
- **Motifs symboliques** et objets de pouvoir
- **Règles de cohérence** déclarées par l'auteur
- **Arc émotionnel** et moments clés
- **Personnages** (jusqu'à 8, avec archétype, motivation, secret)
- **Skills narratifs actifs** (techniques validées par le Laboratoire)

Cette injection transforme le modèle en un "lecteur expert" du projet spécifique — pas une analyse générique, mais un diagnostic confronté à l'intention de l'auteur.

### Page Analyse — vue Résultats

**Onglet Analyser :**
- 6 anneaux SVG de score (animés au chargement, avec delta vs session précédente)
- Section cohérence : validations (checkmarks verts) + écarts (alertes rouges)
- Forces / Faiblesses (avec pistes de correction)
- Techniques appliquées + techniques manquantes recommandées
- Œuvres comparables (titre, auteur, pertinence)
- Verdict synthétique

**Onglet Progression :**
- 4 cartes statistiques (total sessions, progression depuis le début, meilleur score, cohérence max)
- Badge "streak" si 3 sessions consécutives en hausse
- Chart SVG multi-lignes Bézier (6 courbes colorées)
- Timeline des sessions avec deltas inter-sessions
- Dots cliquables pour naviguer vers une analyse spécifique

### Visualisation — Chart SVG custom

Le chart de progression est entièrement dessiné en SVG natif (sans librairie externe) :

```
Courbes Bézier smooth : C mx py-1 mx py C ...
Zone remplie sous la courbe globale (gradient fill)
Lignes de grille horizontales (20, 40, 60, 80, 100)
Lignes de grille verticales au survol (hover)
Tooltip flottant positionné dynamiquement
Points cliquables par session
Légende avec lignes stylisées (solid / dashed)
```

---

## 7. ADMINISTRATION — TABLEAU DE BORD SECRET

### Accès

URL : `/admin`  
Authentification : Mot de passe → HMAC-SHA256(ADMIN_PASSWORD, SESSION_SECRET) → `X-Admin-Token`  
Les variables `ADMIN_PASSWORD` et `SESSION_SECRET` sont dans les secrets Replit.

### Onglets admin (5)

#### 1. Laboratoire (`/admin` → "Laboratoire")

**Matrice de couverture** : grille cultures × époques montrant les zones déjà explorées.

**Générateur de recherche** : 6 types disponibles :
- Standard : analyse narrative d'une culture/époque
- Deep : analyse approfondie multi-dimensionnelle
- Archétype : focus sur les figures archétypales
- Émotionnel : focus sur les patterns émotionnels
- Culturel : comparaison cross-culturelle
- Comparatif : comparaison entre deux traditions

**Cron quotidien** : route `/api/research-lab/daily` pour génération automatique planifiée.

#### 2. Skills (`/admin` → "Skills")

Bibliothèque de techniques narratives extraites des recherches :
- Activation/désactivation par skill
- Filtrage par catégorie
- Les skills actifs sont injectés dans **tous** les prompts d'analyse

#### 3. Entrées (`/admin` → "Entrées")

Bibliothèque complète des recherches générées :
- Filtrage par type
- Expansion de chaque entrée (techniques, leçons, œuvres)
- Suppression avec cascade (supprime les skills associés)

#### 4. Analyses IA (`/admin` → "Analyses IA") — *Nouveau*

Monitoring global de toutes les analyses manuscrit :
- **5 KPIs** : total, score moyen, cohérence moyenne, meilleur score, mots analysés
- **Timeline globale** (SVG) : tous les projets sur axe temporel réel, taille du point = cohérence
- **Progression par projet** : premier/dernier score, delta, meilleur, sparkline
- **Liste complète** : filtrable par projet, suppression par ligne

#### 5. Roadmap (`/admin` → "Roadmap")

Suivi visuel des features planifiées, en cours, livrées.

---

## 8. TECHNIQUES CLÉS EMPLOYÉES

### Server-Sent Events (SSE) — Streaming IA

Le SSE permet d'afficher les résultats de l'IA **progressivement**, sans attendre la fin complète. Cela évite les timeouts et donne un retour visuel immédiat à l'utilisateur.

**Côté serveur (Express) :**
```typescript
res.setHeader("Content-Type", "text/event-stream");
res.setHeader("Cache-Control", "no-cache");
res.setHeader("Connection", "keep-alive");

// Envoi d'un événement
const sseSend = (res, data) => {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

// Événements émis :
// { type: "progress", percent: 30, step: "Analyse structurelle..." }
// { type: "done", data: { ...analysisComplete } }
// { type: "error", message: "..." }
```

**Côté client (React) :**
```typescript
const reader = res.body.getReader();
const decoder = new TextDecoder();
let buf = "";
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buf += decoder.decode(value, { stream: true });
  // Parser les lignes "data: {...}"
}
```

### Drizzle ORM — Requêtes typesafe

Drizzle génère les types TypeScript directement depuis le schéma — pas de décalage possible entre la BDD et le code :

```typescript
// Requête parallèle pour le contexte d'analyse
const [project, matrix, emotionalCore, characters] = await Promise.all([
  db.select().from(projectsTable).where(eq(projectsTable.id, projectId)).limit(1),
  db.select().from(narrativeMatricesTable).where(eq(...)).limit(1),
  db.select().from(emotionalCoresTable).where(eq(...)).limit(1),
  db.select().from(charactersTable).where(eq(...)).limit(8),
]);
```

**Migrations** : `pnpm --filter @workspace/db run push` (Drizzle Kit push)

### Context Injection Pattern

Au lieu de donner au modèle un prompt générique "analyse ce texte", on injecte tout le contexte déclaratif de l'auteur dans le prompt système. Le modèle devient un expert du projet spécifique.

Ce pattern est la différence fondamentale entre un outil générique et un outil professionnel : **le modèle analyse en "connaissant" l'intention de l'auteur**.

### Pondération des scores

La pondération (structure ×0.25, émotion ×0.25, archétypes ×0.20, originalité ×0.15, cohérence ×0.15) est définie côté serveur, pas côté IA. L'IA retourne les 5 scores bruts, et le serveur calcule le global. Cela garantit la reproductibilité et permet de modifier la pondération sans toucher au prompt.

### SVG custom (sans librairie externe)

Tous les graphiques (anneaux de score, chart multi-lignes, sparklines) sont en SVG natif :
- Aucune dépendance externe (pas de recharts, chart.js, etc.)
- Contrôle total du rendu, des animations, des interactions
- Performance maximale (rendu synchrone, pas de re-render inutile)

**Courbes Bézier smooth :**
```
Pour chaque paire de points consécutifs (P[i-1], P[i]) :
midX = (x[i-1] + x[i]) / 2
→ Cubique : C midX y[i-1], midX y[i], x[i] y[i]
```
Résultat : courbes fluides sans artefacts angulaires.

### HMAC-SHA256 pour l'auth admin

```
token = HMAC-SHA256(key: SESSION_SECRET, message: ADMIN_PASSWORD)
```
Envoyé dans chaque requête admin via `X-Admin-Token`. Jamais stocké côté client (recalculé à chaque session). Pas de JWT, pas de cookie — simple et robuste pour un admin solo.

---

## 9. STRATÉGIE DE MISE EN PLACE DURABLE

### Phase 1 — Stabilisation (immédiat)

**Objectif** : Rendre le système production-ready, fiable, et maintenable.

**Actions prioritaires :**

1. **Déploiement sur Replit** :
   - Cliquer "Publish" dans l'interface Replit
   - Le système configure automatiquement HTTPS, health checks, et le domaine `.replit.app`
   - Variables d'environnement déjà en place (`ADMIN_PASSWORD`, `SESSION_SECRET`, `DATABASE_URL`)

2. **Sauvegardes BDD** :
   - Replit PostgreSQL inclut des snapshots automatiques
   - Exporter périodiquement via l'outil admin : dump CSV des analyses et projets

3. **Monitoring simple** :
   - L'onglet admin "Analyses IA" est le tableau de bord de santé
   - Vérifier le score moyen global — une baisse soudaine = problème de prompt ou de contexte

4. **Test de régression minimal** :
   - Maintenir un projet test avec une matrice bien définie
   - Analyser le même extrait après chaque changement majeur
   - Vérifier que les scores restent cohérents

### Phase 2 — Enrichissement du laboratoire (1–3 mois)

**Objectif** : Construire un corpus de skills narratifs suffisant pour que l'IA devienne vraiment experte.

**Cadence recommandée** :

| Fréquence | Action |
|-----------|--------|
| Quotidien (automatique) | 1 recherche via cron (`/api/research-lab/daily`) |
| Hebdomadaire | Revue des skills extraits — activer/désactiver manuellement |
| Mensuel | Générer 4–6 recherches comparatives (2 cultures × 2 époques) |

**Objectif corpus** :
- 30+ entrées dans le laboratoire
- 50+ skills actifs couvrant toutes les catégories
- Couverture de 6+ cultures et 5+ époques

### Phase 3 — Utilisation créative intensive (1–6 mois)

**Routine d'analyse recommandée pour un auteur :**

1. **Créer le projet** avec l'idée brute — laisser l'IA générer la matrice initiale
2. **Affiner la matrice** manuellement — être précis sur les règles de cohérence
3. **Analyser après chaque session d'écriture** — ne jamais sauter l'analyse
4. **Lire le delta** — la progression inter-sessions est l'indicateur le plus précieux
5. **Agir sur les faiblesses** — chaque analyse donne des pistes concrètes de correction

**Seuils de qualité :**

| Score global | Diagnostic | Action |
|-------------|-----------|--------|
| 80–100 | Excellent | Continuer dans cette direction |
| 65–79 | Bon | Corriger les faiblesses majeures puis continuer |
| 50–64 | Moyen | Réécriture partielle nécessaire |
| < 50 | Insuffisant | Retour sur la matrice — l'intention est-elle claire ? |

**Score cohérence < 40** avec matrice bien remplie = signal fort que l'extrait dérive de l'intention narrative.

### Phase 4 — Évolution du système (6–12 mois)

**Features à haute valeur ajoutée (dans l'ordre de priorité recommandée) :**

1. **Export CSV/PDF des analyses** — pour archiver et partager avec un éditeur ou un script-doctor
2. **Analyse comparative** — superposer deux extraits différents du même projet
3. **Alertes de drift narratif** — notifier si 3 analyses consécutives montrent une baisse de cohérence
4. **Mode "éditeur"** — vue simplifiée sans les scores techniques, juste les forces/faiblesses
5. **API webhook** — permettre d'envoyer automatiquement un extrait depuis un éditeur externe (Notion, Scrivener, Obsidian)
6. **Analyse de structure globale** — pas juste un extrait, mais la structure d'ensemble du projet

### Coûts et scalabilité

**Infrastructure actuelle :**
- Replit (hébergement + BDD + proxy) — coût mensuel fixe
- OpenAI GPT-5.4 via Replit AI Integrations — facturation à l'usage

**Estimation coût par analyse :**
- Prompt système (contexte projet) : ~2 000–4 000 tokens
- Extrait analysé : ~500–2 000 tokens
- Réponse JSON structurée : ~1 500–3 000 tokens
- **Total : ~4 000–9 000 tokens par analyse**

**Recommandation** : Limiter la taille des extraits à 1 500 mots maximum pour équilibrer qualité et coût.

### Maintenance du code

**Principes à respecter :**

1. **Ne jamais modifier les schémas BDD sans migration** : toujours passer par `pnpm --filter @workspace/db run push` après modification de `lib/db/src/schema/`
2. **Typecheck avant merge** : `pnpm run typecheck:libs && pnpm --filter @workspace/matrice-narrative run typecheck`
3. **Le prompt d'analyse est dans** `artifacts/api-server/src/routes/manuscripts.ts` — c'est le fichier le plus sensible du système
4. **Les skills injectés sont dans** `narrative_skills` table, colonne `promptContent` — qualifier précisément chaque skill
5. **Logs serveur** : utiliser `req.log` dans les routes Express (jamais `console.log`)

---

## 10. ROADMAP PRIORITAIRE

### Court terme (prochain sprint)

- [ ] Export CSV des analyses depuis l'onglet admin
- [ ] Connexion des ateliers (Atelier Livre, Scénario) à l'analyse IA — analyser directement ce qui a été généré
- [ ] Pagination de la liste des analyses (après 50+ analyses)

### Moyen terme

- [ ] Analyse comparative entre deux extraits du même projet
- [ ] Alertes de drift narratif (cohérence < 40 sur 2 sessions consécutives)
- [ ] Mode lecture éditeur (sans les scores, juste le feedback qualitatif)
- [ ] Graphe de relations personnages interactif (drag & drop)

### Long terme

- [ ] Webhook API pour Notion/Obsidian/Scrivener
- [ ] Analyse de la structure globale du manuscrit (non plus juste des extraits)
- [ ] Multi-utilisateurs avec authentification propre (Clerk Auth)
- [ ] Comparaison inter-projets (est-ce que deux projets ont une cohérence stylistique similaire ?)

---

*Document généré le 2 mai 2026 — Matrice Narrative v1.0*  
*6 722 lignes de code · 21 pages · 6 fichiers de routes API · 7 tables PostgreSQL*
