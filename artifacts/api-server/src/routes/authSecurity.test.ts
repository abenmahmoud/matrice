import assert from "node:assert/strict";
import test from "node:test";
import { validatePasswordPolicy } from "../services/passwordPolicy.js";

test("validatePasswordPolicy requires at least 10 characters", () => {
  assert.deepEqual(validatePasswordPolicy("short"), { ok: false, error: "PASSWORD_TOO_SHORT" });
});

test("validatePasswordPolicy rejects common passwords", () => {
  assert.deepEqual(validatePasswordPolicy("motdepasse"), { ok: false, error: "PASSWORD_TOO_COMMON" });
  assert.deepEqual(validatePasswordPolicy("1234567890"), { ok: false, error: "PASSWORD_TOO_COMMON" });
});

test("validatePasswordPolicy accepts a longer unique password", () => {
  assert.deepEqual(validatePasswordPolicy("Roman-bleu-2026!"), { ok: true });
});
