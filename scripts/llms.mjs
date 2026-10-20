#!/usr/bin/env node
/* Generates llms.txt (llmstxt.org index) and llms-full.txt (all docs concatenated) at the repo root.
   node scripts/llms.mjs        (also: npm run llms) */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = 'https://raw.githubusercontent.com/ARaminco/AraminConsole/main/';
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const title = (md, fallback) => (md.match(/^#\s+(.+)$/m) || [, fallback])[1].trim();
const blurb = (md) => {
  const para = md.replace(/^#.*$/m, '').split(/\n\s*\n/).map((s) => s.trim())
    .find((s) => s && !s.startsWith('|') && !s.startsWith('```') && !s.startsWith('<') && !s.startsWith('!'));
  return (para || '').replace(/\s+/g, ' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[`*]/g, '').slice(0, 160);
};

const docs = readdirSync(join(ROOT, 'docs')).filter((f) => f.endsWith('.md')).sort();
const docEntries = docs.map((f) => ({ path: `docs/${f}`, md: read(`docs/${f}`) }));
const extras = [
  { path: 'AGENTS.md', note: 'Operating guide for AI coding assistants: architecture, conventions, commands' },
  { path: 'skills/aramin-console/SKILL.md', note: 'Agent Skill: component cheat-sheet and recipes for building admin panels' },
  ...['html', 'laravel-blade', 'nextjs'].map((s) => ({ path: `starters/${s}/README.md`, note: `Starter project: ${s}` })),
  { path: 'skills/aramin-design-system/SKILL.md', note: 'Agent Skill: design-system rules, token cheat-sheet and review checklist' },
  { path: 'docs/design-system/README.md', note: 'Design system (Persian): principles, tokens, patterns, components; tokens in dist/tokens.json' },
  { path: 'docs/skills-guide.md', note: 'How to install and use the AraminConsole skills (Claude, Codex, Cursor, Copilot)' },
  { path: 'CONTRIBUTING.md', note: 'How to contribute' },
  { path: 'CHANGELOG.md', note: 'Release history' },
].filter((e) => existsSync(join(ROOT, e.path)));
const refDir = join(ROOT, 'skills/aramin-console/reference');
if (existsSync(refDir)) for (const f of readdirSync(refDir).filter((x) => x.endsWith('.md')).sort()) extras.push({ path: `skills/aramin-console/reference/${f}`, note: 'Skill reference' });

const line = (p, t, n) => `- [${t}](${RAW}${p})${n ? `: ${n}` : ''}`;

const index = [
  `# AraminConsole`,
  ``,
  `> ${pkg.description} Version ${pkg.version}. MIT licensed. Live demo: ${pkg.homepage}`,
  ``,
  `Use one CSS file and one ES module (copy \`dist/\`). Components start from \`data-ac="name"\` attributes and have APIs on \`window.AC\`. Styling uses \`--ac-*\` design tokens and CSS logical properties. Powered by AIR (https://air.co.ir/).`,
  ``,
  `## Start here`,
  line('README.md', 'README', 'Overview, quick start, module matrix'),
  ...extras.slice(0, 2).map((e) => line(e.path, title(read(e.path), e.path), e.note)),
  ``,
  `## Documentation`,
  ...docEntries.map((d) => line(d.path, title(d.md, d.path), blurb(d.md))),
  ``,
  `## Starters and skill`,
  ...extras.slice(2).filter((e) => !/CONTRIBUTING|CHANGELOG/.test(e.path)).map((e) => line(e.path, title(read(e.path), e.path), e.note)),
  ``,
  `## Optional`,
  ...extras.filter((e) => /CONTRIBUTING|CHANGELOG/.test(e.path)).map((e) => line(e.path, title(read(e.path), e.path), e.note)),
  line('llms-full.txt', 'Full documentation in one file', 'README, AGENTS.md, skill and all docs concatenated'),
  ``,
].join('\n');
writeFileSync(join(ROOT, 'llms.txt'), index);

const all = ['README.md', 'AGENTS.md', 'skills/aramin-console/SKILL.md', 'skills/aramin-design-system/SKILL.md', 'docs/design-system/README.md', 'docs/skills-guide.md', ...docEntries.map((d) => d.path),
  ...extras.filter((e) => e.path.startsWith('skills/aramin-console/reference') || e.path.startsWith('starters/')).map((e) => e.path)]
  .filter((p) => existsSync(join(ROOT, p)));
const full = all.map((p) => `\n\n<!-- ===== ${p} ===== -->\n\n${read(p).trim()}`).join('');
writeFileSync(join(ROOT, 'llms-full.txt'), `# AraminConsole ${pkg.version} — full documentation\n${full}\n`);
console.log(`llms.txt (${docEntries.length} docs) and llms-full.txt (${all.length} files, ${Math.round(full.length / 1024)} KB)`);
