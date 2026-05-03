# Matrice Narrative

## Vue d'ensemble

**Matrice Narrative** est un OS créatif premium pour auteurs et cinéastes francophones. Il transforme une idée brute en œuvre cinématographique de haut niveau via un workflow structuré en 5 phases assistées par IA (OpenAI GPT). Interface entièrement en français, dark mode, palette violet/indigo.

**Stack** : React + Vite (frontend) • Express 5 (API) • PostgreSQL + Drizzle ORM • OpenAI GPT (via Replit AI Integrations) • pnpm monorepo

**25 tables DB • 31 modules • 11 outils Immersion • Moteur IA (24 skills + 36 entrées cinéma mondial) • Prisme des Quatre Publics (SRU)**

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
| `/projects/:id/prisme` | **Prisme des Quatre Publics** | **Score de Résonance Universelle (SRU) : 4 axes (Étincelle · Vibration · Profondeur · Maîtrise) + sceaux de tradition cinéma mondial** |

---

## Base de données — 25 tables

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
sru_scores                — Prisme des Quatre Publics (Étincelle/Vibration/Profondeur/Maîtrise, SRU, traditions, synthèse)
ai_skills                 — Skills d'injection IA (technique narrative, histoire cinéma, style auteur, standards pro)
cinema_knowledge          — Base cinéma mondial (36 entrées : Nouvelle Vague, Coréen, Iranien, Soviétique, etc.)
```

---

## Moteur IA — Skills & Connaissances Cinéma

### AI Skills (24 entrées seedées)

Blocs de savoir injectés automatiquement dans les prompts de génération selon le contexte :

| Catégorie | Description |
|-----------|-------------|
| `technique-narrative` | Plan-séquence, ellipse, montage dialectique, corps comme langage, silence, narration fragmentée, regard subjectif, réalisme magique |
| `histoire-cinema` | Nouvelle Vague, cinéma coréen, iranien, néoréalisme, montage soviétique |
| `structure-dramatique` | Structure 3 actes réinventée, antagoniste miroir, espace comme personnage |
| `style-auteur` | Autofiction comme universalité, signature visuelle |
| `culture-regionale` | Cinéma africain, latino-américain (Cinema Novo), asiatique |

### Cinema Knowledge (36 entrées seedées)

Base de référence pour le **Prisme des Quatre Publics** — traditions comparées lors de la génération SRU :

Nouvelle Vague · Néoréalisme · Montage soviétique · Expressionnisme · Cinéma allemand · Cinema Novo (Brésil) · Cinéma coréen contemporain · Cinéma iranien · Cinéma japonais (Ozu/Kurosawa) · Cinéma africain · Bollywood · Cinéma scandinave · Dogme 95 · Cinéma américain indépendant · Cinéma de genre américain · Nouvelle Hollywood · Wong Kar-wai / Hong Kong · Cinéma mexicain · Argentine · Europe de l'Est · Réalisme magique · etc.

---

## Prisme des Quatre Publics — SRU

### Principe

Le **Score de Résonance Universelle (SRU)** mesure la capacité d'un projet à toucher 4 publics distincts, chacun noté de 0 à 100 :

| Axe | Public | Ce qui est évalué |
|-----|--------|-------------------|
| **Étincelle** ✨ | Enfants · 4–12 ans | Émerveillement, magie narrative, peur salvatrice, joie pure |
| **Vibration** ⚡ | Jeunes · 13–25 ans | Authenticité, identité, rébellion juste, énergie |
| **Profondeur** 🌊 | Adultes · 26–60 ans | Complexité psychologique, nuance morale, portée sociale |
| **Maîtrise** 🎬 | Spécialistes · Professionnels | Innovation formelle, traditions cinéma, économie du langage |

**Formule** : `SRU = (Étincelle + Vibration + Profondeur + Maîtrise) / 4`

**Niveaux** : FRAGILE (0–49) · EN DEVENIR (50–64) · SOLIDE (65–74) · REMARQUABLE (75–84) · EXCEPTIONNEL (85–100)

### Utilisation

1. Générer d'abord une **Matrice Narrative** pour le projet
2. Aller dans **Studio → Prisme Universel** (`/projects/:id/prisme`)
3. Cliquer **"Lancer l'analyse Prisme"**
4. L'IA lit la matrice + les 36 traditions cinéma et retourne :
   - Les 4 scores avec commentaires analytiques
   - Le SRU global avec niveau de résonance
   - Un radar de résonance (Recharts)
   - Les Sceaux de Tradition (≥65% de correspondance, max 5)
   - Une synthèse globale de 5–7 phrases (forces + faiblesses réelles)

### Routes API

```
POST /api/projects/:id/generate-sru   — Génère + stocke les scores (SSE streaming)
GET  /api/projects/:id/sru            — Récupère les scores existants
```

---

## Super Admin — Laboratoire IA

Accessible à `/admin` avec le mot de passe `ADMIN_PASSWORD`.

| Onglet | Fonction |
|--------|----------|
| **Skills IA** | CRUD des blocs de savoir injectés dans les prompts |
| **Cinéma Mondial** | CRUD de la base de traditions cinématographiques |
| **Stats** | Tableau de bord d'utilisation (skills actifs, usageCount, top 10) |
| **Seed** | Réinitialisation de la base de données de connaissances |
| **Analyses** | Historique des analyses IA par projet |

### Routes API Admin (protégées par `x-admin-token`)

```
POST /api/admin/login            — Authentification (retourne le token HMAC)
GET  /api/admin/verify           — Vérification du token
GET  /api/admin/ai-skills        — Liste des skills
POST /api/admin/ai-skills        — Création d'un skill
PATCH /api/admin/ai-skills/:id   — Mise à jour d'un skill
DELETE /api/admin/ai-skills/:id  — Suppression d'un skill
GET  /api/admin/cinema           — Liste des entrées cinéma
POST /api/admin/cinema           — Création d'une entrée cinéma
PATCH /api/admin/cinema/:id      — Mise à jour d'une entrée cinéma
DELETE /api/admin/cinema/:id     — Suppression d'une entrée cinéma
GET  /api/admin/stats            — Statistiques d'utilisation
POST /api/admin/seed             — Réinitialisation du seed (force:true pour écraser)
```

---

## Génération IA

Tous les modules utilisent `gpt-5.4` (Replit AI proxy) via la fonction centrale `aiJson()` dans `generationService.ts`, avec `response_format: json_object` et fallback déterministe si l'API échoue.

**Services de génération disponibles :**

| Fonction | Module | Tokens max |
|----------|--------|-----------|
| `generateNarrativeMatrix()` | Matrice | 8 192 |
| `generateEmotionalCore()` | Noyau Émotionnel | 8 192 |
| `generateEmotionalPath()` | Chemin de Correction | 8 192 |
| `generateCharacters()` | Personnages | 8 192 |
| `generateRelationships()` | Relations | 8 192 |
| `generateWorldAndTimeline()` | Monde & Temps | 8 192 |
| `generateResearchNotes()` | Recherche | 8 192 |
| `generateHpsaScore()` | H.P.S.A. | 8 192 |
| `generateBookOutline()` | Roman | 8 192 |
| `generateScreenplay()` | Scénario | 8 192 |
| `generateSeries()` | Série | 8 192 |
| `generatePitch()` | Pitch | 8 192 |
| `generateNoteIntention()` | Note d'intention | 12 000 |
| `generateSequencier()` | Séquencier | 14 000 |
| `generateFilmData()` | Film | 8 192 |
| `generatePlayableScenes()` | Scènes jouables | 8 192 |
| `checkSceneHpsa()` | Analyse scène | 1 000 |
| `generateTensionArc()` | Arc de tension | 8 192 |
| `generateAtmosphere()` | Atmosphères | 8 192 |
| `generateEchoDuTemps()` | Écho du Temps | 8 192 |
| `generateMiroirArtistique()` | Miroir Artistique | 8 192 |
| `generateCinqPiliers()` | 5 Piliers | 8 192 |
| `generateDirectorMode()` | Mode Réalisateur | 8 192 |
| `characterDialogue()` | Dialogue personnages | 8 192 |
| `generateSRUScores()` | **Prisme SRU** | **4 096** |

**Analyse contextuelle par type (`/api/manuscripts/analyze`) :**
- `scene` → script doctor (tension, sous-texte, fonction dramatique, HPSA)
- `chapter` → éditeur littéraire (voix narrative, focalisation, densité prose, arc)
- `series` → showrunner (question dramatique, arcs A/B/C, cliff-hanger, bible)
- `pitch` → comité de lecture (accroche, unicité, potentiel, comparables)

**Sur Replit** : variables auto-provisionnées (`AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`).
**Sur VPS** : utiliser une clé OpenAI directe + changer le modèle en `gpt-4o` dans `generationService.ts`.

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

## Notes techniques importantes

- **Codegen Orval** : l'index `lib/api-zod/src/index.ts` est **régénéré** à chaque `codegen` — ne jamais le modifier manuellement. Pour éviter les conflits de noms (`TS2308`), tout `requestBody` inline doit être converti en `$ref` vers un named schema dans `openapi.yaml`.
- **Migration DB** : `pnpm --filter @workspace/db run push-force` pour pousser le schéma sans confirmation interactive.
- **Scènes Jouables** : tables `film_data` et `film_scenes` créées directement via SQL (pas via drizzle push).
- **H.P.S.A.** : `hpsa_scores` a été migré — `global_score` (real) + `priority_fixes` (jsonb) ajoutés directement via SQL.
- **Logging** : jamais `console.log` côté serveur — utiliser `req.log` dans les routes, le singleton `logger` hors requête.
- **queryKey requis** : les hooks générés Orval nécessitent `queryKey` explicite dans les options query. Toujours ajouter `retry: false` pour les endpoints qui peuvent retourner 404.
- **Routing** : Wouter côté frontend, Express Router côté API, paths gérés par le proxy Replit.
- **Dark mode** : classe `dark` sur `<html>`, palette violet `#7c3aed` / indigo `#4f46e5`.
- **SSE streaming** : les routes de génération longue utilisent `sseRun()` pour streamer la progression.

---

## Commandes clés (développement)

```bash
# Typecheck complet (tous les packages)
pnpm run typecheck

# Régénérer hooks + Zod schemas depuis OpenAPI
pnpm --filter @workspace/api-spec run codegen

# Push DB schema (sans confirmation interactive)
pnpm --filter @workspace/db run push-force

# Rebuild API server
pnpm --filter @workspace/api-server run build

# Rebuild libs composites
pnpm run typecheck:libs
```

---

## Roadmap

### ✅ Livré

- [x] Pipeline narratif 5 phases (Comprendre → Construire → Écrire → Corriger → Présenter)
- [x] 31 modules IA de génération
- [x] Atelier Film (Film Data + Scènes Jouables + Fountain dialogue)
- [x] Section Studio — 11 outils Immersion (Arc, Atmosphères, Constellation, Dialogue, Réalisateur, Carnet, Écho, Miroir, Piliers, Séquencier, Prisme)
- [x] H.P.S.A. scores (4 axes + radar Recharts + globalScore)
- [x] Moteur IA Skills — 24 blocs de savoir injectés contextuellement
- [x] Base Cinéma Mondial — 36 traditions (Nouvelle Vague, Coréen, Iranien, Africain, Bollywood…)
- [x] **Prisme des Quatre Publics (SRU)** — Score de Résonance Universelle sur 4 axes + Sceaux de Tradition
- [x] Super Admin `/admin` — CRUD Skills + Cinéma + Stats + Seed + Analyses
- [x] Exports 9 formats (JSON, Markdown, Fountain)
- [x] Déploiement Docker/VPS (Dockerfile, nginx, docker-compose)

### 🔜 En cours / Prochaines étapes

- [ ] **Labo Narratif** — interface de recherche cinéma mondiale (era × culture × medium) avec extraction automatique de skills
- [ ] **Exports enrichis** — export PDF, export DOCX (node-docx), export SRU en PDF visuel
- [ ] **Versions de contenu** — historique des générations par module (table `content_versions` déjà en place)
- [ ] **Comparateur de projets** — overlayer 2 projets sur le radar SRU
- [ ] **Prisme multi-œuvres** — comparer le SRU du projet avec des films de référence de la base cinéma
- [ ] **Collaboratif** — partage de projet en lecture/écriture entre comptes
- [ ] **Notifications / Badges** — gamification du pipeline (modules complétés, score SRU atteint)
- [ ] **Mode hors-ligne** — PWA + génération locale (modèle Ollama)

---

## Déploiement

```bash
cp .env.example .env
# Remplir POSTGRES_PASSWORD, SESSION_SECRET, ADMIN_PASSWORD, AI_INTEGRATIONS_OPENAI_API_KEY
docker compose up -d --build
```

Voir `DEPLOY.md` pour le guide complet VPS (SSL, migration DB, mises à jour).
