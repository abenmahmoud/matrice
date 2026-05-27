CREATE TABLE IF NOT EXISTS user_onboarding_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  skipped_at TIMESTAMP,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (user_id, step_id)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_user_status ON user_onboarding_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_onboarding_completed ON user_onboarding_progress(completed_at) WHERE completed_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_url TEXT,
  action_label TEXT,
  read_at TIMESTAMP,
  archived_at TIMESTAMP,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL AND archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_user_recent ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type, created_at DESC);

CREATE TABLE IF NOT EXISTS email_log (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES app_users(id) ON DELETE SET NULL,
  template_id TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  resend_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_log_user ON email_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_template ON email_log(template_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_status ON email_log(status, created_at DESC) WHERE status IN ('pending', 'failed');

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id TEXT PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  email_mandate_events BOOLEAN NOT NULL DEFAULT true,
  email_export_ready BOOLEAN NOT NULL DEFAULT true,
  email_lentille_done BOOLEAN NOT NULL DEFAULT true,
  email_beta_warnings BOOLEAN NOT NULL DEFAULT true,
  email_support_reply BOOLEAN NOT NULL DEFAULT true,
  email_product_updates BOOLEAN NOT NULL DEFAULT true,
  inapp_all BOOLEAN NOT NULL DEFAULT true,
  digest_frequency TEXT NOT NULL DEFAULT 'realtime',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'open',
  assigned_admin_id TEXT REFERENCES app_users(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'in_app',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  first_response_at TIMESTAMP,
  resolved_at TIMESTAMP,
  closed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON support_tickets(assigned_admin_id, status) WHERE assigned_admin_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS support_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_user_id TEXT REFERENCES app_users(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL,
  body TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_by_user_at TIMESTAMP,
  read_by_admin_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON support_messages(ticket_id, created_at);
CREATE INDEX IF NOT EXISTS idx_support_messages_unread_user ON support_messages(ticket_id, read_by_user_at) WHERE read_by_user_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_support_messages_unread_admin ON support_messages(ticket_id, read_by_admin_at) WHERE read_by_admin_at IS NULL;

CREATE TABLE IF NOT EXISTS support_faq (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  embedding JSONB,
  uses_count INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  unhelpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_faq_category ON support_faq(category);
