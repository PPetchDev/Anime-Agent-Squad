<div align="center">

# ✦ Anime Agent Squad ✧

**Multi-agent terminal orchestration, re-skinned in pastel-mecha starlight.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-c8a8e8?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-a8f0c8?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Aesthetic](https://img.shields.io/badge/aesthetic-magical%20mecha-ffd8ec?style=flat-square)](#the-magical-mecha-re-skin)

</div>

---

Running ten coding agents in parallel shouldn't feel like juggling ten identical black rectangles. **Anime Agent Squad** dresses every terminal column in a magical-mecha HUD — corner brackets, kana labels, a `SYNC` ratio bar on each character, and a soft lock indicator that whispers `CASTING` / `PERMISSION` / `AWAITING` when an agent is mid-flight. Underneath the costume it is still a real orchestrator: scoped tentacle context, `todo.md` execution surface, multi-PTY runtime, worktree isolation, inter-agent messaging.

The point isn't to hide the agents behind decoration. The point is to give multi-agent work a visual rhythm you can actually read at a glance.

## The Magical Mecha Re-skin

This fork keeps the underlying multi-agent runtime intact and replaces every visible surface with a Symphogear-inspired aesthetic:

- **Palette** — dark cosmic backdrop, rose / lavender / mint pastels, technical orange for warnings
- **HUD frames** — corner-bracketed panels with kana labels (`アクティブ`, `モニター`, `エラー`) on key surfaces
- **Sparkle constellations** — ✦ / ✧ glyphs that drift across empty states and primary chrome
- **Sync rings** — character avatars now expose `syncRatio` and `bondTraits` so the operator UI can show pilot↔mech bond at a glance
- **Lock indicators** — terminal headers light up with `CASTING` (mint, mid-spell) / `PERMISSION` (warning, waiting for approval) / `AWAITING` (warning, waiting for human input)
- **Reduced-motion safe** — every animation respects `prefers-reduced-motion: reduce`

All re-skin work lives in `apps/web/src/styles/magicalmecha-*.css` as reusable CSS primitives (HUD frame, sparkle layer, sync ring, scanline overlay, motion keyframes) so future surfaces can opt in by adding a className — no JSX rewrites required.

## What the Squad Actually Does

- **Tentacles as context layers** — each agent gets a scoped folder under `.octogent/tentacles/<id>/` with `CONTEXT.md`, `todo.md`, and handoff notes
- **`todo.md` as execution surface** — checkbox items become delegatable work units
- **Multi-terminal runtime** — coordinate several Claude Code sessions from one operator UI
- **Child agent spawning** — turn a todo item into a worker agent with its own scoped context
- **Inter-agent messaging** — workers and coordinators report completion, blockers, and handoff notes
- **Local API + WebSocket transport** — terminal lifecycle, persistence, monitor stream
- **Optional worktree isolation** — agents that touch the tree can run under `.octogent/worktrees/<id>/` on isolated branches

A **tentacle** is a folder. An **agent** is a PTY session attached to a tentacle. Several agents can share one tentacle during swarm work. The metaphor stays literal: one squad, many tentacles, different missions running in parallel.

## Quick Start

```bash
pnpm install
pnpm dev
```

This starts the API and web app for local development. The first run creates the local `.octogent/` scaffold, assigns a stable project ID, picks an available local API port starting at `8787`, and opens the UI unless `OCTOGENT_NO_OPEN=1` is set.

### Local global CLI install from a clone

```bash
pnpm install
pnpm build
npm install -g .
octogent
```

## Requirements

- Node.js `22+`
- `claude` installed for the supported agent workflow
- `git` for worktree terminals
- `gh` for GitHub pull request features
- `curl` for the current Claude hook callback flow

Startup fails if neither `claude` nor another supported provider binary is installed.

## What Persists

- `.octogent/` keeps project-local scaffold and worktrees
- `~/.octogent/projects/<project-id>/state/` keeps runtime state, transcripts, monitor cache, and metadata
- `.octogent/tentacles/<tentacle-id>/` keeps the context files and todos that agents read

PTY sessions survive browser reloads during the idle grace period, but they do **not** survive an API restart. Previously running terminal records are marked `stale` on startup when they cannot be reattached; use `octogent terminal list`, `stop`, `kill`, and `prune` to inspect and clean them up. Live PTY sessions are capped at 32 by default — tune `OCTOGENT_MAX_TERMINAL_SESSIONS` for larger orchestration runs.

## Docs

- [Docs Home](docs/index.md)
- [Installation](docs/getting-started/installation.md)
- [Quickstart](docs/getting-started/quickstart.md)
- [Mental Model](docs/concepts/mental-model.md)
- [Tentacles](docs/concepts/tentacles.md)
- [Runtime and API](docs/concepts/runtime-and-api.md)
- [Working With Todos](docs/guides/working-with-todos.md)
- [Orchestrating Child Agents](docs/guides/orchestrating-child-agents.md)
- [Inter-Agent Messaging](docs/guides/inter-agent-messaging.md)
- [CLI Reference](docs/reference/cli.md)
- [Filesystem Layout](docs/reference/filesystem-layout.md)
- [API Reference](docs/reference/api.md)
- [Experimental Features](docs/reference/experimental-features.md)
- [Troubleshooting](docs/reference/troubleshooting.md)

The magical-mecha CSS primitives are documented in [apps/web/AGENTS.md](apps/web/AGENTS.md) under "Magical Mecha Pattern Primitives".

## Credits

The underlying multi-agent orchestration runtime — tentacles, PTY session model, worktree lifecycle, monitor service, inter-agent messaging — comes from [**Octogent**](https://github.com/hesamsheikh/octogent) by [@hesamsheikh](https://github.com/hesamsheikh). The magical-mecha re-skin (palette, HUD primitives, sync rings, lock indicators, every `magicalmecha-*` module, plus the `CharacterAvatar` sync-ratio props and `TerminalLockIndicator` component) is the contribution of this fork.

If you want the upstream operator experience without the anime layer, use Octogent directly. If you want pastel terminals that announce when they are casting a spell, you are in the right repo.
