import { expect, test, type Page, type Route } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PROJECT_ID = "e2e-project";
const SCREENSHOT_DIR = path.join(process.cwd(), "test-results", "route-smoke");
const REPORT_PATH = path.join(process.cwd(), "test-results", "routes-smoke-report.json");
const now = new Date("2026-05-31T12:00:00.000Z").toISOString();

type SmokeRoute = {
  name: string;
  path: string;
  expectedPath?: string;
};

type RouteResult = {
  name: string;
  path: string;
  finalUrl: string;
  status: number | null;
  ok: boolean;
  consoleErrors: string[];
  screenshot: string;
};

const ROUTES: SmokeRoute[] = [
  { name: "home", path: "/" },
  { name: "pricing", path: "/pricing" },
  { name: "dashboard", path: "/dashboard" },
  { name: "community", path: "/community" },
  { name: "support", path: "/support" },
  { name: "billing", path: "/billing" },
  { name: "admin", path: "/admin" },
  { name: "creator-lab", path: "/creator-lab" },
  { name: "voice-lab", path: "/creator-lab/voice" },
  { name: "admin-system", path: "/admin/system" },
  { name: "notifications", path: "/notifications" },
  { name: "profile", path: "/profile" },
  { name: "lentille-marche", path: "/lentille-marche" },
  { name: "project-overview", path: `/projects/${PROJECT_ID}` },
  { name: "project-publish", path: `/projects/${PROJECT_ID}/publish` },
  { name: "project-passport", path: `/projects/${PROJECT_ID}/passport` },
  { name: "project-exports", path: `/projects/${PROJECT_ID}/exports` },
  { name: "project-mandate", path: `/projects/${PROJECT_ID}/mandate` },
  { name: "redirect-compte", path: "/compte", expectedPath: "/profile" },
  { name: "redirect-admin-dashboard", path: "/admin/dashboard", expectedPath: "/admin" },
  { name: "redirect-project-overview", path: `/projects/${PROJECT_ID}/overview`, expectedPath: `/projects/${PROJECT_ID}` },
  { name: "redirect-studio", path: "/studio", expectedPath: "/admin" },
];

test.describe("route smoke visual audit", () => {
  test.beforeEach(async ({ page }) => {
    await mockMatriceApi(page);
    await page.addInitScript(() => {
      window.localStorage.setItem("matrice_user_token", "e2e-user-token");
      window.localStorage.setItem("matrice_admin_token", "e2e-admin-token");
    });
  });

  test("main routes render without HTTP or console regressions", async ({ page }, testInfo) => {
    await mkdir(SCREENSHOT_DIR, { recursive: true });
    const results: RouteResult[] = [];

    for (const route of ROUTES) {
      const consoleErrors: string[] = [];
      const onConsole = (message: { type(): string; text(): string }) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      };
      page.on("console", onConsole);

      const response = await page.goto(route.path, { waitUntil: "networkidle" });
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("body")).not.toBeEmpty();
      await expect(page.locator("#root")).not.toBeEmpty();

      if (route.expectedPath) {
        await expect(page).toHaveURL(new RegExp(`${escapeRegExp(route.expectedPath)}(?:[?#].*)?$`));
      }

      const screenshot = path.join(SCREENSHOT_DIR, `${route.name}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      page.off("console", onConsole);

      const status = response?.status() ?? null;
      const hasBadStatus = status === null || status >= 400;
      const hasOverlay = await page.locator("text=/Plugin: vite:react|Error:|Uncaught/i").first().isVisible().catch(() => false);
      const failed = hasBadStatus || consoleErrors.length > 0 || hasOverlay;

      results.push({
        name: route.name,
        path: route.path,
        finalUrl: page.url(),
        status,
        ok: !failed,
        consoleErrors: hasOverlay ? [...consoleErrors, "Framework/runtime overlay visible"] : consoleErrors,
        screenshot,
      });
    }

    await writeFile(REPORT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), routes: results }, null, 2), "utf8");
    await testInfo.attach("routes-smoke-report", { path: REPORT_PATH, contentType: "application/json" });

    const broken = results.filter((result) => !result.ok);
    expect(
      broken.map((result) => ({
        route: result.path,
        status: result.status,
        finalUrl: result.finalUrl,
        consoleErrors: result.consoleErrors,
      })),
    ).toEqual([]);
  });
});

async function mockMatriceApi(page: Page) {
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname;

    if (request.method() !== "GET") {
      await json(route, { ok: true, id: "e2e-created", url: "https://example.test/e2e" });
      return;
    }

    if (pathname === "/api/auth/me") return json(route, { user: testUser() });
    if (pathname === "/api/credits/balance") return json(route, { balance: creditBalance() });
    if (pathname === "/api/credits/history") return json(route, { history: [] });
    if (pathname === "/api/notifications") return json(route, { notifications: [], unread_count: 0 });
    if (pathname === "/api/notifications/preferences") return json(route, { preferences: notificationPreferences() });
    if (pathname === "/api/access") return json(route, productAccess());
    if (pathname === "/api/projects") return json(route, [project()]);
    if (pathname === "/api/dashboard/summary") return json(route, dashboardSummary());

    if (pathname === "/api/community/threads") return json(route, { threads: [communityThread()] });
    if (pathname === "/api/support/tickets") return json(route, { tickets: [supportTicket()] });

    if (pathname === "/api/admin/dashboard") return json(route, adminDashboard());
    if (pathname.startsWith("/api/admin/users")) return json(route, adminUsers());
    if (pathname === "/api/admin/invites") return json(route, { codes: [], stats: { total: 0, total_uses: 0, active: 0 } });
    if (pathname === "/api/admin/audit") return json(route, { actions: [] });
    if (pathname === "/api/admin/support/tickets") return json(route, { tickets: [adminTicket()] });
    if (pathname.startsWith("/api/admin/finance")) return json(route, adminFinance(pathname));

    if (pathname === "/api/creator/lab/features") return json(route, creatorFeatures());
    if (pathname === "/api/creator/system-info") return json(route, systemInfo());
    if (pathname === "/api/voice-lab/status") return json(route, voiceStatus());
    if (pathname === "/api/voice-lab/samples") return json(route, { samples: [] });
    if (pathname === "/api/voice-lab/jobs") return json(route, { jobs: [] });

    if (pathname === `/api/projects/${PROJECT_ID}`) return json(route, project());
    if (pathname === `/api/projects/${PROJECT_ID}/status`) return json(route, projectStatus());
    if (pathname === `/api/projects/${PROJECT_ID}/matrix`) return json(route, matrix());
    if (pathname === `/api/projects/${PROJECT_ID}/publish-plan`) return json(route, publishPlan());
    if (pathname === `/api/projects/${PROJECT_ID}/sales`) return json(route, sales());
    if (pathname === `/api/projects/${PROJECT_ID}/publishing/finance`) return json(route, publishingFinance());
    if (pathname === `/api/projects/${PROJECT_ID}/passport`) return json(route, { passport: passport() });
    if (pathname === `/api/projects/${PROJECT_ID}/mandate`) return json(route, { mandate: null });
    if (pathname === `/api/lentille-marche/project/${PROJECT_ID}/latest`) return json(route, { analysis: null });

    if (pathname === "/api/lentille-marche/quota") return json(route, { limit: -1, used: 1, remaining: -1, plan: "premium", upgrade_required: false });
    if (pathname === "/api/lentille-marche/history") return json(route, { analyses: [] });
    if (pathname === "/api/payments/subscription") return json(route, { subscription: null });
    if (pathname === "/api/payments/invoices") return json(route, { invoices: [] });
    if (pathname === "/api/passport/locked-works") return json(route, { works: [] });
    if (pathname === "/api/exports/list") return json(route, { jobs: [] });

    await json(route, {});
  });
}

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

function testUser() {
  return {
    id: "user-e2e",
    email: "auteur.e2e@matrice.test",
    displayName: "Auteur E2E",
    role: "owner",
    plan: "premium",
    status: "active",
    isEmailVerified: true,
    creatorModeEnabled: true,
    isBetaTester: true,
    betaStartedAt: now,
    betaExpiresAt: "2026-08-31T12:00:00.000Z",
    onboardingStep: "done",
    onboardingCompletedAt: now,
    generationsUsed: 0,
    projectsCreated: 1,
  };
}

function creditBalance() {
  return { monthlyCredits: 800, extraCredits: 200, totalCredits: 1000, renewAt: "2026-06-30T12:00:00.000Z", plan: "premium" };
}

function notificationPreferences() {
  return {
    emailMandateEvents: true,
    emailExportReady: true,
    emailLentilleDone: true,
    emailBetaWarnings: true,
    emailSupportReply: true,
    emailProductUpdates: true,
    inappAll: true,
    digestFrequency: "realtime",
  };
}

function project() {
  return {
    id: PROJECT_ID,
    title: "Les Cendres du Mirage",
    rawIdea: "Une autrice transforme une idee brute en oeuvre vendable.",
    inputType: "text",
    genre: "Roman contemporain",
    tone: "Intime",
    targetFormat: "roman",
    targetAudience: "Adultes",
    artisticAmbition: "Publication independante",
    visualMoods: [],
    cinematicReferences: "",
    inspirationSources: "",
    manuscriptExcerpt: "Chapitre 1\n\nLe premier paragraphe existe deja.",
    authorDisplayName: "Nora Safir",
    ownerUserId: "user-e2e",
    progression: 72,
    createdAt: now,
    updatedAt: now,
  };
}

function projectStatus() {
  return {
    matrix: true,
    emotionalCore: true,
    characters: true,
    relationships: true,
    world: true,
    research: true,
    hpsa: true,
    book: true,
    screenplay: false,
    series: false,
    pitch: true,
  };
}

function productAccess() {
  return {
    mode: "commercial",
    plan: "premium",
    viewer: { role: "owner", authenticated: true, source: "user-token", userId: "user-e2e", email: "auteur.e2e@matrice.test" },
    isPrivate: false,
    isPaid: true,
    limits: { freeUnlockedModules: [] },
    paywall: { title: "Premium actif", message: "Acces complet", cta: "Continuer" },
  };
}

function matrix() {
  return {
    id: "matrix-e2e",
    projectId: PROJECT_ID,
    centralConcept: "Une preuve de concept claire.",
    logline: "Une autrice publie sous son nom.",
    shortPitch: "Matrice l'aide sans voler sa paternite.",
    themes: ["paternite", "publication"],
    createdAt: now,
    updatedAt: now,
  };
}

function dashboardSummary() {
  return {
    totalProjects: 1,
    averageProgression: 72,
    byFormat: [{ format: "roman", count: 1 }],
    byGenre: [{ genre: "Roman contemporain", count: 1 }],
  };
}

function publishPlan() {
  return {
    project: { id: PROJECT_ID, title: "Les Cendres du Mirage", target_format: "roman", author_display_name: "Nora Safir" },
    work_type: "roman",
    channels: [{ name: "Amazon KDP", url: "https://kdp.amazon.com", model: "commission", revenueType: "vente directe", note: "Canal de test" }],
    checklist: [{ id: "metadata_ready", label: "Metadonnees pretes", required: true, done: true }],
    disclaimer: "Matrice prepare et route vers les plateformes.",
  };
}

function sales() {
  return {
    entries: [],
    totals: { gross_amount: 0, matrice_share: 0, author_share: 0, currency: "EUR", matrice_percent: 10, author_percent: 90 },
  };
}

function publishingFinance() {
  return { payout_account: null, channel_connections: [], settlements: [] };
}

function passport() {
  return {
    id: "passport-e2e",
    projectId: PROJECT_ID,
    ownerUserId: "user-e2e",
    officialTitle: "Les Cendres du Mirage",
    workType: "roman",
    displayedAuthor: "Nora Safir",
    pseudonym: "",
    language: "francais",
    countryCulture: "France",
    genre: "Roman contemporain",
    targetAudience: "Adultes",
    status: "pret_depot",
    logline: "Une autrice publie sous son nom.",
    shortPitch: "Matrice l'aide sans voler sa paternite.",
    shortSynopsis: "Synopsis E2E",
    mainThemes: ["paternite"],
    artisticIntention: "Tester le passeport.",
    declaredOriginality: "Angle publication auteur.",
    clichRisks: [],
    version: 1,
    sealedAt: now,
    contentHash: "a".repeat(64),
    legalDisclaimer: "E2E",
    proofMode: "sha256_ots",
    proofProvider: "OpenTimestamps / Bitcoin",
    proofExternalReference: "",
    proofRegisteredAt: now,
    proofNotes: "Preuve E2E",
    depositTargets: ["sgdl"],
    depositChecklist: {},
    markdownContent: "# Les Cendres du Mirage\n\nContenu E2E.",
    createdAt: now,
    updatedAt: now,
  };
}

function communityThread() {
  return { id: "thread-e2e", title: "Bienvenue dans la communaute", category: "general", status: "open", pinned: true, postsCount: 1, authorName: "Auteur E2E", createdAt: now, updatedAt: now };
}

function supportTicket() {
  return { id: "ticket-e2e", subject: "Question beta", category: "general", priority: "normal", status: "open", updatedAt: now, createdAt: now };
}

function adminTicket() {
  return { id: "ticket-e2e", userId: "user-e2e", subject: "Question beta", category: "general", priority: "normal", status: "open", updatedAt: now };
}

function adminDashboard() {
  return {
    users: { total: 2, active: 2, suspended: 0, new_7d: 1, new_30d: 2, beta_testers: 1, by_plan: { premium: 1, studio: 1 } },
    projects: { total: 1 },
    lentille: { total: 1, last_7d: 1 },
    exports: { total: 0 },
    mandates: { total: 0, active: 0 },
    revenue: { mrr_eur: 15, annual_estimate_eur: 180 },
  };
}

function adminUsers() {
  return {
    users: [{
      id: "user-e2e",
      email: "auteur.e2e@matrice.test",
      displayName: "Auteur E2E",
      role: "owner",
      plan: "premium",
      status: "active",
      isBetaTester: true,
      monthlyCredits: 800,
      extraCredits: 200,
      creditsRenewAt: "2026-06-30T12:00:00.000Z",
      createdAt: now,
    }],
    pagination: { total: 1, page: 1, page_size: 50, total_pages: 1 },
  };
}

function adminFinance(pathname: string) {
  if (pathname.includes("subscriptions")) return { subscriptions: [] };
  if (pathname.includes("transactions")) return { transactions: [] };
  if (pathname.includes("vat-report")) return { report: null };
  return { revenue_eur: 0, mrr_eur: 15, active_subscriptions: 1, failed_payments: 0 };
}

function creatorFeatures() {
  return {
    features: [
      { id: "voice", name: "Voice Lab", status: "experimental", description: "Generation audio mockee pour E2E", readiness: 0.4 },
      { id: "video", name: "Lentille video", status: "planned", description: "Module futur", readiness: 0.1 },
    ],
  };
}

function systemInfo() {
  return {
    server: { env: "test", node_version: "v22", uptime_seconds: 120, memory_mb: 256 },
    database: { total_users: 2, total_projects: 1 },
    services: { deepseek_configured: true, essuf_sign_configured: true, stripe_configured: true, resend_configured: true },
  };
}

function voiceStatus() {
  return {
    engine: "mock",
    generation_enabled: false,
    license_notice: "Chatterbox commercial usage to verify before live activation.",
    safeguards: ["Consentement explicite", "Watermark", "Suppression RGPD"],
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
