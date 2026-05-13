import { db, workPassportsTable, projectsTable } from "@workspace/db";
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

  const hashInput = `${passport.id}:${passport.projectId}:${passport.ownerUserId}:${passport.officialTitle}:${passport.updatedAt?.toISOString() ?? ""}`;
  const contentHash = createHash("sha256").update(hashInput).digest("hex");

  const [updated] = await db
    .update(workPassportsTable)
    .set({
      sealedAt: new Date(),
      contentHash,
      version: (passport.version ?? 1) + 1,
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
