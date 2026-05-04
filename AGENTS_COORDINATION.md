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
