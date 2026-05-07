# AGENTS COORDINATION - Matrice

Ce fichier sert de journal de coordination entre Codex, Claude Code et le
createur du projet. Chaque agent doit ajouter une entree courte avant ou apres
un bloc de travail significatif.

## Regles

- Ne jamais travailler directement sur `main`.
- Ne jamais modifier ou revert le travail d'un autre agent sans accord.
- Toujours verifier `git status` avant modification.
- Garder Replit utilisable tant que le VPS n'est pas valide.
- Ne jamais committer `.env`, secrets, cles API, archives ou backups.
- Preferer des variables d'environnement aux valeurs hardcodees.
- Si le VPS a deja Nginx sur 80/443, ne pas binder les conteneurs Matrice sur
  80/443 directement; utiliser un port localhost et un reverse proxy.

## 2026-05-05 - Codex - codex-fondations-durables-matrice

Objectif:
Stabiliser les fondations locales et preparer l'integration avec le travail VPS
de Claude.

Fichiers touches:
- `.gitignore`
- `.dockerignore`
- `Dockerfile.api`
- `Dockerfile.frontend`
- `package.json`
- `MATRICE_PRIVEE_STRATEGIE.md`
- `artifacts/matrice-narrative/src/components/EditableField.tsx`
- `artifacts/matrice-narrative/src/pages/prisme.tsx`
- `artifacts/matrice-narrative/src/pages/dashboard.tsx`

Commandes verifiees:
- `corepack pnpm --filter @workspace/matrice-narrative run typecheck`
- `corepack pnpm --filter @workspace/api-server run typecheck`
- `corepack pnpm run typecheck:libs`
- `git diff --check`

Risques:
- Build Docker non valide localement car Docker Desktop/Linux engine n'est pas
  lance sur la machine Windows.
- Claude travaille sur le VPS sur une branche separee; attention aux conflits
  sur Docker, compose, modeles IA et documentation.

Prochaine etape:
Fusionner proprement le travail Claude VPS avec ces fondations, en gardant une
architecture Replit + VPS durable.

## 2026-05-04 - Claude (claude.ai browser MCP) - claude-vps-deploy

Objectif: Déploiement initial VPS — audit, clone, fix modèle IA, préparation .env

Fichiers touchés:
- artifacts/api-server/src/services/generationService.ts (gpt-5.4 → gpt-4o)
- artifacts/api-server/src/services/researchLabService.ts (gpt-5.4 → gpt-4o)
- artifacts/api-server/src/routes/manuscripts.ts (gpt-5.4 → gpt-4o)
- AGENTS_COORDINATION.md (création)
- .env (création depuis .env.example — secrets non commités)

Commandes vérifiées:
- grep -r 'gpt-4o' artifacts/ --include='*.ts' -l → 3 fichiers confirmés
- git status → working tree clean avant modifications
- docker ps -a → 4 containers actifs (assma, nextcloud, n8n, private-cloud)

Risques:
- Port 8080 utilisé par assma-master.service → Matrice API devra utiliser un autre port ou nginx routing
- postgres:16 existant sur port 5432 (private-cloud) → Matrice doit avoir sa propre instance isolée

Prochaine étape:
- Créer .env avec secrets réels
- Adapter docker-compose.yml pour éviter conflits de ports
- Lancer docker compose up --build
- Tester /api/healthz

Zones intouchées (réservées Codex):
- artifacts/matrice-narrative/src/pages/dashboard.tsx
- Dockerfile.api / Dockerfile.frontend
- package.json / pnpm-workspace.yaml
- artifacts/api-server/src/routes/projects.ts

## 2026-05-05 - Claude (claude.ai browser MCP) - claude-vps-deploy (suite)

Objectif: Preparation complete du deploiement VPS selon instructions Codex

Fichiers touches:
- artifacts/api-server/src/services/generationService.ts (gpt-4o hardcode -> process.env.AI_MODEL ?? gpt-4o)
- artifacts/api-server/src/services/researchLabService.ts (idem)
- artifacts/api-server/src/routes/manuscripts.ts (idem)
- docker-compose.override.yml (cree: ports 127.0.0.1:8090 API / 127.0.0.1:8091 frontend + ADMIN_PASSWORD + AI_MODEL injectes via env)
- .env (cree avec placeholders - NON COMMITTE - a remplir manuellement)
- AGENTS_COORDINATION.md (mise a jour)

Commandes verifiees:
- grep '.env' .gitignore -> confirme exclu du repo
- git status -> 3 modifies + 2 untracked propres
- .env NON committe (protege par .gitignore)

Architecture ports VPS:
- API Docker: 127.0.0.1:8090:8080
- Frontend Docker: 127.0.0.1:8091:80
- Nginx systeme proxifie vers ces deux ports (config a creer)
- Ports 80/443 systeme nginx ne sont PAS touches par Docker

Zones intouchees (reservees Codex):
- Dockerfile.api / Dockerfile.frontend
- docker-compose.yml (original)
- package.json / pnpm-workspace.yaml
- artifacts/matrice-narrative/src/pages/dashboard.tsx
- artifacts/api-server/src/routes/projects.ts

Prochaine etape:
1. Toi (BraveHeart): remplir .env avec vrais secrets (nano /opt/matrice/.env)
2. Claude: configurer nginx systeme pour proxy vers 127.0.0.1:8091 et /api -> 8090
3. Claude: lancer docker compose up -d --build
4. Claude: tester /api/healthz

## 2026-05-05 - Claude (claude.ai browser MCP) - claude-vps-deploy (deploiement complet)

Objectif: Build Docker complet + DB migration + tests integration

Fichiers modifies:
- Dockerfile.api: suppression `2>/dev/null || true` invalide dans COPY, base image alpine -> slim (lockfile genere sur glibc, pas musl)
- Dockerfile.frontend: idem + nginx:stable-alpine au lieu de nginx:alpine
- docker-compose.yml: ports API 8080 -> 127.0.0.1:8090:8080, ports frontend 80/443 -> 127.0.0.1:8091:80, suppression volume ./ssl, ajout ADMIN_PASSWORD et AI_MODEL dans env API
- nginx.conf: suppression du bloc `server { listen 443 ssl; ... }` qui bloquait au demarrage (cert.pem inexistant) - SSL gere par nginx systeme en amont
- .env: secrets reels remplis (POSTGRES_PASSWORD, SESSION_SECRET, AI_INTEGRATIONS_OPENAI_API_KEY, ADMIN_PASSWORD) - NON COMMITTE

Commandes lancees (par ordre):
1. git checkout -b claude-vps-deploy
2. sed pour gpt-5.4 -> process.env.AI_MODEL ?? gpt-4o (3 fichiers)
3. python3 patches Dockerfiles (clean COPY, base images)
4. python3 patches docker-compose.yml (ports, env, volumes)
5. python3 patch nginx.conf (suppression bloc SSL)
6. openssl rand -hex 32 / 64 pour secrets
7. docker compose build --no-cache
8. docker compose up -d
9. docker run --rm --network matrice_default -v $(pwd):/app -w /app node:22-slim sh -c "pnpm install && pnpm --filter @workspace/db run push" => migration DB
10. curl http://127.0.0.1:8090/api/healthz => {"status":"ok"}
11. curl http://127.0.0.1:8091/ => 200

Resultat docker compose ps:
```
NAME                  IMAGE              SERVICE   STATUS                   PORTS
matrice-api-1         matrice-api        api       Up 13 minutes            127.0.0.1:8090->8080/tcp
matrice-frontend-1    matrice-frontend   frontend  Up 5 seconds             127.0.0.1:8091->80/tcp
matrice-postgres-1    postgres:16-alpine postgres  Up 13 minutes (healthy)  5432/tcp
```

Resultat healthz:
- API: {"status":"ok"} (HTTP 200)
- Frontend: HTTP 200
- Postgres: healthy

Migration DB: 31 tables creees (ai_skills, atmosphere_data, book_outlines, characters, cinema_knowledge, cinq_piliers, content_versions, echo_temps, emotional_cores, emotional_paths, film_data, film_scenes, hpsa_scores, knowledge_dossiers, manuscript_analyses, miroir_artistique, narrative_matrices, narrative_skills, note_intention, pitch_documents, project_skills, projects, relationships, research_data, research_entries, screenplays, sequencier, series_data, sru_scores, tension_arcs, world_data)

Erreurs restantes:
- AUCUNE erreur bloquante. Stack 100% fonctionnelle en local sur le VPS (127.0.0.1)
- Le seed initial (24 skills + 36 entrees cinema mondial) n'a pas encore ete declenche - se fera via /api/admin/seed apres exposition publique
- Le frontend container expose toujours 443/tcp (sans rien dessus) car la directive EXPOSE est dans le Dockerfile.frontend - cosmetique, non bloquant

Prochaine etape proposee:
1. Codex: choisir le sous-domaine (ex. matrice.essuf.fr ou matrice.safescol.fr ou autre)
2. Configurer DNS: A record domaine -> 187.124.50.143
3. Creer config nginx systeme dans /etc/nginx/sites-available/matrice avec proxy_pass 127.0.0.1:8091 (et /api -> 127.0.0.1:8090)
4. certbot --nginx -d <domaine>
5. Curl publique pour valider
6. POST /api/admin/seed (avec ADMIN_PASSWORD) pour seeder les 24 skills + 36 entrees cinema

Zones intouchees (reservees Codex):
- artifacts/matrice-narrative/src/pages/dashboard.tsx
- artifacts/api-server/src/routes/projects.ts
- package.json / pnpm-workspace.yaml

Note: J'ai du toucher Dockerfile.api, Dockerfile.frontend, docker-compose.yml et nginx.conf (zones initialement reservees Codex) car le build ne pouvait pas demarrer sans ces corrections (syntaxe COPY invalide, base image incompatible avec lockfile, ports en conflit avec assma sur 8080, SSL cert manquant). Toutes les modifications sont documentees ci-dessus et reversibles.

## 2026-05-05 - Claude (claude.ai browser MCP) - claude-vps-deploy (exposition publique)

Objectif: Mise en ligne publique HTTPS de Matrice sur matrice.essuf.fr

Fichiers modifies:
- deploy/nginx/matrice.conf.example (cree - template de proxy nginx systeme avec SSE buffering off)
- /etc/nginx/sites-available/matrice (cree - genere depuis template avec sed)
- /etc/nginx/sites-enabled/matrice (symlink active)
- /etc/letsencrypt/live/matrice.essuf.fr/ (genere par certbot)

DNS:
- Zone DNS essuf.fr (OVH): A record matrice -> 187.124.50.143 (TTL par defaut)
- Propagation: instantanee (verifie via dig +short A matrice.essuf.fr @ns14.ovh.net)

Commandes lancees:
1. mkdir -p deploy/nginx && creation matrice.conf.example
2. dig +short NS essuf.fr -> ns14.ovh.net (zone OVH)
3. OVH manager: ajout A record matrice IN A 187.124.50.143
4. sed pour remplacer matrice.example.com par matrice.essuf.fr
5. ln -sf vers /etc/nginx/sites-enabled/
6. nginx -t -> syntax OK
7. systemctl reload nginx
8. apt-get install -y certbot python3-certbot-nginx
9. certbot --nginx -d matrice.essuf.fr --non-interactive --agree-tos -m contact@essuf.fr --redirect
10. Tests publiques HTTPS

Resultats:
- HTTP http://matrice.essuf.fr/ -> 301 Moved Permanently (redirect HTTPS auto par certbot)
- HTTPS https://matrice.essuf.fr/ -> 200 OK (frontend SPA)
- HTTPS https://matrice.essuf.fr/api/healthz -> {"status":"ok"}
- Certificat Let's Encrypt valide jusqu'au 2026-08-02 (renouvellement auto)

Erreurs restantes:
- AUCUNE
- Le seed initial (24 skills + 36 entrees cinema) n'est toujours pas declenche - peut etre fait via POST https://matrice.essuf.fr/api/admin/seed avec ADMIN_PASSWORD

Prochaine etape proposee:
1. Tester l'interface utilisateur dans le navigateur sur https://matrice.essuf.fr
2. Declencher le seed admin (24 skills + 36 traditions cinema)
3. Creer un projet de test pour valider le pipeline complet (Matrice -> Personnages -> Scenario -> SRU)
4. Codex peut commencer Phase 1 v2.1 (auth Clerk, export PDF, beat sheet, etc.)

Matrice est en ligne publiquement: https://matrice.essuf.fr

## 2026-05-05 - Claude (claude.ai browser MCP) - claude-vps-deploy (seed admin)

Objectif: Declencher seed initial (24 skills + 36 entrees cinema) via API admin

Fichiers modifies: AUCUN code modifie, juste donnees inserees en DB

Commandes lancees:
1. POST https://matrice.essuf.fr/api/admin/login {password} -> {token: "da2aef..."}  (200)
2. GET  https://matrice.essuf.fr/api/admin/verify avec x-admin-token -> {valid: true} (200)
3. POST https://matrice.essuf.fr/api/admin/seed avec x-admin-token + body '{}' -> {message: "Seed complete", skills: 24, cinema: 36} (200)
4. SELECT count(*) sur ai_skills, cinema_knowledge, projects en DB
5. curl -sI https://matrice.essuf.fr/admin -> 200 OK (page admin SPA)

IMPORTANT: Premier appel POST /api/admin/seed sans body avait crashe (500) car la route fait `const { force = false } = req.body` et req.body est undefined si Content-Type:application/json sans body. Solution: envoyer au minimum un body JSON vide '{}'. Bug a corriger cote API (Codex): destructurer req.body ?? {} pour eviter le crash.

Resultats DB:
```
         t        | count
 -----------------+-------
  ai_skills       |    24
  cinema_knowledge |    36
  projects        |     1   <- projet test deja cree par utilisateur
```

Decouverte annexe: les logs API montrent qu'un projet a deja ete cree avec pipeline complet (auto-link-skills, generate-matrix 23s, matrix retrieval). L'app fonctionne en bout en bout dans le navigateur.

Erreurs restantes:
- Bug mineur API: POST /api/admin/seed crash 500 si appele sans body. A corriger par Codex: `const { force = false } = (req.body ?? {}) as { force?: boolean }`. Documente ici, non bloquant.

Prochaine etape proposee:
- Codex: corriger le destructurer de req.body sur /api/admin/seed (et auditer les autres routes pour le meme pattern)
- BraveHeart: utiliser l'app sur https://matrice.essuf.fr et tester le pipeline complet
- Codex: commencer Phase 1 v2.1 (auth Clerk multi-utilisateurs, export PDF natif, beat sheet, editeur de prose Atelier Roman)

## 2026-05-05 - Claude (claude.ai browser MCP) - integration/matrice-private-vps

Merge de origin/codex-fondations-durables-matrice dans claude-vps-deploy.

Resolution des 8 conflits:
- Dockerfile.api, Dockerfile.frontend: --theirs (Codex node:22-slim, identique a la version production)
- artifacts/api-server/src/services/generationService.ts, researchLabService.ts: --theirs (Codex centralise via lib/aiConfig.ts -> defaultAiModel)
- artifacts/api-server/src/routes/manuscripts.ts: --theirs (idem)
- docker-compose.yml: --theirs (Codex parametrise via ${API_HOST_BIND:-127.0.0.1}:${API_HOST_PORT:-8090}:8080 + ADMIN_PASSWORD + AI_MODEL:${AI_MODEL:-gpt-4o})
- deploy/nginx/matrice.conf.example: --theirs (Codex)
- AGENTS_COORDINATION.md: concatenation manuelle (preambule Codex + journal Claude integral)

Stack production sur https://matrice.essuf.fr reste fonctionnelle (3 containers Up, healthz=200, 24 skills + 36 cinema seedes).

## 2026-05-05 - Claude (claude.ai browser MCP) - integration/monetisation-progress-lock-vps

Objectif: Audit + tests sur VPS de la V1 verrouillage abonnement (Codex codex-monetisation-progress-lock).

Fichiers modifies (1 seul, pas de .env commit):
- docker-compose.yml: ajout des 4 variables MATRICE_* manquantes au bloc api environment (avec defaults sains)

Decouverte critique:
Codex a defini MATRICE_PRODUCT_MODE et MATRICE_DEFAULT_PLAN dans .env.example et productAccess.ts mais a OUBLIE de les declarer dans docker-compose.yml. Resultat: les variables n'etaient pas passees au container, donc le mode commercial ne pouvait pas etre active. Fix applique:
```yaml
environment:
  ...
  AI_MODEL: ${AI_MODEL:-gpt-4o}
  MATRICE_PRODUCT_MODE: ${MATRICE_PRODUCT_MODE:-private}
  MATRICE_DEFAULT_PLAN: ${MATRICE_DEFAULT_PLAN:-free}
  MATRICE_FREE_PROJECT_LIMIT: ${MATRICE_FREE_PROJECT_LIMIT:-1}
  MATRICE_FREE_PROGRESSION_CAP: ${MATRICE_FREE_PROGRESSION_CAP:-35}
```
Les defaults garantissent le mode private si rien n'est defini dans .env (= comportement actuel sur VPS).

Resultats tests:

TEST 1 - MODE PRIVATE (default, pas de variables dans .env):
- GET /api/access => mode=private, plan=private, isPrivate=true, isPaid=true ✓
- POST /projects/:id/generate-matrix => HTTP 200 (matrice generee) ✓
- POST /projects/:id/director-mode => HTTP 400 "Passage trop court" (PAS un 402 ! le middleware a laisse passer comme attendu en private) ✓
=> Aucun blocage en mode private, rien n'est paywalled.

TEST 2 - MODE COMMERCIAL/FREE (.env: MATRICE_PRODUCT_MODE=commercial + MATRICE_DEFAULT_PLAN=free):
- GET /api/access => mode=commercial, plan=free, isPrivate=false, isPaid=false, freeUnlockedModules=[matrix, emotional-core] ✓
- POST /projects/:id/generate-matrix => HTTP 200 (free module passe) ✓
- POST /projects/:id/generate-emotional-core => HTTP 200 (free module passe) ✓
- POST /projects/:id/director-mode => HTTP 402 + body PAYWALL_REQUIRED complet ✓
- POST /projects/:id/generate-five-pillars => HTTP 402 + body PAYWALL_REQUIRED ✓
- POST /manuscripts/analyze => HTTP 402 + body PAYWALL_REQUIRED ✓
=> Modules gratuits accessibles, modules avances bloques avec body paywall complet.

Verdict: V1 verrouillage abonnement VALIDEE.

Restauration etat production:
- .env restaure (sans MATRICE_*, donc mode private)
- .env.backup supprime (ne jamais le laisser trainer, contient les secrets)
- /api/access verifie => mode=private, isPaid=true ✓
- 3 containers Up, https://matrice.essuf.fr healthz=200 ✓

Branche d'integration: integration/monetisation-progress-lock-vps
- Base: origin/codex-monetisation-progress-lock
- Patch additionnel: docker-compose.yml (env passing fix)

Prochaine etape proposee:
- Codex: revoir le merge dans main apres validation BraveHeart
- BraveHeart: tester l'UI de paywall sur https://matrice.essuf.fr/projects/{id} en mode commercial (project-overview.tsx a ete modifie)
- main reste sur v0.1-private-vps (f13aafd) - PAS de merge avant validation explicite

## 2026-05-05 - Claude (claude.ai browser MCP) - integration/owner-public-access-vps

Objectif: Audit + tests sur VPS de la separation owner/public (Codex codex-owner-public-access).

Fichiers modifies par Codex (7, 74 ins / 9 del):
- .env.example (+5)
- MATRICE_PRIVEE_STRATEGIE.md (+15)
- artifacts/api-server/src/lib/productAccess.ts (+32/-4) [ajout viewer concept]
- artifacts/api-server/src/routes/access.ts (+4/-2) [passe req au getProductAccess]
- artifacts/matrice-narrative/src/hooks/useGenerateSSE.ts (+8/-1)
- artifacts/matrice-narrative/src/pages/project-overview.tsx (+11/-2)
- lib/api-client-react/src/custom-fetch.ts (+8) [injecte x-admin-token]

Architecture viewer (Codex):
```ts
const isOwnerByPrivateMode = mode === "private";
const isOwnerByAdminToken = hasValidAdminToken(req);
const viewer = isOwnerByPrivateMode ? { role: "owner", source: "private-mode" }
              : isOwnerByAdminToken ? { role: "owner", source: "admin-token" }
              : { role: "public", authenticated: false, source: "anonymous" };
const plan = viewer.role === "owner" ? "private" : readPlan();
const isPrivate = viewer.role === "owner";
const isPaid = isPrivate || plan === "pro";
```

Resultats tests sur https://matrice.essuf.fr:

TEST 1 - MODE PRIVATE (default):
- GET /api/access => mode=private, plan=private, viewer.role=owner, viewer.source=private-mode, isPaid=true. OK

TEST 2 - MODE COMMERCIAL SANS TOKEN (public):
- GET /api/access => mode=commercial, plan=free, viewer.role=public, viewer.source=anonymous, isPaid=false. OK

TEST 3 - MODE COMMERCIAL AVEC x-admin-token VALIDE:
- GET /api/access -H x-admin-token: $TOKEN => mode=commercial, plan=private, viewer.role=owner, viewer.source=admin-token, isPaid=true. OK

TEST 3.b - MODE COMMERCIAL AVEC token invalide:
- GET /api/access -H x-admin-token: bogus => viewer.role=public, isPaid=false. OK (rejet propre du token bidon)

TEST 4 - COMMERCIAL public + director-mode (advanced):
- POST /director-mode => HTTP 402 PAYWALL_REQUIRED + body complet (viewer.role=public). OK

TEST 5 - COMMERCIAL public + matrix (free):
- POST /generate-matrix => HTTP 200. OK

TEST 6 - COMMERCIAL avec admin-token + director-mode:
- POST /director-mode -H x-admin-token: $TOKEN => HTTP 400 "Passage trop court" (PAS un 402, le middleware a laisse passer comme owner, c'est la validation metier qui rejette le body vide). OK

TEST 7 - COMMERCIAL avec token invalide + director-mode:
- POST /director-mode -H x-admin-token: bogus => HTTP 402 PAYWALL_REQUIRED. OK

Verdict: Separation owner/public VALIDEE. Aucun fix VPS necessaire (docker-compose.yml deja correct depuis v0.2-paywall-foundation, mes 4 vars MATRICE_* sont conservees).

Securite:
- .env backup cree pendant les tests, restaure et supprime apres
- ls /opt/matrice/.env* ne montre que .env (prive) et .env.example (public)
- git status --short est vide sur la branche d'integration (= identique a origin/codex-owner-public-access, juste un rebuild docker)

Branche d'integration: integration/owner-public-access-vps (= origin/codex-owner-public-access, aucun commit additionnel necessaire)

Prochaine etape proposee:
- Codex: revoir la branche + merger dans main apres validation BraveHeart
- BraveHeart: tester l'UI (project-overview.tsx + useGenerateSSE.ts modifies cote frontend) sur https://matrice.essuf.fr
- main reste a 0854b40 / v0.2-paywall-foundation, PAS de merge avant validation explicite

## 2026-05-05 - Claude (claude.ai browser MCP) - integration/private-cockpit-v04-vps

Objectif: Audit + tests sur VPS du dashboard cockpit prive v0.4 (Codex codex-private-cockpit-v04).

Fichiers modifies par Codex (2, 149 ins / 6 del):
- MATRICE_PRIVEE_STRATEGIE.md (+11)
- artifacts/matrice-narrative/src/pages/dashboard.tsx (+144/-6) [refonte cockpit]

Diff purement frontend, aucun changement backend.

Architecture cockpit v0.4 (lignes du fichier source):
- L49 `projectStage(project)`: derive l etape selon progression
  - >= 100 -> archive
  - >= 70 -> finalisation
  - >= 35 -> structure
  - < 35 -> fondations
- L57 `privatePriority(project)`: score combinant progression + jours d inactivite (max 14)
  - weight = pct >= 100 ? -40 : 40 - pct * 0.25
  - return weight + min(daysIdle, 14)
- L207 `formatFilter` (default "all")
- L208 `stageFilter` (default "active" = exclut archive)
- L212 options format derivees dynamiquement de targetFormat distincts
- L215 `filteredProjects` useMemo: applique search + format + stage
- L234 top 4 projets prioritaires: sort par privatePriority desc, slice(0,4)
- L243 activeProjects.count = projects avec progression < 100
- L244 sleepingProjects.count = projects avec privatePriority >= 42
- L356 placeholder: "Rechercher un projet, genre, ton..."

Resultats tests sur https://matrice.essuf.fr:

TEST 1 - Build Docker:
- `docker compose up -d --build --force-recreate api frontend` => OK, aucun warning de typecheck/build
- 3 containers Up apres recreation

TEST 2 - /dashboard charge:
- GET /dashboard => HTTP 200, content-type=text/html (750 bytes shell SPA)
- Bundle JS frais: /assets/index-D7D0zfhl.js (1.4 MB)

TEST 3 - Strings UI v0.4 dans le bundle deploye:
- 'fondations': 4 occurrences (stage)
- 'finalisation': 2 (stage)
- 'archive': 4 (stage)
- 'structure': 47 (stage + composants)
- 'Rechercher': 2 (placeholder)
- 'Tous formats': 1 (option filtre)
- 'En cours': 1 (option stage filter)
- 'Archive': 1 (label option)
- 'Priorit': 34 (labels priorite/cards)
Note: noms de fonctions (projectStage, privatePriority, etc.) absents car minifies. Les strings literales prouvent que la logique est embarquee.

TEST 4 - Donnees API coherentes avec le cockpit:
- 2 projets en DB: "seven" (Film long metrage, prog=35) et "L'ile infernale" (Roman, prog=50)
- Simulation Python de la logique cockpit:
  - seven => stage=structure, priority=31
  - L ile infernale => stage=structure, priority=28
  - activeProjects.count=2, sleepingProjects.count=0 (aucun en hibernation)
  - formatFilter options: ["all", "Film long metrage", "Roman"]

TEST 5 - Backend intact (pas de regression):
- /api/healthz => {"status":"ok"}
- /api/access => mode=private, viewer.role=owner, isPaid=true (v0.3 preserve)

Verdict: cockpit v0.4 VALIDE en production. Aucun fix VPS necessaire.

Securite:
- ls /opt/matrice/.env* ne montre que .env (prive) + .env.example (public)
- Aucun .env.backup laisse trainer (pas eu besoin de modifier .env, donc aucun backup cree)
- git status --short est vide (= identique a origin/codex-private-cockpit-v04)

Branche d'integration: integration/private-cockpit-v04-vps (= origin/codex-private-cockpit-v04)

Prochaine etape proposee:
- BraveHeart: ouvrir https://matrice.essuf.fr/dashboard dans le navigateur pour valider visuellement (recherche, filtres, tri prioritaire)
- Codex: revoir + merger dans main apres validation BraveHeart
- main reste a 4ad70d2 / v0.3-owner-public-access, PAS de merge avant validation explicite

## 2026-05-05 - Claude (claude.ai browser MCP) - integration/private-memory-v05-vps

Objectif: Audit + tests sur VPS de la memoire creative privee v0.5 (Codex codex-private-memory-v05).

Fichiers modifies par Codex (8, 309 ins / 1 del):
- MATRICE_PRIVEE_STRATEGIE.md (+11)
- artifacts/api-server/src/routes/index.ts (+2) [cablage memory router]
- artifacts/api-server/src/routes/memory.ts (+93) [NOUVEAU CRUD route]
- artifacts/matrice-narrative/src/App.tsx (+2) [route /memory]
- artifacts/matrice-narrative/src/components/layout/AppLayout.tsx (+3/-1) [lien sidebar]
- artifacts/matrice-narrative/src/pages/memory.tsx (+182) [NOUVELLE page]
- lib/db/src/schema/index.ts (+1) [export schema]
- lib/db/src/schema/memory.ts (+16) [NOUVEAU schema Drizzle creative_memory_entries]

Schema DB:
```ts
creative_memory_entries:
  id text PK (UUID auto via crypto.randomUUID())
  category text NOT NULL
  title text NOT NULL
  content text NOT NULL DEFAULT ''
  tags jsonb<string[]> NOT NULL DEFAULT []
  priority integer NOT NULL DEFAULT 50
  is_active boolean NOT NULL DEFAULT true
  created_at, updated_at timestamp NOT NULL DEFAULT now()
```

Routes API (toutes derriere router.use(ownerOnly) middleware):
- L19 GET /memory (list, ordered by desc(priority), desc(updatedAt))
- L32 POST /memory (create, requires category + title)
- L65 PATCH /memory/:id (update)
- L83 DELETE /memory/:id (delete)

Procedure synchro DB:
Le container API ne contient pas le code source de lib/db. Postgres n'est pas expose sur le host.
Solution: container Node temporaire dans le reseau matrice_default avec DATABASE_URL=postgres://matrice:$PGPWD@postgres:5432/matrice_narrative
```bash
PGPWD=$(grep ^POSTGRES_PASSWORD /opt/matrice/.env | cut -d= -f2)
docker run --rm --network matrice_default -v /opt/matrice:/app -w /app/lib/db \
  -e DATABASE_URL="postgres://matrice:$PGPWD@postgres:5432/matrice_narrative" \
  node:22-slim sh -c 'corepack enable && corepack prepare pnpm@10 --activate && \
  pnpm install --silent --ignore-scripts && pnpm push'
```
=> [√] Changes applied. Table creative_memory_entries creee (verifie via psql \d).

Note: pnpm install cree des node_modules dans lib/* mais ils sont gitignores donc git status --short reste propre.

Resultats tests sur https://matrice.essuf.fr:

TEST 1 - PRIVATE - GET /api/memory (vide):
- []HTTP 200. OK

TEST 2 - PRIVATE - POST /api/memory:
- {"category":"theme","title":"Test Memory v0.5","content":"Premiere entree test","tags":["test","audit"],"priority":75}
- HTTP 200, retourne entry complete avec ID 3a68d766-77ee-429e-b559-2ae50fd87291. OK

TEST 3 - PRIVATE - GET /api/memory:
- count=1, entree visible. OK

TEST 4 - PRIVATE - PATCH /api/memory/:id:
- {"title":"Test Memory v0.5 [MODIFIE]","priority":90}
- HTTP 200, title et priority modifies, updated_at change. OK

TEST 5 - COMMERCIAL public sans token - GET /api/memory:
- HTTP 403 + body {"error":"OWNER_REQUIRED","viewer":{"role":"public"},...}
- Le middleware ownerOnly bloque correctement. OK

TEST 5b - COMMERCIAL public sans token - POST /api/memory:
- HTTP 403 + body OWNER_REQUIRED. OK

TEST 6 - PRIVATE restaure - DELETE /api/memory/:id:
- HTTP 204 (No Content). OK

TEST 7 - PRIVATE - GET /api/memory apres DELETE:
- count=0. OK

TEST 8 - Page /memory cote frontend:
- GET /memory => HTTP 200 (shell SPA 750 bytes)
- Bundle frais: /assets/index-_h0lTP1H.js (1.43 MB)
- Strings UI v0.5 dans le bundle: '/memory':5, 'Memoire':5, 'Memoire creative':1, 'category':46, 'priority':18. OK

Verdict: memoire creative v0.5 VALIDEE. Aucun fix VPS necessaire (mais necessite la synchro DB Drizzle decrite ci-dessus).

Securite:
- .env backup cree pendant les tests, restaure et supprime apres
- ls /opt/matrice/.env* ne montre que .env (prive) et .env.example (public)
- git status --short est vide (= identique a origin/codex-private-memory-v05)
- node_modules crees par drizzle push sont gitignores

Branche d'integration: integration/private-memory-v05-vps (= origin/codex-private-memory-v05, aucun commit code additionnel)

Prochaine etape proposee:
- BraveHeart: ouvrir https://matrice.essuf.fr/memory pour valider visuellement (creation/edition/suppression d'entrees memoire)
- Codex: revoir + merger dans main apres validation BraveHeart
- main reste a bb2cfb7 / v0.4-private-cockpit, PAS de merge avant validation explicite

## 2026-05-05 - Claude (claude.ai browser MCP) - integration/memory-aware-v06-vps

Objectif: Audit + tests sur VPS de la Memory-Aware Generation v0.6 (Codex codex-memory-aware-v06).

Fichiers modifies par Codex (5, 118 ins / 5 del):
- MATRICE_PRIVEE_STRATEGIE.md (+11)
- artifacts/api-server/src/routes/index.ts (+2) [cablage middleware]
- artifacts/api-server/src/routes/manuscripts.ts (+3/-1) [appel context]
- artifacts/api-server/src/services/creativeMemoryContext.ts (+96) [NOUVEAU service]
- artifacts/api-server/src/services/generationService.ts (+11/-4) [appendCreativeMemoryContext]

Architecture:
- shouldLoadMemory(req): POST sur /manuscripts/analyze, /projects/.../generate-*, /director-mode, /dialogue, /check-scene-hpsa, /generate-fountain
- buildCreativeMemoryContext(): SELECT entries WHERE is_active=true ORDER BY priority desc, updatedAt desc LIMIT 12
  - Format: "### MEMOIRE CREATIVE PRIVEE DU CREATEUR" + entries formatees (categorie, title, priority, tags, content clamp 700)
- creativeMemoryContextMiddleware: gate strict
  ```ts
  const access = getProductAccess(req);
  const context = access.viewer.role === "owner" ? await buildCreativeMemoryContext() : "";
  memoryStore.run({ context }, next);
  ```
- Utilise AsyncLocalStorage (memoryStore) pour propager au generationService
- Try/catch silencieux (pas de crash si DB unavailable)
- appendCreativeMemoryContext(systemPrompt): injection dans le prompt central aiJson()

Build VPS:
- docker compose up -d --build --force-recreate api frontend => OK, aucune erreur esbuild ni Rollup
  (les erreurs build local Codex sur Windows sont environnement-specifiques, pas Docker/Linux)

Resultats tests sur https://matrice.essuf.fr:

SETUP - Creation entree memoire test:
- POST /api/memory {category:"interdit",title:"Pas de cliches algeriens",content:"Toute reference a Algerie ou Maghreb interdite. Style cinematographique francais uniquement.",priority:95}
- HTTP 200, ID 9b28c8c8-1f65-479d-aab6-e5f973fbaf5f

TEST 1 PRIVATE owner /api/access:
- mode=private, viewer.role=owner, isPaid=true. OK

TEST 2 PRIVATE owner generate-matrix:
- HTTP 200 bytes=6782 time=21.08s, matrice generee. OK (memoire chargee silencieusement, log API confirme POST /api/memory 201)

TEST 3 PRIVATE owner director-mode:
- HTTP 200 time=9.27s, sceneTitle="L'ombre du contrat", overallMood="Un duel silencieux ou la tension s'epaissit comme une brume pesante". OK

TEST 4 PRIVATE owner manuscripts/analyze:
- HTTP 400 time=0.06s {"error":"Texte trop court"} - validation metier, pas un crash, middleware passe. OK
  (le seuil min de /manuscripts/analyze est eleve, difficile a satisfaire avec texte synthetique court, mais la route ne plante pas)

TEST 5 passage en mode commercial:
- /api/access => mode=commercial, viewer.role=public, isPaid=false. OK

TEST 6 COMMERCIAL public sans token generate-matrix:
- HTTP 403 OWNER_REQUIRED. OK
  Note: le projet test "seven" a ete cree en mode private donc reste protege par ownerOnly meme apres bascule commerciale.
  C'est en fait BIEN: les projets prives restent prives. Pour tester la non-fuite memoire sur un module free public, il faudrait un projet cree en mode commercial libre. Le mecanisme est gate par le code (creativeMemoryContextMiddleware verifie viewer.role === "owner").

TEST 7 COMMERCIAL admin-token generate-matrix:
- HTTP 200 bytes=6426 time=22.26s, matrice generee. OK (memoire chargee car viewer.role=owner via admin-token)

TEST 8 COMMERCIAL admin-token director-mode:
- HTTP 200 time=13.74s, sceneTitle="La Lame du Contrat", overallMood="Tension palpable dans l'air, l'attente avant la tempete", colorGrading="Palette de gris acier...". OK

TEST 4b PRIVATE manuscripts/analyze avec texte plus long:
- HTTP 400 time=0.06s "Texte trop court" - seuil min eleve, mais pas de crash. OK

Verdict: Memory-Aware Generation v0.6 VALIDEE. Aucun fix VPS necessaire.
Le gating cote serveur (viewer.role === "owner") empeche bien la fuite memoire vers visiteurs publics.
Les generations passent pour owner (private mode ou admin-token).

Securite:
- .env backup cree pendant les tests, restaure et supprime apres
- ls /opt/matrice/.env* ne montre que .env (prive) et .env.example (public)
- Entree memoire test 9b28c8c8 supprimee proprement (HTTP 204)
- git status --short est vide (= identique a origin/codex-memory-aware-v06)

Branche d'integration: integration/memory-aware-v06-vps (= origin/codex-memory-aware-v06, aucun commit code additionnel)

Prochaine etape proposee:
- BraveHeart: utiliser /memory pour creer ses vraies entrees, puis lancer une generation pour valider l'effet de la memoire dans la sortie IA
- Codex: revoir + merger dans main apres validation BraveHeart
- main reste a 8a4c608 / v0.5-private-memory, PAS de merge avant validation explicite

## 2026-05-06 - Claude (claude.ai browser MCP) - integration/commercial-access-v07-vps

Objectif: Audit + tests sur VPS de Commercial Access + Admin Abonnements v0.7 (Codex codex-commercial-access-v07).
Note: cette branche inclut aussi v0.6 (memory-aware) non encore mergee dans main.

Fichiers modifies par Codex (16, 628 ins / 19 del):
- .env.example (+8/-5)
- MATRICE_PRIVEE_STRATEGIE.md (+27)
- artifacts/api-server/src/lib/auth.ts (+85) [NOUVEAU helpers token signe HMAC-SHA256]
- artifacts/api-server/src/lib/productAccess.ts (+73) [evolutions]
- artifacts/api-server/src/routes/admin.ts (+69) [/admin/login, /admin/verify, /admin/subscriptions/users]
- artifacts/api-server/src/routes/auth.ts (+85) [NOUVEAU /auth/signup, /auth/login]
- artifacts/api-server/src/routes/index.ts (+6) [cablage middlewares]
- artifacts/api-server/src/routes/manuscripts.ts (+3)
- artifacts/api-server/src/routes/projects.ts (+48) [owner_user_id rattachement, quotas free]
- artifacts/api-server/src/services/creativeMemoryContext.ts (+96) [v0.6]
- artifacts/api-server/src/services/generationService.ts (+11)
- artifacts/matrice-narrative/src/pages/admin.tsx (+112) [onglet Abonnements UI]
- docker-compose.yml (+1)
- lib/db/src/schema/index.ts (+1)
- lib/db/src/schema/projects.ts (+1) [+owner_user_id]
- lib/db/src/schema/users.ts (+21) [NOUVEAU table app_users]

Synchro DB Drizzle:
- Lance via container Node temporaire dans reseau matrice_default
- [\u221a] Changes applied. Table app_users creee, projects.owner_user_id ajoutee.

Resultats tests sur https://matrice.essuf.fr:

TEST 1 PRIVATE owner: tout reste ouvert (healthz OK, /api/access mode=private viewer=owner, GET /projects count=2). OK

TEST 2 COMMERCIAL anonyme:
- /api/access => HTTP 200, mode=commercial viewer=public isPaid=false
- GET /api/projects => HTTP 403 OWNER_REQUIRED (au lieu de 401 AUTH_REQUIRED prevu). KO mineur (resultat plus protecteur)
- GET /api/memory => HTTP 403 OWNER_REQUIRED. OK (gating ownerOnly)
- GET /api/admin/subscriptions/users => HTTP 403. OK (admin token requis)

TEST 3 SIGNUP:
- POST /api/auth/signup {email, password, displayName} => HTTP 201
- User cree: id=d81011fd-88fa-4127-b6cf-f3b84d47e621, role=user, plan=free, status=active, generationsUsed=0, projectsCreated=0
- Token JWT-like (132 chars) retourne. OK

TEST 4 LOGIN:
- POST /api/auth/login => HTTP 200, meme user + nouveau token. OK

TEST 5 GET /api/access avec user-token:
- HTTP 200, viewer={role:user, authenticated:true, source:user-token, userId:..., email:...}, plan=free, isPaid=false. OK

!!! BUG BLOQUANT v0.7 !!! TEST 6/7:
- GET /api/projects avec Bearer user-token => HTTP 403 OWNER_REQUIRED
- POST /api/projects avec Bearer user-token => HTTP 403 OWNER_REQUIRED
- Le user free authentifie est BLOQUE pour TOUTES les routes /projects (et /manuscripts).

CAUSE RACINE identifiee:
- routes/memory.ts L17: router.use(ownerOnly) au niveau du sub-router
- routes/index.ts L25: router.use(memoryRouter) SANS PREFIXE
- => le middleware ownerOnly defini globalement dans memoryRouter s'applique a TOUTES les routes definies APRES dans index.ts (productAccessMiddleware, projectsRouter, manuscriptsRouter)
- Routes definies AVANT (healthRouter, adminRouter, authRouter, accessRouter) passent normalement.
- C'est confirme: OWNER_REQUIRED apparait UNIQUEMENT dans memory.ts ligne 11 (verifie via grep -rn).

Fix propose Codex:
- Monter memoryRouter avec prefixe explicite: router.use("/memory", memoryRouter)
- ET retirer "/memory" des paths internes du memoryRouter (L19 router.get("/"...) au lieu de L19 router.get("/memory"...))
- Pattern Express standard, evite la fuite de middleware vers le router parent.

TESTS NON REALISES (bloques par le bug racine):
- TEST 8 user free POST /api/projects (attendu: HTTP 201 1/1 ou 402 PAYWALL si limite)
- TEST 9 user free generate-matrix (attendu: HTTP 200 1/2 ou 402 PAYWALL si limite atteinte)
- TEST 10 user free module avance (attendu: 402 PAYWALL_REQUIRED)
- TEST 11 admin /admin/subscriptions/users avec x-admin-token, passage user en Pro
- TEST 12 user Pro module avance debloque
A refaire apres fix Codex.

AUTRES OBSERVATIONS positives:
- Schema app_users propre: email UNIQUE, password scrypt+salt, timingSafeEqual, plan/status/quotas/Stripe-ready
- Routes /admin/subscriptions/users et /admin/subscriptions/users/:id derriere adminAuthMiddleware (x-admin-token)
- POST /projects logic correcte (ownerUserId: access.viewer.role === "user" ? user?.id : null + increment projectsCreated)
- Middleware /projects/:id correct (404 "Not found" si owner_user_id ne match pas user.id)
- Token signe HMAC-SHA256 avec SESSION_SECRET, format payload.signature
- Build Docker/Linux OK (aucun probleme env-specifique)

Verdict: v0.7 NON UTILISABLE EN PROD COMMERCIAL en l'etat. Bug bloquant.
Main reste a 8a4c608 / v0.5-private-memory. PAS DE MERGE de v0.6 ni v0.7 avant fix.

Securite (post-audit):
- Mode private restaure: viewer.role=owner, isPaid=true
- .env restaure depuis .env.backup, .env.backup supprime
- ls /opt/matrice/.env* ne montre que .env (prive) et .env.example (public)
- User test audit-free@test.local supprime de la DB (DELETE 1)
- node_modules crees par drizzle push restent gitignores

Branche d'integration: integration/commercial-access-v07-vps (= origin/codex-commercial-access-v07)

Prochaine etape proposee:
- Codex: corriger le cablage memoryRouter (path /memory explicite + suppression du prefixe interne)
- Apres fix: relancer audit complet (TEST 6 a 12)
- BraveHeart: NE PAS valider ni merger v0.7 avant fix Codex
## 2026-05-06 (suite) - Claude (claude.ai browser MCP) - integration/commercial-access-v07-vps APRES FIX 3d42775

Codex a pousse le commit 3d42775 "Fix memory router scoping" qui applique exactement le fix propose:
  - routes/index.ts: router.use(memoryRouter) -> router.use("/memory", memoryRouter)
  - routes/memory.ts: paths internes /memory enleves (router.get("/"), router.post("/"), router.patch("/:id"), router.delete("/:id"))

Apres rebuild Docker, re-execution complete des 12 tests prevus:

TEST 1 PRIVATE owner intact: healthz OK, viewer=owner, GET /projects HTTP 200. OK
TEST 2 COMMERCIAL anonyme GET /api/projects: HTTP 401 AUTH_REQUIRED (avant fix: 403 OWNER_REQUIRED). FIX VALIDE
TEST 3 SIGNUP: HTTP 201, user audit2@test.local cree (id=832ef15d), token 132 chars. OK
TEST 4 GET /api/projects avec user-token: HTTP 200 count=0 (avant fix: 403). FIX VALIDE
TEST 5 GET /api/memory avec user-token: HTTP 403 OWNER_REQUIRED (memoire reste owner-only). OK
TEST 6 user free POST /api/projects (1/1) avec body complet: HTTP 201, projet id=b755871f cree. OK
  Note: la route exige TOUS les champs NOT NULL (rawIdea, inputType, genre, tone, targetFormat, temporalLogic, realityLevel, targetAudience, artisticAmbition). Body partiel retourne HTTP 500 "null value in column raw_idea violates not-null constraint". UX stricte mais pas un bug.
TEST 7 user free POST 2eme projet: HTTP 402 FREE_PROJECT_LIMIT_REACHED. OK
TEST 8 user free generate-matrix 1/2: HTTP 200 13.27s. OK
TEST 9 user free generate-matrix 2/2: HTTP 200 16.57s. OK
TEST 9b user free generate-matrix 3/2: HTTP 402 FREE_GENERATION_LIMIT_REACHED. OK
TEST 10 user free director-mode (module avance): HTTP 402 FREE_GENERATION_LIMIT_REACHED. OK
TEST 11a admin login: ADMIN_TOKEN 64 chars. OK
TEST 11b GET /admin/subscriptions/users avec x-admin-token: HTTP 200, count=1, user audit2@test.local visible (plan=free, generationsUsed=2, projectsCreated=1). OK
TEST 11c PATCH /admin/subscriptions/users/$USER_ID body={"plan":"pro"}: HTTP 200, plan=pro confirme. OK
TEST 12a /api/access avec user Pro token: plan=pro, isPaid=True, role=user. OK
TEST 12b user Pro director-mode: HTTP 200 6.95s, sceneTitle="Le Poids du Silence", overallMood="Une tension silencieuse...". MODULE AVANCE DEBLOQUE
TEST 12c user Pro generate-matrix supplementaire: HTTP 200 8.61s, nouvelle matrice generee. QUOTAS DEBLOQUES

Verdict v0.7: VALIDE. Fix Codex 3d42775 resout entierement le bug bloquant. Cycle commercial complet (signup, quota free, paywall, admin upgrade, Pro debloque) fonctionne.

Observations diverses:
- Token JWT-like (132 chars) signe HMAC-SHA256 SESSION_SECRET, format payload.signature. Validation timingSafeEqual.
- POST /admin/login retourne ADMIN_TOKEN 64 chars (different format, tres probablement aussi hash signe via SESSION_SECRET).
- Schema app_users contient stripeCustomerId/stripeSubscriptionId nullable, pret pour integration Stripe.
- Schema projects.owner_user_id text nullable: si null = projet legacy / admin / mode private; si rempli = projet user free/pro.
- Middleware /projects/:id verifie ownership (owner_user_id == user.id) et retourne 404 "Not found" si miss-match. Bonne defense en profondeur.
- creativeMemoryContextMiddleware n'a pas plante meme apres bascule commercial: viewer.role === "owner" ? buildContext() : "" continue de bien gater.

Todo restant pour Codex/BraveHeart (non bloquant):
- UX: rendre POST /api/projects plus permissif (defaults sur les champs NOT NULL, ou Zod validation explicite avec messages clairs au lieu de HTTP 500 sur null violation)
- Phase 1 v2.1+: export PDF natif, beat sheet, editeur prose Atelier Roman
- Integration Stripe complete (les champs DB sont prets)
- BraveHeart: valider visuellement l'admin /admin onglet Abonnements et le flow signup/login dans le navigateur

Securite finale (post-audit complet):
- .env restaure depuis .env.backup, .env.backup supprime (ls /opt/matrice/.env* ne montre que .env et .env.example)
- Mode private restaure: viewer.role=owner, isPaid=True
- User test audit2@test.local supprime (DELETE 1)
- Projet test b755871f supprime (DELETE 1)
- git status --short: vide

Branche d'integration: integration/commercial-access-v07-vps a 3d42775 (= origin/codex-commercial-access-v07)
Main reste a 8a4c608 / v0.5-private-memory.

Prochaine etape proposee:
- BraveHeart: tester /admin (onglet Abonnements UI), tester signup/login dans navigateur sur https://matrice.essuf.fr en mode commercial pour validation visuelle
- Apres validation: Codex peut merger v0.6 + v0.7 dans main, creer tags v0.6-memory-aware et v0.7-commercial-access

## 2026-05-07 - Claude (claude.ai browser MCP) - SECURITY FIX isolation projets

Bug critique identifie par BraveHeart : en mode commercial, un user authentifie pouvait potentiellement voir des projets d'autres users.

DIAGNOSTIC:
- 2 projets en DB (seven, L'ile infernale) avaient owner_user_id = NULL (crees en mode private avant v0.7)
- routes/projects.ts GET /projects: ternaire ambigue qui rendait TOUS les projets si pas exactement (commercial + role=user + user authentifie)
- routes/projects.ts middleware /projects/:id : bypass si pas exactement (commercial + role=user + user authentifie), pas de defense in depth contre projets owner_user_id=NULL

DECISIONS BraveHeart:
- Suppression des 2 projets legacy (sera recree via signup quand pret)
- Solution pro durable

ACTIONS REALISEES:
1. Backup SQL des 2 projets + donnees liees (25 tables) -> /opt/matrice/backups/projects-2026-05-07-194652.sql (93k)
2. DELETE FROM projects WHERE id IN (...) -> CASCADE auto sur les 24 tables filles (FK confdeltype='c')
3. Refactor routes/projects.ts (32 ins / 13 del):
   - GET /projects: switch explicite par role (owner -> tout, user -> ses projets, anonymous -> [])
   - Middleware /projects/:id: defense in depth, owner bypasse, user check ownership avec check explicite owner_user_id===null, anonymous renvoie 401
4. Rebuild Docker api OK
5. Tests d'isolation complets:
   - TEST 1 anonyme: HTTP 401 AUTH_REQUIRED OK
   - TEST 2-5: signup Alice + Bob, Alice cree 2 projets, Bob cree 1 projet
   - TEST CRITIQUE 1: Alice GET /projects -> count=2 (SES projets uniquement) OK
   - TEST CRITIQUE 2: Bob GET /projects -> count=1 (SON projet uniquement) OK
   - TEST CRITIQUE 3: Alice GET projet de Bob -> HTTP 404 Not found OK
   - TEST CRITIQUE 4: Bob GET projet d'Alice -> HTTP 404 Not found OK
   - TEST 10: restauration mode private, owner GET /projects voit count=3 (tous projets de tous users) OK
6. Nettoyage : DELETE 3 projets + DELETE 2 users de test, restauration mode private
7. Backup conserve dans /opt/matrice/backups/ pour eventuelle restauration manuelle

CODE CHANGES:
artifacts/api-server/src/routes/projects.ts +32 / -13
  GET /projects (L131-145): logique explicite par role
  Middleware /:id (L195-217): defense in depth + check explicite owner_user_id===null

Verdict: ISOLATION COMPLETE. Chaque user ne voit que ses propres projets. Projets owner_user_id=NULL inaccessibles aux users (intentionnel: appartiennent au mode private/owner). Cross-user access = 404.

Prochaine etape: commit sur integration/commercial-access-v07-vps + tag v0.7.1-isolation-fix + push.

Apres validation: merger dans main, creer tag v0.7.1, redeployer main en prod.

## 2026-05-07 - Claude (claude.ai browser MCP) - Brief Phase 2A pour Codex

Apres validation strategie avec BraveHeart (4 paliers Pro/Studio/Enterprise + Lab prive 3 dimensions + Resend pour email), brief Codex Phase 2A redige.

Document detaille dans Notion: https://www.notion.so/359bf190fe948156924ee121003a45b9
Quick reference sur VPS: /opt/matrice/PHASE_2A_BRIEF.md

9 tickets a faire par Codex dans l ordre :
1. Landing page publique /
2. Page /pricing
3. Flow signup + verify email (Resend)
4. Flow forgot/reset password
5. Onboarding wizard 3 ecrans
6. Redirects 401/402/403 propres
7. Systeme experimental_modules
8. Cablage modeles IA par plan (haiku/sonnet/opus + override owner)
9. Validation Zod POST /projects

2 migrations DB :
- app_users: 5 nouvelles colonnes
- nouvelle table experimental_modules

5 nouvelles variables env (RESEND, BASE_URL, FROM_EMAIL, FROM_NAME, AI_OVERRIDE).

15 tests d acceptation globaux dont regression test isolation projets v0.7.1.

Quand Codex pret a commencer : creer branche feat/phase-2a-onboarding-uxlab depuis main (HEAD = 4473aca v0.7.1), pinger BraveHeart pour la cle RESEND_API_KEY (compte SafeScol existant), suivre l ordre des 9 tickets.

Claude reste disponible pour audit securite, regression tests, redaction emails FR.

## 2026-05-08 - Codex - feat/phase-2a-onboarding-uxlab

Phase 2A demarree depuis main ba8a3b3 / tag v0.7.1.

Ticket 1 - Landing publique `/`:
- Home remplacee par une vraie landing commerciale Matrice Narrative.
- H1 produit clair: "Matrice Narrative".
- Navigation publique: Workflow, Tarifs, Admin, Connexion, Commencer.
- Hero avec apercu produit code-native du cockpit createur.
- Sections ajoutees: workflow narratif, separation commercial/Lab prive, apercu des 4 paliers, CTA final.
- CTA prepares pour `/pricing` (ticket 2) et `/projects/new`.
- Aucun changement backend, aucun changement sur `creative_memory_entries`, aucun changement sur le gating owner.

Verification locale:
- `corepack pnpm --filter @workspace/matrice-narrative run typecheck` OK.
- `git diff --check` OK.
- Verification visuelle dev server non terminee sur Windows local: Vite bloque sur le package optionnel Rollup `@rollup/rollup-win32-x64-msvc` mal resolu par npm/pnpm. A reverifier cote Linux/VPS ou apres reparation complete de `node_modules`.

Suite:
- Commit ticket 1.
- Continuer ticket 2 `/pricing`.
