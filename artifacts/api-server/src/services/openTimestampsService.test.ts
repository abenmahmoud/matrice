import test from "node:test";
import assert from "node:assert/strict";
import {
  configureOpenTimestampsForTests,
  stampHash,
  upgradeProof,
  verifyProof,
} from "./openTimestampsService.js";

type FakeDetached = {
  digest: Uint8Array;
  timestamp: { isTimestampComplete(): boolean };
  serializeToBytes(): Uint8Array;
  fileDigest(): Uint8Array;
};

const VALID_HASH = "05c4f616a8e5310d19d938cfd769864d7f4ccdc2ca8b479b10af83564b097af9";
const TX_ID = "a".repeat(64);

test.afterEach(() => {
  configureOpenTimestampsForTests();
});

test("stampHash cree une preuve OTS en base64", async () => {
  const api = fakeOpenTimestamps({ complete: false });
  configureOpenTimestampsForTests(api);

  const result = await stampHash(VALID_HASH);

  assert.equal(result.status, "pending");
  assert.equal(result.ots, Buffer.from([1, 2, 3, 4]).toString("base64"));
  assert.equal(api.calls.stamp, 1);
});

test("upgradeProof detecte une confirmation Bitcoin", async () => {
  const api = fakeOpenTimestamps({ complete: true });
  configureOpenTimestampsForTests(api);

  const result = await upgradeProof(Buffer.from([1, 2, 3, 4]).toString("base64"));

  assert.equal(result.status, "confirmed");
  assert.equal(result.blockchain, "bitcoin");
  assert.equal(result.blockHeight, 850000);
  assert.equal(result.confirmedAt?.toISOString(), "2024-03-09T16:00:00.000Z");
  assert.equal(result.blockchainTx, TX_ID);
});

test("verifyProof refuse les empreintes invalides et accepte une preuve confirmee", async () => {
  const api = fakeOpenTimestamps({ complete: true });
  configureOpenTimestampsForTests(api);

  await assert.rejects(() => verifyProof("AQIDBA==", "hash-invalide"), /Empreinte SHA-256 invalide/);
  await assert.doesNotReject(() => verifyProof("AQIDBA==", VALID_HASH));
  assert.equal(await verifyProof("AQIDBA==", VALID_HASH), true);
});

function fakeOpenTimestamps(options: { complete: boolean }) {
  const calls = { stamp: 0, upgrade: 0, verify: 0 };
  const detached = createDetached(options.complete);

  return {
    calls,
    DetachedTimestampFile: {
      fromHash: (_hashOp: unknown, hash: Uint8Array | number[]) => createDetached(options.complete, hash),
      deserialize: () => detached,
    },
    Ops: {
      OpSHA256: class {},
    },
    stamp: async () => {
      calls.stamp += 1;
    },
    upgrade: async () => {
      calls.upgrade += 1;
      return true;
    },
    verify: async () => {
      calls.verify += 1;
      return { bitcoin: { timestamp: 1710000000, height: 850000 } };
    },
    info: () => `# Bitcoin transaction id ${TX_ID}`,
  };
}

function createDetached(complete: boolean, digest: Uint8Array | number[] = Buffer.from(VALID_HASH, "hex")): FakeDetached {
  return {
    digest: Uint8Array.from(digest),
    timestamp: {
      isTimestampComplete: () => complete,
    },
    serializeToBytes: () => Uint8Array.from([1, 2, 3, 4]),
    fileDigest() {
      return this.digest;
    },
  };
}
