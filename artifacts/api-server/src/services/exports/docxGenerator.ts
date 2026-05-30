import {
  AlignmentType,
  Document,
  Footer,
  NumberFormat,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  TextRun,
} from "docx";
import { eq } from "drizzle-orm";
import { appUsersTable, db, workPassportsTable } from "@workspace/db";

export async function generateDocxManuscript(workPassportId: string): Promise<Buffer> {
  const passport = await findWorkPassport(workPassportId);

  if (!passport.markdownContent.trim()) {
    throw new Error("L'oeuvre n'a pas de contenu markdown");
  }

  const [owner] = await db
    .select({ email: appUsersTable.email, displayName: appUsersTable.displayName })
    .from(appUsersTable)
    .where(eq(appUsersTable.id, passport.ownerUserId))
    .limit(1);

  const authorDisplayName = passport.pseudonym || passport.displayedAuthor || owner?.displayName || "Anonyme";
  const authorContact = owner?.email || "";
  const title = passport.officialTitle || "Oeuvre sans titre";
  const wordCount = countWords(passport.markdownContent);
  const chapters = parseMarkdownToChapters(passport.markdownContent);

  const titlePageParagraphs: Paragraph[] = [
    ...blankParagraphs(5),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 48,
          font: "Times New Roman",
        }),
      ],
      spacing: { after: 600 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "un roman de", italics: true, size: 24, font: "Times New Roman" })],
      spacing: { after: 200 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: authorDisplayName, size: 32, font: "Times New Roman" })],
      spacing: { after: 1200 },
    }),
    ...blankParagraphs(15),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: authorDisplayName, size: 22, font: "Times New Roman" })],
    }),
    ...(authorContact
      ? [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [new TextRun({ text: authorContact, size: 22, font: "Times New Roman" })],
          }),
        ]
      : []),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: `${wordCount.toLocaleString("fr-FR")} mots`, size: 22, font: "Times New Roman" })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];

  const bodyParagraphs = chapters.flatMap((chapter, chapterIndex) => [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      pageBreakBefore: chapterIndex > 0,
      children: [new TextRun({ text: chapter.title, bold: true, size: 28, font: "Times New Roman" })],
      spacing: { before: 480, after: 480, line: 480 },
    }),
    ...chapter.content
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.replace(/\n/g, " ").trim())
      .filter(Boolean)
      .map(
        (paragraph) =>
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun({ text: paragraph, size: 24, font: "Times New Roman" })],
            indent: { firstLine: 720 },
            spacing: { line: 480 },
          }),
      ),
  ]);

  const document = new Document({
    creator: authorDisplayName,
    title,
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: titlePageParagraphs,
      },
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ children: [PageNumber.CURRENT], size: 20, font: "Times New Roman" })],
              }),
            ],
          }),
        },
        children: bodyParagraphs,
      },
    ],
  });

  return Packer.toBuffer(document);
}

async function findWorkPassport(workPassportId: string) {
  const [passport] = await db.select().from(workPassportsTable).where(eq(workPassportsTable.id, workPassportId)).limit(1);
  if (!passport) {
    throw new Error(`Passeport d'oeuvre introuvable: ${workPassportId}`);
  }
  return passport;
}

function blankParagraphs(count: number): Paragraph[] {
  return Array.from({ length: count }, () => new Paragraph({ children: [new TextRun({ text: "" })] }));
}

function countWords(markdown: string): number {
  return markdown.split(/\s+/).filter(Boolean).length;
}

function parseMarkdownToChapters(markdown: string): Array<{ title: string; content: string }> {
  const chapters: Array<{ title: string; content: string }> = [];
  let currentTitle = "";
  let currentLines: string[] = [];

  function flushChapter(): void {
    if (!currentTitle && currentLines.every((line) => !line.trim())) {
      currentLines = [];
      return;
    }

    chapters.push({
      title: currentTitle || `Chapitre ${chapters.length + 1}`,
      content: currentLines.join("\n"),
    });
    currentLines = [];
  }

  for (const line of markdown.split("\n")) {
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      flushChapter();
      currentTitle = heading[1]?.trim() || `Chapitre ${chapters.length + 1}`;
      continue;
    }
    currentLines.push(line);
  }

  flushChapter();
  return chapters.length > 0 ? chapters : [{ title: "Chapitre 1", content: markdown }];
}
