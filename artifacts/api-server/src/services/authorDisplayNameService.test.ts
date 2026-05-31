import assert from "node:assert/strict";
import test from "node:test";
import { resolveAuthorDisplayName, resolveExportAuthorName } from "./authorDisplayNameService.js";

test("resolveAuthorDisplayName persists the project pen name when provided", () => {
  assert.equal(resolveAuthorDisplayName({ projectAuthorDisplayName: " Leïla A. ", userDisplayName: "Adel" }), "Leïla A.");
});

test("resolveAuthorDisplayName falls back to displayName then email", () => {
  assert.equal(resolveAuthorDisplayName({ projectAuthorDisplayName: "", userDisplayName: "Adel" }), "Adel");
  assert.equal(resolveAuthorDisplayName({ projectAuthorDisplayName: " ", userDisplayName: "", userEmail: "auteur@example.com" }), "auteur@example.com");
});

test("resolveExportAuthorName injects the project pen name into export metadata", () => {
  assert.equal(
    resolveExportAuthorName({
      pseudonym: "",
      passportDisplayedAuthor: "",
      projectAuthorDisplayName: "Nora Safir",
      userDisplayName: "Compte Matrice",
    }),
    "Nora Safir",
  );
});

test("resolveExportAuthorName keeps passport pseudonym priority", () => {
  assert.equal(
    resolveExportAuthorName({
      pseudonym: "Nom de plume officiel",
      passportDisplayedAuthor: "Ancien auteur",
      projectAuthorDisplayName: "Nora Safir",
      userDisplayName: "Compte Matrice",
    }),
    "Nom de plume officiel",
  );
});

test("resolveExportAuthorName falls back to passport displayed author when project pen name is empty", () => {
  assert.equal(
    resolveExportAuthorName({
      pseudonym: "",
      passportDisplayedAuthor: "Auteur du passeport",
      projectAuthorDisplayName: "",
      userDisplayName: "Compte Matrice",
    }),
    "Auteur du passeport",
  );
});
