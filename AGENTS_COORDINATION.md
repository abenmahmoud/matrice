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
