import assert from "node:assert/strict";
import test from "node:test";
import { computeOnboardingProgress, ONBOARDING_STEPS } from "./onboardingProgress.js";

test("computeOnboardingProgress starts at welcome for a new user", () => {
  const progress = computeOnboardingProgress([]);

  assert.equal(progress.current_step?.id, "welcome");
  assert.equal(progress.progress_percent, 0);
  assert.equal(progress.required_completed, false);
});

test("computeOnboardingProgress reaches 100 when required steps are done", () => {
  const progress = computeOnboardingProgress([
    { stepId: "welcome", status: "completed" },
    { stepId: "first_project", status: "completed" },
  ]);

  assert.equal(progress.required_completed, true);
  assert.equal(progress.progress_percent, 100);
});

test("computeOnboardingProgress excludes skipped optional steps from next action", () => {
  const progress = computeOnboardingProgress([
    { stepId: "welcome", status: "completed" },
    { stepId: "profile_complete", status: "skipped" },
  ]);

  assert.equal(progress.current_step?.id, "first_project");
  assert.equal(progress.skipped_steps.includes("profile_complete"), true);
  assert.equal(ONBOARDING_STEPS.some((step) => step.id === "notification_preferences"), true);
});
