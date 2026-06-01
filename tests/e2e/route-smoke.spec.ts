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
  { name: "modules-guide", path: "/modules-guide", appLayout: true },
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
  { name: "admin-community", path: "/admin/community", appLayout: true },
  { name: "admin-system", path: "/admin/system", appLayout: true },
  { name: "creator-lab", path: "/creator-lab", appLayout: true },
  { name: "voice-lab", path: "/creator-lab/voice", appLayout: true },
  { name: "creator-system", path: "/creator-lab/system", appLayout: true },
  { name: "project-overview", path: `/projects/${PROJECT_ID}`, appLayout: true },
  { name: "project-matrix", path: `/projects/${PROJECT_ID}/matrix`, appLayout: true },
  { name: "project-emotional-core", path: `/projects/${PROJECT_ID}/emotional-core`, appLayout: true },
  { name: "project-characters", path: `/projects/${PROJECT_ID}/characters`, appLayout: true },
  { name: "project-relationships", path: `/projects/${PROJECT_ID}/relationships`, appLayout: true },
  { name: "project-world", path: `/projects/${PROJECT_ID}/world`, appLayout: true },
  { name: "project-research", path: `/projects/${PROJECT_ID}/research`, appLayout: true },
  { name: "project-hpsa", path: `/projects/${PROJECT_ID}/hpsa`, appLayout: true },
  { name: "project-book", path: `/projects/${PROJECT_ID}/book`, appLayout: true },
  { name: "project-screenplay", path: `/projects/${PROJECT_ID}/screenplay`, appLayout: true },
  { name: "project-series", path: `/projects/${PROJECT_ID}/series`, appLayout: true },
  { name: "project-exports", path: `/projects/${PROJECT_ID}/exports`, appLayout: true },
  { name: "project-publish", path: `/projects/${PROJECT_ID}/publish`, appLayout: true },
  { name: "project-passport", path: `/projects/${PROJECT_ID}/passport`, appLayout: true },
  { name: "project-pitch", path: `/projects/${PROJECT_ID}/pitch`, appLayout: true },
  { name: "project-prisme", path: `/projects/${PROJECT_ID}/prisme`, appLayout: true },
  { name: "project-mandate", path: `/projects/${PROJECT_ID}/mandate`, appLayout: true },
  { name: "project-analyse", path: `/projects/${PROJECT_ID}/analyse`, appLayout: true },
  { name: "project-tension-arc", path: `/projects/${PROJECT_ID}/tension-arc`, appLayout: true },
  { name: "project-atmosphere", path: `/projects/${PROJECT_ID}/atmosphere`, appLayout: true },
  { name: "project-constellation", path: `/projects/${PROJECT_ID}/constellation`, appLayout: true },
  { name: "project-dialogue", path: `/projects/${PROJECT_ID}/dialogue`, appLayout: true },
  { name: "project-director", path: `/projects/${PROJECT_ID}/director`, appLayout: true },
  { name: "project-notebook", path: `/projects/${PROJECT_ID}/notebook`, appLayout: true },
  { name: "project-echo-temps", path: `/projects/${PROJECT_ID}/echo-temps`, appLayout: true },
  { name: "project-miroir", path: `/projects/${PROJECT_ID}/miroir`, appLayout: true },
  { name: "project-piliers", path: `/projects/${PROJECT_ID}/piliers`, appLayout: true },
  { name: "project-sequencier", path: `/projects/${PROJECT_ID}/sequencier`, appLayout: true },
  { name: "project-note-intention", path: `/projects/${PROJECT_ID}/note-intention`, appLayout: true },
  { name: "project-film-scenes", path: `/projects/${PROJECT_ID}/film-scenes`, appLayout: true },
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
    if (pathname === "/api/community/threads/thread-e2e") return json(route, { thread: communityThread(), posts: [communityPost()] });
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
    if (pathname === `/api/projects/${PROJECT_ID}/emotional-core`) return json(route, emotionalCore());
    if (pathname === `/api/projects/${PROJECT_ID}/characters`) return json(route, []);
    if (pathname === `/api/projects/${PROJECT_ID}/relationships`) return json(route, []);
    if (pathname === `/api/projects/${PROJECT_ID}/world`) return json(route, worldData());
    if (pathname === `/api/projects/${PROJECT_ID}/research`) return json(route, researchData());
    if (pathname === `/api/projects/${PROJECT_ID}/hpsa`) return json(route, hpsaData());
    if (pathname === `/api/projects/${PROJECT_ID}/book`) return json(route, bookPayload());
    if (pathname === `/api/projects/${PROJECT_ID}/screenplay`) return json(route, screenplayPayload());
    if (pathname === `/api/projects/${PROJECT_ID}/series`) return json(route, seriesPayload());
    if (pathname === `/api/projects/${PROJECT_ID}/pitch`) return json(route, pitchPayload());
    if (pathname === `/api/projects/${PROJECT_ID}/prisme`) return json(route, prismePayload());
    if (pathname === `/api/projects/${PROJECT_ID}/tension-arc`) return json(route, tensionArcPayload());
    if (pathname === `/api/projects/${PROJECT_ID}/atmosphere`) return json(route, atmospherePayload());
    if (pathname === `/api/projects/${PROJECT_ID}/echo-temps`) return json(route, echoTempsPayload());
    if (pathname === `/api/projects/${PROJECT_ID}/miroir`) return json(route, miroirPayload());
    if (pathname === `/api/projects/${PROJECT_ID}/cinq-piliers`) return json(route, piliersPayload());
    if (pathname === `/api/projects/${PROJECT_ID}/sequencier`) return json(route, sequencierPayload());
    if (pathname === `/api/projects/${PROJECT_ID}/note-intention`) return json(route, noteIntentionPayload());
    if (pathname === `/api/projects/${PROJECT_ID}/film-scenes`) return json(route, filmScenesPayload());
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

function emotionalCore() {
  return {
    id: "core-e2e",
    projectId: PROJECT_ID,
    dominantEmotion: "Colere defensive masquant une soif de reconnaissance",
    hiddenWound: "Avoir ete eclipsee par une figure dominante.",
    emotionalLack: "La certitude d'exister sans se battre.",
    innerChildSignal: "Quand son travail est minimise, elle se ferme.",
    protectionMask: "Ironie et controle",
    apparentDesire: "Reussir seule",
    deepNeed: "Etre reconnue sans se justifier",
    centralFear: "Devenir invisible",
    shamePoint: "Avoir besoin des autres",
    guiltyPoint: "Confondre aide et dette",
    emotionalContradiction: "Elle veut etre libre tout en reclamant validation.",
    symbolicObject: "Le cheque dechire",
    symbolicPlace: "L'atelier lumineux",
    emotionalAntagonist: "Le paternalisme",
    correctionPath: "Accepter l'alliance sans perdre sa voix.",
    transformationArc: "De la defense a la confiance.",
    finalEmotionalState: "Calme et affirmation.",
  };
}

function worldData() {
  return {
    id: "world-e2e",
    projectId: PROJECT_ID,
    locations: [{ name: "Atelier", description: "Lieu de creation et de conflit.", atmosphere: "Lumineux, tendu" }],
    atmospheres: ["Lumineux", "Ironique"],
    temporalRules: "Chronologie contemporaine resserree.",
    parallelTimelines: [],
    dreamLayers: [],
    timelineEvents: [{ date: "Acte 1", event: "Rencontre", significance: "Declenche le conflit." }],
    forbiddenRules: [],
    causeEffectLogic: "Chaque geste d'aide cree une dette symbolique.",
  };
}

function researchData() {
  return {
    id: "research-e2e",
    projectId: PROJECT_ID,
    referenceWorks: [{ title: "Lucifer", author: "Joe Henderson", medium: "Serie", relevance: "Duo conflictuel ironique." }],
    successSignals: ["Romance a conflit clair"],
    currentTrends: ["Comedie romantique sociale"],
    clicheRisks: ["Patron sauveur trop unilateral"],
    originalityOpportunities: ["Renverser la dynamique de dette"],
    criticalNotes: ["Clarifier la paternite artistique."],
    abstractMechanics: ["Opposition don/controle"],
    humorPatterns: ["Reparties de statut"],
    suspensePatterns: ["Malentendus d'intention"],
    tearTriggers: ["Reconnaissance tardive"],
    creationNotes: "Note E2E.",
  };
}

function hpsaData() {
  const axis = {
    score: 72,
    diagnostic: "Base solide.",
    weaknesses: [],
    corrections: ["Renforcer le retournement final."],
    suggestions: [],
  };
  return {
    id: "hpsa-e2e",
    projectId: PROJECT_ID,
    globalScore: 74,
    humour: { ...axis, score: 78 },
    pleur: { ...axis, score: 68 },
    suspense: { ...axis, score: 70 },
    attractivite: { ...axis, score: 82 },
    priorityFixes: ["Rendre l'objectif antagoniste plus explicite."],
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

function screenplayPayload() {
  return {
    id: "screenplay-e2e",
    projectId: PROJECT_ID,
    tagline: "Une alliance mal comprise devient une histoire d'amour.",
    logline: "Une artiste et un patron perfectionniste s'affrontent autour d'un financement.",
    cinematicSynopsis: "Synopsis cinematographique E2E.",
    treatment: "Traitement court.",
    beats: [{ number: 1, label: "Image d'ouverture", description: "L'atelier avant la rupture.", pageRange: "1-3" }],
    scenes: [{ number: 1, heading: "INT. ATELIER - JOUR", description: "Elle refuse le cheque.", dramaticFunction: "Incident", emotionalTone: "Tendu" }],
  };
}

function seriesPayload() {
  return {
    id: "series-e2e",
    projectId: PROJECT_ID,
    format: "Mini-serie romantique",
    loglineSerie: "Chaque episode deplace la relation de pouvoir.",
    seasonConcept: "Une saison sur la reconnaissance artistique.",
    seriesPotential: "Potentiel limite mais clair.",
    longArcs: ["La dette devient confiance."],
    episodes: [{ number: 1, title: "Le cheque", summary: "Le malentendu initial.", aPlot: "Financement", bPlot: "Orgueil", cliffhanger: "Elle refuse." }],
    progressiveRevelations: ["Il ne cherche pas a la posseder."],
    secondaryCharacters: ["Une galeriste lucide"],
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

function tensionArcPayload() {
  return {
    acts: [
      { label: "Rencontre", description: "Le financement declenche le conflit.", tension: 45, emotion: "mefiance", keyEvent: "Cheque refuse" },
      { label: "Confrontation", description: "Les intentions se brouillent.", tension: 72, emotion: "colere", keyEvent: "Accusation publique" },
      { label: "Reconnaissance", description: "La dette devient alliance.", tension: 58, emotion: "apaisement", keyEvent: "Excuses franches" },
    ],
    overallShape: "Courbe romance conflictuelle.",
    recommendation: "Monter la tension de statut au milieu.",
  };
}

function atmospherePayload() {
  return {
    colorPalette: [
      { name: "Ivoire", hex: "#F5F1E8", role: "Fond calme" },
      { name: "Encre", hex: "#2A2520", role: "Conflit" },
      { name: "Or sourd", hex: "#8B6F2E", role: "Valeur" },
    ],
    lightingStyle: "Lumiere d'atelier naturelle avec ombres nettes.",
    musicReferences: [{ genre: "Neo-soul", artists: ["FKJ"], mood: "Intime" }],
    cinematicStyle: "Comedie romantique lumineuse.",
    textures: ["Toile", "Papier", "Bois clair"],
    sensoryNotes: { smell: "Peinture fraiche", sound: "Rue lointaine", touch: "Papier epais" },
    visualReferences: ["Ateliers parisiens", "Galleries contemporaines"],
  };
}

function echoTempsPayload() {
  return {
    mythicResonances: [{ myth: "Pygmalion inverse", culture: "Europe", connection: "L'oeuvre refuse l'emprise." }],
    historicalParallels: [{ period: "XXIe siecle", region: "France", connection: "Independance creative." }],
    culturalEchoes: [{ culture: "Comedie romantique", storyTitle: "Duo oppose", connection: "Attraction par friction." }],
    temporalAnchor: "Economie creative contemporaine",
    universalWound: "Etre reconnu sans etre possede",
    futureResonance: "La paternite artistique comme droit moral",
  };
}

function miroirPayload() {
  return {
    trueTheme: "La difference entre soutenir et controler.",
    shadowStory: "Une peur d'etre achetee.",
    blindSpots: ["Le geste financier manque d'ambiguite morale."],
    resonanceGaps: [{ zone: "Antagonisme", reflection: "Le patron doit aussi perdre quelque chose." }],
    artisticInvitations: [{ invitation: "Faire du cheque un symbole recurrent.", why: "Il cristallise la dette." }],
    mirrorPhrase: "Ce n'est pas l'argent qui blesse, c'est le pouvoir qu'on lui prete.",
  };
}

function piliersPayload() {
  return {
    pillars: [
      { name: "Humour", presence: 75, type: "Repartie", analysis: "Ironie active.", strongMoment: "Premier refus", artisticSuggestion: "Accentuer le timing." },
      { name: "Suspense", presence: 60, type: "Malentendu", analysis: "Tension relationnelle.", strongMoment: "Accusation", artisticSuggestion: "Retarder l'explication." },
    ],
    dominantPillar: "Humour",
    weakestPillar: "Surprise",
    globalBalance: "Equilibre viable, surprise a renforcer.",
  };
}

function sequencierPayload() {
  return {
    sequences: [{
      numero: 1,
      titre: "Le financement",
      lieu: "Atelier",
      moment: "Jour",
      personnages: ["Julien", "Capucine"],
      fonctionDramatique: "Incident declencheur",
      arcEmotionnel: "Mefiance vers colere",
      dureeEstimee: 5,
      liensThematiques: "Argent et reconnaissance",
      noteRealisateur: "Plan fixe sur le cheque.",
    }],
    totalDuree: 5,
    structure: "Court metrage",
    noteGlobale: "Sequence lisible.",
  };
}

function noteIntentionPayload() {
  return {
    vision: "Raconter une reconciliation sans effacer le conflit social.",
    partiPrisMiseEnScene: "Camera proche des gestes.",
    personnagesVision: [{ nom: "Capucine", visionRealisateur: "Independante, vive, defensive." }],
    universVisuel: "Atelier lumineux et bureaux froids.",
    musiqueEtSon: "Silences et respirations.",
    positionnement: "Comedie romantique contemporaine.",
    pourquoiMaintenant: "La question du pouvoir dans l'aide est actuelle.",
    motFinal: "Une histoire de paternite artistique.",
  };
}

function filmScenesPayload() {
  return [{
    id: "scene-e2e",
    projectId: PROJECT_ID,
    sceneNumber: 1,
    title: "Le cheque",
    intExt: "INT",
    location: "ATELIER",
    timeOfDay: "JOUR",
    charactersPresent: ["Julien", "Capucine"],
    actionDescription: "Elle comprend son geste comme une tentative de controle.",
    hpsaCheck: { humour: 70, pleur: 40, suspense: 60, attractivite: 80 },
    narrativeFunction: "Incident declencheur",
  }];
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

function communityPost() {
  return { id: "post-e2e", threadId: "thread-e2e", body: "Reponse de test pour la moderation.", status: "visible", authorName: "Auteur E2E", createdAt: now, updatedAt: now };
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
  return { mrr_eur: "15.00", active_subscriptions: 1, ca_month_eur: "0.00", commissions_eur: "0.00" };
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
