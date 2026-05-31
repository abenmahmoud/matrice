import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { once } from "node:events";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(root, "public", "index.html");

test("essuf.fr portal serves the company page and product links", async () => {
  const html = await readFile(indexPath, "utf8");
  const server = createServer((req, res) => {
    if (req.url === "/healthz") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok\n");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  try {
    const address = server.address();
    assert.equal(typeof address, "object");
    assert.ok(address);
    const response = await fetch(`http://127.0.0.1:${address.port}/`);
    assert.equal(response.status, 200);
    const body = await response.text();
    assert.match(body, /Essuf-Group/);
    assert.match(body, /https:\/\/matrice\.essuf\.fr/);
    assert.match(body, /https:\/\/sign\.essuf\.fr/);
    assert.doesNotMatch(body, /\b(?:IBAN|BIC|RIB)\b/i);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
});
