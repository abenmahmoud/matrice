# Déploiement VPS — Matrice Narrative

## Prérequis sur le VPS

```bash
# Docker + Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

## Déploiement initial

```bash
# 1. Cloner le repo
git clone <votre-repo> matrice-narrative
cd matrice-narrative

# 2. Configurer les variables d'environnement
cp .env.example .env
nano .env   # Remplir POSTGRES_PASSWORD, SESSION_SECRET, et les clés OpenAI

# 3. (Optionnel) Certificats SSL pour HTTPS
mkdir ssl
# Avec Let's Encrypt :
sudo certbot certonly --standalone -d votre-domaine.com
cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem ssl/key.pem
# Sans SSL (HTTP seulement) : retirer le bloc 443 de nginx.conf

# 4. Lancer les services
docker compose up -d --build

# 5. Pousser les migrations de base de données (première fois seulement)
docker compose exec api node -e "
  const { drizzle } = await import('drizzle-orm/node-postgres');
  // Migration auto via drizzle push
"
# Ou utiliser les commandes de migration Drizzle directement depuis votre machine de dev
```

## Mise à jour de l'application

```bash
git pull
docker compose up -d --build
```

## Vérification

```bash
# Logs de l'API
docker compose logs -f api

# Logs du frontend
docker compose logs -f frontend

# Santé de l'API
curl http://localhost:8080/api/healthz
```

## Migrations de base de données

Depuis votre machine de développement (avec Replit ou local) :

```bash
# Après chaque modification du schéma DB
DATABASE_URL=postgres://matrice:PASSWORD@IP_VPS:5432/matrice_narrative \
  pnpm --filter @workspace/db run push
```

Ou exposer temporairement le port PostgreSQL dans docker-compose.yml :
```yaml
postgres:
  ports:
    - "5432:5432"  # Retirer en production
```

## Architecture en production

```
Internet → nginx (80/443)
              ↓
        Frontend static (React)
              ↓ /api/*
         API Express (8080)
              ↓
         PostgreSQL (5432)
```

## Variables OpenAI en production VPS

Sur le VPS, vous avez deux options :

### Option A : Votre propre clé OpenAI (recommandé pour VPS)
```
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
AI_INTEGRATIONS_OPENAI_API_KEY=sk-votre-clé-openai
```

### Option B : Proxy Replit (uniquement si déployé sur Replit)
Les variables `AI_INTEGRATIONS_OPENAI_*` sont auto-provisionnées sur Replit.
