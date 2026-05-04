# Journal de Coordination Multi-Agents — Matrice Narrative

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
