# Matrice Narrative

## Vue d'ensemble

**Matrice Narrative** est un OS créatif premium pour auteurs et cinéastes francophones. Il transforme une idée brute en univers narratif complet via un workflow structuré assisté par IA (OpenAI GPT).

**Stack** : React + Vite (frontend) • Express 5 (API) • PostgreSQL + Drizzle ORM • OpenAI GPT (via Replit AI Integrations)

---

## Architecture

```
pnpm monorepo
├── artifacts/
│   ├── matrice-narrative/      # Frontend React + Vite (Tailwind, violet/indigo)
│   └── api-server/             # API Express 5 (port 8080)
├── lib/
│   ├── db/                     # Schéma Drizzle + connexion PostgreSQL
│   ├── api-spec/               # Spec OpenAPI (source de vérité contrats API)
│   ├── api-zod/                # Zod schemas générés (validation serveur)
│   ├── api-client-react/       # React Query hooks générés (client frontend)
│   └── integrations-openai-ai-server/  # Client OpenAI (proxy Replit AI)
├── docker-compose.yml          # Déploiement VPS production
├── Dockerfile.api              # Image Docker API server
├── Dockerfile.frontend         # Image Docker frontend (nginx)
├── nginx.conf                  # Config nginx (reverse proxy + SSL)
├── .env.example                # Variables d'environnement à copier
└── DEPLOY.md                   # Guide de déploiement VPS complet
```

---

## Workflow narratif (15 pages)

| Route | Description |
|-------|-------------|
| `/` | Landing page cinématique |
| `/dashboard` | Tableau de bord projets |
| `/projects/new` | Création d'univers |
| `/projects/:id/matrix` | Matrice Narrative |
| `/projects/:id/emotional-core` | Noyau Émotionnel |
| `/projects/:id/characters` | Personnages |
| `/projects/:id/relationships` | Relations |
| `/projects/:id/world` | Monde & Chronologie |
| `/projects/:id/research` | Recherche & Analyse |
| `/projects/:id/hpsa` | Scores H.P.S.A. |
| `/projects/:id/book` | Atelier Roman |
| `/projects/:id/screenplay` | Atelier Scénario |
| `/projects/:id/series` | Atelier Série |
| `/projects/:id/pitch` | Dossier Pitch |
| `/projects/:id/exports` | Exports |

---

## Base de données (12 tables)

`projects` · `narrative_matrices` · `emotional_cores` · `emotional_paths` · `characters` · `relationships` · `world_data` · `research_data` · `hpsa_scores` · `book_outlines` · `screenplays` · `series_data` · `pitch_documents`

---

## Génération IA

Chaque module génère via `gpt-5.4` avec `response_format: json_object` et fallback déterministe si l'API échoue. Les appels prennent **30-90 secondes** selon la complexité.

**Variables requises** :
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — auto-provisionnée sur Replit
- `AI_INTEGRATIONS_OPENAI_API_KEY` — auto-provisionnée sur Replit

Pour VPS : utiliser une clé OpenAI directe (`https://api.openai.com/v1`).

---

## Déploiement VPS

```bash
cp .env.example .env
# Remplir POSTGRES_PASSWORD, SESSION_SECRET, et les clés OpenAI
docker compose up -d --build
```

Voir `DEPLOY.md` pour le guide complet.

---

## Commandes clés

```bash
# Typecheck complet
pnpm run typecheck

# Build des libs composites (génère les .d.ts)
pnpm run typecheck:libs

# Migration DB (dev)
pnpm --filter @workspace/db run push

# Régénérer hooks + Zod schemas depuis OpenAPI
pnpm --filter @workspace/api-spec run codegen
```

---

## Notes importantes

- **Génération IA** : les endpoints `/generate-*` font des appels OpenAI réels — timeout nginx configuré à 120s dans `nginx.conf`
- **Fallback** : si OpenAI échoue, la génération retourne un contenu déterministe fonctionnel
- **Tout en français** : UI, prompts, contenu généré — tout est en français
- **Dark mode** : classe `dark` sur `<html>` dans `index.html`, palette violet/indigo
