import assert from "node:assert/strict";
import { test } from "node:test";
import { BETA_CODE_PATTERN, generateBetaInviteCode, validateInviteCodeState } from "./betaInviteService.js";
import type { BetaInviteCode } from "@workspace/db";

function betaCode(overrides: Partial<BetaInviteCode> = {}): BetaInviteCode {
  return {
    code: "MATRICE-BETA-ABC234",
    planGranted: "premium",
    durationMonths: 3,
    maxUses: 1,
    usesCount: 0,
    expiresAt: null,
    createdBy: null,
    notes: null,
    createdAt: new Date("2026-05-27T10:00:00Z"),
    ...overrides,
  };
}

test("generateBetaInviteCode emits safe beta codes", () => {
  const randomValues = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
  let index = 0;
  const code = generateBetaInviteCode(() => randomValues[index++] ?? 0);
  const suffix = code.replace("MATRICE-BETA-", "");

  assert.match(code, BETA_CODE_PATTERN);
  assert.equal(code.startsWith("MATRICE-BETA-"), true);
  assert.equal(/[IO01]/.test(suffix), false);
});

test("validateInviteCodeState rejects unavailable codes", () => {
  const now = new Date("2026-05-27T10:00:00Z");

  assert.deepEqual(validateInviteCodeState(undefined, now), { ok: false, status: 400, error: "INVALID_INVITE_CODE" });
  assert.deepEqual(validateInviteCodeState(betaCode({ usesCount: 1, maxUses: 1 }), now), { ok: false, status: 409, error: "INVITE_CODE_EXHAUSTED" });
  assert.deepEqual(validateInviteCodeState(betaCode({ expiresAt: new Date("2026-05-26T10:00:00Z") }), now), { ok: false, status: 410, error: "INVITE_CODE_EXPIRED" });
  assert.deepEqual(validateInviteCodeState(betaCode({ expiresAt: new Date("2026-05-28T10:00:00Z") }), now), { ok: true });
});
