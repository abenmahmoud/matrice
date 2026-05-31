# Matrice Narrative

**L'OS créatif pour auteurs et cinéastes francophones.**

De l'idée brute à l'œuvre cinématographique — pipeline narratif complet assisté par IA, 24 modules, 11 outils d'immersion cinématographique, documents professionnels CNC/festivals.

---

## Aperçu

Matrice Narrative n'est pas un éditeur de texte. C'est un **système de pensée narratif** — un espace où l'IA ne génère pas à la place de l'auteur, mais analyse, confronte et révèle ce que l'auteur n'a pas encore vu.

Le concept central : la **Matrice**, un document vivant qui capture l'ADN d'un projet (logline, conflits, lois de l'univers, motifs symboliques, règles de cohérence). Chaque module du pipeline, chaque analyse, chaque génération — tout est confronté à cette intention déclarée.

---

## Fonctionnalités principales

### Pipeline narratif — 5 phases, 24 modules

**Phase 1 — Fondations créatives**
- Matrice Narrative — ADN complet du projet (logline, synopsis, thèmes, lois, conflits, motifs symboliques)
- Noyau Émotionnel — arc émotionnel, catharsis, rythme, empathie lecteur

**Phase 2 — Structure narrative**
- Personnages — galerie complète avec psychologie profonde, archétypes, arcs
- Relations — graphe des relations entre personnages généré par IA
- Monde & Temps — worldbuilding, chronologie, logique temporelle

**Phase 3 — Analyse & Recherche**
- Notes de Recherche — documentation contextuelle générée par IA
- Scores H.P.S.A. — métriques narratives custom (Heroes / Plausibilité / Stakes / Arc)
- Analyse IA contextualisée — 6 dimensions, confrontation à la matrice, progression inter-sessions

**Phase 4 — Écriture**
- Atelier Roman — plan chapitré complet
- Atelier Scénario — scénario formaté
- Atelier Série — structure sérielle, épisodes, arcs longs
- Dossier de Pitch — document pour producteurs et éditeurs

**Phase 5 — Publication**
- Exports (JSON / TXT / Markdown)

### Outils d'Immersion cinématographique — 11 outils

| Outil | Description |
|-------|-------------|
| Arc de Tension | Courbe dramatique interactive, acte par acte, visualisation Recharts |
| Chambre des Atmosphères | Palette couleurs, musique, textures, références cinéma |
| Constellation | Carte SVG interactive des personnages et relations |
| Dialogue des Personnages | Chat IA — chaque personnage répond dans sa propre voix |
| Mode Réalisateur | Découpe technique : plan, caméra, focale, lumière, son |
| Carnet de Tournage | Compilation Atmosphères + Arc → document PDF imprimable |
| Écho du Temps | Résonances mythiques, historiques et culturelles cross-civilisations |
| Miroir Artistique | Thème caché, angles morts, invitations non exploitées |
| Les 5 Piliers | Humour / Suspense / Émotion / Tendresse / Surprise |
| **Séquencier** | Découpage professionnel en séquences numérotées (fonction dramatique, intensité 1–10) |
| **Note d'Intention** | Document formel 1ère personne pour CNC / producteurs / festivals — 8 sections |

### Analyse IA — le cœur du système

L'analyse ne fonctionne pas comme un chatbot générique. Elle injecte dans chaque requête :
- La matrice complète du projet (logline, conflits, lois, motifs)
- Le noyau émotionnel (arc, catharsis, rythme)
- Tous les personnages (archétypes, motivations, secrets)
- Les skills narratifs actifs (techniques validées par le Laboratoire)

Résultat : un diagnostic de cohérence entre ce qui a été **écrit** et ce qui a été **déclaré** — unique sur le marché.

6 dimensions notées : Structure, Émotion, Archétypes, Originalité, Cohérence, Score global pondéré.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + Vite 7 + TypeScript |
| Routing | Wouter |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Backend | Express 5 + TypeScript |
| ORM | Drizzle ORM |
| Base de données | PostgreSQL |
| IA | OpenAI GPT (proxy Replit / clé directe sur VPS) |
| Monorepo | pnpm workspaces |
| Validation | Zod v4 |
| Logging | Pino |

```
workspace/
├── artifacts/
│   ├── matrice-narrative/      # Frontend React + Vite
│   └── api-server/             # API Express 5
├── lib/
│   ├── db/                     # Schémas Drizzle (20 tables)
│   ├── api-spec/               # OpenAPI spec
│   ├── api-zod/                # Zod schemas générés
│   └── api-client-react/       # React Query hooks générés
├── docker-compose.yml
├── Dockerfile.api
├── Dockerfile.frontend
└── nginx.conf
```

---

## Démarrage rapide

### Prérequis

- Node.js 22+
- pnpm 9+
- PostgreSQL 16+
- Clé API OpenAI

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/abenmahmoud/matrice.git
cd matrice

# Installer les dépendances
pnpm install

# Configurer l'environnement
cp .env.example .env
# Remplir : POSTGRES_PASSWORD, SESSION_SECRET, ADMIN_PASSWORD, OPENAI_API_KEY
```

> **Sur VPS :** remplacer `gpt-5.4` par `gpt-4o` dans `artifacts/api-server/src/services/generationService.ts`
> (le modèle gpt-5.4 est disponible uniquement via le proxy Replit)

### Migration base de données

```bash
pnpm --filter @workspace/db run push
```

### Démarrage

```bash
# API server
pnpm --filter @workspace/api-server run dev

# Frontend (dans un second terminal)
pnpm --filter @workspace/matrice-narrative run dev
```

---

## Déploiement VPS (Docker)

```bash
# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Lancer tous les services
docker compose up -d --build

# Migration BDD (premier démarrage uniquement)
docker compose exec api pnpm --filter @workspace/db run push
```

L'architecture Docker inclut :
- Container API (Node.js 22 Alpine, multi-stage build)
- Container Frontend (nginx:alpine, build statique)
- Container PostgreSQL 16
- Nginx reverse proxy avec SSL, gzip, cache statique

Voir `DEPLOY.md` pour le guide complet (SSL Let's Encrypt, health checks, mises à jour rolling).

---

## Commandes de développement

```bash
# Typecheck complet
pnpm run typecheck

# Audit visuel automatique des routes principales
pnpm test:e2e

# Migration DB après modification du schéma
pnpm --filter @workspace/db run push

# Rebuild libs composites
cd lib/db && pnpm exec tsc --build --force

# Régénérer hooks React Query depuis OpenAPI
pnpm --filter @workspace/api-spec run codegen
```

Le test `pnpm test:e2e` lance le frontend Vite en local, injecte une session utilisateur owner de test, mocke les reponses API stables, charge les routes principales et verifie : statut HTTP, page non vide, presence du layout principal pour les pages connectees, absence d'overlay runtime, absence d'erreur console et capture d'ecran archivee. Le rapport JSON est genere dans `test-results/routes-smoke-report.json`, le rapport Markdown dans `test-results/routes-smoke-report.md` et les captures dans `test-screenshots/route-smoke/`.

Seed optionnel si tu veux lancer le meme audit contre une base locale/VPS avec donnees de test : `lib/db/seeds/e2e_route_smoke_seed.sql`.

---

## Variables d'environnement

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `DATABASE_URL` | ✅ | URL de connexion PostgreSQL |
| `OPENAI_API_KEY` | ✅ | Clé API OpenAI (sur VPS) |
| `SESSION_SECRET` | ✅ | Secret HMAC pour l'authentification admin |
| `ADMIN_PASSWORD` | ✅ | Mot de passe du tableau de bord admin |
| `POSTGRES_PASSWORD` | ✅ (Docker) | Mot de passe PostgreSQL pour Docker Compose |

---

## Administration

Accès via `/admin` — protégé par HMAC-SHA256.

Fonctionnalités :
- Tableau de bord des analyses IA (stats, graphes, progression)
- Laboratoire narratif (génération de corpus, enrichissement automatique quotidien)
- Bibliothèque de skills narratifs (techniques injectées dans les prompts)

---

## Architecture — différenciateurs techniques

**Skills narratifs secrets**
Le Laboratoire génère automatiquement des techniques narratives (skills) depuis des recherches cross-culturelles et cross-temporelles. Ces skills sont injectés silencieusement dans chaque prompt d'analyse — l'IA devient progressivement experte du projet.

**Fallback déterministe universel**
Chaque appel IA possède un fallback de haute qualité pré-écrit. Si l'API échoue (timeout, quota), l'utilisateur reçoit du contenu utilisable — jamais une erreur vide.

**Génération IA — pattern `aiJson`**
```typescript
// Toutes les générations passent par ce helper unique
async function aiJson<T>(system: string, user: string, fallback: T): Promise<T>
// → response_format: json_object
// → timeout 90s
// → fallback automatique
```

---

## Chiffres

- **20 tables** PostgreSQL
- **33 pages** frontend
- **~80 endpoints** API
- **24 fonctions** de génération IA
- **11 outils** d'immersion cinématographique
- **~20 000 lignes** de code TypeScript

---

## Roadmap

### Court terme
- [ ] Export PDF natif côté serveur (Note d'Intention, Séquencier)
- [ ] Authentification multi-utilisateurs (Clerk Auth)
- [ ] Beat Sheet / Structure 3 actes visualisée
- [ ] Export CSV des analyses IA

### Moyen terme
- [ ] Templates par genre narratif (thriller, drame, comédie, sci-fi...)
- [ ] Mode Révision — comparer deux versions d'un passage
- [ ] Générateur de loglines alternatives (5–10 variations scorées)
- [ ] Galerie de références visuelles (moodboard par atmosphère)
- [ ] Historique de versions par module (snapshots)

### Long terme
- [ ] Application mobile (Expo React Native)
- [ ] Mode collaboratif — co-écriture en temps réel
- [ ] API publique + webhooks (Notion, Obsidian, Scrivener)
- [ ] Analyse de la structure globale du manuscrit
- [ ] Comparaison inter-projets (cohérence stylistique)

---

## Philosophie

> *L'IA ne génère pas à la place de l'auteur. Elle analyse, confronte, et révèle ce que l'auteur n'a pas encore vu.*

Matrice Narrative est construit sur la conviction que les outils créatifs les plus puissants ne remplacent pas l'auteur — ils l'aident à être plus fidèle à sa propre intention.

---

## Licence

Propriétaire — tous droits réservés.

---

*Matrice Narrative v2.0 — mai 2026*
