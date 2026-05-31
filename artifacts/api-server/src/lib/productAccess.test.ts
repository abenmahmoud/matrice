import assert from "node:assert/strict";
import test from "node:test";

process.env["DATABASE_URL"] ??= "postgres://matrice:matrice@localhost:5432/matrice_test";

const { getProductAccess } = await import("./productAccess.js");

function reqWithUser(role: "user" | "admin" | "owner", plan = "free") {
  return {
    headers: {},
    authUser: {
      id: `${role}-id`,
      email: `${role}@matrice.test`,
      displayName: role,
      role,
      plan,
      status: "active",
      generationsUsed: 0,
      projectsCreated: 3,
      isEmailVerified: true,
      creatorModeEnabled: false,
      isBetaTester: false,
      betaStartedAt: null,
      betaExpiresAt: null,
      onboardingStep: "done",
      onboardingCompletedAt: null,
    },
  } as never;
}

test("getProductAccess lets admin accounts generate without free-plan limits", () => {
  const previousMode = process.env["MATRICE_PRODUCT_MODE"];
  process.env["MATRICE_PRODUCT_MODE"] = "commercial";

  try {
    const access = getProductAccess(reqWithUser("admin", "free"));

    assert.equal(access.viewer.role, "user");
    assert.equal(access.viewer.source, "user-token");
    assert.equal(access.isPaid, true);
    assert.equal(access.plan, "free");
  } finally {
    if (previousMode === undefined) {
      delete process.env["MATRICE_PRODUCT_MODE"];
    } else {
      process.env["MATRICE_PRODUCT_MODE"] = previousMode;
    }
  }
});

test("getProductAccess still keeps ordinary free users behind free limits", () => {
  const previousMode = process.env["MATRICE_PRODUCT_MODE"];
  process.env["MATRICE_PRODUCT_MODE"] = "commercial";

  try {
    const access = getProductAccess(reqWithUser("user", "free"));

    assert.equal(access.viewer.role, "user");
    assert.equal(access.isPaid, false);
    assert.equal(access.limits.freeProjectLimit, 1);
  } finally {
    if (previousMode === undefined) {
      delete process.env["MATRICE_PRODUCT_MODE"];
    } else {
      process.env["MATRICE_PRODUCT_MODE"] = previousMode;
    }
  }
});
