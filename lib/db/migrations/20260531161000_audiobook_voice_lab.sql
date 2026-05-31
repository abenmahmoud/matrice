-- Lot E: Voice Lab samples and audiobook jobs.

CREATE TABLE IF NOT EXISTS voice_samples (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  consent_accepted BOOLEAN NOT NULL DEFAULT false,
  sample_path TEXT NOT NULL,
  original_filename TEXT,
  mime_type TEXT NOT NULL DEFAULT 'audio/wav',
  size_bytes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_voice_samples_user ON voice_samples(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_samples_project ON voice_samples(project_id);

CREATE TABLE IF NOT EXISTS audio_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  voice_sample_id TEXT REFERENCES voice_samples(id) ON DELETE SET NULL,
  scope TEXT NOT NULL DEFAULT 'excerpt',
  status TEXT NOT NULL DEFAULT 'queued',
  engine TEXT NOT NULL DEFAULT 'mock',
  input_text TEXT NOT NULL,
  output_path TEXT,
  watermark TEXT NOT NULL DEFAULT 'Generated with Matrice Voice Lab',
  cost_credits INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audio_jobs_user ON audio_jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audio_jobs_status ON audio_jobs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audio_jobs_project ON audio_jobs(project_id);
