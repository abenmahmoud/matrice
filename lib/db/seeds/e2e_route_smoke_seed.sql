-- Seed optionnel pour lancer l'audit visuel contre une DB locale/VPS.
-- Le test Playwright mocke les API par defaut pour rester stable en CI,
-- mais cette graine donne un owner + projet coherents si on veut brancher un backend reel.
--
-- Garde-fou: ne jamais executer cette graine sur la production par accident.
-- Usage local:
--   psql -v NODE_ENV=test -f lib/db/seeds/e2e_route_smoke_seed.sql
-- Override exceptionnel sur une base ISOLEE uniquement:
--   psql -v NODE_ENV=production -v ALLOW_E2E_SEED=true -f ...

\if :{?NODE_ENV}
\else
\set NODE_ENV development
\endif

\if :{?ALLOW_E2E_SEED}
\else
\set ALLOW_E2E_SEED false
\endif

SELECT set_config('matrice.e2e_seed.node_env', :'NODE_ENV', false);
SELECT set_config('matrice.e2e_seed.allow', :'ALLOW_E2E_SEED', false);

DO $$
BEGIN
  IF current_setting('matrice.e2e_seed.node_env', true) = 'production'
     AND current_setting('matrice.e2e_seed.allow', true) <> 'true'
  THEN
    RAISE EXCEPTION 'Refusing to run e2e seed in production. Use an isolated test database or pass ALLOW_E2E_SEED=true intentionally.';
  END IF;
END $$;

INSERT INTO app_users (
  id,
  email,
  password_hash,
  display_name,
  role,
  plan,
  status,
  monthly_credits,
  extra_credits,
  projects_created,
  is_email_verified,
  creator_mode_enabled,
  is_beta_tester,
  onboarding_step,
  onboarding_completed_at,
  created_at,
  updated_at
) VALUES (
  'user-e2e',
  'auteur.e2e@matrice.test',
  'e2e-disabled-password-hash',
  'Auteur E2E',
  'owner',
  'premium',
  'active',
  800,
  200,
  1,
  true,
  true,
  true,
  'done',
  now(),
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  role = 'owner',
  plan = 'premium',
  status = 'active',
  creator_mode_enabled = true,
  updated_at = now();

INSERT INTO projects (
  id,
  title,
  raw_idea,
  input_type,
  genre,
  tone,
  target_format,
  target_audience,
  artistic_ambition,
  manuscript_excerpt,
  author_display_name,
  owner_user_id,
  progression,
  created_at,
  updated_at
) VALUES (
  'e2e-project',
  'Les Cendres du Mirage',
  'Une autrice transforme une idee brute en oeuvre vendable.',
  'text',
  'Roman contemporain',
  'Intime',
  'roman',
  'Adultes',
  'Publication independante',
  'Chapitre 1

Le premier paragraphe existe deja.',
  'Nora Safir',
  'user-e2e',
  72,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  author_display_name = EXCLUDED.author_display_name,
  owner_user_id = EXCLUDED.owner_user_id,
  updated_at = now();
