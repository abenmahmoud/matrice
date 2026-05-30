CREATE TABLE IF NOT EXISTS lentille_analyses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,

  input_logline TEXT NOT NULL,
  input_synopsis TEXT NOT NULL,
  input_genre TEXT,
  input_format_target TEXT,

  score_microdrama INTEGER NOT NULL,
  score_ai_prod INTEGER NOT NULL,
  score_pression_spatiale INTEGER NOT NULL,
  score_perso_deplace INTEGER NOT NULL,
  score_hybridation INTEGER NOT NULL,
  score_global INTEGER NOT NULL,

  diagnostic_compatible JSONB NOT NULL,
  diagnostic_renforcer JSONB NOT NULL,
  propositions JSONB NOT NULL,
  hook_10s TEXT NOT NULL,
  microdrama_version JSONB NOT NULL,
  budget_estimate JSONB NOT NULL,
  hybridation_proposal JSONB NOT NULL,
  format_recommendation TEXT NOT NULL,
  format_reasoning TEXT NOT NULL,

  model_used TEXT NOT NULL DEFAULT 'deepseek-chat',
  tokens_used INTEGER NOT NULL,
  cost_eur NUMERIC(10, 6) NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lentille_user ON lentille_analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lentille_project ON lentille_analyses(project_id);
