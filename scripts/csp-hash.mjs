// Calcula el hash SHA-256 de los scripts en línea que genera Expo, para la
// Content-Security-Policy de deploy/nginx/snippets/security-headers.conf.
// Uso: npm run export:web && node scripts/csp-hash.mjs
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../apps/mobile/dist/', import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/,
  '$1',
);

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* htmlFiles(path);
    else if (name.endsWith('.html')) yield path;
  }
}

const hashes = new Set();
for (const file of htmlFiles(dist)) {
  const html = readFileSync(file, 'utf8');
  for (const [, code] of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    hashes.add(`'sha256-${createHash('sha256').update(code).digest('base64')}'`);
  }
}
console.log([...hashes].join(' ') || 'No hay scripts en línea');
