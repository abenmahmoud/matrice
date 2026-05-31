import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env["E2E_PORT"] ?? 4317);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 7_500 },
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    viewport: { width: 1440, height: 950 },
  },
  webServer: {
    command: "corepack pnpm --filter @workspace/matrice-narrative run dev",
    url: baseURL,
    reuseExistingServer: !process.env["CI"],
    timeout: 120_000,
    env: {
      PORT: String(port),
      BASE_PATH: "/",
      NODE_ENV: "test",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
