import type { BetaInviteCode } from "@workspace/db";

const SAFE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const BETA_CODE_PATTERN = /^MATRICE-BETA-[A-HJ-NP-Z2-9]{6}$/;

export function generateBetaInviteCode(random = Math.random): string {
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += SAFE_CHARS[Math.floor(random() * SAFE_CHARS.length)];
  }
  return `MATRICE-BETA-${suffix}`;
}

export function normalizeInviteCode(value: unknown): string {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

export function validateInviteCodeState(code: BetaInviteCode | undefined, now = new Date()):
  | { ok: true }
  | { ok: false; status: 400 | 409 | 410; error: string } {
  if (!code) return { ok: false, status: 400, error: "INVALID_INVITE_CODE" };
  if (code.usesCount >= code.maxUses) return { ok: false, status: 409, error: "INVITE_CODE_EXHAUSTED" };
  if (code.expiresAt && code.expiresAt <= now) return { ok: false, status: 410, error: "INVITE_CODE_EXPIRED" };
  return { ok: true };
}
