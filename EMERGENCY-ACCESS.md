# Acces de secours Matrice

Ce document sert uniquement en cas de blocage total d'authentification ou d'email. Ne jamais committer de vrai mot de passe, de hash reel ou d'adresse de secours personnelle.

## 1. Generer un hash de mot de passe

Depuis `/opt/matrice` ou depuis le repo local :

```bash
corepack pnpm exec node --import tsx -e "import { hashPassword } from './artifacts/api-server/src/lib/auth.ts'; const password = process.argv[1]; if (!password || password.length < 10) throw new Error('Mot de passe trop court'); console.log(hashPassword(password));" "REMPLACER_PAR_UN_MOT_DE_PASSE_LONG"
```

Copier le hash affiche. Il ressemble a `salt:hash`.

## 2. Creer un deuxieme compte owner

Remplacer l'email, l'id et le hash avant execution.

```sql
BEGIN;

INSERT INTO app_users (
  id,
  email,
  password_hash,
  display_name,
  role,
  plan,
  status,
  is_email_verified,
  monthly_credits,
  extra_credits,
  created_at,
  updated_at
) VALUES (
  'owner-secours-a-remplacer',
  'adresse-secours@exemple.fr',
  'HASH_GENERE_A_COLLER_ICI',
  'Owner secours',
  'owner',
  'premium',
  'active',
  true,
  800,
  0,
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'owner',
  plan = 'premium',
  status = 'active',
  is_email_verified = true,
  updated_at = now();

COMMIT;
```

Execution VPS :

```bash
docker exec -i matrice-postgres-1 psql -U matrice -d matrice_narrative
```

Puis coller le bloc SQL.

## 3. Remettre un mot de passe si les emails sont casses

Generer un nouveau hash avec la commande Node de la section 1, puis :

```sql
UPDATE app_users
SET
  password_hash = 'HASH_GENERE_A_COLLER_ICI',
  password_reset_token = NULL,
  password_reset_expires_at = NULL,
  status = 'active',
  is_email_verified = true,
  updated_at = now()
WHERE email = 'adresse-du-compte@exemple.fr';
```

## 4. Marquer un email comme verifie manuellement

```sql
UPDATE app_users
SET
  is_email_verified = true,
  email_verification_token = NULL,
  email_verification_sent_at = now(),
  status = 'active',
  updated_at = now()
WHERE email = 'adresse-du-compte@exemple.fr';
```

## 5. Verifications apres intervention

```sql
SELECT id, email, display_name, role, plan, status, is_email_verified
FROM app_users
WHERE email IN ('adresse-secours@exemple.fr', 'adresse-du-compte@exemple.fr');
```

Ensuite tester la connexion sur `https://matrice.essuf.fr/login`, puis retirer tout mot de passe temporaire partage par canal non securise.
