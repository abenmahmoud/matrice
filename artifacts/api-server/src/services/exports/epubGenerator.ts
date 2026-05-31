import EPub from "epub-gen-memory";
import { eq } from "drizzle-orm";
import { appUsersTable, db, projectsTable, workPassportsTable } from "@workspace/db";
import { resolveExportAuthorName } from "../authorDisplayNameService.js";

const MATRICE_EPUB_CSS = `
body {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1em;
  line-height: 1.6;
  margin: 5%;
  text-align: justify;
}
h1, h2, h3 {
  font-family: 'Cormorant Garamond', 'EB Garamond', Georgia, serif;
  font-weight: 600;
  margin: 2em 0 1em;
  text-align: center;
}
h1 {
  font-size: 1.8em;
  page-break-before: always;
}
p {
  margin: 0;
  orphans: 2;
  text-indent: 1.5em;
  widows: 2;
}
p:first-of-type,
h1 + p,
h2 + p,
h3 + p {
  text-indent: 0;
}
blockquote {
  font-style: italic;
  margin: 1em 2em;
}
em {
  font-style: italic;
}
strong {
  font-weight: 600;
}
`;

type Chapter = {
  title: string;
  content: string;
};

export async function generateEpub(workPassportId: string): Promise<Buffer> {
  const passport = await findWorkPassport(workPassportId);

  if (!passport.markdownContent.trim()) {
    throw new Error("L'oeuvre n'a pas de contenu markdown");
  }

  const chapters = parseMarkdownToChapters(passport.markdownContent);
  const author = await resolveAuthorName(passport);
  const title = passport.officialTitle || "Oeuvre sans titre";
  const language = passport.language === "francais" ? "fr" : passport.language || "fr";

  return EPub(
    {
      title,
      author,
      lang: language,
      publisher: "Matrice Narrative",
      description: passport.shortPitch || "",
      css: MATRICE_EPUB_CSS,
    },
    chapters.map((chapter) => ({
      title: chapter.title,
      content: chapter.content,
    })),
  );
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

function parseMarkdownToChapters(markdown: string): Chapter[] {
  const lines = markdown.split("\n");
  const chapters: Chapter[] = [];
  let currentTitle = "";
  let currentLines: string[] = [];

  function flushChapter(): void {
    if (!currentTitle && currentLines.every((line) => !line.trim())) {
      currentLines = [];
      return;
    }

    chapters.push({
      title: currentTitle || `Chapitre ${chapters.length + 1}`,
      content: markdownParagraphsToHtml(currentLines.join("\n")),
    });
    currentLines = [];
  }

  for (const line of lines) {
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      flushChapter();
      currentTitle = heading[1]?.trim() || `Chapitre ${chapters.length + 1}`;
      continue;
    }

    currentLines.push(line);
  }

  flushChapter();

  return chapters.length > 0
    ? chapters
    : [{ title: "Chapitre 1", content: "<p><em>Aucun contenu disponible.</em></p>" }];
}

function markdownParagraphsToHtml(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\n/g, " ").trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
