import assert from "node:assert/strict";
import test from "node:test";
import { logger } from "../lib/logger.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "./emailService.js";

const originalFetch = globalThis.fetch;
const originalEnv = {
  RESEND_API_KEY: process.env["RESEND_API_KEY"],
  EMAIL_PROVIDER: process.env["EMAIL_PROVIDER"],
  BREVO_API_KEY: process.env["BREVO_API_KEY"],
  MATRICE_EMAIL_FROM: process.env["MATRICE_EMAIL_FROM"],
  MATRICE_FROM_EMAIL: process.env["MATRICE_FROM_EMAIL"],
  MATRICE_FROM_NAME: process.env["MATRICE_FROM_NAME"],
};

function restoreEnv() {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  globalThis.fetch = originalFetch;
}

test.afterEach(restoreEnv);

test("sendVerificationEmail uses MATRICE_EMAIL_FROM and attempts Resend delivery", async () => {
  process.env["RESEND_API_KEY"] = "re_test_key";
  process.env["EMAIL_PROVIDER"] = "resend";
  process.env["BREVO_API_KEY"] = "";
  process.env["MATRICE_EMAIL_FROM"] = "Matrice <no-reply@matrice.essuf.fr>";
  delete process.env["MATRICE_FROM_EMAIL"];

  let requestBody: Record<string, unknown> | null = null;
  globalThis.fetch = (async (_url, init) => {
    requestBody = JSON.parse(String(init?.body));
    return Response.json({ id: "email_123" });
  }) as typeof fetch;

  const delivery = await sendVerificationEmail({
    to: "invite@example.com",
    displayName: "Invite",
    token: "verify-token",
  });

  assert.equal(delivery.status, "sent");
  assert.equal(requestBody?.["from"], "Matrice <no-reply@matrice.essuf.fr>");
  assert.equal(requestBody?.["to"], "invite@example.com");
  assert.equal(String(requestBody?.["html"]).includes("verify-token"), true);
});

test("sendPasswordResetEmail returns a failed delivery and logs EMAIL_FAILED", async () => {
  process.env["RESEND_API_KEY"] = "re_test_key";
  process.env["EMAIL_PROVIDER"] = "resend";
  process.env["BREVO_API_KEY"] = "";
  process.env["MATRICE_EMAIL_FROM"] = "Matrice <no-reply@matrice.essuf.fr>";

  const warnCalls: Array<{ object: unknown; message?: string }> = [];
  const originalWarn = logger.warn.bind(logger);
  logger.warn = ((object: unknown, message?: string) => {
    warnCalls.push({ object, message });
  }) as typeof logger.warn;

  globalThis.fetch = (async () => Response.json({ message: "Domain not verified" }, { status: 403 })) as typeof fetch;

  try {
    const delivery = await sendPasswordResetEmail({
      to: "reader@example.com",
      displayName: "Reader",
      token: "reset-token",
    });

    assert.equal(delivery.status, "failed");
    assert.equal(delivery.message, "Domain not verified");
    assert.equal(warnCalls.some((call) => call.message === "EMAIL_FAILED"), true);
  } finally {
    logger.warn = originalWarn as typeof logger.warn;
  }
});

test("sendVerificationEmail reports skipped when RESEND_API_KEY is missing", async () => {
  delete process.env["RESEND_API_KEY"];
  process.env["EMAIL_PROVIDER"] = "resend";
  process.env["BREVO_API_KEY"] = "";

  const delivery = await sendVerificationEmail({
    to: "invite@example.com",
    displayName: "Invite",
    token: "verify-token",
  });

  assert.equal(delivery.status, "skipped");
  assert.equal(delivery.reason, "missing-api-key");
});
