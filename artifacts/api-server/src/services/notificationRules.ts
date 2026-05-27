export type NotificationType =
  | "welcome"
  | "beta_welcome"
  | "project_created"
  | "lentille_done"
  | "export_ready"
  | "mandate_signed"
  | "mandate_pending"
  | "support_reply"
  | "beta_expiring_7d"
  | "beta_expiring_1d"
  | "beta_expired"
  | "product_update";

export type NotificationEmailPrefs = {
  emailMandateEvents: boolean;
  emailExportReady: boolean;
  emailLentilleDone: boolean;
  emailBetaWarnings: boolean;
  emailSupportReply: boolean;
  emailProductUpdates: boolean;
};

export function shouldSendEmail(type: NotificationType, prefs: NotificationEmailPrefs | undefined): boolean {
  if (type === "welcome" || type === "beta_welcome") return true;
  if (!prefs) return true;
  if (type === "mandate_signed" || type === "mandate_pending") return prefs.emailMandateEvents;
  if (type === "export_ready") return prefs.emailExportReady;
  if (type === "lentille_done") return prefs.emailLentilleDone;
  if (type.startsWith("beta_expiring") || type === "beta_expired") return prefs.emailBetaWarnings;
  if (type === "support_reply") return prefs.emailSupportReply;
  if (type === "product_update") return prefs.emailProductUpdates;
  return false;
}
