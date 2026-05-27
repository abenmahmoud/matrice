import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb } from "pdf-lib";

export type MandatePdfInput = {
  level: "simple" | "advanced" | "exclusive";
  commissionPercent: number;
  durationMonths: number;
  territories: string[];
  exclusivity: boolean;
  author: {
    fullName: string;
    email: string;
    address?: string;
    inseeNumber?: string;
  };
  project: {
    title: string;
    pitch: string;
    genre: string;
  };
  mandataire: {
    name: string;
    siret: string;
    representative: string;
    address: string;
  };
};

type FontSet = {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
};

const PAGE = { width: 595.28, height: 841.89, margin: 50 };

export async function generateMandatePdf(input: MandatePdfInput): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const fonts: FontSet = {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    italic: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
  };

  let page = pdfDoc.addPage([PAGE.width, PAGE.height]);
  let y = 800;

  const write = (text: string, size = 10, font = fonts.regular, options: { gap?: number; color?: ReturnType<typeof rgb> } = {}) => {
    page.drawText(pdfText(text), {
      x: PAGE.margin,
      y,
      size,
      font,
      color: options.color ?? rgb(0.12, 0.1, 0.08),
    });
    y -= options.gap ?? size + 8;
  };

  const paragraph = (text: string, gap = 18) => {
    const used = drawWrappedText(page, pdfText(text), PAGE.margin, y, 495, 10, fonts.regular);
    y -= used + gap;
  };

  const ensureSpace = (height: number) => {
    if (y >= height) return;
    page = pdfDoc.addPage([PAGE.width, PAGE.height]);
    y = 800;
  };

  write("MANDAT DE REPRESENTATION EDITORIALE", 18, fonts.bold, { gap: 28 });
  write(`Niveau : ${input.level.toUpperCase()}`, 10, fonts.italic, { color: rgb(0.42, 0.36, 0.28) });
  write(`Oeuvre : ${input.project.title}`, 11, fonts.bold, { gap: 28 });

  write("ENTRE LES SOUSSIGNES", 12, fonts.bold);
  paragraph(`${input.author.fullName}, auteur, email ${input.author.email}, ci-apres denomme l'Auteur.`);
  paragraph(`${input.mandataire.name}, SIRET ${input.mandataire.siret}, representee par ${input.mandataire.representative}, siege ${input.mandataire.address}, ci-apres denommee le Mandataire.`);

  write("ARTICLE 1 - OBJET DU MANDAT", 12, fonts.bold);
  paragraph(articleObject(input));

  ensureSpace(230);
  write("ARTICLE 2 - COMMISSION DU MANDATAIRE", 12, fonts.bold);
  paragraph(`Le Mandataire percevra une commission de ${input.commissionPercent}% sur les revenus nets generes par l'exploitation de l'oeuvre. Les revenus nets s'entendent apres deduction des frais directs de production, distribution, hebergement et services techniques engages pour l'oeuvre.`);

  ensureSpace(200);
  write("ARTICLE 3 - DUREE DU MANDAT", 12, fonts.bold);
  paragraph(`Le present mandat est conclu pour une duree de ${input.durationMonths} mois a compter de sa signature electronique. Il est renouvelable par accord des parties ou selon les conditions commerciales applicables.`);

  ensureSpace(180);
  write("ARTICLE 4 - TERRITOIRES", 12, fonts.bold);
  paragraph(`Le mandat s'applique aux territoires suivants : ${input.territories.join(", ")}.`);

  if (input.exclusivity) {
    ensureSpace(180);
    write("ARTICLE 5 - EXCLUSIVITE", 12, fonts.bold);
    paragraph("L'Auteur consent au Mandataire une exclusivite d'exploitation pendant la duree du mandat. L'Auteur s'engage a ne pas conclure d'accord concurrent portant sur le meme perimetre sans accord ecrit du Mandataire.");
  }

  ensureSpace(240);
  write("ARTICLE 6 - RESILIATION", 12, fonts.bold);
  paragraph("Le mandat peut etre resilie par l'une ou l'autre des parties avec un preavis de trois mois, sauf manquement grave justifiant une resiliation immediate.");

  ensureSpace(210);
  write("ARTICLE 7 - DROIT APPLICABLE", 12, fonts.bold);
  paragraph("Le droit francais est applicable. En cas de litige, les parties rechercheront une solution amiable avant toute procedure devant les juridictions competentes.");

  ensureSpace(230);
  write("MENTION D'ACCEPTATION", 11, fonts.bold);
  paragraph(`L'Auteur declare avoir lu et approuve le present mandat. Bon pour mandat de ${input.durationMonths} mois avec commission de ${input.commissionPercent}%.`, 28);

  write("Signatures electroniques via Essuf-Sign", 10, fonts.italic);
  y -= 20;
  page.drawText(pdfText("L'Auteur :"), { x: 50, y, size: 11, font: fonts.bold });
  page.drawText(pdfText("Le Mandataire :"), { x: 320, y, size: 11, font: fonts.bold });
  y -= 16;
  page.drawText(pdfText(input.author.fullName), { x: 50, y, size: 10, font: fonts.regular });
  page.drawText(pdfText(input.mandataire.name), { x: 320, y, size: 10, font: fonts.regular });
  y -= 14;
  page.drawText(pdfText(input.author.email), { x: 50, y, size: 9, font: fonts.italic });
  page.drawText(pdfText(input.mandataire.representative), { x: 320, y, size: 9, font: fonts.italic });

  return Buffer.from(await pdfDoc.save());
}

function articleObject(input: MandatePdfInput): string {
  if (input.level === "simple") {
    return `L'Auteur donne mandat au Mandataire pour exploiter l'oeuvre "${input.project.title}" via les plateformes operees par le Mandataire, notamment matrice.essuf.fr. Genre declare : ${input.project.genre}. Pitch : ${input.project.pitch || "non renseigne"}.`;
  }
  if (input.level === "exclusive") {
    return `L'Auteur donne mandat exclusif au Mandataire pour l'exploitation et la representation commerciale de l'oeuvre "${input.project.title}", incluant la presentation a des partenaires editoriaux, audiovisuels et numeriques. Genre declare : ${input.project.genre}. Pitch : ${input.project.pitch || "non renseigne"}.`;
  }
  return `L'Auteur donne mandat au Mandataire pour exploiter, distribuer et representer l'oeuvre "${input.project.title}" sur les plateformes accessibles au Mandataire, incluant les services tiers pertinents pour l'edition numerique, l'audio et la diffusion commerciale. Genre declare : ${input.project.genre}. Pitch : ${input.project.pitch || "non renseigne"}.`;
}

function drawWrappedText(page: PDFPage, text: string, x: number, y: number, maxWidth: number, fontSize: number, font: PDFFont): number {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  lines.forEach((line, index) => {
    page.drawText(line, { x, y: y - index * (fontSize + 3), size: fontSize, font });
  });

  return Math.max(fontSize + 3, lines.length * (fontSize + 3));
}

function pdfText(value: string): string {
  return value
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[œŒ]/g, "oe")
    .replace(/[€]/g, "EUR");
}
