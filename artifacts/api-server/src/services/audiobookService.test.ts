import assert from "node:assert/strict";
import test from "node:test";

test("resolveAudioEngine falls back to mock when Chatterbox is absent", async () => {
  process.env["DATABASE_URL"] ??= "postgres://test:test@localhost:5432/test";
  const { resolveAudioEngine } = await import("./audiobookService.js");
  const oldEnabled = process.env["MATRICE_AUDIOBOOK_ENABLED"];
  const oldUrl = process.env["CHATTERBOX_API_URL"];
  delete process.env["CHATTERBOX_API_URL"];
  process.env["MATRICE_AUDIOBOOK_ENABLED"] = "true";
  assert.equal(resolveAudioEngine(), "mock");
  if (oldEnabled === undefined) delete process.env["MATRICE_AUDIOBOOK_ENABLED"]; else process.env["MATRICE_AUDIOBOOK_ENABLED"] = oldEnabled;
  if (oldUrl === undefined) delete process.env["CHATTERBOX_API_URL"]; else process.env["CHATTERBOX_API_URL"] = oldUrl;
});
