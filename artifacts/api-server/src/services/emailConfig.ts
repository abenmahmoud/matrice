import { logger } from "../lib/logger.js";

const DEFAULT_PUBLIC_BASE_URL = "https://matrice.essuf.fr";
const DEFAULT_EMAIL_FROM = "Matrice <no-reply@essuf.fr>";

export class EmailConfigInvalidError extends Error {
  readonly code = "EMAIL_CONFIG_INVALID";

  constructor(message: string) {
    super(message);
    this.name = "EmailConfigInvalidError";
  }
}

export interface EmailRuntimeConfig {
  baseUrl: string;
  from: string;
  fromIdentity: {
    email: string;
    name: string;
  };
}

function hasEnv(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(process.env, name);
}

function rawBaseUrl(): string {
  if (hasEnv("MATRICE_PUBLIC_BASE_URL")) return process.env["MATRICE_PUBLIC_BASE_URL"] ?? "";
  if (hasEnv("MATRICE_BASE_URL")) return process.env["MATRICE_BASE_URL"] ?? "";
  return DEFAULT_PUBLIC_BASE_URL;
}

function rawFromAddress(): string {
  if (hasEnv("MATRICE_EMAIL_FROM")) return process.env["MATRICE_EMAIL_FROM"] ?? "";
  if (hasEnv("MATRICE_FROM_EMAIL")) {
    const name = process.env["MATRICE_FROM_NAME"]?.trim() || "Matrice";
    return `${name} <${process.env["MATRICE_FROM_EMAIL"] ?? ""}>`;
  }
  return DEFAULT_EMAIL_FROM;
}

function parseBaseUrl(value: string): string | null {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (!url.hostname) return null;
    if (!url.hostname.includes(".") && url.hostname !== "localhost") return null;
    return trimmed;
  } catch {
    return null;
  }
}

function parseFrom(value: string): { email: string; name: string; formatted: string } | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const bracketMatch = trimmed.match(/^(.*?)\s*<([^<>]+)>$/);
  const rawName = bracketMatch ? (bracketMatch[1] ?? "").trim() : "";
  const email = (bracketMatch ? bracketMatch[2] : trimmed)?.trim() ?? "";
  const emailMatch = email.match(/^[^\s@<>]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/);
  if (!emailMatch) return null;

  const name = rawName || process.env["MATRICE_FROM_NAME"]?.trim() || "Matrice";
  return {
    email,
    name,
    formatted: bracketMatch ? `${name} <${email}>` : email,
  };
}

export function getEmailRuntimeConfig(): EmailRuntimeConfig {
  const baseRaw = rawBaseUrl();
  const fromRaw = rawFromAddress();
  const baseUrl = parseBaseUrl(baseRaw);
  const from = parseFrom(fromRaw);

  if (!baseUrl || !from) {
    logger.error({ base_url: baseRaw || "<empty>", from: fromRaw || "<empty>" }, "EMAIL_CONFIG_INVALID");
    throw new EmailConfigInvalidError(
      `EMAIL_CONFIG_INVALID base_url=${baseRaw || "<empty>"} from=${fromRaw || "<empty>"}`,
    );
  }

  return {
    baseUrl,
    from: from.formatted,
    fromIdentity: {
      email: from.email,
      name: from.name,
    },
  };
}

export function emailPublicBaseUrl(): string {
  return getEmailRuntimeConfig().baseUrl;
}
