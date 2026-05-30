import assert from "node:assert/strict";
import test from "node:test";
import { shouldSendEmail } from "./notificationRules.js";

const allEnabled = {
  emailMandateEvents: true,
  emailExportReady: true,
  emailLentilleDone: true,
  emailBetaWarnings: true,
  emailSupportReply: true,
  emailProductUpdates: true,
};

test("shouldSendEmail enables transactional messages by default", () => {
  assert.equal(shouldSendEmail("welcome", undefined), true);
  assert.equal(shouldSendEmail("support_reply", undefined), true);
  assert.equal(shouldSendEmail("export_ready", undefined), true);
});

test("shouldSendEmail respects disabled user preferences", () => {
  assert.equal(shouldSendEmail("support_reply", { ...allEnabled, emailSupportReply: false }), false);
  assert.equal(shouldSendEmail("export_ready", { ...allEnabled, emailExportReady: false }), false);
  assert.equal(shouldSendEmail("lentille_done", { ...allEnabled, emailLentilleDone: false }), false);
});

test("shouldSendEmail always sends welcome emails", () => {
  const disabled = {
    emailMandateEvents: false,
    emailExportReady: false,
    emailLentilleDone: false,
    emailBetaWarnings: false,
    emailSupportReply: false,
    emailProductUpdates: false,
  };
  assert.equal(shouldSendEmail("welcome", disabled), true);
  assert.equal(shouldSendEmail("beta_welcome", disabled), true);
});
