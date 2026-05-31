ALTER TABLE app_users ADD COLUMN IF NOT EXISTS force_password_reset BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_app_users_force_password_reset
  ON app_users(force_password_reset)
  WHERE force_password_reset = true;
