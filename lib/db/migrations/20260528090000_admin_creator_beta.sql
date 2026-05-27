ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_role_check;
ALTER TABLE app_users ADD CONSTRAINT app_users_role_check
  CHECK (role IN ('user', 'admin', 'owner'));

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS creator_mode_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS beta_started_at TIMESTAMP;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS beta_expires_at TIMESTAMP;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS onboarding_step TEXT NOT NULL DEFAULT 'welcome';
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_app_users_role ON app_users(role);
CREATE INDEX IF NOT EXISTS idx_app_users_status ON app_users(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_users_plan ON app_users(plan, status);
CREATE INDEX IF NOT EXISTS idx_app_users_beta ON app_users(is_beta_tester) WHERE is_beta_tester = true;

CREATE TABLE IF NOT EXISTS beta_invite_codes (
  code TEXT PRIMARY KEY,
  plan_granted TEXT NOT NULL DEFAULT 'premium',
  duration_months INTEGER NOT NULL DEFAULT 3,
  max_uses INTEGER NOT NULL DEFAULT 1,
  uses_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP,
  created_by TEXT REFERENCES app_users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS beta_code_usages (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL REFERENCES beta_invite_codes(code) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  used_at TIMESTAMP NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_beta_codes_status ON beta_invite_codes(uses_count, max_uses, expires_at);
CREATE INDEX IF NOT EXISTS idx_beta_usages_user ON beta_code_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_usages_code ON beta_code_usages(code, used_at DESC);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_user_id TEXT REFERENCES app_users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_admin ON admin_audit_log(admin_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_target ON admin_audit_log(target_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_type ON admin_audit_log(action_type, created_at DESC);
