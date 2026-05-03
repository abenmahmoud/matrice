# Matrice Narrative

## Vue d'ensemble

**Matrice Narrative** est un OS créatif premium pour auteurs et cinéastes francophones. Il transforme une idée brute en œuvre cinématographique de haut niveau via un workflow structuré en 5 phases assistées par IA (OpenAI GPT). Interface entièrement en français, dark mode, palette violet/indigo.

**Stack** : React + Vite (frontend) • Express 5 (API) • PostgreSQL + Drizzle ORM • OpenAI GPT (via Replit AI Integrations) • pnpm monorepo

**24 tables DB • 29 modules • 11 outils Immersion • Moteur IA (24 skills + 36 entrées cinéma mondial)**

---

## Architecture

```
pnpm monorepo
├── artifacts/
│   ├── matrice-narrative/      # Frontend React + Vite (Tailwind, violet/indigo, wouter routing)
│   └── api-server/             # API Express 5 (port 8080, Pino logger)
├── lib/
│   ├── db/                     # Schéma Drizzle + connexion PostgreSQL
│   ├── api-spec/               # Spec OpenAPI (source de vérité des contrats API)
│   ├── api-zod/                # Zod schemas générés (validation serveur)
│   ├── api-client-react/       # React Query hooks générés (client frontend)
│   └── integrations-openai-ai-server/  # Client OpenAI (proxy Replit AI Integrations)
├── docker-compose.yml          # Déploiement VPS production
├── Dockerfile.api              # Image Docker API server (node:22-alpine, multi-stage)
├── Dockerfile.frontend         # Image Docker frontend (nginx:alpine)
├── nginx.conf                  # Config nginx (reverse proxy, SSL, gzip, cache)
├── .env.example                # Variables d'environnement à copier
└── DEPLOY.md                   # Guide de déploiement VPS complet
```

---

## Pipeline narratif — 5 phases

### Phase 1 — Comprendre

| Route | Module | Description |
|-------|---------|-------------|
| `/projects/:id/matrix` | Matrice Narrative | Logline, synopsis, thèmes, lois de l'univers, conflits |
| `/projects/:id/emotional-core` | Noyau Émotionnel | Blessure, peur, masque, besoin + pipeline visuel Chemin de Correction (9 étapes) |
| `/projects/:id/research` | Notes de Recherche | Documentation contextuelle générée par IA |

### Phase 2 — Construire

| Route | Module | Description |
|-------|---------|-------------|
| `/projects/:id/characters` | Personnages | Galerie complète (5 archétypes), psychologie jungienne profonde |
| `/projects/:id/relationships` | Relations | Graphe IA des relations, blessures/peurs/secrets croisés |
| `/projects/:id/world` | Monde & Temps | Worldbuilding, chronologie, logique temporelle |

### Phase 3 — Écrire

| Route | Module | Description |
|-------|---------|-------------|
| `/projects/:id/book` | Atelier Roman | Chapitres enrichis (10 champs : PDV, lieu, arc émotionnel, scène clé, crochet final…) |
| `/projects/:id/screenplay` | Atelier Scénario | 15 beats labellisés, scènes avec ton émotionnel + fonction dramatique, script Fountain, onglet Atelier Film |
| `/projects/:id/film-scenes` | Scènes Jouables | 10 scènes cinématographiques jouables (structure, dialogue, mise en scène, analyse H.P.S.A.) |
| `/projects/:id/series` | Atelier Série | Épisodes enrichis (16 champs : question dramatique, arcs A/B, midpoint, cliffhanger, arc saison…) |

### Phase 4 — Corriger

| Route | Module | Description |
|-------|---------|-------------|
| `/projects/:id/hpsa` | Scores H.P.S.A. | 4 axes purs (Humour / Pleur / Suspense / Attractivité) + globalScore + priorityFixes |
| `/projects/:id/analyse` | Analyse IA contextuelle | Diagnostic confronté à la matrice, sélecteur de type (Scène / Chapitre / Épisode / Pitch / Auto), progression par session |

### Phase 5 — Présenter

| Route | Module | Description |
|-------|---------|-------------|
| `/projects/:id/pitch` | Dossier de Pitch | Document de présentation producteurs/éditeurs |
| `/projects/:id/note-intention` | Note d'Intention | Document formel CNC/festivals (vision, parti pris, univers visuel) |
| `/projects/:id/exports` | Exports | 9 formats groupés par catégorie (Universel / Roman / Cinéma / Série) |

### Section Studio — Outils Immersion

| Route | Module | Description |
|-------|---------|-------------|
| `/projects/:id/tension-arc` | Arc de Tension | Courbe émotionnelle dramatique (Recharts), acte par acte |
| `/projects/:id/atmosphere` | Chambre des Atmosphères | Palette couleurs, musique, textures, style cinéma |
| `/projects/:id/constellation` | Constellation | Carte SVG interactive des personnages et relations |
| `/projects/:id/dialogue` | Dialogue des Personnages | Chat IA incarnant les personnages dans leur voix propre |
| `/projects/:id/director` | Mode Réalisateur | Découpe technique (plan, caméra, focale, lumière, son) |
| `/projects/:id/notebook` | Carnet de Tournage | Compilation Atmosphères + Arc → document imprimable |
| `/projects/:id/echo-temps` | Écho du Temps | Résonances mythiques, historiques, culturelles |
| `/projects/:id/miroir` | Miroir Artistique | Réflexion poétique (thème caché, angles morts) |
| `/projects/:id/piliers` | Les 5 Piliers | Analyse Humour / Suspense / Émotion / Tendresse / Surprise |
| `/projects/:id/sequencier` | Séquencier | Découpage professionnel numéroté (fonction dramatique, arc émotionnel, durée) |

---

## Base de données — 22 tables

```
projects                  — Projets et métadonnées
narrative_matrices        — Matrice narrative (logline, synopsis, thèmes, lois univers)
emotional_cores           — Noyau émotionnel du protagoniste (blessure, masque, peurs)
emotional_paths           — Parcours émotionnel (généré par IA)
characters                — Personnages (5 archétypes, psychologie jungienne)
relationships             — Relations entre personnages (générées par IA)
world_data                — Worldbuilding et chronologie
research_data             — Notes de recherche
hpsa_scores               — Scores H.P.S.A. (4 axes + globalScore + priorityFixes jsonb)
book_outlines             — Plan chapitré roman (chapitres jsonb enrichis, 10 champs)
screenplays               — Scénario (beats labellisés, scènes avec ton/fonction, Fountain)
series_data               — Structure série (épisodes jsonb enrichis, 16 champs)
film_data                 — Données film (concept, logline, format, promesses visuelles/émotionnelles)
film_scenes               — Scènes jouables (10 scènes, structure complète + analyse HPSA)
pitch_documents           — Dossier de pitch
tension_arcs              — Arc de tension dramatique
atmosphere_data           — Chambre des atmosphères
echo_temps                — Écho du temps (résonances mythiques/historiques)
miroir_artistique         — Miroir artistique (réflexion poétique)
cinq_piliers              — Les 5 piliers dramatiques
sequencier                — Séquencier professionnel (découpage en séquences)
note_intention            — Note d'intention cinématographique (document CNC/producteurs)
ai_skills                 — Skills d'injection IA (technique narrative, histoire cinéma, style auteur, standards pro)
cinema_knowledge          — Base cinéma mondial (36+ entrées : Nouvelle Vague, Coréen, Iranien, Soviétique, etc.)
```

---

## Exports disponibles

| Type | Format | Catégorie |
|------|--------|-----------|
| `matrix` | JSON | Universel |
| `emotional-core` | JSON | Universel |
| `hpsa` | JSON | Universel |
| `pitch` | Markdown | Universel |
| `complete` | JSON | Universel |
| `book-outline` | Markdown | Roman |
| `screenplay` | .fountain | Cinéma |
| `series-markdown` | Markdown | Série — bible complète avec tous les épisodes |
| `season-arc-json` | JSON | Série — arc saison structuré avec arcs émotionnels |

---

## Génération IA

Tous les modules utilisent `gpt-5.4` (Replit AI proxy) via la fonction centrale `aiJson()` dans `generationService.ts`, avec `response_format: json_object` et fallback déterministe si l'API échoue.

**Nouveaux services de génération (session 3) :**
- `generateFilmData()` — concept film, logline, format, promesse visuelle et émotionnelle
- `generatePlayableScenes()` — 10 scènes jouables avec structure complète, dialogue, mise en scène, analyse H.P.S.A. par scène
- `checkSceneHpsa()` — analyse H.P.S.A. contextuelle d'une scène existante (4 axes + feedback)

**Analyse contextuelle par type (`/api/manuscripts/analyze`) :**
Paramètre `analyseType` (`scene` / `chapter` / `series` / `pitch`) injecte un focus différencié dans le system prompt :
- `scene` → script doctor (tension, sous-texte, fonction dramatique, HPSA)
- `chapter` → éditeur littéraire (voix narrative, focalisation, densité prose, arc)
- `series` → showrunner (question dramatique, arcs A/B/C, cliff-hanger, bible)
- `pitch` → comité de lecture (accroche, unicité, potentiel, comparables)

**Paramètres `aiJson` :**
- `skillsContext` — injecte les skills du Laboratoire narratif dans le system prompt
- `opts.temperature` — modulé par type : créatif (0.85–0.88), narratif (0.82), analytique (non défini)
- `opts.maxTokens` — augmenté pour les modules longs : Séquencier (14 000), Note d'Intention (12 000), défaut (8 192)

**Sur Replit** : variables auto-provisionnées (`AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`).

**Sur VPS** : utiliser une clé OpenAI directe + changer le modèle en `gpt-4o` dans `generationService.ts`.

---

## Notes techniques importantes

- **Codegen Orval** : l'index `lib/api-zod/src/index.ts` est **régénéré** à chaque `codegen` — ne jamais le modifier manuellement. Pour éviter les conflits de noms (`TS2308`), tout `requestBody` inline doit être converti en `$ref` vers un named schema dans `openapi.yaml`.
- **Migration DB** : `pnpm --filter @workspace/db run push` échoue en mode interactif sur Replit — utiliser `executeSql()` via le code_execution sandbox pour les migrations directes.
- **Scènes Jouables** : tables `film_data` et `film_scenes` créées directement via SQL (pas via drizzle push).
- **H.P.S.A.** : `hpsa_scores` a été migré — `global_score` (real) + `priority_fixes` (jsonb) ajoutés directement via SQL.
- **Logging** : jamais `console.log` côté serveur — utiliser `req.log` dans les routes, le singleton `logger` hors requête.
- **queryKey requis** : les hooks générés Orval nécessitent `queryKey` explicite dans les options query.
- **Routing** : Wouter côté frontend, Express Router côté API, paths gérés par le proxy Replit.
- **Dark mode** : classe `dark` sur `<html>`, palette violet `#7c3aed` / indigo `#4f46e5`.

---

## Commandes clés (développement)

```bash
# Typecheck complet (tous les packages)
pnpm run typecheck

# Régénérer hooks + Zod schemas depuis OpenAPI
pnpm --filter @workspace/api-spec run codegen

# Rebuild API server
pnpm --filter @workspace/api-server run build

# Migration DB directe (éviter drizzle push en mode interactif)
# → Utiliser executeSql() dans code_execution sandbox

# Rebuild libs composites
pnpm run typecheck:libs
```

---

## Déploiement

```bash
cp .env.example .env
# Remplir POSTGRES_PASSWORD, SESSION_SECRET, AI_INTEGRATIONS_OPENAI_API_KEY
docker compose up -d --build
```

Voir `DEPLOY.md` pour le guide complet VPS (SSL, migration DB, mises à jour).
