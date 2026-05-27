import test from "node:test";
import assert from "node:assert/strict";
import { generateMandatePdf } from "./mandatePdfService.js";

test("generateMandatePdf creates a readable PDF buffer", async () => {
  const pdf = await generateMandatePdf({
    level: "advanced",
    commissionPercent: 15,
    durationMonths: 12,
    territories: ["monde"],
    exclusivity: false,
    author: {
      fullName: "BraveHeart",
      email: "am.ad.bm@gmail.com",
    },
    project: {
      title: "Projet test",
      pitch: "Un roman de test pour verifier le mandat.",
      genre: "roman",
    },
    mandataire: {
      name: "ESSUF-GROUP SAS",
      siret: "En cours d'immatriculation",
      representative: "Adel BENMAHMOUD, President",
      address: "Drancy, France",
    },
  });

  assert.ok(pdf.length > 1_000);
  assert.equal(pdf.subarray(0, 4).toString("utf8"), "%PDF");
});
