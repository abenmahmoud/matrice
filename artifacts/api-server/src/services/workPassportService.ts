 
import { db, workPassportsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import type { WorkPassport, InsertWorkPassport } from "@workspace/db";
import { createHash } from "crypto";

export async function getWorkPassport(projectId: string, ownerUserId: string): Promise<WorkPassport | null> {
  const rows = await db
    .select()
    .from(workPassportsTable)
    .where(
      and(
        eq(workPassportsTable.projectId, projectId),
        eq(workPassportsTable.ownerUserId, ownerUserId)
      )
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function createOrUpdateWorkPassport(
  projectId: string,
  ownerUserId: string,
  data: Partial<InsertWorkPassport>
): Promise<WorkPassport> {
  const existing = await getWorkPassport(projectId, ownerUserId);

  if (existing) {
    const [updated] = await db
      .update(workPassportsTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(workPassportsTable.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(workPassportsTable)
    .values({
      projectId,
      ownerUserId,
      ...data,
    } as InsertWorkPassport)
    .returning();
  return created;
}

export async function sealWorkPassport(
  projectId: string,
  ownerUserId: string
): Promise<WorkPassport | null> {
  const passport = await getWorkPassport(projectId, ownerUserId);
  if (!passport) return null;

  const hashInput = canonicalPassportPayload(passport);
  const contentHash = createHash("sha256").update(hashInput).digest("hex");

  const [updated] = await db
    .update(workPassportsTable)
    .set({
      sealedAt: new Date(),
      contentHash,
      proofMode: passport.proofMode || "internal_hash",
      proofProvider: passport.proofProvider || "Matrice Narrative",
      proofNotes: passport.proofNotes ||
        "Empreinte SHA-256 interne creee par Matrice. Pour une preuve externe, utiliser un depot officiel ou un horodatage qualifie.",
      version: (passport.version ?? 1) + 1,
      updatedAt: new Date(),
    })
    .where(eq(workPassportsTable.id, passport.id))
    .returning();
  return updated;
}


// ---------------------------------------------------------------------------
// Certification enrichment — C2PA + OpenTimestamps + Label
// ---------------------------------------------------------------------------

export function enrichPassport(passport: WorkPassport): EnrichedWorkPassport {
  let c2paManifest: C2PAManifest | null = null;
  let otsProof: OTSProof | null = null;
  let c2paVerificationUrl: string | null = null;

  if (passport.c2paManifest) {
    try {
      c2paManifest = JSON.parse(passport.c2paManifest) as C2PAManifest;
      c2paVerificationUrl = getC2PAVerificationUrl(c2paManifest);
    } catch {
      // Invalid manifest JSON
    }
  }

  if (passport.otsProof) {
    try {
      otsProof = JSON.parse(passport.otsProof) as OTSProof;
    } catch {
      // Invalid OTS proof JSON
    }
  }

  const level = passport.certificationLevel ?? 1;
  const certificationLabel = CERTIFICATION_LABELS[level] || null;

  return {
    ...passport,
    c2paManifest,
    otsProof,
    certificationLabel,
    c2paVerificationUrl,
  };
}

/**
 * Certify a work passport with C2PA manifest + OpenTimestamps.
 * This should be called after generating or updating a passport.
 */
export async function certifyWorkPassport(
  passport: WorkPassport,
  content: string,
  author: string
): Promise<WorkPassport> {
  const aiScore = passport.aiContributionScore ?? 0.5;
  const level = calculateCertificationLevel(aiScore);

  // Generate C2PA manifest
  const c2pa = generateC2PAManifest(
    passport.officialTitle || "Oeuvre sans titre",
    author,
    content,
    aiScore
  );

  // Submit to OpenTimestamps
  const ots = await submitToOpenTimestamps(content);

  // Update passport with certification data
  const [updated] = await db
    .update(workPassportsTable)
    .set({
      certificationLevel: level,
      c2paManifest: JSON.stringify(c2pa),
      otsProof: JSON.stringify(ots),
      updatedAt: new Date(),
    })
    .where(eq(workPassportsTable.id, passport.id))
    .returning();

  return updated;
}

export function generatePassportMarkdown(passport: WorkPassport): string {
  const now = new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });

  return `# Passeport d'Œuvre — ${passport.officialTitle || "Sans titre"}

> **Document généré le ${now} via Matrice Narrative**
>
> ${passport.legalDisclaimer || "Ce document ne remplace pas un dépôt officiel."}

---

## 1. Identité de l'œuvre

| Champ | Valeur |
|-------|--------|
| **Titre officiel** | ${passport.officialTitle || "_Non défini_"} |
| **Type** | ${passport.workType || "_Non défini_"} |
| **Auteur affiché** | ${passport.displayedAuthor || "_Non défini_"} |
| **Pseudonyme** | ${passport.pseudonym || "_Non défini_"} |
| **Langue** | ${passport.language || "_Non défini_"} |
| **Pays / Culture** | ${passport.countryCulture || "_Non défini_"} |
| **Genre** | ${passport.genre || "_Non défini_"} |
| **Public cible** | ${passport.targetAudience || "_Non défini_"} |
| **Statut** | ${passport.status || "brouillon"} |

---

## 2. ADN narratif

### Logline
${passport.logline || "_Non définie_"}

### Pitch court
${passport.shortPitch || "_Non défini_"}

### Synopsis court
${passport.shortSynopsis || "_Non défini_"}

### Thèmes principaux
${(passport.mainThemes ?? []).map((t: string) => `- ${t}`).join("\n") || "_Non définis_"}

### Intention artistique
${passport.artisticIntention || "_Non définie_"}

### Originalité déclarée
${passport.declaredOriginality || "_Non définie_"}

### Risques de clichés
${(passport.clichRisks ?? []).map((c: string) => `- ${c}`).join("\n") || "_Non identifiés_"}

---

## 3. Traçabilité

| Champ | Valeur |
|-------|--------|
| **Version** | ${passport.version ?? 1} |
| **Créé le** | ${passport.createdAt ? new Date(passport.createdAt).toLocaleDateString("fr-FR") : "_Inconnu_"} |
| **Dernière mise à jour** | ${passport.updatedAt ? new Date(passport.updatedAt).toLocaleDateString("fr-FR") : "_Inconnu_"} |
| **Scellé le** | ${passport.sealedAt ? new Date(passport.sealedAt).toLocaleDateString("fr-FR") : "_Non scellé_"} |
| **Empreinte SHA-256** | ${passport.contentHash || "_Non scellée_"} |

---

## 3.b Preuve d'anteriorite

| Champ | Valeur |
|-------|--------|
| **Mode de preuve** | ${passport.proofMode || "internal_hash"} |
| **Fournisseur / registre** | ${passport.proofProvider || "Matrice Narrative"} |
| **Reference externe** | ${passport.proofExternalReference || "_Non definie_"} |
| **Date d'enregistrement externe** | ${passport.proofRegisteredAt ? new Date(passport.proofRegisteredAt).toLocaleDateString("fr-FR") : "_Non enregistree_"} |

${passport.proofNotes || "Le scellement actuel prepare une preuve interne. Pour une force probante externe, effectuer un depot officiel adapte."}

---

## 4. Dépôt et reconnaissance

### Cibles recommandées
${(passport.depositTargets ?? []).map((t: string) => `- ${t}`).join("\n") || "_Non définies_"}

### Checklist de préparation
${Object.entries(passport.depositChecklist ?? {})
  .map(([key, val]) => `- [${val ? "x" : " "}] ${key}`)
  .join("\n") || "_Vide_"}

---

*Passeport d'Œuvre — Matrice Narrative © ${new Date().getFullYear()}*
`;
}

function canonicalPassportPayload(passport: WorkPassport): string {
  return JSON.stringify({
    id: passport.id,
    projectId: passport.projectId,
    ownerUserId: passport.ownerUserId,
    officialTitle: passport.officialTitle,
    workType: passport.workType,
    displayedAuthor: passport.displayedAuthor,
    pseudonym: passport.pseudonym,
    language: passport.language,
    countryCulture: passport.countryCulture,
    genre: passport.genre,
    targetAudience: passport.targetAudience,
    status: passport.status,
    logline: passport.logline,
    shortPitch: passport.shortPitch,
    shortSynopsis: passport.shortSynopsis,
    mainThemes: passport.mainThemes,
    artisticIntention: passport.artisticIntention,
    declaredOriginality: passport.declaredOriginality,
    clichRisks: passport.clichRisks,
    depositTargets: passport.depositTargets,
    depositChecklist: passport.depositChecklist,
    proofMode: passport.proofMode,
    proofProvider: passport.proofProvider,
    proofExternalReference: passport.proofExternalReference,
    proofNotes: passport.proofNotes,
    legalDisclaimer: passport.legalDisclaimer,
    version: passport.version,
  });
}
