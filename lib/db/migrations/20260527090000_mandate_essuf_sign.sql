CREATE TABLE IF NOT EXISTS delegation_mandate (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  essuf_sign_envelope_id TEXT,
  author_sign_url TEXT,
  final_pdf_hash TEXT,
  ots_hash TEXT,
  verify_url TEXT,
  signed_at TIMESTAMP,
  declined_at TIMESTAMP,
  expired_at TIMESTAMP,
  mandate_level TEXT NOT NULL DEFAULT 'advanced',
  commission_percent INTEGER NOT NULL DEFAULT 15,
  duration_months INTEGER NOT NULL DEFAULT 12,
  territories JSONB NOT NULL DEFAULT '["monde"]'::jsonb,
  exclusivity BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE delegation_mandate ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES app_users(id) ON DELETE CASCADE;
ALTER TABLE delegation_mandate ADD COLUMN IF NOT EXISTS project_id TEXT REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE delegation_mandate ADD COLUMN IF NOT EXISTS essuf_sign_envelope_id TEXT;
ALTER TABLE delegation_mandate ADD COLUMN IF NOT EXISTS author_sign_url TEXT;
ALTER TABLE delegation_mandate ADD COLUMN IF NOT EXISTS final_pdf_hash TEXT;
ALTER TABLE delegation_mandate ADD COLUMN IF NOT EXISTS ots_hash TEXT;
ALTER TABLE delegation_mandate ADD COLUMN IF NOT EXISTS verify_url TEXT;
ALTER TABLE delegation_mandate ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP;
ALTER TABLE delegation_mandate ADD COLUMN IF NOT EXISTS declined_at TIMESTAMP;
ALTER TABLE delegation_mandate ADD COLUMN IF NOT EXISTS expired_at TIMESTAMP;
ALTER TABLE delegation_mandate ADD COLUMN IF NOT EXISTS mandate_level TEXT NOT NULL DEFAULT 'advanced';
ALTER TABLE delegation_mandate ADD COLUMN IF NOT EXISTS commission_percent INTEGER NOT NULL DEFAULT 15;
ALTER TABLE delegation_mandate ADD COLUMN IF NOT EXISTS duration_months INTEGER NOT NULL DEFAULT 12;
ALTER TABLE delegation_mandate ADD COLUMN IF NOT EXISTS territories JSONB NOT NULL DEFAULT '["monde"]'::jsonb;
ALTER TABLE delegation_mandate ADD COLUMN IF NOT EXISTS exclusivity BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE delegation_mandate ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE delegation_mandate ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT now();
ALTER TABLE delegation_mandate ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_mandate_user ON delegation_mandate(user_id, status);
CREATE INDEX IF NOT EXISTS idx_mandate_project ON delegation_mandate(project_id);
CREATE INDEX IF NOT EXISTS idx_mandate_envelope ON delegation_mandate(essuf_sign_envelope_id);
