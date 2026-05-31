import puppeteer from "puppeteer";
import { eq } from "drizzle-orm";
import { appUsersTable, db, projectsTable, workPassportsTable } from "@workspace/db";
import { resolveExportAuthorName } from "../authorDisplayNameService.js";

export async function generateKdpPdf(workPassportId: string): Promise<Buffer> {
  const passport = await findWorkPassport(workPassportId);

  if (!passport.markdownContent.trim()) {
    throw new Error("L'oeuvre n'a pas de contenu markdown");
  }

  const author = await resolveAuthorName(passport);
  const title = passport.officialTitle || "Oeuvre sans titre";
  const html = renderKdpTemplate({
    title,
    author,
    copyright: `© ${new Date().getFullYear()} ${author}`,
    chaptersHtml: parseChaptersForKdp(passport.markdownContent),
  });

  const browser = await puppeteer.launch({
    executablePath: process.env["PUPPETEER_EXECUTABLE_PATH"] || undefined,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      width: "6in",
      height: "9in",
      margin: {
        top: "0.75in",
        right: "0.5in",
        bottom: "0.75in",
        left: "0.75in",
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-size:9pt;width:100%;text-align:center;font-family:Garamond,serif;color:#333;">${escapeHtml(title)}</div>`,
      footerTemplate:
        '<div style="font-size:9pt;width:100%;text-align:center;font-family:Garamond,serif;color:#333;"><span class="pageNumber"></span></div>',
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

async function findWorkPassport(workPassportId: string) {
  const [passport] = await db.select().from(workPassportsTable).where(eq(workPassportsTable.id, workPassportId)).limit(1);
  if (!passport) {
    throw new Error(`Passeport d'oeuvre introuvable: ${workPassportId}`);
  }
  return passport;
}

async function resolveAuthorName(passport: typeof workPassportsTable.$inferSelect): Promise<string> {
  const [project] = await db
    .select({ authorDisplayName: projectsTable.authorDisplayName })
    .from(projectsTable)
    .where(eq(projectsTable.id, passport.projectId))
    .limit(1);

  const [owner] = await db
    .select({ email: appUsersTable.email, displayName: appUsersTable.displayName })
    .from(appUsersTable)
    .where(eq(appUsersTable.id, passport.ownerUserId))
    .limit(1);

  return resolveExportAuthorName({
    pseudonym: passport.pseudonym,
    passportDisplayedAuthor: passport.displayedAuthor,
    projectAuthorDisplayName: project?.authorDisplayName,
    userDisplayName: owner?.displayName,
    userEmail: owner?.email,
  });
}

function renderKdpTemplate(data: { title: string; author: string; copyright: string; chaptersHtml: string }): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(data.title)}</title>
<style>
  @page {
    size: 6in 9in;
    margin: 0.75in 0.5in 0.75in 0.75in;
  }
  body {
    color: #000;
    font-family: 'EB Garamond', Garamond, Georgia, serif;
    font-size: 11pt;
    line-height: 1.4;
    margin: 0;
    text-align: justify;
  }
  .title-page {
    page-break-after: always;
    padding-top: 2in;
    text-align: center;
  }
  .title-page h1 {
    font-family: 'Cormorant Garamond', Garamond, Georgia, serif;
    font-size: 28pt;
    font-weight: bold;
    margin-bottom: 0.5in;
  }
  .title-page .author {
    font-size: 16pt;
    margin-top: 1in;
  }
  .copyright {
    font-size: 9pt;
    page-break-after: always;
    padding-top: 5in;
    text-align: center;
  }
  .chapter {
    page-break-before: always;
  }
  .chapter h2 {
    font-family: 'Cormorant Garamond', Garamond, Georgia, serif;
    font-size: 18pt;
    font-weight: bold;
    margin: 1.5in 0 0.5in;
    text-align: center;
  }
  p {
    margin: 0;
    orphans: 2;
    text-indent: 1.5em;
    widows: 2;
  }
  p:first-of-type,
  h2 + p {
    text-indent: 0;
  }
</style>
</head>
<body>
  <div class="title-page">
    <h1>${escapeHtml(data.title)}</h1>
    <div class="author">${escapeHtml(data.author)}</div>
  </div>
  <div class="copyright">
    <p>${escapeHtml(data.copyright)}</p>
    <p>Tous droits réservés.</p>
    <p>Verrouillé sur Matrice Narrative</p>
  </div>
  ${data.chaptersHtml}
</body>
</html>`;
}

function parseChaptersForKdp(markdown: string): string {
  let html = "";
  let currentTitle = "";
  let currentLines: string[] = [];
  let chapterCount = 0;

  function flushChapter(): void {
    if (!currentTitle && currentLines.every((line) => !line.trim())) {
      currentLines = [];
      return;
    }

    const paragraphs = currentLines
      .join("\n")
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.replace(/\n/g, " ").trim())
      .filter(Boolean)
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("\n");

    chapterCount += 1;
    html += `<div class="chapter">
  <h2>${escapeHtml(currentTitle || `Chapitre ${chapterCount}`)}</h2>
  ${paragraphs}
</div>
`;
    currentLines = [];
  }

  for (const line of markdown.split("\n")) {
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      flushChapter();
      currentTitle = heading[1]?.trim() || "Chapitre";
      continue;
    }
    currentLines.push(line);
  }

  flushChapter();
  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
