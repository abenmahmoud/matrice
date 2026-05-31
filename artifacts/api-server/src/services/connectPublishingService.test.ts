import assert from "node:assert/strict";
import test from "node:test";

test("computeApplicationFeeCents applies a native 10 percent platform fee", async () => {
  process.env["DATABASE_URL"] ??= "postgres://test:test@localhost:5432/test";
  const { computeApplicationFeeCents } = await import("./connectPublishingService.js");
  assert.equal(computeApplicationFeeCents(1000), 100);
  assert.equal(computeApplicationFeeCents(999), 100);
});

test("assertConnectModeAllowed blocks live mode unless feature flag is enabled", async () => {
  process.env["DATABASE_URL"] ??= "postgres://test:test@localhost:5432/test";
  const { assertConnectModeAllowed } = await import("./connectPublishingService.js");
  const oldKey = process.env["STRIPE_SECRET_KEY"];
  const oldFlag = process.env["MATRICE_CONNECT_LIVE"];
  process.env["STRIPE_SECRET_KEY"] = "sk_live_test";
  process.env["MATRICE_CONNECT_LIVE"] = "false";
  assert.throws(() => assertConnectModeAllowed(), /CONNECT_LIVE_DISABLED/);
  process.env["MATRICE_CONNECT_LIVE"] = "true";
  assert.doesNotThrow(() => assertConnectModeAllowed());
  if (oldKey === undefined) delete process.env["STRIPE_SECRET_KEY"]; else process.env["STRIPE_SECRET_KEY"] = oldKey;
  if (oldFlag === undefined) delete process.env["MATRICE_CONNECT_LIVE"]; else process.env["MATRICE_CONNECT_LIVE"] = oldFlag;
});
