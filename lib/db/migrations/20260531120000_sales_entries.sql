CREATE TABLE IF NOT EXISTS sales_entries (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  sale_date TIMESTAMP NOT NULL,
  gross_amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_entries_project ON sales_entries(project_id, sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_entries_user ON sales_entries(user_id, sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_entries_channel ON sales_entries(channel);
