import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = await readFile(path.join(root, "public", "index.html"), "utf8");

const required = [
  "Essuf-Group",
  "https://matrice.essuf.fr",
  "https://sign.essuf.fr",
  "https://www.safescol.fr",
  "105 453 864",
  "contact@essuf.fr",
  "47 Rue Vivienne",
];

const missing = required.filter((value) => !html.includes(value));
if (missing.length) {
  throw new Error(`Missing required portal content: ${missing.join(", ")}`);
}

if (/\b(?:IBAN|BIC|RIB)\b/i.test(html)) {
  throw new Error("Sensitive banking information must not appear on the portal.");
}

console.log("Essuf portal static validation OK");
