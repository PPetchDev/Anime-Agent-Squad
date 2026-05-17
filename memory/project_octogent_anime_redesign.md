---
name: octogent-anime-redesign
description: Active redesign — Octogent UI gets a Magical Mecha (anime mecha-HUD × magical-girl hybrid) re-skin. Scope is re-skin only, no feature changes.
metadata:
  type: project
---

User is taking the Octogent operator UI and giving it a full anime visual overhaul. Direction locked as of 2026-05-18: **Magical Mecha** — mecha cockpit/HUD bones (sync ratios, panel borders, monospace metric tiles, scan lines, target reticles) with magical-girl skin (pastel rose/lavender/mint palette, sparkles ✦✧, kawaii character cards, serif italic display type, "spell/mana/cast" vocabulary for agents).

**Why:** User picked the bold hybrid over the safe single-genre options. They want creative/expressive over safe-technical. The agents are already framed as anime characters (Mika, Yuki, Hana) so leaning into character-driven framing fits the existing system.

**How to apply:**
- This is **re-skin only**: change CSS tokens, palette, typography, visual treatment. Do NOT remove tabs, components, dialogs, behaviors, routing, or API contracts. User flagged this concern explicitly — every existing surface gets re-skinned, none get cut.
- Preserve the modular CSS structure (`src/styles/foundation.css`, `console-theme-tokens.css`, per-canvas files) — change tokens, not the file architecture.
- Keep terminal output readable: `JetBrains Mono` mono + dark background stays; only accent colors, prompt char, status pills get the magical-mecha treatment.
- Surfaces to re-skin (all 8+ primary nav tabs and their canvases, sidebars, dialogs, character system, empty states, telemetry tape, runtime status strip) — full inventory in spec at `docs/superpowers/specs/2026-05-18-...`.
- The brainstorming visual companion runs at `localhost:5xxxx` from `.superpowers/brainstorm/<session>/` — those HTML files are *mockups for the design conversation*, not the production UI.

Related: [[user-aesthetic-preference]]
