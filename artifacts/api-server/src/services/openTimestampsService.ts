type OtsStatus = "pending" | "confirmed";

type VerifyResult = {
  bitcoin?: {
    timestamp?: number;
    height?: number;
  };
};

type OtsOptions = {
  calendars?: string[];
  m?: number;
  ignoreBitcoinNode?: boolean;
  esplora?: {
    url?: string;
    timeout?: number;
  };
};

type OpenTimestampsApi = {
  DetachedTimestampFile: {
    fromHash(hashOp: unknown, hash: Uint8Array | number[]): unknown;
    deserialize(bytes: Uint8Array | Buffer | ArrayBuffer | number[]): unknown;
  };
  Ops: {
    OpSHA256: new () => unknown;
  };
  stamp(detached: unknown, options?: OtsOptions): Promise<void>;
  upgrade(detached: unknown, options?: OtsOptions): Promise<boolean>;
  verify(detachedStamped: unknown, detachedOriginal: unknown, options?: OtsOptions): Promise<VerifyResult>;
  info(detached: unknown, options?: { verbose?: boolean }): string;
};

export type StampHashResult = {
  ots: string;
  status: OtsStatus;
};

export type UpgradeProofResult = {
  ots: string;
  status: OtsStatus;
  blockchain?: "bitcoin";
  blockchainTx?: string;
  blockHeight?: number;
  confirmedAt?: Date;
};

let defaultOpenTimestampsApi: OpenTimestampsApi | undefined;
let activeOpenTimestamps: OpenTimestampsApi | undefined;

const DEFAULT_CALENDARS = [
  "https://a.pool.opentimestamps.org",
  "https://b.pool.opentimestamps.org",
];

function getCalendars(): string[] {
  return (process.env["OTS_CALENDARS"] ?? "")
    .split(",")
    .map((calendar) => calendar.trim())
    .filter(Boolean)
    .concat(DEFAULT_CALENDARS)
    .filter((calendar, index, all) => all.indexOf(calendar) === index);
}

function otsOptions(): OtsOptions {
  return {
    calendars: getCalendars(),
    m: 1,
    ignoreBitcoinNode: true,
    esplora: {
      url: process.env["OTS_ESPLORA_URL"] || "https://blockstream.info/api",
      timeout: Number(process.env["OTS_ESPLORA_TIMEOUT_MS"] ?? 5000),
    },
  };
}

export async function stampHash(sha256Hex: string): Promise<StampHashResult> {
  const openTimestamps = await getOpenTimestamps();
  const detached = detachedFromHash(openTimestamps, sha256Hex);
  await openTimestamps.stamp(detached, otsOptions());

  return {
    ots: serializeDetached(detached),
    status: isTimestampComplete(detached) ? "confirmed" : "pending",
  };
}

export async function upgradeProof(otsBase64: string): Promise<UpgradeProofResult> {
  const openTimestamps = await getOpenTimestamps();
  const detached = deserializeDetached(openTimestamps, otsBase64);
  await openTimestamps.upgrade(detached, otsOptions());

  const status: OtsStatus = isTimestampComplete(detached) ? "confirmed" : "pending";
  const result: UpgradeProofResult = {
    ots: serializeDetached(detached),
    status,
  };

  if (status !== "confirmed") {
    return result;
  }

  const original = detachedFromDigest(openTimestamps, readDigest(detached));
  const verified = await openTimestamps.verify(detached, original, otsOptions());
  const bitcoin = verified.bitcoin;
  if (!bitcoin?.height) {
    return result;
  }

  result.blockchain = "bitcoin";
  result.blockHeight = bitcoin.height;
  result.confirmedAt = bitcoin.timestamp ? new Date(bitcoin.timestamp * 1000) : undefined;
  result.blockchainTx = extractBitcoinTransactionId(openTimestamps, detached);
  return result;
}

export async function verifyProof(otsBase64: string, sha256Hex: string): Promise<boolean> {
  const openTimestamps = await getOpenTimestamps();
  const detachedStamped = deserializeDetached(openTimestamps, otsBase64);
  const detachedOriginal = detachedFromHash(openTimestamps, sha256Hex);
  const verified = await openTimestamps.verify(detachedStamped, detachedOriginal, otsOptions());
  return Boolean(verified.bitcoin?.height);
}

export function configureOpenTimestampsForTests(api?: OpenTimestampsApi): void {
  activeOpenTimestamps = api;
}

async function getOpenTimestamps(): Promise<OpenTimestampsApi> {
  if (activeOpenTimestamps) {
    return activeOpenTimestamps;
  }

  if (!defaultOpenTimestampsApi) {
    const imported = await import("javascript-opentimestamps");
    defaultOpenTimestampsApi = ((imported as { default?: unknown }).default ?? imported) as OpenTimestampsApi;
  }

  return defaultOpenTimestampsApi;
}

function detachedFromHash(openTimestamps: OpenTimestampsApi, sha256Hex: string): unknown {
  assertSha256Hex(sha256Hex);
  return detachedFromDigest(openTimestamps, Buffer.from(sha256Hex, "hex"));
}

function detachedFromDigest(openTimestamps: OpenTimestampsApi, digest: Uint8Array | number[]): unknown {
  return openTimestamps.DetachedTimestampFile.fromHash(new openTimestamps.Ops.OpSHA256(), digest);
}

function deserializeDetached(openTimestamps: OpenTimestampsApi, otsBase64: string): unknown {
  if (!otsBase64 || typeof otsBase64 !== "string") {
    throw new Error("Preuve OpenTimestamps manquante");
  }
  return openTimestamps.DetachedTimestampFile.deserialize(Buffer.from(otsBase64, "base64"));
}

function serializeDetached(detached: unknown): string {
  const serializable = detached as { serializeToBytes(): Uint8Array | number[] };
  return Buffer.from(serializable.serializeToBytes()).toString("base64");
}

function readDigest(detached: unknown): Uint8Array {
  const readable = detached as { fileDigest(): Uint8Array | number[] };
  return Uint8Array.from(readable.fileDigest());
}

function isTimestampComplete(detached: unknown): boolean {
  const timestamped = detached as { timestamp?: { isTimestampComplete(): boolean } };
  return Boolean(timestamped.timestamp?.isTimestampComplete());
}

function extractBitcoinTransactionId(openTimestamps: OpenTimestampsApi, detached: unknown): string | undefined {
  const info = openTimestamps.info(detached, { verbose: true });
  return info.match(/Bitcoin transaction id\s+([a-f0-9]{64})/i)?.[1];
}

function assertSha256Hex(value: string): void {
  if (!/^[a-f0-9]{64}$/i.test(value)) {
    throw new Error("Empreinte SHA-256 invalide");
  }
}
