# Skills guide

AraminConsole ships two Agent Skills (Persian guide: [skills-guide.fa.md](skills-guide.fa.md)):

| Skill | Folder | Use for |
|---|---|---|
| `aramin-console` | `skills/aramin-console/` | Building: markup, classes, `data-ac` components, APIs, recipes |
| `aramin-design-system` | `skills/aramin-design-system/` | Designing and reviewing: tokens, patterns, RTL rules, Persian UX copy, review checklist |

A skill is a folder with a `SKILL.md` (YAML `name` + `description`). The assistant always sees the description and loads the full text only when the task matches.

## Claude Code
Project-level (recommended) or user-level:
```bash
mkdir -p .claude/skills && cp -r AraminConsole/skills/aramin-console AraminConsole/skills/aramin-design-system .claude/skills/
# all projects: ~/.claude/skills/
```
```powershell
New-Item -ItemType Directory -Force .claude\skills | Out-Null
Copy-Item -Recurse AraminConsole\skills\aramin-console, AraminConsole\skills\aramin-design-system .claude\skills\
```
Restart Claude Code; check with `/skills`.

## Claude.ai / Desktop
Zip each skill folder (the folder itself inside the zip), then Settings -> Capabilities -> Skills -> Upload skill.

## Codex, Cursor, Copilot
No skill format: feed the same text as project instructions. Codex reads `AGENTS.md` (this repo has one; add a line pointing to `skills/aramin-design-system/SKILL.md`). Cursor: put the `SKILL.md` body in `.cursor/rules/aramin-design-system.mdc`. Copilot: append to `.github/copilot-instructions.md`.

## llms.txt
Give the assistant `https://raw.githubusercontent.com/ARaminco/AraminConsole/main/llms.txt` (index) or `llms-full.txt` (everything; large).

## Keeping skills current
Copies do not update themselves: `git pull` the repo and copy the folders again whenever you upgrade AraminConsole. The design skill's token facts come from `src/css/tokens.css`; `npm run tokens` regenerates `docs/design-system/tokens.md` and `dist/tokens.json`.

## Example prompts
- "Using AraminConsole, build a user-management page: table with search and status filter, a New user modal, confirm before delete. RTL and mobile."
- "Review this page against the AraminConsole design system and list issues with line numbers."
- "Create a brand preset for accent `#0e9f6e` and check contrast in light and dark."
