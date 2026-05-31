import { logger } from "../lib/logger.js";
import { getEmailRuntimeConfig } from "./emailConfig.js";

type EmailDelivery =
  | { status: "skipped"; provider: "resend" | "brevo"; reason: "missing-api-key" }
  | { status: "sent"; provider: "resend" | "brevo"; id: string | null }
  | { status: "failed"; provider: "resend" | "brevo"; message: string };

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

async function sendEmail(input: SendEmailInput): Promise<EmailDelivery> {
  const emailConfig = getEmailRuntimeConfig();
  const provider = process.env["EMAIL_PROVIDER"]?.trim().toLowerCase()
    || (process.env["BREVO_API_KEY"] ? "brevo" : "resend");
  if (provider === "brevo") {
    return logDelivery(input, await sendBrevoEmail(input, emailConfig), emailConfig);
  }

  const resendDelivery = await sendResendEmail(input, emailConfig);
  if (resendDelivery.status === "failed" && process.env["BREVO_API_KEY"]) {
    logger.warn({
      provider: "resend",
      to: input.to,
      subject: input.subject,
      from: emailConfig.from,
      baseUrl: emailConfig.baseUrl,
      reason: resendDelivery.message,
    }, "EMAIL_FAILED fallback_to_brevo");
    return logDelivery(input, await sendBrevoEmail(input, emailConfig), emailConfig);
  }

  return logDelivery(input, resendDelivery, emailConfig);
}

function logDelivery(input: SendEmailInput, delivery: EmailDelivery, emailConfig: ReturnType<typeof getEmailRuntimeConfig>): EmailDelivery {
  if (delivery.status === "sent") {
    logger.info({
      provider: delivery.provider,
      to: input.to,
      subject: input.subject,
      from: emailConfig.from,
      baseUrl: emailConfig.baseUrl,
      id: delivery.id,
    }, "EMAIL_SENT ok");
    return delivery;
  }
  const reason = delivery.status === "skipped" ? delivery.reason : delivery.message;
  logger.warn({
    provider: delivery.provider,
    to: input.to,
    subject: input.subject,
    from: emailConfig.from,
    baseUrl: emailConfig.baseUrl,
    reason,
  }, "EMAIL_FAILED");
  return delivery;
}

async function sendResendEmail(input: SendEmailInput, emailConfig: ReturnType<typeof getEmailRuntimeConfig>): Promise<EmailDelivery> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    return { status: "skipped", provider: "resend", reason: "missing-api-key" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailConfig.from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;
    if (!response.ok) {
      return { status: "failed", provider: "resend", message: payload?.message ?? `Resend HTTP ${response.status}` };
    }

    return { status: "sent", provider: "resend", id: payload?.id ?? null };
  } catch (err) {
    return { status: "failed", provider: "resend", message: err instanceof Error ? err.message : "Unknown email error" };
  }
}

async function sendBrevoEmail(input: SendEmailInput, emailConfig: ReturnType<typeof getEmailRuntimeConfig>): Promise<EmailDelivery> {
  const apiKey = process.env["BREVO_API_KEY"];
  if (!apiKey) {
    return { status: "skipped", provider: "brevo", reason: "missing-api-key" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: emailConfig.fromIdentity,
        to: [{ email: input.to }],
        subject: input.subject,
        htmlContent: input.html,
        textContent: input.text,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { messageId?: string; message?: string; code?: string } | null;
    if (!response.ok) {
      return {
        status: "failed",
        provider: "brevo",
        message: payload?.message ?? payload?.code ?? `Brevo HTTP ${response.status}`,
      };
    }

    return { status: "sent", provider: "brevo", id: payload?.messageId ?? null };
  } catch (err) {
    return { status: "failed", provider: "brevo", message: err instanceof Error ? err.message : "Unknown email error" };
  }
}

function verifyUrl(token: string): string {
  return `${getEmailRuntimeConfig().baseUrl}/verify-email?token=${encodeURIComponent(token)}`;
}

function resetUrl(token: string): string {
  return `${getEmailRuntimeConfig().baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendVerificationEmail(input: {
  to: string;
  displayName: string;
  token: string;
}): Promise<EmailDelivery> {
  const url = verifyUrl(input.token);
  const name = input.displayName || "createur";
  const htmlName = escapeHtml(name);

  return sendEmail({
    to: input.to,
    subject: "Confirme ton acces Matrice Narrative",
    text: [
      `Bonjour ${name},`,
      "",
      "Confirme ton email pour activer ton compte Matrice Narrative :",
      url,
      "",
      "Si tu n'as pas cree de compte, ignore cet email.",
    ].join("\n"),
    html: `
      <div style="font-family:Inter,Arial,sans-serif;background:#09090e;color:#f8fafc;padding:32px">
        <div style="max-width:560px;margin:0 auto;background:#10101a;border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:28px">
          <p style="color:#c4b5fd;font-size:12px;letter-spacing:.16em;text-transform:uppercase;margin:0 0 18px">Matrice Narrative</p>
          <h1 style="font-size:26px;line-height:1.2;margin:0 0 16px">Confirme ton email</h1>
          <p style="color:#cbd5e1;font-size:15px;line-height:1.7;margin:0 0 22px">Bonjour ${htmlName}, ton compte est presque pret. Confirme ton email pour activer l'acces a ton espace createur.</p>
          <a href="${url}" style="display:inline-block;background:#8b5cf6;color:#fff;text-decoration:none;border-radius:999px;padding:13px 20px;font-weight:700">Confirmer mon email</a>
          <p style="color:#94a3b8;font-size:13px;line-height:1.7;margin:24px 0 0">Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :<br><span style="word-break:break-all;color:#ddd6fe">${url}</span></p>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(input: {
  to: string;
  displayName: string;
  token: string;
}): Promise<EmailDelivery> {
  const url = resetUrl(input.token);
  const name = input.displayName || "createur";
  const htmlName = escapeHtml(name);

  return sendEmail({
    to: input.to,
    subject: "Reinitialise ton mot de passe Matrice Narrative",
    text: [
      `Bonjour ${name},`,
      "",
      "Tu peux reinitialiser ton mot de passe avec ce lien valable 1 heure :",
      url,
      "",
      "Si tu n'as pas demande cette action, ignore cet email.",
    ].join("\n"),
    html: `
      <div style="font-family:Inter,Arial,sans-serif;background:#09090e;color:#f8fafc;padding:32px">
        <div style="max-width:560px;margin:0 auto;background:#10101a;border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:28px">
          <p style="color:#c4b5fd;font-size:12px;letter-spacing:.16em;text-transform:uppercase;margin:0 0 18px">Matrice Narrative</p>
          <h1 style="font-size:26px;line-height:1.2;margin:0 0 16px">Reinitialise ton mot de passe</h1>
          <p style="color:#cbd5e1;font-size:15px;line-height:1.7;margin:0 0 22px">Bonjour ${htmlName}, ce lien est valable 1 heure.</p>
          <a href="${url}" style="display:inline-block;background:#8b5cf6;color:#fff;text-decoration:none;border-radius:999px;padding:13px 20px;font-weight:700">Choisir un nouveau mot de passe</a>
          <p style="color:#94a3b8;font-size:13px;line-height:1.7;margin:24px 0 0">Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :<br><span style="word-break:break-all;color:#ddd6fe">${url}</span></p>
        </div>
      </div>
    `,
  });
}
