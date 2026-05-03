# Matrice Narrative

## Vue d'ensemble

**Matrice Narrative** est un OS créatif premium pour auteurs et cinéastes francophones. Il transforme une idée brute en œuvre cinématographique de haut niveau via un workflow structuré en 15 modules assistés par IA (OpenAI GPT). Interface entièrement en français, dark mode, palette violet/indigo.

**Stack** : React + Vite (frontend) • Express 5 (API) • PostgreSQL + Drizzle ORM • OpenAI GPT (via Replit AI Integrations) • pnpm monorepo

**22 tables DB • 28 modules • 11 outils Immersion**

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

## Pipeline narratif — 24 modules

### Phase 1 — Fondations créatives

| Route | Module | Description |
|-------|---------|-------------|
| `/projects/:id/matrix` | Matrice Narrative | Logline, synopsis, thèmes, lois de l'univers, conflits |
| `/projects/:id/emotional-core` | Noyau Émotionnel | Blessure, peur, masque, besoin intérieur du protagoniste |

### Phase 2 — Structure narrative

| Route | Module | Description |
|-------|---------|-------------|
| `/projects/:id/characters` | Personnages | Galerie complète, psychologie profonde |
| `/projects/:id/relationships` | Relations | Graphe des relations entre personnages |
| `/projects/:id/world` | Monde & Temps | Worldbuilding, chronologie, logique temporelle |

### Phase 3 — Analyse & recherche

| Route | Module | Description |
|-------|---------|-------------|
| `/projects/:id/research` | Notes de Recherche | Documentation contextuelle générée par IA |
| `/projects/:id/hpsa` | Scores H.P.S.A. | Cohérence Heroes / Plausibilité / Stakes / Arc |

### Phase 4 — Écriture

| Route | Module | Description |
|-------|---------|-------------|
| `/projects/:id/book` | Atelier Roman | Plan chapitré complet |
| `/projects/:id/screenplay` | Atelier Scénario | Scénario formaté |
| `/projects/:id/series` | Atelier Série | Structure sérielle, épisodes, arcs longs |

### Phase 5 — Publication

| Route | Module | Description |
|-------|---------|-------------|
| `/projects/:id/pitch` | Dossier de Pitch | Document de présentation producteurs/éditeurs |
| `/projects/:id/exports` | Exports | Export des documents |
| `/projects/:id/analyse` | Analyse IA | Analyse globale du projet |

### Section Immersion — Outils cinématographiques avancés

| Route | Module | Description |
|-------|---------|-------------|
| `/projects/:id/tension-arc` | Arc de Tension | Courbe émotionnelle dramatique (Recharts), acte par acte |
| `/projects/:id/atmosphere` | Chambre des Atmosphères | Palette couleurs, musique, textures, style cinéma |
| `/projects/:id/constellation` | Constellation | Carte SVG interactive des personnages et relations |
| `/projects/:id/dialogue` | Dialogue des Personnages | Chat IA incarnant les personnages dans leur voix propre |
| `/projects/:id/director` | Mode Réalisateur | Découpe technique (plan, caméra, focale, lumière, son) depuis un passage |
| `/projects/:id/notebook` | Carnet de Tournage | Compilation Atmosphères + Arc → document imprimable PDF |
| `/projects/:id/echo-temps` | Écho du Temps | Résonances mythiques, historiques, culturelles cross-civilisations |
| `/projects/:id/miroir` | Miroir Artistique | Réflexion poétique de l'œuvre (thème caché, angles morts, invitations) |
| `/projects/:id/piliers` | Les 5 Piliers | Analyse Humour / Suspense / Émotion / Tendresse / Surprise |
| `/projects/:id/sequencier` | Séquencier | Découpage professionnel en séquences numérotées (fonction dramatique, arc émotionnel, durée, note réalisation) |
| `/projects/:id/note-intention` | Note d'Intention | Document formel à la 1ère personne pour CNC / producteurs / festivals (vision, parti pris, personnages, univers visuel, positionnement) |

---

## Base de données — 20 tables

```
projects                  — Projets et métadonnées
narrative_matrices        — Matrice narrative (logline, synopsis, thèmes)
emotional_cores           — Noyau émotionnel du protagoniste
emotional_paths           — Parcours émotionnel
characters                — Personnages (psychologie complète)
relationships             — Relations entre personnages
world_data                — Worldbuilding et chronologie
research_data             — Notes de recherche
hpsa_scores               — Scores H.P.S.A. de cohérence
book_outlines             — Plan chapitré roman
screenplays               — Scénario
series_data               — Structure série
pitch_documents           — Dossier de pitch
tension_arcs              — Arc de tension dramatique
atmosphere_data           — Chambre des atmosphères
echo_temps                — Écho du temps (résonances mythiques/historiques)
miroir_artistique         — Miroir artistique (réflexion poétique)
cinq_piliers              — Les 5 piliers dramatiques
sequencier                — Séquencier professionnel (découpage en séquences)
note_intention            — Note d'intention cinématographique (document CNC/producteurs)
```

---

## Génération IA

Tous les modules utilisent `gpt-5.4` (Replit AI proxy) via la fonction centrale `aiJson()` dans `generationService.ts`, avec `response_format: json_object` et fallback déterministe si l'API échoue.

**Paramètres `aiJson` :**
- `skillsContext` — injecte les skills du Laboratoire narratif dans le system prompt (tous les modules l'utilisent désormais)
- `opts.temperature` — modulé par type de module : créatif (0.85–0.88), narratif (0.82), analytique (non défini)
- `opts.maxTokens` — augmenté pour les modules longs : Séquencier (14 000), Note d'Intention (12 000), défaut (8 192)

**Logging des erreurs :** `aiJson` loggue désormais les erreurs via `process.stderr` (JSON parse errors vs API errors) au lieu de les avaler silencieusement.

**`generateRelationships`** : fonction désormais `async` et entièrement pilotée par IA — génère toutes les paires de personnages (jusqu'à 5) avec analyse psychologique des blessures, peurs, secrets et contradictions. Auparavant : relations codées en dur.

**Personnages** : génération passée de 3 à 5 personnages (Protagoniste, Antagoniste, Allié/Témoin, Catalyseur, Secondaire), avec instructions renforcées sur la psychologie jungienne, la théorie de l'attachement, et les archétypes irremplaçables.

**Sur Replit** : variables auto-provisionnées (`AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`).

**Sur VPS** : utiliser une clé OpenAI directe + changer le modèle en `gpt-4o` dans `generationService.ts` (le modèle `gpt-5.4` est Replit-only).

```bash
# Remplacer dans artifacts/api-server/src/services/generationService.ts
# model: "gpt-5.4"  →  model: "gpt-4o"
grep -rn "gpt-5.4" artifacts/api-server/src/services/
```

---

## Commandes clés (développement)

```bash
# Typecheck complet (tous les packages)
pnpm run typecheck

# Migration DB (après modification du schéma)
pnpm --filter @workspace/db run push

# Rebuild libs composites
cd lib/db && pnpm exec tsc --build --force

# Régénérer hooks + Zod schemas depuis OpenAPI
pnpm --filter @workspace/api-spec run codegen

# Lancer les workflows de développement
# → Via l'interface Replit (workflows configurés dans artifact.toml)
```

---

## Notes importantes

- **Génération IA** : les endpoints `/generate-*` font des appels OpenAI réels — timeout nginx configuré à 120s
- **Fallback déterministe** : si OpenAI échoue, chaque module retourne un contenu de haute qualité pré-écrit
- **skillsContext** : injecté dans tous les 24 modules de génération (correction v2.1 — auparavant manquant dans 7 modules)
- **generateRelationships** : async, pilotée par IA, génère des paires basées sur les blessures/peurs/secrets réels des personnages
- **Analyse manuscrit** : `buildProjectContext` inclut universeLaws, coherenceRules, secrets, possibleEndings, powerObjects, centralConcept
- **Tout en français** : UI, prompts, contenu généré — intégralement en français
- **Dark mode** : classe `dark` sur `<html>`, palette violet `#7c3aed` / indigo `#4f46e5`
- **Routing** : Wouter côté frontend, Express Router côté API, paths gérés par le proxy Replit
- **Logger** : Pino (jamais `console.log` dans le code serveur — utiliser `req.log` ou le singleton `logger`)
- **queryKey requis** : les hooks générés Orval nécessitent `queryKey` explicite dans les options query

---

## Déploiement

```bash
cp .env.example .env
# Remplir POSTGRES_PASSWORD, SESSION_SECRET, AI_INTEGRATIONS_OPENAI_API_KEY
docker compose up -d --build
```

Voir `DEPLOY.md` pour le guide complet VPS (SSL, migration DB, mises à jour).
