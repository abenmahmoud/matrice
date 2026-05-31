import { expect, test, type Page, type Route } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PROJECT_ID = "e2e-project";
const USER_ID = "user-e2e";
const SCREENSHOT_DIR = path.join(process.cwd(), "test-screenshots", "route-smoke");
const REPORT_PATH = path.join(process.cwd(), "test-results", "routes-smoke-report.json");
const REPORT_MD_PATH = path.join(process.cwd(), "test-results", "routes-smoke-report.md");
const now = new Date("2026-05-31T12:00:00.000Z").toISOString();

type SmokeRoute = {
  name: string;
  path: string;
  expectedPath?: string;
  appLayout?: boolean;
};

type RouteResult = {
  name: string;
  path: string;
  finalUrl: string;
  status: number | null;
  ok: boolean;
  consoleErrors: string[];
  hasAppLayout: boolean | null;
  screenshot: string;
};

const ROUTES: SmokeRoute[] = [
  { name: "home", path: "/" },
  { name: "pricing", path: "/pricing" },
  { name: "login", path: "/login" },
  { name: "connexion-alias", path: "/connexion" },
  { name: "signup", path: "/signup" },
  { name: "forgot-password", path: "/forgot-password" },
  { name: "legal-mentions", path: "/legal/mentions-legales" },
  { name: "legal-cgu", path: "/legal/cgu" },
  { name: "legal-cgv", path: "/legal/cgv" },
  { name: "legal-confidentialite", path: "/legal/confidentialite" },
  { name: "auth-required", path: "/auth-required" },
  { name: "dashboard", path: "/dashboard", appLayout: true },
  { name: "community", path: "/community", appLayout: true },
  { name: "community-new", path: "/community/new", appLayout: true },
  { name: "support", path: "/support", appLayout: true },
  { name: "support-new", path: "/support/new", appLayout: true },
  { name: "billing", path: "/billing", appLayout: true },
  { name: "sales", path: "/sales", appLayout: true },
  { name: "notifications", path: "/notifications", appLayout: true },
  { name: "profile", path: "/profile", appLayout: true },
  { name: "locked-works", path: "/locked-works", appLayout: true },
  { name: "memory", path: "/memory", appLayout: true },
  { name: "analyse", path: "/analyse", appLayout: true },
  { name: "lentille-marche", path: "/lentille-marche", appLayout: true },
  { name: "experimental-modules", path: "/experimental-modules", appLayout: true },
  { name: "admin", path: "/admin", appLayout: true },
  { name: "admin-credits", path: "/admin/credits", appLayout: true },
  { name: "admin-users", path: "/admin/users", appLayout: true },
  { name: "admin-user-detail", path: `/admin/users/${USER_ID}`, appLayout: true },
  { name: "admin-finance", path: "/admin/finance", appLayout: true },
  { name: "admin-authors", path: "/admin/authors", appLayout: true },
  { name: "admin-invites", path: "/admin/invites", appLayout: true },
  { name: "admin-audit", path: "/admin/audit", appLayout: true },
  { name: "admin-support", path: "/admin/support", appLayout: true },
  { name: "admin-system", path: "/admin/system", appLayout: true },
  { name: "creator-lab", path: "/creator-lab", appLayout: true },
  { name: "voice-lab", path: "/creator-lab/voice", appLayout: true },
  { name: "creator-system", path: "/creator-lab/system", appLayout: true },
  { name: "project-overview", path: `/projects/${PROJECT_ID}`, appLayout: true },
  { name: "project-matrix", path: `/projects/${PROJECT_ID}/matrix`, appLayout: true },
  { name: "project-characters", path: `/projects/${PROJECT_ID}/characters`, appLayout: true },
  { name: "project-book", path: `/projects/${PROJECT_ID}/book`, appLayout: true },
  { name: "project-exports", path: `/projects/${PROJECT_ID}/exports`, appLayout: true },
  { name: "project-publish", path: `/projects/${PROJECT_ID}/publish`, appLayout: true },
  { name: "project-passport", path: `/projects/${PROJECT_ID}/passport`, appLayout: true },
  { name: "project-pitch", path: `/projects/${PROJECT_ID}/pitch`, appLayout: true },
  { name: "project-prisme", path: `/projects/${PROJECT_ID}/prisme`, appLayout: true },
  { name: "project-mandate", path: `/projects/${PROJECT_ID}/mandate`, appLayout: true },
  { name: "redirect-compte", path: "/compte", expectedPath: "/profile", appLayout: true },
  { name: "redirect-admin-dashboard", path: "/admin/dashboard", expectedPath: "/admin", appLayout: true },
  { name: "redirect-project-overview", path: `/projects/${PROJECT_ID}/overview`, expectedPath: `/projects/${PROJECT_ID}`, appLayout: true },
  { name: "redirect-studio", path: "/studio", expectedPath: "/admin", appLayout: true },
];

test.describe("route smoke visual audit", () => {
  test.setTimeout(180_000);

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
      const hasAppLayout = route.appLayout ? await page.locator(".matrice-work").first().isVisible().catch(() => false) : null;

      const screenshot = path.join(SCREENSHOT_DIR, `${route.name}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      page.off("console", onConsole);

      const status = response?.status() ?? null;
      const hasBadStatus = status === null || status >= 400;
      const hasOverlay = await page.locator("text=/Plugin: vite:react|Error:|Uncaught/i").first().isVisible().catch(() => false);
      const failed = hasBadStatus || consoleErrors.length > 0 || hasOverlay || hasAppLayout === false;

      results.push({
        name: route.name,
        path: route.path,
        finalUrl: page.url(),
        status,
        ok: !failed,
        consoleErrors: [
          ...consoleErrors,
          ...(hasOverlay ? ["Framework/runtime overlay visible"] : []),
          ...(hasAppLayout === false ? ["AppLayout principal absent (.matrice-work introuvable)"] : []),
        ],
        hasAppLayout,
        screenshot,
      });
    }

    await writeFile(REPORT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), routes: results }, null, 2), "utf8");
    await writeFile(REPORT_MD_PATH, renderMarkdownReport(results), "utf8");
    await testInfo.attach("routes-smoke-report", { path: REPORT_PATH, contentType: "application/json" });
    await testInfo.attach("routes-smoke-report-md", { path: REPORT_MD_PATH, contentType: "text/markdown" });

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

  test("landing exposes a one-click path to login", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("link", { name: "Connexion" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Mot de passe")).toBeVisible();
  });

  test("unverified login shows an explicit resend action", async ({ page }) => {
    await page.route("**/api/auth/login", async (route) => {
      await json(route, { error: "EMAIL_NOT_VERIFIED", user: { email: "invite@example.com" }, canResend: true }, 403);
    });

    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByLabel("Email").fill("invite@example.com");
    await page.getByLabel("Mot de passe").fill("motdepasse-test");
    await page.getByRole("button", { name: /Se connecter/i }).click();

    await expect(page.getByText("Ton compte n'est pas encore confirme")).toBeVisible();
    await expect(page.getByRole("button", { name: "Renvoyer l'email de confirmation" })).toBeVisible();
  });

  test("admin owner can trigger the email verification rescue action", async ({ page }) => {
    let rescueCalled = false;
    await page.route(`**/api/admin/users/${USER_ID}/mark-email-verified`, async (route) => {
      rescueCalled = true;
      await json(route, { ok: true, user: { id: USER_ID, isEmailVerified: true } });
    });

    await page.goto(`/admin/users/${USER_ID}`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Marquer email verifie/i }).click();
    await expect.poll(() => rescueCalled).toBe(true);
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
    if (pathname === "/api/experimental-modules") return json(route, { modules: experimentalModules() });
    if (pathname === "/api/credits/balance") return json(route, { balance: creditBalance() });
    if (pathname === "/api/credits/history") return json(route, { history: [] });
    if (pathname === "/api/notifications") return json(route, { notifications: [], unread_count: 0 });
    if (pathname === "/api/notifications/preferences") return json(route, { preferences: notificationPreferences() });
    if (pathname === "/api/access") return json(route, productAccess());
    if (pathname === "/api/projects") return json(route, [project()]);
    if (pathname === "/api/dashboard/summary") return json(route, dashboardSummary());

    if (pathname === "/api/community/threads") return json(route, { threads: [communityThread()] });
    if (pathname === "/api/support/tickets") return json(route, { tickets: [supportTicket()] });
    if (pathname === "/api/manuscripts") return json(route, []);
    if (pathname === "/api/memory") return json(route, [memoryEntry()]);

    if (pathname === "/api/admin/dashboard") return json(route, adminDashboard());
    if (pathname === `/api/admin/users/${USER_ID}`) return json(route, adminUserDetail());
    if (pathname === "/api/admin/users") return json(route, adminUsers());
    if (pathname === "/api/admin/invites") return json(route, { codes: [], stats: { total: 0, total_uses: 0, active: 0 } });
    if (pathname === "/api/admin/audit") return json(route, { actions: [] });
    if (pathname === "/api/admin/support/tickets") return json(route, { tickets: [adminTicket()] });
    if (pathname.startsWith("/api/admin/finance")) return json(route, adminFinance(pathname));
    if (pathname.startsWith("/api/admin/authors")) return json(route, adminAuthors());

    if (pathname === "/api/creator/lab/features") return json(route, creatorFeatures());
    if (pathname === "/api/creator/system-info") return json(route, systemInfo());
    if (pathname === "/api/voice-lab/status") return json(route, voiceStatus());
    if (pathname === "/api/voice-lab/samples") return json(route, { samples: [] });
    if (pathname === "/api/voice-lab/jobs") return json(route, { jobs: [] });

    if (pathname === `/api/projects/${PROJECT_ID}`) return json(route, project());
    if (pathname === `/api/projects/${PROJECT_ID}/status`) return json(route, projectStatus());
    if (pathname === `/api/projects/${PROJECT_ID}/matrix`) return json(route, matrix());
    if (pathname === `/api/projects/${PROJECT_ID}/characters`) return json(route, []);
    if (pathname === `/api/projects/${PROJECT_ID}/book`) return json(route, bookPayload());
    if (pathname === `/api/projects/${PROJECT_ID}/pitch`) return json(route, pitchPayload());
    if (pathname === `/api/projects/${PROJECT_ID}/prisme`) return json(route, prismePayload());
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
    if (pathname === "/api/sales/mine") return json(route, mineSales());
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
    id: USER_ID,
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

function experimentalModules() {
  return [
    { id: "module-e2e", slug: "voice-lab", name: "Voice Lab", description: "Module experimental E2E", minimumPlan: "premium", isOwnerOnly: true, isEnabled: true, available: true },
  ];
}

function memoryEntry() {
  return { id: "memory-e2e", category: "creative_rules", title: "Paternite auteur", content: "Matrice ne s'approprie jamais l'oeuvre.", tags: ["auteur"], priority: 80, isActive: true };
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
    ownerUserId: USER_ID,
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

function bookPayload() {
  return {
    id: "book-e2e",
    projectId: PROJECT_ID,
    structure: "Plan en trois actes",
    chapters: [{ title: "Chapitre 1", summary: "Ouverture", purpose: "Installer l'autrice" }],
    createdAt: now,
    updatedAt: now,
  };
}

function pitchPayload() {
  return {
    id: "pitch-e2e",
    projectId: PROJECT_ID,
    title: "Les Cendres du Mirage",
    logline: "Une autrice publie sous son nom.",
    synopsis: "Pitch E2E",
    targetAudience: "Adultes",
    sellingPoints: ["Paternite", "Vente"],
    createdAt: now,
    updatedAt: now,
  };
}

function prismePayload() {
  return {
    id: "prisme-e2e",
    projectId: PROJECT_ID,
    globalScore: 82,
    axes: [],
    insights: ["Aucun souci E2E"],
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

function mineSales() {
  return {
    entries: [
      {
        id: "sale-e2e",
        project_id: PROJECT_ID,
        project_title: "Les Cendres du Mirage",
        channel: "Amazon KDP",
        date: "2026-05-31T12:00:00.000Z",
        gross_amount: 19.99,
        currency: "EUR",
        author_share: 17.99,
        matrice_share: 2,
        settlement_status: "pending",
        settlement_label: "En attente",
        raw_settlement_status: "paid",
        kyc_status: "complete",
      },
    ],
    totals: {
      gross_amount: 19.99,
      author_share: 17.99,
      matrice_share: 2,
      paid_amount: 0,
      pending_amount: 17.99,
      blocked_kyc_amount: 0,
      currency: "EUR",
      author_percent: 90,
      matrice_percent: 10,
    },
  };
}

function passport() {
  return {
    id: "passport-e2e",
    projectId: PROJECT_ID,
    ownerUserId: USER_ID,
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
  return { id: "ticket-e2e", userId: USER_ID, subject: "Question beta", category: "general", priority: "normal", status: "open", updatedAt: now };
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
      id: USER_ID,
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

function adminUserDetail() {
  return {
    user: {
      id: USER_ID,
      email: "auteur.e2e@matrice.test",
      displayName: "Auteur E2E",
      role: "owner",
      plan: "premium",
      status: "active",
      isEmailVerified: false,
      forcePasswordReset: false,
      generationsUsed: 0,
      projectsCreated: 1,
      creatorModeEnabled: true,
      isBetaTester: true,
      betaStartedAt: now,
      betaExpiresAt: "2026-08-31T12:00:00.000Z",
      onboardingStep: "done",
      onboardingCompletedAt: now,
      monthlyCredits: 800,
      extraCredits: 200,
      creditsRenewAt: "2026-06-30T12:00:00.000Z",
      createdAt: now,
      updatedAt: now,
    },
    stats: { projects_count: 1, lentille_analyses: 1, exports: 0, mandates: 0, active_mandates: 0 },
    projects: [{ id: PROJECT_ID, title: "Les Cendres du Mirage", genre: "Roman contemporain", updatedAt: now, createdAt: now }],
    mandates: [],
    credits: { balance: { monthly: 800, extra: 200, total: 1000 }, renew_at: "2026-06-30T12:00:00.000Z", history: [] },
    beta_usages: [],
    recent_admin_actions: [],
    health_flags: [],
  };
}

function adminAuthors() {
  return {
    authors: [{
      id: "user-e2e",
      email: "auteur.e2e@matrice.test",
      displayName: "Auteur E2E",
      plan: "premium",
      status: "active",
      projectsCount: 1,
      mandatesCount: 0,
      exportsCount: 0,
      createdAt: now,
    }],
    total: 1,
  };
}

function renderMarkdownReport(results: RouteResult[]): string {
  const broken = results.filter((result) => !result.ok);
  const rows = results
    .map((result) => {
      const status = result.ok ? "OK" : "CASSEE";
      const details = result.consoleErrors.length ? result.consoleErrors.join(" / ") : "-";
      return `| ${result.name} | \`${result.path}\` | ${result.status ?? "-"} | ${status} | ${result.hasAppLayout ?? "-"} | ${details} |`;
    })
    .join("\n");

  return [
    "# Rapport e2e routes Matrice",
    "",
    `Genere le ${new Date().toISOString()}`,
    "",
    `Total: ${results.length} routes`,
    `OK: ${results.length - broken.length}`,
    `Cassees: ${broken.length}`,
    "",
    "| Page | Route | HTTP | Statut | AppLayout | Details |",
    "|---|---:|---:|---|---:|---|",
    rows,
    "",
    "Captures archivees dans `test-screenshots/route-smoke/`.",
  ].join("\n");
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
