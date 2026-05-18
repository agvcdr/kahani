# Restaurant Website Repo Skeleton for Claude Code

This repository is a no-source-code structure for planning and building a small restaurant website with Claude Code.

Goals:
- Mobile-first, highly responsive layout
- Cross-browser compatibility across Chromium, Firefox, and WebKit/Safari
- Modular menu data so items, prices, dietary tags, allergens, modifiers, and specials can be added or updated without editing page layout code
- Clear Claude Code project memory, project skills, and specialized subagents
- Local testing structure for accessibility, visual regression, responsive behavior, performance, and end-to-end flows

Recommended implementation target:
- Static or hybrid site framework such as Astro, Next.js, or Vite-based React
- TypeScript for content validation once code is added
- Content-driven menu files in `src/content/menu/`
- Automated browser checks in `tests/`

No application source code is included. Directories contain `.gitkeep` files so the structure is preserved in Git.

## Claude Code entry points

- `CLAUDE.md` - project-level instructions Claude Code reads at startup
- `AGENTS.md` - shared agent instructions imported by `CLAUDE.md`
- `.claude/agents/` - project subagents for architecture, UX, menu data, QA, accessibility, SEO, and performance
- `.claude/skills/` - project skills for repeatable workflows such as menu updates, responsive reviews, local testing, and release checks
- `.claude/rules/` - focused project rules Claude can consult for specific concerns

## Suggested first Claude Code prompt

After unzipping this skeleton and opening it in Claude Code, start with:

```text
Read CLAUDE.md and AGENTS.md. Use the site-architect agent and restaurant-requirements skill to turn this skeleton into an implementation plan for a small restaurant website. Do not write source code yet. Produce the framework choice, content model, component map, and local testing plan.
```

## Repository map

```text
.claude/              Claude Code project config, agents, skills, and rules
src/                  Future website source structure, currently placeholders only
public/               Future static assets served as-is
config/               Future project configuration notes
scripts/              Future local utility scripts
suite tests/          Future browser, accessibility, visual, and performance checks
docs/                 Architecture, content model, QA, and workflow documentation
.github/workflows/    Future CI workflow placeholders
```
