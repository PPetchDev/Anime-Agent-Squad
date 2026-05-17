# Octogent Magical Mecha Re-skin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the Octogent operator UI (`apps/web`) as Magical Mecha — mecha cockpit/HUD bones with magical-girl pastel skin — without changing any behavior, route, prop contract, or component shape.

**Architecture:** Token swap at `foundation.css` cascades the Symphogear palette across the entire app. Five new CSS modules under `apps/web/src/styles/magicalmecha-*.css` provide reusable patterns (sparkle, HUD frame, sync ring, scanline, motion). Each existing CSS module is edited to consume the new tokens and apply patterns. Four small, conditional JSX touches add sync-ring rendering, lock indicators, and prompt styling. All animation gated on `prefers-reduced-motion`.

**Tech Stack:** Vite + React + TypeScript + Vitest, CSS variables, `@octogent/core` for domain types, JetBrains Mono / Playfair Display / Noto Sans JP.

**Pre-flight:**
- Repo is currently not a git repository — run `git init && git add -A && git commit -m "chore: snapshot before magical-mecha re-skin"` once before starting, so the commit steps below have somewhere to land. If the user prefers no version control, replace each `git commit` step with a manual "checkpoint" note.
- Reference spec: `docs/superpowers/specs/2026-05-18-octogent-magicalmecha-design.md`
- Install: `pnpm install` (already done if `node_modules/` exists)
- Dev server: `pnpm dev` (used for visual verification)
- Tests: `pnpm test` (vitest, must stay green throughout)

---

## File Structure

### Files edited (existing)

```
apps/web/src/styles/
├── foundation.css                    palette + typography token override
├── console-theme-tokens.css          console-specific token override
├── styles.css                        import manifest (add 5 new imports)
├── chrome-and-buttons.css            HUD buttons, pill restyle
├── sidebar-and-scrollbars.css        glow border, character card frame
├── terminal-and-status.css           pastel prompt, lock indicator slot
├── character.css                     sync ring + bond trait classes
├── console-chrome-status-nav.css     primary nav + status strip restyle
├── console-canvas-canvas.css         canvas tab re-skin
├── console-canvas-activity.css       activity tab re-skin
├── console-canvas-deck.css           deck tab re-skin
├── console-canvas-github.css         github tab re-skin
├── console-canvas-monitor.css        monitor tab re-skin
├── console-canvas-conversations.css  conversations tab re-skin
├── console-canvas-settings.css       settings tab re-skin
├── console-canvas-prompts.css        prompts tab re-skin
├── console-canvas-code-intel.css     code intel tab re-skin
└── console-overrides-telemetry.css   telemetry tape restyle

apps/web/src/components/
├── character/CharacterAvatar.tsx     add optional syncRatio, bondTraits props
└── Terminal.tsx                      lock indicator slot (reads agent state)

apps/web/src/components/ui/
└── StatusBadge.tsx                   no JSX change — restyled via CSS

apps/web/AGENTS.md                    document new pattern primitives
```

### Files added (new)

```
apps/web/src/styles/
├── magicalmecha-motion.css           shared keyframes + reduced-motion guard
├── magicalmecha-sparkle.css          ✦ sparkle pseudo-element layer
├── magicalmecha-hud-frame.css        HUD frame + corner brackets + kana label
├── magicalmecha-sync-ring.css        rotating dashed ring + sync bar
└── magicalmecha-scanline.css         scan-line overlay

apps/web/tests/
├── CharacterAvatar.test.tsx          syncRatio / bondTraits / reduced-motion
└── Terminal.lockIndicator.test.tsx   lock indicator state mapping
```

---

# Phase 0 · Foundation tokens (~1 day)

## Task 0.1: Replace Symphogear palette in `foundation.css`

**Files:**
- Modify: `apps/web/src/styles/foundation.css`

- [ ] **Step 1: Replace the entire `:root` block**

Open `apps/web/src/styles/foundation.css`. Replace the file with:

```css
@import url("https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,800&family=Noto+Sans+JP:wght@400;500&display=swap");

:root {
  /* Base surfaces — Symphogear dark cosmic */
  --bg-canvas: #0a0814;
  --bg-surface-1: #110a1f;
  --bg-surface-2: #1a1230;
  --bg-surface-3: #261a44;

  /* Borders & rings */
  --border-subtle: rgba(255, 216, 236, 0.18);
  --border-strong: rgba(255, 216, 236, 0.45);
  --ring-focus: #ffd8ec;

  /* Magical pastel triad */
  --text-primary: #f5eef8;
  --text-secondary: #c9b8d8;
  --text-muted: #8a7a9c;

  --accent-primary: #ffd8ec;
  --accent-secondary: #c8a8e8;
  --accent-mint: #a8f0c8;
  --accent-warning: #ff8c42;
  --accent-danger: #ff5f7a;

  /* Backward-compat: existing token names mapped to new values */
  --term-red: var(--accent-danger);
  --term-green: var(--accent-mint);
  --term-blue: #5fc4ff;
  --term-warning: var(--accent-warning);

  /* Sidebar tokens — keep existing names, recolor through new accents */
  --sidebar-canvas: color-mix(in srgb, var(--bg-surface-1) 84%, #1a1335 16%);
  --sidebar-panel: color-mix(in srgb, var(--bg-surface-1) 78%, #221a44 22%);
  --sidebar-card: color-mix(in srgb, var(--bg-surface-1) 82%, #1e1638 18%);
  --sidebar-header: color-mix(in srgb, var(--bg-surface-2) 72%, #2a1f4a 28%);
  --sidebar-row: color-mix(in srgb, var(--bg-surface-1) 88%, #181030 12%);
  --sidebar-row-hover: color-mix(in srgb, var(--sidebar-row) 76%, #2c1f50 24%);
  --sidebar-row-active: color-mix(in srgb, var(--sidebar-row) 62%, #3a2a66 38%);
  --sidebar-border: var(--border-subtle);
  --sidebar-border-strong: var(--border-strong);
  --sidebar-text-muted: var(--text-muted);

  /* Terminal — keep dark, recolor accents */
  --terminal-bg: #06030f;
  --terminal-header-bg-top: #1f1338;
  --terminal-header-bg-bottom: #160c2a;
  --terminal-header-text: var(--text-primary);
  --terminal-scrollbar-track: color-mix(in srgb, var(--terminal-bg) 88%, #0f0822 12%);
  --terminal-scrollbar-thumb: color-mix(in srgb, var(--accent-primary) 34%, var(--terminal-bg) 66%);
  --terminal-scrollbar-thumb-hover: color-mix(
    in srgb,
    var(--accent-primary) 44%,
    var(--terminal-bg) 56%
  );
  --terminal-scrollbar-thumb-active: color-mix(
    in srgb,
    var(--accent-primary) 54%,
    var(--terminal-bg) 46%
  );

  /* Glows — magical-mecha signature */
  --glow-soft: 0 0 12px rgba(255, 216, 236, 0.35);
  --glow-strong: 0 0 20px rgba(255, 216, 236, 0.6);
  --glow-warning: 0 0 12px rgba(255, 140, 66, 0.5);
  --glow-mint: 0 0 12px rgba(168, 240, 200, 0.5);

  /* Typography */
  --font-display: "Playfair Display", Georgia, "Times New Roman", serif;
  --font-main: "PP Neue Machina Plain", "PP Neue Machina", "JetBrains Mono", "IBM Plex Mono",
    monospace;
  --font-mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
  --font-kana: "Noto Sans JP", sans-serif;
  --control-font-family: var(--font-main);
  --control-letter-spacing: 0.06em;
  --control-line-height: 1.2;
  --ui-base-font-size: 18px;

  /* Backward-compat control tokens */
  --control-border-strong: var(--border-strong);
  --control-bg-strong: var(--bg-surface-1);

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 999px;

  /* Effects */
  --scanline-overlay: repeating-linear-gradient(
    0deg,
    transparent 0,
    transparent 2px,
    rgba(255, 216, 236, 0.025) 2px,
    rgba(255, 216, 236, 0.025) 3px
  );
  --sparkle-z-index: 1;

  /* Scrollbar — keep size, recolor via accent tokens */
  --scrollbar-size: 10px;
  --scrollbar-track: color-mix(in srgb, var(--bg-surface-1) 88%, #0f0822);
  --scrollbar-thumb: color-mix(in srgb, var(--accent-primary) 38%, var(--border-subtle) 62%);
  --scrollbar-thumb-hover: color-mix(in srgb, var(--accent-primary) 54%, var(--border-subtle) 46%);
  --scrollbar-thumb-active: color-mix(in srgb, var(--accent-primary) 68%, var(--border-subtle) 32%);
  --terminal-column-min-width: 370px;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  height: 100%;
  min-height: 100%;
}

html {
  font-size: var(--ui-base-font-size);
}

body {
  font-family: var(--font-main);
  background: radial-gradient(circle at top right, #1a0f2e 0%, var(--bg-canvas) 50%);
  color: var(--text-primary);
  overflow: hidden;
}

.page {
  height: 100vh;
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  min-width: 0;
  overflow: hidden;
}

.workspace-shell {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  min-width: 0;
  overflow: hidden;
}

.workspace-shell--full {
  grid-template-columns: 1fr;
}
```

- [ ] **Step 2: Visual smoke test**

Run `pnpm dev` (or keep it running). Open the app in browser. Verify:
- App loads, no JS console errors
- Body background reads as deep cosmic purple/dark
- Text is readable (light pinkish-white on dark)
- Existing layout intact — sidebar, primary nav, terminal columns visible

Expected: A "paint job" effect — colors changed, structure intact. Some surfaces may look mismatched (amber accents replaced by pink) — this is fine; later phases fix surface-level treatments.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/styles/foundation.css
git commit -m "feat(web): swap foundation tokens to Symphogear palette"
```

## Task 0.2: Reconcile `console-theme-tokens.css` with the new palette

**Files:**
- Modify: `apps/web/src/styles/console-theme-tokens.css`

- [ ] **Step 1: Replace the file**

Open `apps/web/src/styles/console-theme-tokens.css`. Replace its contents with:

```css
:root {
  /* Console-specific overrides — inherit from foundation, sharpen for canvas-heavy views */
  --console-bg: var(--bg-canvas);
  --console-panel: var(--bg-surface-1);
  --console-panel-raised: var(--bg-surface-2);
  --console-accent: var(--accent-primary);
  --console-accent-secondary: var(--accent-secondary);
  --console-text: var(--text-primary);
  --console-text-muted: var(--text-secondary);
  --console-border: var(--border-subtle);
  --console-border-strong: var(--border-strong);
  --console-glow: var(--glow-soft);
}

body {
  background:
    radial-gradient(ellipse at 18% 0%, rgba(255, 216, 236, 0.06) 0%, transparent 45%),
    radial-gradient(ellipse at 82% 100%, rgba(168, 139, 250, 0.05) 0%, transparent 45%),
    radial-gradient(circle at top right, #1a0f2e 0%, var(--bg-canvas) 50%);
}
```

- [ ] **Step 2: Visual smoke**

Reload the app. Verify body now has two subtle pastel glow halos in the top-left and bottom-right corners.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/styles/console-theme-tokens.css
git commit -m "feat(web): refresh console theme tokens to magical-mecha aliases"
```

---

# Phase 1 · Pattern library (~2–3 days)

## Task 1.1: Create `magicalmecha-motion.css` (shared keyframes + reduced-motion guard)

**Files:**
- Create: `apps/web/src/styles/magicalmecha-motion.css`

- [ ] **Step 1: Write the file**

Create `apps/web/src/styles/magicalmecha-motion.css`:

```css
/* Shared keyframes for all magical-mecha animations.
   prefers-reduced-motion is honored by the global guard at the bottom. */

@keyframes mm-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes mm-drift {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.55;
  }
  50% {
    transform: translateY(-3px) scale(1.08);
    opacity: 1;
  }
}

@keyframes mm-pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 8px rgba(168, 240, 200, 0.3);
  }
  50% {
    box-shadow: 0 0 16px rgba(168, 240, 200, 0.6);
  }
}

@keyframes mm-pulse-warning {
  0%,
  100% {
    box-shadow: 0 0 8px rgba(255, 140, 66, 0.3);
  }
  50% {
    box-shadow: 0 0 16px rgba(255, 140, 66, 0.6);
  }
}

@keyframes mm-fade-in {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/styles/magicalmecha-motion.css
git commit -m "feat(web): add magical-mecha motion keyframes + reduced-motion guard"
```

## Task 1.2: Create `magicalmecha-hud-frame.css`

**Files:**
- Create: `apps/web/src/styles/magicalmecha-hud-frame.css`

- [ ] **Step 1: Write the file**

Create `apps/web/src/styles/magicalmecha-hud-frame.css`:

```css
/* HUD frame — corner-bracketed panel border with optional kana label.
   Usage:
     <div class="mm-hud-frame">
       <span class="mm-hud-frame__label">アクティブ</span>
       <!-- content -->
     </div>
*/

.mm-hud-frame {
  position: relative;
  padding: 14px;
  border: 1px solid var(--border-subtle);
  background: rgba(255, 216, 236, 0.02);
  border-radius: var(--radius-md);
}

.mm-hud-frame::before,
.mm-hud-frame::after {
  content: "";
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: var(--accent-primary);
  border-style: solid;
  pointer-events: none;
}

.mm-hud-frame::before {
  top: -1px;
  left: -1px;
  border-width: 2px 0 0 2px;
  border-top-left-radius: var(--radius-md);
}

.mm-hud-frame::after {
  top: -1px;
  right: -1px;
  border-width: 2px 2px 0 0;
  border-top-right-radius: var(--radius-md);
}

.mm-hud-frame > .mm-hud-frame__corner-bl,
.mm-hud-frame > .mm-hud-frame__corner-br {
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: var(--accent-primary);
  border-style: solid;
  pointer-events: none;
}

.mm-hud-frame > .mm-hud-frame__corner-bl {
  bottom: -1px;
  left: -1px;
  border-width: 0 0 2px 2px;
  border-bottom-left-radius: var(--radius-md);
}

.mm-hud-frame > .mm-hud-frame__corner-br {
  bottom: -1px;
  right: -1px;
  border-width: 0 2px 2px 0;
  border-bottom-right-radius: var(--radius-md);
}

.mm-hud-frame__label {
  position: absolute;
  top: -8px;
  left: 14px;
  padding: 0 6px;
  background: var(--bg-surface-1);
  font-family: var(--font-kana);
  font-size: 10px;
  letter-spacing: 3px;
  color: var(--accent-primary);
  pointer-events: none;
}

.mm-hud-frame--warning {
  border-color: rgba(255, 140, 66, 0.4);
}

.mm-hud-frame--warning::before,
.mm-hud-frame--warning::after,
.mm-hud-frame--warning > .mm-hud-frame__corner-bl,
.mm-hud-frame--warning > .mm-hud-frame__corner-br {
  border-color: var(--accent-warning);
}

.mm-hud-frame--warning .mm-hud-frame__label {
  color: var(--accent-warning);
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/styles/magicalmecha-hud-frame.css
git commit -m "feat(web): add magical-mecha HUD frame pattern"
```

## Task 1.3: Create `magicalmecha-sparkle.css`

**Files:**
- Create: `apps/web/src/styles/magicalmecha-sparkle.css`

- [ ] **Step 1: Write the file**

Create `apps/web/src/styles/magicalmecha-sparkle.css`:

```css
/* Sparkle layer — purely decorative ✦/✧ glyphs drifting on a 4-6s loop.
   Always aria-hidden through CSS content (not user-visible to AT).
   Usage: add .mm-sparkle-host to any positioned container. */

.mm-sparkle-host {
  position: relative;
}

.mm-sparkle-host::before,
.mm-sparkle-host::after {
  position: absolute;
  font-family: serif;
  color: rgba(255, 216, 236, 0.55);
  z-index: var(--sparkle-z-index);
  pointer-events: none;
  animation: mm-drift 5s ease-in-out infinite;
}

.mm-sparkle-host::before {
  content: "✦";
  top: 8px;
  right: 12px;
  font-size: 13px;
}

.mm-sparkle-host::after {
  content: "✧";
  bottom: 10px;
  left: 16px;
  font-size: 10px;
  color: rgba(200, 168, 232, 0.5);
  animation-duration: 6s;
  animation-delay: 1.5s;
}

/* Variant: dense — three sparkles instead of two, used for empty states. */
.mm-sparkle-host--dense::before {
  font-size: 18px;
}

.mm-sparkle-host--dense::after {
  font-size: 14px;
}

.mm-sparkle-host--dense > .mm-sparkle-extra {
  position: absolute;
  top: 45%;
  right: 28%;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  pointer-events: none;
  animation: mm-drift 7s ease-in-out infinite;
  animation-delay: 3s;
}

/* Variant: subtle — half alpha, used for cards behind text. */
.mm-sparkle-host--subtle::before,
.mm-sparkle-host--subtle::after {
  opacity: 0.5;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/styles/magicalmecha-sparkle.css
git commit -m "feat(web): add magical-mecha sparkle layer pattern"
```

## Task 1.4: Create `magicalmecha-sync-ring.css`

**Files:**
- Create: `apps/web/src/styles/magicalmecha-sync-ring.css`

- [ ] **Step 1: Write the file**

Create `apps/web/src/styles/magicalmecha-sync-ring.css`:

```css
/* Sync ring — rotating dashed ring around a character avatar, plus a
   horizontal sync bar. Activated by CharacterAvatar when a syncRatio prop
   is provided. Pure CSS; no JS. */

.mm-sync {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.mm-sync-avatar {
  position: relative;
  display: inline-block;
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
}

.mm-sync-avatar--sm {
  width: 32px;
  height: 32px;
}

.mm-sync-avatar--lg {
  width: 56px;
  height: 56px;
}

.mm-sync-avatar > .mm-sync-avatar__core {
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #fff;
  box-shadow: var(--glow-soft);
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
}

.mm-sync-avatar > .mm-sync-avatar__core > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mm-sync-avatar > .mm-sync-avatar__ring {
  position: absolute;
  inset: 0;
  border: 1px dashed rgba(255, 216, 236, 0.55);
  border-radius: 50%;
  animation: mm-spin 16s linear infinite;
  pointer-events: none;
}

.mm-sync-avatar > .mm-sync-avatar__ring-outer {
  position: absolute;
  inset: -4px;
  border: 1px solid rgba(255, 216, 236, 0.22);
  border-radius: 50%;
  pointer-events: none;
}

.mm-sync-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 3px;
}

.mm-sync-name {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 800;
  color: var(--accent-primary);
  font-size: 14px;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mm-sync-bar {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mm-sync-bar__label {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 1.5px;
  color: var(--accent-primary);
  opacity: 0.7;
}

.mm-sync-bar__track {
  flex: 1;
  height: 5px;
  background: rgba(255, 216, 236, 0.12);
  border-radius: 3px;
  overflow: hidden;
}

.mm-sync-bar__fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--accent-warning),
    var(--accent-primary),
    var(--accent-secondary)
  );
  box-shadow: var(--glow-soft);
}

.mm-sync-bar__value {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-primary);
  font-weight: 700;
  min-width: 30px;
  text-align: right;
}

.mm-sync-traits {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.mm-sync-traits > .mm-sync-trait {
  font-family: var(--font-mono);
  font-size: 9px;
  padding: 1px 7px;
  border-radius: var(--radius-pill);
  background: rgba(255, 216, 236, 0.1);
  border: 1px solid rgba(255, 216, 236, 0.3);
  color: var(--accent-primary);
}

.mm-sync-traits > .mm-sync-trait:nth-child(2n) {
  color: var(--accent-mint);
  background: rgba(168, 240, 200, 0.08);
  border-color: rgba(168, 240, 200, 0.3);
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/styles/magicalmecha-sync-ring.css
git commit -m "feat(web): add magical-mecha character sync ring pattern"
```

## Task 1.5: Create `magicalmecha-scanline.css`

**Files:**
- Create: `apps/web/src/styles/magicalmecha-scanline.css`

- [ ] **Step 1: Write the file**

Create `apps/web/src/styles/magicalmecha-scanline.css`:

```css
/* Scan-line overlay — atmospheric 4% alpha repeating gradient. Apply to
   active panels and terminal header chrome via .mm-scanline. */

.mm-scanline {
  position: relative;
}

.mm-scanline::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--scanline-overlay);
  pointer-events: none;
  z-index: 0;
}

.mm-scanline > * {
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/styles/magicalmecha-scanline.css
git commit -m "feat(web): add magical-mecha scan-line overlay pattern"
```

## Task 1.6: Wire new modules into the `styles.css` manifest

**Files:**
- Modify: `apps/web/src/styles.css`

- [ ] **Step 1: Update the import manifest**

Open `apps/web/src/styles.css`. Replace its contents with:

```css
/* Foundation */
@import "./styles/foundation.css";

/* Magical Mecha pattern primitives (must load before component CSS that uses them) */
@import "./styles/magicalmecha-motion.css";
@import "./styles/magicalmecha-hud-frame.css";
@import "./styles/magicalmecha-sparkle.css";
@import "./styles/magicalmecha-sync-ring.css";
@import "./styles/magicalmecha-scanline.css";

/* Shared UI primitives and surfaces */
@import "./styles/chrome-and-buttons.css";
@import "./styles/sidebar-and-scrollbars.css";
@import "./styles/terminal-and-status.css";
@import "./styles/character.css";

/* Console theme tokens and console-specific overrides */
@import "./styles/console-theme-tokens.css";
@import "./styles/console-chrome-status-nav.css";
@import "./styles/console-canvas-activity.css";
@import "./styles/console-canvas-github.css";
@import "./styles/console-canvas-monitor.css";
@import "./styles/console-canvas-conversations.css";
@import "./styles/console-canvas-settings.css";
@import "./styles/console-canvas-deck.css";
@import "./styles/console-canvas-pixpack.css";
@import "./styles/console-canvas-canvas.css";
@import "./styles/console-canvas-code-intel.css";
@import "./styles/console-canvas-prompts.css";
@import "./styles/console-overrides-telemetry.css";
```

- [ ] **Step 2: Visual smoke**

Run `pnpm dev` (or refresh if already running). Verify no build error in the dev server output. The app should look identical to Task 0.2's state — the new modules are loaded but no element opts into them yet.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/styles.css
git commit -m "feat(web): register magical-mecha pattern modules in styles manifest"
```

## Task 1.7: Document new patterns in `apps/web/AGENTS.md`

**Files:**
- Modify: `apps/web/AGENTS.md`

- [ ] **Step 1: Append the pattern primitives section**

Open `apps/web/AGENTS.md`. Append the following section to the end of the file (after the existing `## Testing` section):

```markdown
## Magical Mecha Pattern Primitives

The `magicalmecha-*.css` modules in `src/styles/` provide five reusable visual patterns. Opt into them by adding classNames — no JS required.

- `.mm-hud-frame` — corner-bracketed panel. Add `<span class="mm-hud-frame__corner-bl"></span><span class="mm-hud-frame__corner-br"></span>` as direct children for the bottom corners; optionally add `<span class="mm-hud-frame__label">アクティブ</span>` for a kana label. `--warning` variant for orange brackets.
- `.mm-sparkle-host` — adds `::before`/`::after` ✦/✧ glyphs that drift. Variants: `--dense` (with a `.mm-sparkle-extra` child), `--subtle`.
- `.mm-sync-avatar` + `.mm-sync-body` + `.mm-sync-bar` + `.mm-sync-traits` — character avatar with dashed rotating ring and sync ratio bar. Render through `CharacterAvatar` with `syncRatio` and `bondTraits` props.
- `.mm-scanline` — 4%-alpha repeating gradient overlay via `::after`. Children automatically reflowed to `z-index: 1`.
- `magicalmecha-motion.css` defines `mm-spin`, `mm-drift`, `mm-pulse-glow`, `mm-pulse-warning`, `mm-fade-in` keyframes and the global `prefers-reduced-motion` guard.

All patterns honor `prefers-reduced-motion: reduce` automatically through the global guard. Decorative pseudo-elements and ring SVGs must be `aria-hidden` — never the sole source of meaning.
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/AGENTS.md
git commit -m "docs(web): document magical-mecha pattern primitives"
```

---

# Phase 2 · Console chrome (~2 days)

## Task 2.1: Re-skin `ConsolePrimaryNav` + `console-chrome-status-nav.css`

**Files:**
- Modify: `apps/web/src/styles/console-chrome-status-nav.css`
- Read-only: `apps/web/src/components/ConsolePrimaryNav.tsx` (to confirm existing classes)

- [ ] **Step 1: Identify existing class hooks**

Run: `grep -n "className" apps/web/src/components/ConsolePrimaryNav.tsx | head -30`
Note the classNames in use (typically `console-primary-nav`, `console-primary-nav__item`, etc.).

- [ ] **Step 2: Open `console-chrome-status-nav.css` and apply magical-mecha tokens**

Locate the existing primary-nav and runtime-status-strip rules in that file. Apply these refinements (insert at the bottom of the relevant blocks, or merge into existing selectors):

```css
/* === Magical mecha refinements: primary nav === */

.console-primary-nav__item {
  border-radius: var(--radius-md);
  transition:
    background 200ms ease-out,
    box-shadow 200ms ease-out,
    transform 200ms ease-out;
}

.console-primary-nav__item:hover {
  background: rgba(255, 216, 236, 0.06);
  box-shadow: var(--glow-soft);
  transform: translateY(-1px);
}

.console-primary-nav__item--active,
.console-primary-nav__item[aria-selected="true"],
.console-primary-nav__item[data-active="true"] {
  background: linear-gradient(
    135deg,
    rgba(255, 216, 236, 0.14),
    rgba(200, 168, 232, 0.08)
  );
  border: 1px solid var(--border-strong);
  box-shadow: var(--glow-soft);
}

.console-primary-nav__item:focus-visible {
  outline: 2px solid var(--ring-focus);
  outline-offset: 2px;
}

/* === Magical mecha refinements: runtime status strip === */

.runtime-status-strip {
  border-bottom: 1px solid var(--border-subtle);
  background:
    var(--scanline-overlay),
    linear-gradient(180deg, var(--bg-surface-1), var(--bg-surface-2));
}

.runtime-status-strip__metric {
  border: 1px solid var(--border-subtle);
  background: rgba(255, 216, 236, 0.04);
  border-radius: var(--radius-md);
}

.runtime-status-strip__metric-label {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 2px;
  color: var(--accent-primary);
  opacity: 0.7;
  text-transform: uppercase;
}

.runtime-status-strip__metric-value {
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}
```

> **Note:** If `console-primary-nav__item--active`, `.runtime-status-strip__metric`, or any selector above does not match an actual class in the codebase, replace it with the real class name discovered in Step 1. The intent is to refine the existing chrome elements, not introduce new structural classes.

- [ ] **Step 3: Visual verification**

Refresh the app. Hover primary nav items — should glow softly and lift. Active nav item should have a pastel highlight. RuntimeStatusStrip metric tiles should have pastel borders and a faint scan-line.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/styles/console-chrome-status-nav.css
git commit -m "feat(web): re-skin primary nav + runtime status strip"
```

## Task 2.2: Re-skin `ActiveAgentsSidebar` + `sidebar-and-scrollbars.css`

**Files:**
- Modify: `apps/web/src/components/ActiveAgentsSidebar.tsx`
- Modify: `apps/web/src/styles/sidebar-and-scrollbars.css`

- [ ] **Step 1: Add HUD-frame wrapper to the section header**

Open `apps/web/src/components/ActiveAgentsSidebar.tsx`. Find the section header (typically a div with className containing `sidebar` and a label like "ACTIVE TENTACLES" or similar). Wrap that header element with the HUD frame class. Example pattern:

```tsx
// Before
<div className="sidebar-section-header">
  <span>ACTIVE TENTACLES</span>
</div>

// After
<div className="sidebar-section-header mm-hud-frame">
  <span className="mm-hud-frame__label">アクティブ</span>
  <span className="mm-hud-frame__corner-bl" aria-hidden="true"></span>
  <span className="mm-hud-frame__corner-br" aria-hidden="true"></span>
  <span>Active Tentacles</span>
</div>
```

If the existing header markup differs, adapt: the rule is that the visible header text is preserved, and the HUD frame classes/spans are added around or inside it without removing existing elements.

- [ ] **Step 2: Adjust sidebar tokens in `sidebar-and-scrollbars.css`**

Open `apps/web/src/styles/sidebar-and-scrollbars.css`. Append (or merge into existing rules):

```css
/* === Magical mecha refinements: sidebar === */

.sidebar-section-header.mm-hud-frame {
  padding: 12px 14px 10px;
  background: rgba(255, 216, 236, 0.03);
  border: 1px solid var(--border-subtle);
}

.sidebar-row,
.sidebar-card {
  transition:
    background 200ms ease-out,
    box-shadow 200ms ease-out;
}

.sidebar-row:hover,
.sidebar-card:hover {
  background: var(--sidebar-row-hover);
  box-shadow: var(--glow-soft);
}

.sidebar-row:focus-visible,
.sidebar-card:focus-visible {
  outline: 2px solid var(--ring-focus);
  outline-offset: 2px;
}
```

- [ ] **Step 3: Visual verification**

Refresh. The sidebar section header should now show kana `アクティブ` label and corner brackets. Hover an agent row — pastel highlight + glow.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/ActiveAgentsSidebar.tsx apps/web/src/styles/sidebar-and-scrollbars.css
git commit -m "feat(web): re-skin agents sidebar with HUD frame header"
```

## Task 2.3: Re-skin `TelemetryTape` + `console-overrides-telemetry.css`

**Files:**
- Modify: `apps/web/src/styles/console-overrides-telemetry.css`

- [ ] **Step 1: Append refinements**

Open `apps/web/src/styles/console-overrides-telemetry.css`. Append:

```css
/* === Magical mecha refinements: telemetry tape === */

.telemetry-tape {
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-surface-1);
  position: relative;
}

.telemetry-tape::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--scanline-overlay);
  pointer-events: none;
}

.telemetry-tape__event {
  font-family: var(--font-mono);
  color: var(--text-secondary);
}

.telemetry-tape__event--processing,
.telemetry-tape__event[data-state="processing"] {
  color: var(--accent-mint);
}

.telemetry-tape__event--warning,
.telemetry-tape__event[data-state="waiting_for_permission"],
.telemetry-tape__event[data-state="waiting_for_user"] {
  color: var(--accent-warning);
}
```

If `.telemetry-tape__event--processing` etc. do not match real classnames in `TelemetryTape.tsx`, run:

```bash
grep -n "className" apps/web/src/components/TelemetryTape.tsx
```

and adapt selectors to actual class names. Keep the intent: events with active/warning state get accent colors.

- [ ] **Step 2: Visual verification**

Open the telemetry tape (it's the bottom strip). Generate some agent activity (or just verify the tape exists). Lines should read in mono pastel with subtle scan-line.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/styles/console-overrides-telemetry.css
git commit -m "feat(web): re-skin telemetry tape"
```

## Task 2.4: Re-skin `SidebarActionPanel` + `chrome-and-buttons.css`

**Files:**
- Modify: `apps/web/src/styles/chrome-and-buttons.css`

- [ ] **Step 1: Append button + pill refinements**

Open `apps/web/src/styles/chrome-and-buttons.css`. Append:

```css
/* === Magical mecha refinements: buttons + pills === */

button.primary,
.btn.primary,
.button--primary {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: var(--bg-canvas);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  font-family: var(--font-main);
  letter-spacing: var(--control-letter-spacing);
  box-shadow: var(--glow-soft);
  transition:
    transform 200ms ease-out,
    box-shadow 200ms ease-out;
}

button.primary:hover,
.btn.primary:hover,
.button--primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--glow-strong);
}

button.secondary,
.btn.secondary,
.button--secondary {
  background: transparent;
  color: var(--accent-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  font-family: var(--font-main);
  letter-spacing: var(--control-letter-spacing);
}

button.secondary:hover,
.btn.secondary:hover,
.button--secondary:hover {
  border-color: var(--border-strong);
  background: rgba(255, 216, 236, 0.05);
}

button.danger,
.btn.danger,
.button--danger {
  background: rgba(255, 95, 122, 0.12);
  border: 1px solid rgba(255, 95, 122, 0.5);
  color: var(--accent-danger);
}

button.danger:hover,
.btn.danger:hover,
.button--danger:hover {
  background: rgba(255, 95, 122, 0.2);
}

button:focus-visible,
.btn:focus-visible {
  outline: 2px solid var(--ring-focus);
  outline-offset: 2px;
}

/* StatusBadge (pill) — magical mecha colors */

.pill,
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 1.5px;
  border: 1px solid;
}

.pill::before,
.status-badge::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 6px currentColor;
}

.pill.idle,
.status-badge.idle,
.pill.queued,
.status-badge.queued {
  color: var(--accent-secondary);
  background: rgba(200, 168, 232, 0.08);
  border-color: rgba(200, 168, 232, 0.4);
}

.pill.live,
.status-badge.live,
.pill.processing,
.status-badge.processing {
  color: var(--accent-mint);
  background: rgba(168, 240, 200, 0.1);
  border-color: rgba(168, 240, 200, 0.45);
}

.pill.processing,
.status-badge.processing {
  animation: mm-pulse-glow 2s ease-in-out infinite;
}

.pill.warning,
.status-badge.warning {
  color: var(--accent-warning);
  background: rgba(255, 140, 66, 0.1);
  border-color: rgba(255, 140, 66, 0.5);
}

.pill.blocked,
.status-badge.blocked {
  color: var(--accent-danger);
  background: rgba(255, 95, 122, 0.1);
  border-color: rgba(255, 95, 122, 0.5);
}
```

- [ ] **Step 2: Visual verification**

Refresh. Locate any visible button or `AgentStateBadge` in the running app. Confirm:
- Primary buttons are pastel pink gradient with glow on hover
- Pills show colored dot + label, processing pulses

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/styles/chrome-and-buttons.css
git commit -m "feat(web): re-skin buttons and status pills"
```

---

# Phase 3 · Character + Terminal (~2 days)

## Task 3.1: Add `syncRatio` and `bondTraits` props to `CharacterAvatar` (TDD)

**Files:**
- Modify: `apps/web/src/components/character/CharacterAvatar.tsx`
- Modify: `apps/web/src/styles/character.css`
- Create: `apps/web/tests/CharacterAvatar.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/web/tests/CharacterAvatar.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { CharacterAvatar } from "../src/components/character/CharacterAvatar";

describe("CharacterAvatar — magical-mecha sync ring", () => {
  it("renders no sync ring when syncRatio is omitted (backward compatible)", () => {
    const { container } = render(<CharacterAvatar characterId="mika" />);
    expect(container.querySelector(".mm-sync-avatar__ring")).toBeNull();
    expect(container.querySelector(".mm-sync-bar")).toBeNull();
  });

  it("renders the dashed ring + sync bar when syncRatio is provided", () => {
    const { container } = render(<CharacterAvatar characterId="mika" syncRatio={73} />);
    expect(container.querySelector(".mm-sync-avatar__ring")).not.toBeNull();
    const fill = container.querySelector<HTMLElement>(".mm-sync-bar__fill");
    expect(fill).not.toBeNull();
    expect(fill?.style.width).toBe("73%");
  });

  it("clamps syncRatio to [0, 100]", () => {
    const { container, rerender } = render(
      <CharacterAvatar characterId="mika" syncRatio={150} />,
    );
    const fill = container.querySelector<HTMLElement>(".mm-sync-bar__fill");
    expect(fill?.style.width).toBe("100%");

    rerender(<CharacterAvatar characterId="mika" syncRatio={-20} />);
    expect(fill?.style.width).toBe("0%");
  });

  it("renders provided bond traits as pill spans", () => {
    const { container } = render(
      <CharacterAvatar
        characterId="mika"
        syncRatio={50}
        bondTraits={["kind", "bold"]}
      />,
    );
    const traits = container.querySelectorAll(".mm-sync-trait");
    expect(traits).toHaveLength(2);
    expect(traits[0]?.textContent).toContain("kind");
    expect(traits[1]?.textContent).toContain("bold");
  });

  it("exposes sync ratio via aria-label on the wrapper", () => {
    const { container } = render(<CharacterAvatar characterId="mika" syncRatio={73} />);
    const wrapper = container.querySelector<HTMLElement>(".character-avatar");
    expect(wrapper?.getAttribute("aria-label")).toContain("73");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @octogent/web exec vitest run tests/CharacterAvatar.test.tsx`
Expected: at least one test fails because `syncRatio` is not a recognized prop and `.mm-sync-avatar__ring` is not rendered.

- [ ] **Step 3: Update `CharacterAvatar.tsx`**

Replace `apps/web/src/components/character/CharacterAvatar.tsx` with:

```tsx
import {
  DEFAULT_CHARACTER_AVATAR_PATH,
  getCharacterTemplate,
  resolveCharacterAvatarPath,
} from "@octogent/core";

type CharacterAvatarProps = {
  characterId?: string | undefined;
  customAvatarPath?: string | undefined;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  className?: string;
  syncRatio?: number;
  bondTraits?: readonly string[];
};

const clampRatio = (value: number): number => {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
};

export const CharacterAvatar = ({
  characterId,
  customAvatarPath,
  size = "md",
  showDetails = false,
  className,
  syncRatio,
  bondTraits,
}: CharacterAvatarProps) => {
  const template = getCharacterTemplate(characterId);
  const avatarPath = resolveCharacterAvatarPath({ characterId, customAvatarPath });
  const name = template?.name ?? "Octogent Agent";
  const title = template?.title ?? "Unassigned";
  const traits = template?.shortTraits ?? [];
  const detailText = traits.length > 0 ? `${title} - ${traits.join(", ")}` : title;
  const hasSync = typeof syncRatio === "number";
  const clampedRatio = hasSync ? clampRatio(syncRatio as number) : 0;
  const ariaLabel = hasSync
    ? `${name}, sync ${Math.round(clampedRatio)}%`
    : `${name}: ${detailText}`;

  return (
    <span
      className={[
        "character-avatar",
        `character-avatar--${size}`,
        showDetails ? "character-avatar--with-details" : "",
        hasSync ? "character-avatar--with-sync" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      title={`${name}: ${detailText}`}
      aria-label={ariaLabel}
    >
      {hasSync ? (
        <span className={`mm-sync-avatar mm-sync-avatar--${size}`}>
          <span className="mm-sync-avatar__ring-outer" aria-hidden="true"></span>
          <span className="mm-sync-avatar__ring" aria-hidden="true"></span>
          <span className="mm-sync-avatar__core">
            <img
              src={avatarPath}
              alt=""
              onError={(event) => {
                const image = event.currentTarget;
                if (image.src.endsWith(DEFAULT_CHARACTER_AVATAR_PATH)) return;
                image.src = DEFAULT_CHARACTER_AVATAR_PATH;
              }}
            />
          </span>
        </span>
      ) : (
        <img
          className="character-avatar__image"
          src={avatarPath}
          alt=""
          onError={(event) => {
            const image = event.currentTarget;
            if (image.src.endsWith(DEFAULT_CHARACTER_AVATAR_PATH)) return;
            image.src = DEFAULT_CHARACTER_AVATAR_PATH;
          }}
        />
      )}

      {hasSync ? (
        <span className="mm-sync-body">
          <span className="mm-sync-name">{name}</span>
          <span className="mm-sync-bar">
            <span className="mm-sync-bar__label">SYNC</span>
            <span className="mm-sync-bar__track">
              <span
                className="mm-sync-bar__fill"
                style={{ width: `${clampedRatio}%` }}
              ></span>
            </span>
            <span className="mm-sync-bar__value">{Math.round(clampedRatio)}%</span>
          </span>
          {bondTraits && bondTraits.length > 0 ? (
            <span className="mm-sync-traits">
              {bondTraits.map((trait) => (
                <span key={trait} className="mm-sync-trait">
                  {trait}
                </span>
              ))}
            </span>
          ) : null}
        </span>
      ) : (
        showDetails && (
          <span className="character-avatar__details">
            <span className="character-avatar__name">{name}</span>
            <span className="character-avatar__title">{title}</span>
            {traits.length > 0 && (
              <span className="character-avatar__traits">{traits.slice(0, 2).join(" / ")}</span>
            )}
          </span>
        )
      )}
    </span>
  );
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm --filter @octogent/web exec vitest run tests/CharacterAvatar.test.tsx`
Expected: all 5 tests pass.

- [ ] **Step 5: Run the full test suite to confirm nothing else broke**

Run: `pnpm test`
Expected: all tests pass.

- [ ] **Step 6: Refresh `character.css` for magical card styling**

Open `apps/web/src/styles/character.css`. Append at the end:

```css
/* === Magical mecha refinements: character avatar === */

.character-avatar {
  align-items: center;
}

.character-avatar__name {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 800;
  color: var(--accent-primary);
}

.character-avatar__title {
  font-family: var(--font-mono);
  color: var(--text-secondary);
  letter-spacing: 1.5px;
}

.character-avatar--with-sync {
  display: inline-flex;
  gap: 10px;
  align-items: center;
}
```

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/character/CharacterAvatar.tsx apps/web/src/styles/character.css apps/web/tests/CharacterAvatar.test.tsx
git commit -m "feat(web): add optional syncRatio + bondTraits to CharacterAvatar"
```

## Task 3.2: Re-skin `CharacterPicker` (CSS only)

**Files:**
- Modify: `apps/web/src/styles/character.css`

- [ ] **Step 1: Append picker refinements**

Open `apps/web/src/styles/character.css`. Append at the end:

```css
/* === Magical mecha refinements: character picker === */

.character-picker__option {
  background: rgba(255, 216, 236, 0.04);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 8px;
  transition:
    transform 200ms ease-out,
    box-shadow 200ms ease-out,
    background 200ms ease-out;
}

.character-picker__option:hover {
  transform: translateY(-2px);
  background: rgba(255, 216, 236, 0.08);
  box-shadow: var(--glow-soft);
}

.character-picker__option:focus-visible {
  outline: 2px solid var(--ring-focus);
  outline-offset: 2px;
}

.character-picker__option[aria-selected="true"],
.character-picker__option[data-selected="true"],
.character-picker__option.is-selected {
  background: linear-gradient(
    135deg,
    rgba(255, 216, 236, 0.16),
    rgba(200, 168, 232, 0.1)
  );
  border-color: var(--border-strong);
  box-shadow: var(--glow-strong);
}
```

- [ ] **Step 2: Visual verification**

Open a screen that shows the character picker (Canvas tab → spawn agent flow, or Deck tab). Hover options — should lift and glow. Selected option pastel highlight.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/styles/character.css
git commit -m "feat(web): re-skin character picker with magical lift + glow"
```

## Task 3.3: Add lock indicator to `Terminal.tsx` header (TDD)

**Files:**
- Modify: `apps/web/src/components/Terminal.tsx`
- Modify: `apps/web/src/styles/terminal-and-status.css`
- Create: `apps/web/tests/Terminal.lockIndicator.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/web/tests/Terminal.lockIndicator.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

/**
 * We test a small pure helper that derives the lock indicator label + tone
 * from an AgentRuntimeState. This keeps the test decoupled from xterm /
 * WebSocket setup in Terminal.tsx.
 */
import { deriveLockIndicator } from "../src/components/terminalLockIndicator";

describe("deriveLockIndicator", () => {
  it("returns null for idle", () => {
    expect(deriveLockIndicator("idle")).toBeNull();
  });

  it("returns CASTING for processing", () => {
    expect(deriveLockIndicator("processing")).toEqual({
      label: "CASTING",
      tone: "mint",
    });
  });

  it("returns PERMISSION for waiting_for_permission", () => {
    expect(deriveLockIndicator("waiting_for_permission")).toEqual({
      label: "PERMISSION",
      tone: "warning",
    });
  });

  it("returns AWAITING for waiting_for_user", () => {
    expect(deriveLockIndicator("waiting_for_user")).toEqual({
      label: "AWAITING",
      tone: "warning",
    });
  });
});

describe("Terminal lock indicator rendering", () => {
  it("renders the indicator span when state is non-idle", async () => {
    // Import the component lazily so the module's WebSocket / xterm imports
    // don't tear down the test runner during describe-init.
    const { LockIndicator } = await import("../src/components/terminalLockIndicator");
    const { container } = render(<LockIndicator state="processing" />);
    const node = container.querySelector(".terminal-lock-indicator");
    expect(node).not.toBeNull();
    expect(node?.textContent).toContain("CASTING");
    expect(node?.classList.contains("terminal-lock-indicator--mint")).toBe(true);
  });

  it("renders nothing when state is idle", async () => {
    const { LockIndicator } = await import("../src/components/terminalLockIndicator");
    const { container } = render(<LockIndicator state="idle" />);
    expect(container.querySelector(".terminal-lock-indicator")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `pnpm --filter @octogent/web exec vitest run tests/Terminal.lockIndicator.test.tsx`
Expected: failure — module `terminalLockIndicator` does not exist.

- [ ] **Step 3: Create the helper module**

Create `apps/web/src/components/terminalLockIndicator.tsx`:

```tsx
import type { AgentRuntimeState } from "@octogent/core";

export type LockIndicatorTone = "mint" | "warning";

export type LockIndicatorDescriptor = {
  label: string;
  tone: LockIndicatorTone;
};

export const deriveLockIndicator = (
  state: AgentRuntimeState,
): LockIndicatorDescriptor | null => {
  switch (state) {
    case "processing":
      return { label: "CASTING", tone: "mint" };
    case "waiting_for_permission":
      return { label: "PERMISSION", tone: "warning" };
    case "waiting_for_user":
      return { label: "AWAITING", tone: "warning" };
    default:
      return null;
  }
};

type LockIndicatorProps = {
  state: AgentRuntimeState;
};

export const LockIndicator = ({ state }: LockIndicatorProps) => {
  const descriptor = deriveLockIndicator(state);
  if (descriptor === null) {
    return null;
  }
  return (
    <span
      className={`terminal-lock-indicator terminal-lock-indicator--${descriptor.tone}`}
      aria-label={`Agent state: ${descriptor.label.toLowerCase()}`}
    >
      <span aria-hidden="true">◢</span>
      <span>{descriptor.label}</span>
      <span aria-hidden="true">◣</span>
    </span>
  );
};
```

- [ ] **Step 4: Wire the indicator into `Terminal.tsx`**

Open `apps/web/src/components/Terminal.tsx`. Add an import near the top (alongside the other relative imports):

```tsx
import { LockIndicator } from "./terminalLockIndicator";
```

Then locate the `.terminal-header-actions` div in the JSX (around the existing `AgentStateBadge` render). Insert the `LockIndicator` immediately before `<AgentStateBadge state={agentState} />`:

```tsx
<div className="terminal-header-actions">
  {/* …existing prompt picker block… */}
  <LockIndicator state={agentState} />
  <AgentStateBadge state={agentState} />
</div>
```

- [ ] **Step 5: Run the tests**

Run: `pnpm --filter @octogent/web exec vitest run tests/Terminal.lockIndicator.test.tsx`
Expected: all 6 tests pass.

Run: `pnpm test` (full suite).
Expected: all pass.

- [ ] **Step 6: Style the indicator in `terminal-and-status.css`**

Open `apps/web/src/styles/terminal-and-status.css`. Append at the end:

```css
/* === Magical mecha refinements: terminal header === */

.terminal-header {
  background: linear-gradient(
    90deg,
    rgba(255, 216, 236, 0.1),
    rgba(200, 168, 232, 0.06)
  );
  border-bottom: 1px solid var(--border-subtle);
  position: relative;
}

.terminal-header::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--scanline-overlay);
  pointer-events: none;
}

.terminal-header > * {
  position: relative;
  z-index: 1;
}

.terminal-title {
  font-family: var(--font-display);
  font-style: italic;
  color: var(--accent-primary);
}

.terminal-lock-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 2px;
  border: 1px solid;
}

.terminal-lock-indicator--mint {
  color: var(--accent-mint);
  background: rgba(168, 240, 200, 0.1);
  border-color: rgba(168, 240, 200, 0.5);
  animation: mm-pulse-glow 2s ease-in-out infinite;
}

.terminal-lock-indicator--warning {
  color: var(--accent-warning);
  background: rgba(255, 140, 66, 0.1);
  border-color: rgba(255, 140, 66, 0.5);
  animation: mm-pulse-warning 2s ease-in-out infinite;
}
```

- [ ] **Step 7: Visual verification**

Open the app. With at least one terminal session, observe the terminal header. Idle → no indicator; busy/processing → mint CASTING badge appears with pulse.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/components/Terminal.tsx apps/web/src/components/terminalLockIndicator.tsx apps/web/tests/Terminal.lockIndicator.test.tsx apps/web/src/styles/terminal-and-status.css
git commit -m "feat(web): add CASTING/PERMISSION/AWAITING lock indicator to terminal header"
```

## Task 3.4: Re-skin `TerminalPromptPicker` (CSS only)

**Files:**
- Modify: `apps/web/src/styles/terminal-and-status.css`

- [ ] **Step 1: Identify existing classes**

Run: `grep -n "className" apps/web/src/components/TerminalPromptPicker.tsx | head`
Note class names (likely `terminal-prompt-picker`, `terminal-prompt-picker__option`, etc.).

- [ ] **Step 2: Append refinements**

In `apps/web/src/styles/terminal-and-status.css`, append:

```css
.terminal-prompt-picker {
  background: var(--bg-surface-2);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--glow-soft);
}

.terminal-prompt-picker__option,
.terminal-prompt-picker li {
  border-radius: var(--radius-pill);
  padding: 4px 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 1.5px;
  border: 1px solid var(--border-subtle);
  transition: background 150ms ease-out;
}

.terminal-prompt-picker__option:hover,
.terminal-prompt-picker li:hover {
  background: rgba(255, 216, 236, 0.1);
  border-color: var(--border-strong);
}
```

If actual class names differ, adapt — keep the intent (rounded pastel pills with hover state).

- [ ] **Step 3: Visual verification**

Open the prompt picker (click the "Prompts" button in any terminal header). Options should appear as pastel pills.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/styles/terminal-and-status.css
git commit -m "feat(web): re-skin terminal prompt picker as pastel pills"
```

---

# Phase 4 · Primary view tabs (~4–5 days)

Each primary view tab gets its own task. Each task is CSS-only (with one exception noted in 4.1) and follows the pattern: identify existing classes → append magical-mecha refinements → visual smoke → commit.

## Task 4.1: Canvas tab — `console-canvas-canvas.css` + node component touches

**Files:**
- Modify: `apps/web/src/styles/console-canvas-canvas.css`
- Read-only: `apps/web/src/components/canvas/OctopusNode.tsx`, `SessionNode.tsx`, `CanvasTentaclePanel.tsx`, `CanvasTerminalColumn.tsx`
- Optional modify: any of the above to wire `syncRatio` prop on rendered `CharacterAvatar` if the component renders agent cards.

- [ ] **Step 1: Append canvas refinements**

Open `apps/web/src/styles/console-canvas-canvas.css`. Append:

```css
/* === Magical mecha: canvas tab === */

.canvas-primary-view,
.canvas-tab,
.canvas-graph-host {
  background:
    radial-gradient(ellipse at 30% 20%, rgba(255, 216, 236, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(200, 168, 232, 0.04) 0%, transparent 50%),
    var(--bg-canvas);
}

.octopus-node,
.canvas-octoboss {
  background: radial-gradient(
    circle,
    rgba(255, 216, 236, 0.2) 0%,
    rgba(255, 216, 236, 0.05) 60%,
    transparent 80%
  );
  border: 2px solid var(--accent-primary);
  border-radius: 50%;
  box-shadow: var(--glow-strong);
}

.session-node,
.canvas-session,
.canvas-tentacle-panel {
  background: var(--bg-surface-1);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  position: relative;
  transition: box-shadow 200ms ease-out;
}

.session-node:hover,
.canvas-session:hover,
.canvas-tentacle-panel:hover {
  box-shadow: var(--glow-soft);
  border-color: var(--border-strong);
}

.canvas-link,
.canvas-edge,
svg .canvas-link {
  stroke: var(--accent-secondary);
  stroke-opacity: 0.45;
  stroke-width: 1.5;
}

.canvas-terminal-column {
  background: var(--bg-surface-1);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}
```

If the actual classes differ from the names above (run `grep -n "className" apps/web/src/components/canvas/*.tsx` to confirm), adapt selectors to real class names. Intent: octoboss = pastel pink sigil with glow; sessions = HUD-framed cards; links = lavender 45% opacity.

- [ ] **Step 2: Wire sync ring on agent avatars (optional)**

If `SessionNode.tsx` or `CanvasTerminalColumn.tsx` already renders `<CharacterAvatar>` for the agent, pass the agent's runtime ratio as `syncRatio`. Derive the ratio from existing `terminalRuntimeStateStore` data: count the agent's "active time" over the most recent N events vs. total. For a first pass that doesn't require new data wiring, render `syncRatio={50}` as a static placeholder. Mark the source as a TODO at the call site with a one-line comment, e.g. `// TODO(magicalmecha): derive from terminalRuntimeStateStore once aggregator exists`. Do not invent new state stores.

If the node does not render `CharacterAvatar` today, skip this step — sync ring will appear via other surfaces (deck, sidebar) instead.

- [ ] **Step 3: Visual verification**

Open the Canvas tab. Octoboss center should glow pastel pink. Session nodes pastel borders with hover glow. Links lavender.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/styles/console-canvas-canvas.css apps/web/src/components/canvas/
git commit -m "feat(web): re-skin canvas tab — octoboss sigil + session cards + lavender links"
```

## Task 4.2: Activity + GitHub + Monitor tabs (metric tiles + heatmap)

**Files:**
- Modify: `apps/web/src/styles/console-canvas-activity.css`
- Modify: `apps/web/src/styles/console-canvas-github.css`
- Modify: `apps/web/src/styles/console-canvas-monitor.css`

- [ ] **Step 1: Append `console-canvas-activity.css`**

Append:

```css
/* === Magical mecha: activity tab === */

.activity-primary-view,
.activity-tab {
  background: var(--bg-canvas);
}

.usage-heatmap-cell {
  border-radius: 2px;
}

/* Pastel intensity ramp — overrides any red/green ramp in the heatmap. */
.usage-heatmap-cell[data-intensity="0"] {
  background: rgba(255, 216, 236, 0.04);
}
.usage-heatmap-cell[data-intensity="1"],
.usage-heatmap-cell[data-intensity="2"] {
  background: rgba(255, 216, 236, 0.25);
}
.usage-heatmap-cell[data-intensity="3"],
.usage-heatmap-cell[data-intensity="4"] {
  background: rgba(200, 168, 232, 0.4);
}
.usage-heatmap-cell[data-intensity="5"],
.usage-heatmap-cell[data-intensity="6"] {
  background: rgba(168, 240, 200, 0.55);
}
.usage-heatmap-cell[data-intensity="7"],
.usage-heatmap-cell[data-intensity="8"],
.usage-heatmap-cell[data-intensity="9"],
.usage-heatmap-cell[data-intensity="10"] {
  background: linear-gradient(135deg, var(--accent-mint), var(--accent-primary));
  box-shadow: var(--glow-mint);
}

.activity-metric-tile,
.metric-tile {
  background: rgba(255, 216, 236, 0.04);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 12px;
}

.activity-empty,
.activity-tab__empty {
  position: relative;
}
```

If `usage-heatmap-cell` is not the actual class name, run `grep -n "heatmap" apps/web/src/components/UsageHeatmap.tsx` to find the real one and adapt the `[data-intensity]` selectors accordingly. If the heatmap uses an inline `style="opacity: …"` for intensity instead of a data attribute, change `background-color` of `.usage-heatmap-cell` to a single pastel pink and let the inline opacity drive intensity.

- [ ] **Step 2: Append `console-canvas-github.css`**

Append:

```css
/* === Magical mecha: github tab === */

.github-primary-view {
  background: var(--bg-canvas);
}

.github-stat-card,
.github-metric {
  background: rgba(255, 216, 236, 0.04);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 12px;
}

.github-recent-commit,
.github-commit-row {
  border-bottom: 1px solid var(--border-subtle);
  font-family: var(--font-mono);
}

.github-recent-commit:hover,
.github-commit-row:hover {
  background: rgba(255, 216, 236, 0.04);
}
```

- [ ] **Step 3: Append `console-canvas-monitor.css`**

Append:

```css
/* === Magical mecha: monitor tab === */

.monitor-primary-view {
  background: var(--bg-canvas);
  position: relative;
}

.monitor-primary-view::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--scanline-overlay);
  pointer-events: none;
  z-index: 0;
}

.monitor-primary-view > * {
  position: relative;
  z-index: 1;
}

.monitor-feed-event,
.monitor-event {
  font-family: var(--font-mono);
  color: var(--text-secondary);
  padding: 4px 10px;
  border-bottom: 1px solid var(--border-subtle);
}

.monitor-feed-event[data-state="processing"],
.monitor-event--processing {
  color: var(--accent-mint);
}

.monitor-feed-event[data-state="waiting_for_permission"],
.monitor-feed-event[data-state="waiting_for_user"],
.monitor-event--warning {
  color: var(--accent-warning);
}
```

- [ ] **Step 4: Visual verification**

Open each of Activity, GitHub, Monitor tabs. Heatmap should show pastel intensity, metric tiles HUD-framed, monitor scan-line overlay visible.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/styles/console-canvas-activity.css apps/web/src/styles/console-canvas-github.css apps/web/src/styles/console-canvas-monitor.css
git commit -m "feat(web): re-skin activity + github + monitor tabs"
```

## Task 4.3: Deck + Conversations tabs

**Files:**
- Modify: `apps/web/src/styles/console-canvas-deck.css`
- Modify: `apps/web/src/styles/console-canvas-conversations.css`

- [ ] **Step 1: Append `console-canvas-deck.css`**

Open the file. **Do not remove the existing `Silkscreen` font-family declarations** (they style retro accents inside cards — keep them as pixel display character). Append:

```css
/* === Magical mecha: deck tab === */

.deck-primary-view,
.deck-tab {
  background: var(--bg-canvas);
}

.deck-card,
.tentacle-card {
  background: var(--bg-surface-1);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 14px;
  transition:
    transform 200ms ease-out,
    box-shadow 200ms ease-out;
  position: relative;
}

.deck-card:hover,
.tentacle-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--glow-soft);
  border-color: var(--border-strong);
}

.deck-card__name,
.tentacle-card__name {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 800;
  color: var(--accent-primary);
}

.deck-summon-button {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: var(--bg-canvas);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--glow-soft);
}
```

- [ ] **Step 2: Append `console-canvas-conversations.css`**

Append:

```css
/* === Magical mecha: conversations tab === */

.conversations-primary-view {
  background: var(--bg-canvas);
}

.conversations-sidebar {
  background: var(--bg-surface-1);
  border-right: 1px solid var(--border-subtle);
}

.conversation-row,
.conversations-list__row {
  border-bottom: 1px solid var(--border-subtle);
  transition: background 150ms ease-out;
}

.conversation-row:hover,
.conversations-list__row:hover {
  background: var(--sidebar-row-hover);
}

.conversation-message,
.message-bubble {
  background: rgba(255, 216, 236, 0.05);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 10px 14px;
}

.conversation-message--user,
.message-bubble--user {
  background: linear-gradient(
    135deg,
    rgba(255, 216, 236, 0.12),
    rgba(200, 168, 232, 0.08)
  );
  border-color: var(--border-strong);
}
```

If selectors don't match the actual JSX, run `grep -n "className" apps/web/src/components/ConversationsPrimaryView.tsx apps/web/src/components/SidebarConversationsList.tsx` and adapt.

- [ ] **Step 3: Visual verification**

Open Deck and Conversations tabs. Deck cards lift on hover with character names in italic serif. Conversation bubbles pastel rounded.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/styles/console-canvas-deck.css apps/web/src/styles/console-canvas-conversations.css
git commit -m "feat(web): re-skin deck + conversations tabs"
```

## Task 4.4: Settings + Prompts + Code Intel tabs

**Files:**
- Modify: `apps/web/src/styles/console-canvas-settings.css`
- Modify: `apps/web/src/styles/console-canvas-prompts.css`
- Modify: `apps/web/src/styles/console-canvas-code-intel.css`

- [ ] **Step 1: Append `console-canvas-settings.css`**

Append:

```css
/* === Magical mecha: settings tab === */

.settings-primary-view {
  background: var(--bg-canvas);
}

.settings-section {
  background: rgba(255, 216, 236, 0.03);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 16px;
}

.settings-section__title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 800;
  color: var(--accent-primary);
  margin: 0 0 12px;
}

.settings-toggle,
.settings-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.settings-toggle:last-child,
.settings-row:last-child {
  border-bottom: none;
}
```

- [ ] **Step 2: Append `console-canvas-prompts.css`**

Append:

```css
/* === Magical mecha: prompts tab === */

.prompts-primary-view {
  background: var(--bg-canvas);
}

.prompts-list__row,
.prompt-card {
  background: var(--bg-surface-1);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  margin-bottom: 8px;
  transition: background 150ms ease-out;
}

.prompts-list__row:hover,
.prompt-card:hover {
  background: rgba(255, 216, 236, 0.06);
  border-color: var(--border-strong);
}

.prompt-card__title {
  font-family: var(--font-display);
  font-style: italic;
  color: var(--accent-primary);
}
```

- [ ] **Step 3: Append `console-canvas-code-intel.css`**

Append:

```css
/* === Magical mecha: code intel tab === */

.code-intel-primary-view {
  background: var(--bg-canvas);
}

.code-intel-treemap rect {
  stroke: var(--bg-surface-1);
  stroke-width: 0.5;
}

.code-intel-treemap rect[data-tier="hot"] {
  fill: var(--accent-primary);
}
.code-intel-treemap rect[data-tier="warm"] {
  fill: var(--accent-secondary);
}
.code-intel-treemap rect[data-tier="cool"] {
  fill: var(--accent-mint);
}

.code-intel-arc path,
.code-intel-arc-diagram path {
  stroke: var(--accent-primary);
  stroke-opacity: 0.55;
  fill: none;
}

.code-intel-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-secondary);
}
```

If `[data-tier]` is not actually used, run `grep -rn "treemap\|arc-diagram" apps/web/src/components/CodeIntel*.tsx` to find the real attribute. Replace selectors as needed; the intent is a pastel triad fill scheme.

- [ ] **Step 4: Visual verification**

Open Settings, Prompts, Code Intel tabs. Sections HUD-framed, rows pastel hover, code intel viz in pastel triad.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/styles/console-canvas-settings.css apps/web/src/styles/console-canvas-prompts.css apps/web/src/styles/console-canvas-code-intel.css
git commit -m "feat(web): re-skin settings + prompts + code intel tabs"
```

## Task 4.5: QA wave 1 — open every tab, capture issues

- [ ] **Step 1: Walkthrough**

Run `pnpm dev`. Visit each primary nav tab in order. For each tab:
1. Note any visual breakage (clipping, overlap, illegible text, broken layout).
2. Hover key interactive elements (buttons, rows, cards) — confirm hover/focus visible.
3. Open any sub-dialogs reachable from the tab.

- [ ] **Step 2: Record issues inline**

If you find any breakage, fix it in the relevant `console-canvas-*.css` file via a targeted addition (do not overhaul). Commit each fix as `fix(web): <tab>: <issue>`.

- [ ] **Step 3: Confirm checkpoint**

When all tabs render without obvious breakage, proceed to Phase 5.

---

# Phase 5 · Dialogs + Empty + Final QA (~2 days)

## Task 5.1: Re-skin destructive dialogs

**Files:**
- Modify: `apps/web/src/styles/chrome-and-buttons.css` (dialog block)
- Read-only: `apps/web/src/components/DeleteTentacleDialog.tsx`, `ClearAllConversationsDialog.tsx`, `TentacleGitActionsDialog.tsx`, `canvas/DeleteAllTerminalsDialog.tsx`

- [ ] **Step 1: Append dialog refinements**

Open `apps/web/src/styles/chrome-and-buttons.css`. Append:

```css
/* === Magical mecha: dialogs === */

.dialog,
.modal-dialog,
.app-dialog {
  background: var(--bg-surface-1);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.5),
    var(--glow-strong);
  padding: 20px;
  max-width: 540px;
}

.dialog__title,
.modal-dialog__title {
  font-family: var(--font-display);
  font-style: italic;
  color: var(--accent-primary);
  margin: 0 0 12px;
}

.dialog--warning,
.dialog--destructive {
  border-color: rgba(255, 140, 66, 0.5);
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.5),
    var(--glow-warning);
}

.dialog--warning .dialog__title,
.dialog--destructive .dialog__title {
  color: var(--accent-warning);
}

.dialog__backdrop,
.modal-backdrop {
  background: rgba(10, 8, 20, 0.7);
  backdrop-filter: blur(4px);
}
```

- [ ] **Step 2: Mark destructive dialogs with the warning class (JSX touches)**

For each destructive dialog component, ensure its root dialog div has the `dialog--warning` (or `dialog--destructive`) class. The exact prop name depends on what class hooks exist today — open each file and add to the dialog wrapper's `className`:

- `apps/web/src/components/DeleteTentacleDialog.tsx`
- `apps/web/src/components/ClearAllConversationsDialog.tsx`
- `apps/web/src/components/canvas/DeleteAllTerminalsDialog.tsx`

Example pattern:

```tsx
<div className="dialog dialog--destructive">
  {/* ... */}
</div>
```

If the dialog component uses an external dialog library wrapper, add the class via the library's `className` prop on the root.

For `TentacleGitActionsDialog.tsx` — keep the neutral `.dialog` class (it's not destructive).

- [ ] **Step 3: Visual verification**

Trigger each dialog (delete a tentacle, clear conversations, etc.). Destructive dialogs should glow orange around the border; titles in italic serif.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/styles/chrome-and-buttons.css apps/web/src/components/DeleteTentacleDialog.tsx apps/web/src/components/ClearAllConversationsDialog.tsx apps/web/src/components/canvas/DeleteAllTerminalsDialog.tsx
git commit -m "feat(web): re-skin destructive dialogs with warning glow"
```

## Task 5.2: Re-skin `EmptyOctopus` empty state

**Files:**
- Modify: `apps/web/src/components/EmptyOctopus.tsx`
- Modify: `apps/web/src/styles/console-canvas-canvas.css` (or wherever `.empty-octopus` lives — `grep` first)

- [ ] **Step 1: Identify the file that styles `EmptyOctopus`**

Run: `grep -rn "empty-octopus\|EmptyOctopus" apps/web/src/styles/ apps/web/src/components/EmptyOctopus.tsx`

Note the relevant style file (likely `console-canvas-canvas.css` or `chrome-and-buttons.css`).

- [ ] **Step 2: Wrap the container in sparkle host (JSX)**

Open `apps/web/src/components/EmptyOctopus.tsx`. Add `mm-sparkle-host mm-sparkle-host--dense` to the outer container className, and add an extra sparkle child:

```tsx
<div className="empty-octopus mm-sparkle-host mm-sparkle-host--dense">
  <span className="mm-sparkle-extra" aria-hidden="true">✧</span>
  {/* existing children, including the octopus illustration */}
  <p className="empty-octopus__prompt">summon your first tentacle ✦</p>
</div>
```

If the component already has a prompt or call-to-action line, replace its text with `summon your first tentacle ✦`. If it doesn't, add the `<p>` above.

- [ ] **Step 3: Style the prompt**

In the style file identified in Step 1, append:

```css
.empty-octopus {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
  position: relative;
}

.empty-octopus__prompt {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 800;
  color: var(--accent-primary);
  font-size: 18px;
  margin-top: 20px;
  text-shadow: var(--glow-soft);
}
```

- [ ] **Step 4: Visual verification**

Open the app in an empty state (no tentacles). Confirm sparkles drifting and italic pastel prompt.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/EmptyOctopus.tsx apps/web/src/styles/
git commit -m "feat(web): re-skin EmptyOctopus with sparkle constellation"
```

## Task 5.3: Final QA pass — checklist

- [ ] **Step 1: Run unit tests**

Run: `pnpm test`
Expected: all tests pass (existing + 11 new).

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: no errors. (Warnings on pre-existing code are out of scope to fix.)

- [ ] **Step 3: Run build**

Run: `pnpm build`
Expected: clean build, no errors.

- [ ] **Step 4: Manual QA — visual walkthrough**

Run `pnpm dev`. Step through:

- [ ] Open each primary nav tab — layout intact, colors consistent
- [ ] Hover at least one interactive element on each tab — visible feedback
- [ ] Open each dialog (delete tentacle, clear conversations, git actions, delete terminals) — readable, focusable
- [ ] Press `Tab` repeatedly — focus moves to all interactive elements and is visible
- [ ] Spawn or simulate a terminal — header shows character name in italic serif, lock indicator appears when state changes to `processing`
- [ ] Trigger the empty state — sparkles drift

- [ ] **Step 5: Manual QA — accessibility**

- [ ] Open Chrome DevTools → Lighthouse → run a11y audit. Score ≥ 95.
- [ ] In DevTools → Rendering tab → Emulate CSS media feature `prefers-reduced-motion: reduce`. All animations stop. Refresh and confirm sparkles, ring, pulses are static.
- [ ] Install axe DevTools extension; run on Canvas tab. Zero color-contrast violations.

- [ ] **Step 6: Performance check**

- [ ] Open Canvas tab with at least 3 active terminals. Open DevTools → Performance tab. Record 5 seconds of interaction (hover, scroll). Confirm frame rate ≥ 55fps.

- [ ] **Step 7: Update AGENTS.md final**

Open `apps/web/AGENTS.md`. Verify the "Magical Mecha Pattern Primitives" section (added in Task 1.7) is still accurate. If any patterns evolved during implementation (e.g., a new class was added), update the docs.

- [ ] **Step 8: Commit closing notes**

```bash
git add apps/web/AGENTS.md
git commit -m "docs(web): finalize magical-mecha pattern docs after QA"
```

- [ ] **Step 9: Sign-off note**

Add a short summary comment to the PR (or commit message) recording:
- Tests passed: yes/no
- Lighthouse a11y: <score>
- Frame rate on Canvas: <fps>
- Any deferred issues with tracking links

---

## Plan complete

All six phases implemented. The redesign should be visible end-to-end, all tabs preserved, all dialogs preserved, all interactions functional. Re-runnable from `git log --oneline` since each task is a single commit.
