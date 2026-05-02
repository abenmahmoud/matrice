# Guide de Déploiement VPS — Matrice Narrative

## Architecture en production

```
Internet (80/443)
      ↓
  nginx (Docker)
  ├── /* → Frontend React (fichiers statiques)
  └── /api/* → API Express (port 8080)
                    ↓
              PostgreSQL (port 5432, interne)
```

---

## Prérequis sur le VPS

### 1. Installer Docker + Docker Compose

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker   # ou déconnectez/reconnectez
docker --version
docker compose version
```

### 2. (Recommandé) Installer certbot pour HTTPS

```bash
sudo apt install -y certbot
```

---

## Déploiement initial

### Étape 1 — Récupérer le code

```bash
# Option A : depuis GitHub (recommandé)
git clone https://github.com/VOTRE-USER/matrice-narrative.git
cd matrice-narrative

# Option B : copier depuis Replit
# Dans Replit → menu ⋮ → Download as zip → extraire sur le VPS
```

### Étape 2 — Configurer les variables d'environnement

```bash
cp .env.example .env
nano .env
```

Remplissez ces valeurs dans `.env` :

```env
# Base de données
POSTGRES_PASSWORD=MotDePasseUltraSecurMinimum32Chars!

# Sécurité session (générez avec : openssl rand -hex 64)
SESSION_SECRET=votre_secret_très_long_ici

# OpenAI — OBLIGATOIRE sur VPS (la clé Replit ne fonctionne pas hors Replit)
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...votre-vraie-clé-openai...

NODE_ENV=production
PORT=8080
```

> ⚠️ **Important modèle IA** : L'application utilise `gpt-5.4` (modèle Replit-only).
> Sur VPS avec une vraie clé OpenAI, remplacez-le par `gpt-4o` ou `gpt-4-turbo` :
> ```bash
> sed -i 's/gpt-5\.4/gpt-4o/g' artifacts/api-server/src/services/generationService.ts
> ```

### Étape 3 — Certificat SSL (HTTPS)

```bash
# Pointer votre domaine vers l'IP du VPS AVANT cette étape

# Obtenir un certificat Let's Encrypt
sudo certbot certonly --standalone -d votre-domaine.com -d www.votre-domaine.com

# Copier les certificats pour Docker
mkdir -p ssl
sudo cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/cert.pem ssl/key.pem
```

> Sans domaine / sans SSL : commentez le bloc `server { listen 443 ... }` dans `nginx.conf`
> et retirez les lignes `ports: 443:443` et `volumes: ./ssl` dans `docker-compose.yml`.

### Étape 4 — Mettre à jour nginx.conf avec votre domaine

Remplacez `server_name _;` par votre domaine dans `nginx.conf` :

```nginx
server_name votre-domaine.com www.votre-domaine.com;
```

### Étape 5 — Construire et lancer

```bash
docker compose up -d --build
```

Le premier build prend 3–8 minutes. Suivez la progression :

```bash
docker compose logs -f
```

### Étape 6 — Migration de la base de données (OBLIGATOIRE au premier lancement)

```bash
# Installer pnpm localement (si pas déjà fait)
npm install -g pnpm@10

# Installer les dépendances
pnpm install

# Pousser le schéma vers la base de données de production
# (Le port 5432 doit être exposé temporairement dans docker-compose.yml)
DATABASE_URL=postgres://matrice:VOTRE_POSTGRES_PASSWORD@localhost:5432/matrice_narrative \
  pnpm --filter @workspace/db run push
```

> Pour exposer le port PostgreSQL temporairement, ajoutez dans `docker-compose.yml` sous `postgres:` :
> ```yaml
> ports:
>   - "5432:5432"   # ← ajouter temporairement
> ```
> Puis `docker compose up -d postgres` → migration → retirez le port → `docker compose up -d`

### Étape 7 — Vérification

```bash
# Santé de l'API
curl http://localhost:8080/api/healthz

# Ou via nginx
curl https://votre-domaine.com/api/healthz
# → {"status":"ok"}

# Logs en temps réel
docker compose logs -f api
docker compose logs -f frontend
```

---

## Mise à jour de l'application

```bash
# 1. Récupérer les nouvelles modifications
git pull

# 2. Si le schéma DB a changé (nouvelles tables) :
DATABASE_URL=postgres://matrice:VOTRE_PASSWORD@localhost:5432/matrice_narrative \
  pnpm --filter @workspace/db run push

# 3. Reconstruire et redémarrer
docker compose up -d --build

# 4. Vérifier
docker compose logs -f
curl https://votre-domaine.com/api/healthz
```

---

## Renouvellement SSL automatique

```bash
# Tester le renouvellement
sudo certbot renew --dry-run

# Ajouter une tâche cron pour renouveler et redémarrer nginx
sudo crontab -e
# Ajouter cette ligne :
0 3 * * 1 certbot renew --quiet && \
  cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem /chemin/matrice-narrative/ssl/cert.pem && \
  cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem /chemin/matrice-narrative/ssl/key.pem && \
  docker compose -f /chemin/matrice-narrative/docker-compose.yml restart frontend
```

---

## Commandes utiles

```bash
# État des services
docker compose ps

# Logs d'un service spécifique
docker compose logs -f api
docker compose logs -f frontend
docker compose logs -f postgres

# Redémarrer un service
docker compose restart api

# Arrêter tout
docker compose down

# Arrêter et supprimer les volumes (⚠️ efface la base de données)
docker compose down -v

# Accéder à la base de données en console
docker compose exec postgres psql -U matrice -d matrice_narrative

# Voir l'espace utilisé
docker system df
```

---

## Résolution de problèmes

### L'API ne démarre pas

```bash
docker compose logs api
# Vérifier :
# - DATABASE_URL correcte dans .env
# - PostgreSQL accessible (docker compose ps postgres)
# - Variables AI_INTEGRATIONS_OPENAI_* présentes
```

### La génération IA échoue

```bash
# Tester la clé OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-votre-clé"

# Vérifier que le modèle existe
# gpt-4o = disponible partout
# gpt-5.4 = Replit uniquement → changer en gpt-4o si sur VPS
```

### Erreur "relation does not exist"

Le schéma DB n'a pas été migré. Relancer la migration :

```bash
DATABASE_URL=postgres://matrice:PASSWORD@localhost:5432/matrice_narrative \
  pnpm --filter @workspace/db run push
```

### Le frontend affiche une page blanche

```bash
docker compose logs frontend
# Vérifier que le build s'est terminé sans erreur
# Le fichier /usr/share/nginx/html/index.html doit exister :
docker compose exec frontend ls /usr/share/nginx/html/
```

### Timeout sur les générations IA

Normal — les appels OpenAI prennent 30–90 secondes. Le timeout nginx est configuré à 120s. Si insuffisant, modifier dans `nginx.conf` :

```nginx
proxy_read_timeout 180s;   # augmenter si nécessaire
```

---

## Configuration VPS recommandée

| Ressource | Minimum | Recommandé |
|-----------|---------|------------|
| RAM | 2 Go | 4 Go |
| CPU | 1 vCPU | 2 vCPU |
| Stockage | 20 Go SSD | 40 Go SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

Fournisseurs testés : Hetzner (CX22), OVH (VPS Value), Scaleway (DEV1-S), DigitalOcean (Droplet 2Go)

---

## Sécurité recommandée

```bash
# Changer le port SSH par défaut
sudo nano /etc/ssh/sshd_config
# Port 2222  (exemple)

# Configurer UFW (pare-feu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 2222/tcp   # votre nouveau port SSH
sudo ufw enable

# Désactiver l'accès root SSH
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no

# Restreindre PostgreSQL (ne jamais exposer le port 5432 en production)
# Le docker-compose.yml ne l'expose pas par défaut — garder ainsi
```
