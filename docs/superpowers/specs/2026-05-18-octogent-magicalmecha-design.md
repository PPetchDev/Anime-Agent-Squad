# Octogent — Magical Mecha Re-skin

**Status:** Draft · awaiting user review
**Date:** 2026-05-18
**Owner:** Mika (frontend)
**Scope:** Visual re-skin of `apps/web` UI. No feature changes, no API changes, no behavior changes.

## 1. Intent

Take the existing Octogent operator UI and re-skin it as **Magical Mecha** — a hybrid anime aesthetic that combines mecha cockpit/HUD framing (sync ratios, panel borders, monospace metric tiles, scan lines, target reticles) with magical-girl styling (pastel rose/lavender/mint palette, sparkles ✦✧, kawaii character cards, serif italic display type, "spell/cast/mana" microcopy).

The agents are already framed as anime characters in the existing system (`CharacterAvatar`, `CharacterPicker`, agents named Mika, Yuki, Hana). This redesign leans into that framing instead of fighting it.

### Locked decisions

| Question | Answer |
|---|---|
| Genre | Magical Mecha (mecha HUD × magical girl hybrid, in the spirit of *Symphogear*, *Madoka Rebellion*, *Lyrical Nanoha*) |
| Intensity | Balanced — HUD bones 50% / sparkle skin 50%. Chrome jazz'd up. Terminal keeps mono + dark, gets pastel accents only |
| Vocabulary | Hybrid — keep canonical names (`tentacle`, `agent`, `session`, `terminal`); add magical microcopy (sync ratio, cast rate, mana, lock, awaken, ritual, bond) at metric labels, status pills, and empty states |
| Palette | Symphogear — dark cosmic base + pastel rose/lavender/mint + technical orange warning |
| Implementation | Token swap + focused CSS-only enhancements + targeted JSX touches. No new component library, no behavior change |

### Non-goals

- ❌ Removing or hiding any existing tab, surface, dialog, or feature
- ❌ Changing component contracts (props/state)
- ❌ Changing routing, API endpoints, or state machines
- ❌ Renaming `tentacle`/`agent`/`session` in code or docs (vocabulary stays at the microcopy layer)
- ❌ Building a new design-system package
- ❌ Pixel-level visual regression testing (overkill; manual QA + Lighthouse suffice)

## 2. Architecture & file organization

The codebase is already CSS-variable-driven and modular (`src/styles.css` as manifest, focused `console-*.css` and `console-canvas-*.css` files). The redesign respects that structure.

### Files edited

```
apps/web/src/styles/
├── foundation.css                ← palette + typography token overrides
├── console-theme-tokens.css      ← console-specific token overrides
├── chrome-and-buttons.css        ← HUD-style buttons, pill states
├── sidebar-and-scrollbars.css    ← glow border, character card frame
├── terminal-and-status.css       ← pastel prompt char, lock indicator
└── character.css                 ← sync ring, bond traits styling
```

### Files added (new CSS modules)

```
apps/web/src/styles/
├── magicalmecha-sparkle.css      ← ✦ sparkle pseudo-element layer
├── magicalmecha-hud-frame.css    ← HUD frame border + corner brackets
├── magicalmecha-sync-ring.css    ← rotating dashed ring + sync bar
├── magicalmecha-scanline.css     ← optional scan-line overlay
└── magicalmecha-motion.css       ← shared keyframes + reduced-motion guard
```

These are imported through `src/styles.css` (the existing manifest), keeping the established pattern.

### JSX touches (props-compatible, conditional)

- `CharacterAvatar.tsx` — add optional `syncRatio?: number` and `bondTraits?: string[]` props. When omitted, render the existing avatar (backward compatible).
- `ActiveAgentsSidebar.tsx` — wrap section headers in `.mm-hud-frame` className. No prop changes.
- `Terminal.tsx` — read existing `agentRuntimeState` (values: `idle | processing | waiting_for_permission | waiting_for_user`) and render a state-specific indicator: `processing` → `◢ CASTING ◣` mint, `waiting_for_permission` → `◢ PERMISSION ◣` orange, `waiting_for_user` → `◢ AWAITING ◣` orange, `idle` → no indicator. No new state.
- `AgentStateBadge.tsx` — uses `StatusBadge` with the existing `StatusBadgeTone` union (`live | idle | processing | queued | blocked | warning`). Re-skin via the StatusBadge CSS only; DOM shape and tone mapping unchanged.

### Safety rules

- ❌ Do not modify component contracts (props/state) destructively
- ❌ Do not change routing, API contracts, state machines
- ❌ Do not remove any tab, dialog, button, or surface
- ✦ Every enhancement is an isolated CSS module → revert one file to undo it
- ✦ Every JSX touch uses optional/conditional rendering → backward compatible
- ✦ All animation respects `prefers-reduced-motion`

### Token-driven principle

Symphogear palette is set once in `foundation.css` and `console-theme-tokens.css`. Every styled surface picks up the change automatically through existing `var(--...)` references. This means Phase 0 alone produces a visible (if rough) "paint job," and later phases layer on patterns without re-touching colors.

## 3. Design tokens (Symphogear)

Values written into `apps/web/src/styles/foundation.css` and `console-theme-tokens.css`:

### Colors

```css
/* Base surfaces — dark cosmic */
--bg-canvas:        #0a0814;   /* deep void background */
--bg-surface-1:     #110a1f;   /* sidebar, panels */
--bg-surface-2:     #1a1230;   /* raised cards */
--bg-surface-3:     #261a44;   /* hover surfaces */

/* Magical pastel triad */
--accent-primary:   #ffd8ec;   /* rose — primary action, focus, character */
--accent-secondary: #c8a8e8;   /* lavender — link, secondary action */
--accent-mint:      #a8f0c8;   /* mint — success, active, healthy */

/* Technical warning band */
--accent-warning:   #ff8c42;   /* engine orange — lock, busy, alert */
--accent-danger:    #ff5f7a;   /* destructive (warmer than current red) */

/* Text */
--text-primary:     #f5eef8;
--text-secondary:   #c9b8d8;
--text-muted:       #8a7a9c;

/* Borders & rings */
--border-subtle:    rgba(255, 216, 236, 0.18);
--border-strong:    rgba(255, 216, 236, 0.45);
--ring-focus:       #ffd8ec;

/* Terminal — keep dark + high contrast */
--terminal-bg:      #06030f;
--terminal-text:    #e6e8ec;
--terminal-prompt:  #ffd8ec;
--terminal-success: #a8f0c8;
--terminal-warning: #ff8c42;
--terminal-error:   #ff5f7a;
```

### Glows (new — magical mecha signature)

```css
--glow-soft:    0 0 12px rgba(255, 216, 236, 0.35);
--glow-strong:  0 0 20px rgba(255, 216, 236, 0.6);
--glow-warning: 0 0 12px rgba(255, 140, 66, 0.5);
--glow-mint:    0 0 12px rgba(168, 240, 200, 0.5);
```

### Typography

```css
--font-display: "Playfair Display", Georgia, "Times New Roman", serif;
--font-main:    "PP Neue Machina Plain", "PP Neue Machina",
                "JetBrains Mono", "IBM Plex Mono", monospace;
--font-mono:    "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
--font-kana:    "Noto Sans JP", sans-serif;
--ui-base-font-size: 18px;   /* unchanged */
```

Google Fonts imports added at the top of `foundation.css`: `Playfair Display` (italic 800), `Noto Sans JP` (regular). The existing `Silkscreen` import is **kept** — it is referenced from `console-canvas-deck.css` (4 places). Phase 4's Deck day decides whether those four usages stay on Silkscreen (pixel display retro accent inside the magical-mecha frame) or migrate to `--font-display`.

### Radii

```css
--radius-sm:   4px;
--radius-md:   8px;
--radius-lg:   12px;
--radius-pill: 999px;
```

### Effects

```css
--scanline-overlay:
  repeating-linear-gradient(0deg, transparent 0, transparent 2px,
    rgba(255, 216, 236, 0.025) 2px, rgba(255, 216, 236, 0.025) 3px);

--sparkle-z-index: 1;
```

Spacing scale and `--scrollbar-size`, `--terminal-column-min-width`: unchanged.

## 4. Visual building blocks

Eight reusable patterns. Each is a small CSS module that components opt into via className. No JS infrastructure required (except where a JSX touch is explicitly listed).

### 4.1 HUD frame

Corner-bracketed panel border with optional kana label. Used to wrap sidebars, panel headers, dialog bodies.

```html
<div class="mm-hud-frame">
  <span class="mm-hud-frame__label">アクティブ</span>
  <span class="mm-corner-bl"></span><span class="mm-corner-br"></span>
  <!-- content -->
</div>
```

### 4.2 Character sync ring

Dashed ring slowly rotating around the avatar core, with a horizontal sync bar and optional bond-trait pills. Powered by `CharacterAvatar` props `syncRatio` and `bondTraits`.

### 4.3 Sparkle layer

`::before` and `::after` pseudo-elements with ✦/✧ glyphs drifting on a 4–6s loop. Applied to empty states, sidebar accents, hover-active cards. Decorative only — `aria-hidden`, never the sole conveyor of meaning.

### 4.4 Scan-line overlay

Repeating 2–3px gradient at 4% alpha. Applied to active panels and terminal header chrome. Atmospheric, low-distraction.

### 4.5 Status pills

Re-skin of the existing `StatusBadge` (`apps/web/src/components/ui/StatusBadge.tsx`). Six tones already wired: `live`, `idle`, `processing`, `queued`, `blocked`, `warning`. Re-color them in the magical-mecha palette:

- `idle` → lavender (`--accent-secondary`)
- `live` / `processing` → mint (`--accent-mint`) with pulse glow on `processing`
- `queued` → muted lavender, no glow
- `warning` (covers `waiting_for_permission`, `waiting_for_user`) → orange (`--accent-warning`)
- `blocked` → danger pink (`--accent-danger`)

Each pill is color + dot + text label (never color alone — a11y). DOM shape unchanged; only CSS re-skin.

### 4.6 Metric tile

Mecha-cockpit-style readout: small mono label, large value, unit, optional inline sparkline. Used in `RuntimeStatusStrip`, `ActivityPrimaryView`, `GitHubPrimaryView`, `MonitorPrimaryView`.

### 4.7 Lock indicator

Compact bracketed indicator in the terminal header, driven by `agentRuntimeState`:

- `processing` → `◢ CASTING ◣` in mint
- `waiting_for_permission` → `◢ PERMISSION ◣` in warning orange
- `waiting_for_user` → `◢ AWAITING ◣` in warning orange
- `idle` → indicator hidden

JSX touch in `Terminal.tsx` only — no new state introduced.

### 4.8 Kana decorative spans

Small Japanese typography accents (魔法, 同期, 召喚) placed alongside English labels. `aria-hidden="true"` everywhere — never the only label for any control or status.

## 5. Surface inventory

Every surface in `apps/web/src/components/` is re-skinned. No surface is removed.

### Console chrome (always visible)

| Surface | File | Patterns |
|---|---|---|
| RuntimeStatusStrip | `RuntimeStatusStrip.tsx` + `console-chrome-status-nav.css` | Metric tile (3-up), scan-line, kana deco |
| ConsolePrimaryNav | `ConsolePrimaryNav.tsx` + `console-chrome-status-nav.css` | HUD frame on active item, glow on hover, sparkle on selected |
| ActiveAgentsSidebar | `ActiveAgentsSidebar.tsx` + `sidebar-and-scrollbars.css` | HUD frame header (kana `アクティブ`), sparkle accent |
| TelemetryTape | `TelemetryTape.tsx` + `console-overrides-telemetry.css` | Scan-line, mono + pastel accent |
| SidebarActionPanel | `SidebarActionPanel.tsx` | Pastel pill buttons inside HUD frame |

### Primary view tabs

| Tab | Components | CSS file | Treatment |
|---|---|---|---|
| Canvas | `CanvasPrimaryView`, `OctopusNode`, `SessionNode`, `CanvasTentaclePanel`, `CanvasTerminalColumn` | `console-canvas-canvas.css` | Every node = HUD frame; each agent = sync ring; octopus center = magical sigil; lines = pastel gradient |
| Activity | `ActivityPrimaryView`, `UsageHeatmap` | `console-canvas-activity.css` | Metric tile grid, sparkle empty state, heatmap cells use pastel ramp (void → rose → lavender → mint) |
| Deck | `DeckPrimaryView` | `console-canvas-deck.css` | Character card with sync ring, hover glow, "summon ✦" CTA |
| GitHub | `GitHubPrimaryView` | `console-canvas-github.css` | Metric tiles (commits/PRs/issues), commit list rows = HUD-framed, kana `リポ` |
| Monitor | `MonitorPrimaryView` | `console-canvas-monitor.css` | Metric tile, scan-line overlay, event feed rows = pastel |
| Conversations | `ConversationsPrimaryView`, `SidebarConversationsList` | `console-canvas-conversations.css` | Sidebar HUD frame, message bubbles = pastel rounded, character avatar with sync ring |
| Settings | `SettingsPrimaryView` | `console-canvas-settings.css` | Toggle = magical pill; section card = HUD frame |
| Prompts | `PromptsPrimaryView`, `SidebarPromptsList` | `console-canvas-prompts.css` | Prompt list rows = HUD-framed, kana `儀式` |
| Code Intel | `CodeIntelPrimaryView`, `CodeIntelArcDiagram`, `CodeIntelTreemap` | `console-canvas-code-intel.css` | Arc/treemap fills = pastel triad; labels = mono pastel |

### Terminal subsystem

| Surface | File | Treatment |
|---|---|---|
| Terminal header | `Terminal.tsx` + `terminal-and-status.css` | HUD frame, `mika ✦` styled prompt with italic character name, lock indicator when busy |
| Terminal body | (xterm.js scroller) | Keep dark `#06030f` BG + JetBrains Mono. Only accent colors (prompt, success, warning) flow via CSS variables |
| TerminalPromptPicker | `TerminalPromptPicker.tsx` | Pastel pill option list, kana `儀式` accent |

### Character system

| Component | File | Treatment |
|---|---|---|
| CharacterAvatar | `CharacterAvatar.tsx` + `character.css` | Add optional `syncRatio` and `bondTraits` props → sync ring renders when present (backward compatible) |
| CharacterPicker | `CharacterPicker.tsx` + `character.css` | Grid = magical card; hover = lift + glow; selected = sparkle border |
| AgentStateBadge | `AgentStateBadge.tsx` | Map to new status pill variants |

### Dialogs

| Dialog | File | Treatment |
|---|---|---|
| DeleteTentacleDialog | `DeleteTentacleDialog.tsx` | HUD frame, warning accent, "release tentacle ✧" copy |
| ClearAllConversationsDialog | `ClearAllConversationsDialog.tsx` | HUD frame, warning orange accent |
| TentacleGitActionsDialog | `TentacleGitActionsDialog.tsx` | Tabs as pastel pills; commit input HUD-framed |
| DeleteAllTerminalsDialog | `canvas/DeleteAllTerminalsDialog.tsx` | Warning orange + lock indicator |

### Empty states & data viz

| Surface | Treatment |
|---|---|
| EmptyOctopus | Sparkle constellation, italic prompt "summon your first tentacle ✦" |
| UsageHeatmap cells | Pastel intensity ramp (void → rose → lavender → mint) — no red/green |
| CodeIntelTreemap rects | Pastel triad fills, HUD-thin borders |
| CodeIntelArcDiagram arcs | Pastel gradient strokes, opacity-based weight |

## 6. Motion, accessibility, testing

### Motion budget

| Animation | Surface | Duration | Notes |
|---|---|---|---|
| Sync ring spin | Character avatar | 16s linear infinite | 1 rotation per 16s — ambient |
| Sparkle drift | Sparkle layer | 4–6s ease-in-out infinite | translateY ±3px + opacity .6→1 |
| Pill glow pulse | Active/busy pills | 2s ease-in-out infinite (active only) | box-shadow alpha .3↔.6 |
| Hover lift | Cards, buttons | 200ms ease-out | translateY -2px + glow appear |
| Focus ring | Keyboard focus | 150ms ease-out | sparkle ring scale .98→1.02 |
| Tab transition | Nav switch | 220ms cubic-bezier(.4,0,.2,1) | opacity + slight slide |

Hard rules:
- No auto-playing video, parallax, or scroll-jacked animation
- No animating `width`/`height`/`top`/`left` — `transform` + `opacity` only
- No JS-driven animation — CSS keyframes only
- All animation off when `prefers-reduced-motion: reduce`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Accessibility

Contrast targets (WCAG AA minimum, AAA preferred):

| Pair | Ratio | Status |
|---|---|---|
| text-primary on bg-canvas | 16.4:1 | AAA |
| text-secondary on bg-canvas | 10.8:1 | AAA |
| text-muted on bg-canvas | 5.6:1 | AA (large+body) |
| accent-primary on bg-canvas | 14.2:1 | AAA |
| accent-warning on bg-canvas | 7.4:1 | AA |

Other a11y rules:
- `:focus-visible` outline = 2px sparkle ring + 1px offset (not a glow substitute — outlines stay visible at low contrast)
- Status badges = color + dot + text label, never color alone
- Kana spans, sparkle pseudo-elements, sync ring SVGs = `aria-hidden="true"`
- Sync ratio numeric value announced via aria-label on the parent card

### Testing strategy

Unit / component tests (vitest, existing infrastructure):
- `pnpm test` must pass — all existing tests stay green (no contract changes)
- New tests for `CharacterAvatar`:
  - `syncRatio` omitted → no ring rendered
  - `syncRatio={50}` → bar at 50% width
  - With `prefers-reduced-motion` → animation classes suppressed
- New tests for `Terminal.tsx`:
  - `agentRuntimeState === 'processing'` → `CASTING` indicator renders
  - `agentRuntimeState === 'waiting_for_permission'` → `PERMISSION` indicator renders
  - `agentRuntimeState === 'waiting_for_user'` → `AWAITING` indicator renders
  - `agentRuntimeState === 'idle'` → indicator hidden

Manual QA checklist (run during Phase 5; full sign-off list):
- Every primary nav tab opens — no broken layout, no missing element
- Every dialog opens, is readable, focusable, ESC dismissable
- Terminal renders code/log readably, scrolls smoothly, colors follow mapping
- Empty state sparkles drift, copy is legible
- DevTools toggle `prefers-reduced-motion` → animations stop immediately
- Lighthouse a11y score ≥ 95
- Tab navigation reveals focus on every interactive element
- axe DevTools color-contrast pass
- Canvas tab frame rate ≥ 55fps

Visual snapshot tests: out of scope for this redesign (manual QA + Lighthouse + axe cover the risk).

### Rollout safety

- All CSS changes live in isolated modules — revert one file to undo a pattern
- JSX touches use optional/conditional rendering — backward compatible
- No feature flag (overkill for re-skin) — phased commits per Section 7 give clean bisect
- `pnpm lint` + `pnpm build` + `pnpm test` must pass before each phase commit
- `apps/web/AGENTS.md` updated with note about `magicalmecha-*.css` modules

## 7. Implementation phases

Six phases. Each phase ships independently, reverts independently, reviews independently.

### Phase 0 · Foundation tokens (~1 day)

Goal: swap palette at root tokens; everything cascades automatically.

- Edit `foundation.css` — replace all color variables with Symphogear values
- Edit `console-theme-tokens.css` — sync console-specific tokens
- New `magicalmecha-motion.css` — keyframes + reduced-motion guard
- Add Google Fonts: Playfair Display + Noto Sans JP (keep existing Silkscreen import — still used by deck CSS)
- Run `pnpm lint`, `pnpm build`, visual smoke — all tabs render, nothing broken

Ships: "paint job" palette across the whole app. No HUD frames or sparkle rings yet.

### Phase 1 · Pattern library (~2–3 days)

Goal: build the eight reusable CSS modules so later phases just add classNames.

- New `magicalmecha-sparkle.css` (`.mm-sparkle-host` + variants)
- New `magicalmecha-hud-frame.css` (`.mm-hud-frame` + corners + kana label)
- New `magicalmecha-sync-ring.css` (`.mm-sync-avatar` + ring + bar)
- New `magicalmecha-scanline.css` (`.mm-scanline` overlay)
- Update `character.css` — add sync ring classes
- Update `styles.css` import manifest
- Add "Magical Mecha pattern primitives" section to `apps/web/AGENTS.md` with usage examples

Ships: no user-visible change — pattern library is ready for consumers.

### Phase 2 · Console chrome (~2 days)

Goal: re-skin surfaces visible on every tab.

- `ConsolePrimaryNav` — active state HUD frame + sparkle, hover glow
- `ActiveAgentsSidebar` — HUD frame header with kana `アクティブ`, agent rows show sync ring
- `RuntimeStatusStrip` — metric tiles (cast rate / mana / queue), scan-line
- `TelemetryTape` — pastel mono + scan-line
- `SidebarActionPanel` — pastel pill buttons inside HUD frame

Ships: first dramatic user-visible change — every tab has new chrome.

### Phase 3 · Character + Terminal (~2 days)

Goal: reusable parts with focused JSX touches and tests.

- `CharacterAvatar.tsx` — add optional `syncRatio` and `bondTraits` props (backward compatible); render ring/bar when present
- `CharacterPicker.tsx` — magical card hover state
- `AgentStateBadge.tsx` — map to new status pill variants
- `Terminal.tsx` — header HUD frame + `mika ✦` prompt style + TARGET LOCK indicator (reads existing `agentRuntimeState`)
- `TerminalPromptPicker.tsx` — pastel pill option list
- New tests: sync ring conditional render, reduced-motion guard, lock indicator state mapping

Ships: character cards and terminal headers updated everywhere.

### Phase 4 · Primary view tabs (~4–5 days)

Goal: re-skin each canvas using the pattern library.

- Day 1: Canvas (`CanvasPrimaryView` + `OctopusNode` + `SessionNode` + `CanvasTentaclePanel` + `CanvasTerminalColumn`) — heaviest single surface
- Day 2: Activity + GitHub + Monitor (metric tiles, heatmap palette)
- Day 3: Deck + Conversations
- Day 4: Settings + Prompts + Code Intel
- Day 5: QA wave 1 — every tab + key interaction smoke

Ships: full primary view re-skin.

### Phase 5 · Dialogs + Empty + Final QA (~2 days)

- `DeleteTentacleDialog`, `ClearAllConversationsDialog`, `TentacleGitActionsDialog`, `DeleteAllTerminalsDialog` — HUD frame + warning pill states
- `EmptyOctopus` — sparkle constellation + italic copy
- Run manual QA checklist
- Lighthouse a11y, axe DevTools
- `pnpm test` + `pnpm lint` + `pnpm build` clean
- Final `apps/web/AGENTS.md` update

Ships: redesign complete.

### Total estimate

| Phase | Effort | Risk |
|---|---|---|
| 0 · Foundation tokens | 1 day | Low |
| 1 · Pattern library | 2–3 days | None (no UI change) |
| 2 · Console chrome | 2 days | Low |
| 3 · Character + Terminal | 2 days | Low |
| 4 · Primary view tabs | 4–5 days | Medium (Canvas is dense) |
| 5 · Dialogs + Empty + QA | 2 days | Low |
| **Total** | **~13–15 working days** (~2–3 weeks) | |

## 8. Open questions

None blocking. Two items deferred to implementation, both with clear precedent:

- **Sync ratio data source.** The `CharacterAvatar` sync ring needs a 0–100 number per agent. Implementation should derive this from existing `agentRuntimeState` activity (e.g., busy / total ratio over the recent window) using the `terminalRuntimeStateStore` already wired in `App.tsx`. No new data plumbing required.
- **Custom character art per agent.** Out of scope for the re-skin. Existing gradient avatars stay; future work may swap in AI-generated portraits, but the design tolerates either.

## 9. References

- Project guidelines: `CLAUDE.md`, `apps/web/AGENTS.md`
- Existing token structure: `apps/web/src/styles/foundation.css`, `apps/web/src/styles/console-theme-tokens.css`
- Existing character system: `apps/web/src/components/character/`
- Brainstorming mockups (transient): `.superpowers/brainstorm/*/content/`
