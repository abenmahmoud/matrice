import { logger } from "../lib/logger.js";

export type MandateSigner = {
  name: string;
  email: string;
  role: string;
  signOrder: number;
};

export type CreateMandateEnvelopeInput = {
  mandateId: string;
  projectId: string;
  documentName: string;
  pdfBuffer: Buffer;
  signers: MandateSigner[];
  webhookUrl: string;
  webhookSecret: string;
  expiresInDays: number;
  metadata?: Record<string, unknown>;
};

export type CreateMandateEnvelopeResult = {
  envelopeId: string;
  signersLinks: Record<string, string>;
  pdfOriginalHash: string;
};

export class EssufSignNotConfiguredError extends Error {
  constructor() {
    super("ESSUF_SIGN_NOT_CONFIGURED");
    this.name = "EssufSignNotConfiguredError";
  }
}

export async function createMandateEnvelope(input: CreateMandateEnvelopeInput): Promise<CreateMandateEnvelopeResult> {
  const apiKey = process.env["ESSUF_SIGN_API_KEY"];
  const baseUrl = (process.env["ESSUF_SIGN_BASE_URL"] ?? "https://sign.essuf.fr").replace(/\/$/, "");

  if (!apiKey || !input.webhookSecret) {
    throw new EssufSignNotConfiguredError();
  }

  const response = await fetch(`${baseUrl}/api/sign/envelopes`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      document_name: input.documentName,
      document_type: "matrice_mandate",
      source_app: "matrice",
      source_reference: input.mandateId,
      pdf_base64: input.pdfBuffer.toString("base64"),
      signers: input.signers.map((signer) => ({
        name: signer.name,
        email: signer.email,
        role: signer.role,
        sign_order: signer.signOrder,
      })),
      callback_url: input.webhookUrl,
      callback_secret: input.webhookSecret,
      language: "fr",
      expires_in_days: input.expiresInDays,
      metadata: {
        mandate_id: input.mandateId,
        project_id: input.projectId,
        ...input.metadata,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    logger.error({ status: response.status, body }, "Essuf-Sign envelope creation failed");
    throw new Error(`ESSUF_SIGN_ERROR_${response.status}`);
  }

  const payload = await response.json() as {
    envelope_id?: string;
    signers_links?: Record<string, string>;
    pdf_original_hash?: string;
  };

  if (!payload.envelope_id || !payload.signers_links || !payload.pdf_original_hash) {
    logger.error({ payload }, "Essuf-Sign response missing expected fields");
    throw new Error("ESSUF_SIGN_INVALID_RESPONSE");
  }

  return {
    envelopeId: payload.envelope_id,
    signersLinks: payload.signers_links,
    pdfOriginalHash: payload.pdf_original_hash,
  };
}
