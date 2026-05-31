-- Lot D: Stripe Connect test publishing.

CREATE TABLE IF NOT EXISTS payout_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  charges_enabled BOOLEAN NOT NULL DEFAULT false,
  payouts_enabled BOOLEAN NOT NULL DEFAULT false,
  details_submitted BOOLEAN NOT NULL DEFAULT false,
  requirements_currently_due JSONB NOT NULL DEFAULT '[]'::jsonb,
  onboarding_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS payout_accounts_user_id_unique ON payout_accounts(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS payout_accounts_stripe_account_id_unique ON payout_accounts(stripe_account_id);

CREATE TABLE IF NOT EXISTS channel_connections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  external_account TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_channel_connections_project ON channel_connections(project_id, status);
CREATE INDEX IF NOT EXISTS idx_channel_connections_user ON channel_connections(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS sales_settlements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  payout_account_id TEXT REFERENCES payout_accounts(id) ON DELETE SET NULL,
  sales_entry_id TEXT REFERENCES sales_entries(id) ON DELETE SET NULL,
  channel TEXT NOT NULL DEFAULT 'Matrice',
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  stripe_transfer_id TEXT,
  stripe_payout_id TEXT,
  gross_amount_cents INTEGER NOT NULL,
  application_fee_amount_cents INTEGER NOT NULL,
  net_amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending',
  kyc_status TEXT NOT NULL DEFAULT 'pending',
  live_mode BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_settlements_project ON sales_settlements(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_settlements_user ON sales_settlements(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_settlements_status ON sales_settlements(status, kyc_status);
CREATE INDEX IF NOT EXISTS idx_sales_settlements_session ON sales_settlements(stripe_checkout_session_id);
