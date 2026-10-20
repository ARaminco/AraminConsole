#!/usr/bin/env node
/* Checks that relative links in README*.md, docs/*.md, AGENTS.md and starters/skills READMEs resolve.  node scripts/check-links.mjs */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? (f === 'node_modules' ? [] : walk(p)) : [p]; });
const files = [...walk(ROOT).filter((p) => p.endsWith('.md') && !/node_modules|CHANGELOG|\/demo\//.test(p.split('\\').join('/')))];
let bad = 0;
for (const f of files) {
  const md = readFileSync(f, 'utf8').replace(/```[\s\S]*?```/g, '');
  for (const m of md.matchAll(/\]\(([^)\s]+)\)/g)) {
    const t = m[1].split('#')[0];
    if (!t || /^(https?:|mailto:|#)/.test(t)) continue;
    if (!existsSync(resolve(dirname(f), t))) { console.log(`BROKEN ${f.slice(ROOT.length + 1)} -> ${m[1]}`); bad++; }
  }
}
console.log(bad ? `${bad} broken link(s)` : `all relative links resolve (${files.length} files)`);
process.exit(bad ? 1 : 0);
