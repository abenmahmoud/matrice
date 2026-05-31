import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { once } from "node:events";
import test from "node:test";
import express from "express";

import { buildMineSalesPayload, normalizeSettlementStatus } from "./salesMineService.js";

test("GET /api/sales/mine returns 401 without token", async () => {
  process.env["DATABASE_URL"] ??= "postgres://test:test@localhost:5432/test";
  process.env["SESSION_SECRET"] ??= "test-session-secret";
  const [{ authContextMiddleware }, { default: salesRouter }] = await Promise.all([
    import("../lib/auth.js"),
    import("../routes/sales.js"),
  ]);
  const app = express();
  app.use(express.json());
  app.use("/api", authContextMiddleware, salesRouter);
  const server = app.listen(0);
  await once(server, "listening");
  try {
    const address = server.address();
    assert.equal(typeof address, "object");
    assert.ok(address);
    const response = await fetch(`http://127.0.0.1:${(address as AddressInfo).port}/api/sales/mine`);
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: "AUTH_REQUIRED" });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
});

test("buildMineSalesPayload computes 90/10 aggregates and settlement totals", () => {
  const payload = buildMineSalesPayload("author-1", [
    {
      id: "sale-1",
      userId: "author-1",
      projectId: "project-1",
      projectTitle: "Livre A",
      channel: "Amazon KDP",
      saleDate: new Date("2026-05-30T12:00:00Z"),
      grossAmountCents: 1000,
      currency: "EUR",
      settlement: { status: "payout_paid", kycStatus: "complete" },
    },
    {
      id: "sale-2",
      userId: "author-1",
      projectId: "project-2",
      projectTitle: "Livre B",
      channel: "Draft2Digital",
      saleDate: new Date("2026-05-31T12:00:00Z"),
      grossAmountCents: 999,
      currency: "EUR",
      settlement: { status: "paid", kycStatus: "complete" },
    },
  ]);

  assert.equal(payload.entries.length, 2);
  assert.equal(payload.entries[0].author_share, 9);
  assert.equal(payload.entries[0].matrice_share, 1);
  assert.equal(payload.entries[1].author_share, 8.99);
  assert.equal(payload.entries[1].matrice_share, 1);
  assert.equal(payload.totals.gross_amount, 19.99);
  assert.equal(payload.totals.author_share, 17.99);
  assert.equal(payload.totals.matrice_share, 2);
  assert.equal(payload.totals.paid_amount, 9);
  assert.equal(payload.totals.pending_amount, 8.99);
});

test("buildMineSalesPayload never exposes another user's sales", () => {
  const payload = buildMineSalesPayload("author-1", [
    {
      id: "sale-own",
      userId: "author-1",
      projectId: "project-1",
      projectTitle: "Livre A",
      channel: "Amazon KDP",
      saleDate: new Date("2026-05-30T12:00:00Z"),
      grossAmountCents: 500,
      currency: "EUR",
      settlement: null,
    },
    {
      id: "sale-other",
      userId: "author-2",
      projectId: "project-secret",
      projectTitle: "Livre cache",
      channel: "Secret",
      saleDate: new Date("2026-05-31T12:00:00Z"),
      grossAmountCents: 999999,
      currency: "EUR",
      settlement: { status: "payout_paid", kycStatus: "complete" },
    },
  ]);

  assert.deepEqual(payload.entries.map((entry) => entry.id), ["sale-own"]);
  assert.equal(payload.totals.gross_amount, 5);
});

test("normalizeSettlementStatus blocks payouts when KYC is incomplete", () => {
  assert.equal(normalizeSettlementStatus({ status: "payout_paid", kycStatus: "pending" }), "blocked_kyc");
  assert.equal(normalizeSettlementStatus({ status: "paid", kycStatus: "complete" }), "pending");
});
