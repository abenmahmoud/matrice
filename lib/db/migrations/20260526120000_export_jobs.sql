-- Sprint C - Table export_jobs pour la génération asynchrone.

CREATE TABLE IF NOT EXISTS export_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  work_passport_id TEXT NOT NULL REFERENCES work_passports(id) ON DELETE CASCADE,

  format TEXT NOT NULL CHECK (format IN ('epub3', 'docx_manuscript', 'pdf_kdp', 'pdf_archive')),

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress_pct INTEGER DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),

  output_file_path TEXT,
  output_file_size_bytes INTEGER,
  output_download_token TEXT,
  output_expires_at TIMESTAMP,

  error_message TEXT,

  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS export_jobs_user_idx ON export_jobs(user_id);
CREATE INDEX IF NOT EXISTS export_jobs_passport_idx ON export_jobs(work_passport_id);
CREATE INDEX IF NOT EXISTS export_jobs_status_idx ON export_jobs(status);
CREATE INDEX IF NOT EXISTS export_jobs_token_idx ON export_jobs(output_download_token) WHERE output_download_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS export_jobs_created_idx ON export_jobs(created_at DESC);
