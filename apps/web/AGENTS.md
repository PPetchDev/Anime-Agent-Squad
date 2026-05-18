# Web Guidelines

## Ownership
- `apps/web` owns the operator UI, client-side interaction flow, and presentation of runtime state.
- Keep backend orchestration out of the UI. The web app should consume API/runtime contracts, not recreate server logic in React components.

## Relevant Docs
- `docs/concepts/mental-model.md`
- `docs/concepts/tentacles.md`
- `docs/concepts/runtime-and-api.md`
- `docs/guides/working-with-todos.md`
- `docs/guides/orchestrating-child-agents.md`
- `docs/guides/inter-agent-messaging.md`
- Read these when changing interaction models, UI vocabulary, tentacle flows, agent orchestration surfaces, or operator-facing behavior.

## Module Shape
- Top-level containers should orchestrate. Move pure constants, parsers, normalizers, and hooks into `src/app/*`.
- Keep large JSX blocks in focused components under `src/components/*` with typed props.
- Reusable primitives belong in `src/components/ui/*`.
- Runtime transport code belongs in `src/runtime/*`.

## Styling
- Keep `src/styles.css` as the import manifest.
- Add or update focused CSS modules under `src/styles/*` instead of growing one large stylesheet.
- Preserve the existing token-driven, modular CSS structure and avoid one-off style dumping in unrelated files.

## UI Conventions
- Use the existing product vocabulary: agents, sessions, worktrees, logs, pipelines, tentacles, and terminal columns.
- Preserve the current layout model: terminal columns are the visual unit; tentacles are the contextual grouping.
- Prefer in-app confirmation and action-panel flows over browser-native dialogs for destructive actions.

## State
- Persist layout and UI preferences through the runtime-backed `.octogent` state model, not browser-only storage, unless the feature is explicitly local-only.
- Keep tentacle IDs stable for routing and runtime identity; user-facing names remain presentation data.

## Testing
- Add targeted component or runtime tests when changing view-model logic, state reconciliation, or destructive UI flows.
- When modifying shared UI behavior, verify both the component surface and the normalizer/hook logic that feeds it.

## Magical Mecha Pattern Primitives

The `magicalmecha-*.css` modules in `src/styles/` provide five reusable visual patterns. Opt into them by adding classNames — no JS required.

- `.mm-hud-frame` — corner-bracketed panel. Add `<span class="mm-hud-frame__corner-bl"></span><span class="mm-hud-frame__corner-br"></span>` as direct children for the bottom corners; optionally add `<span class="mm-hud-frame__label">アクティブ</span>` for a kana label. `--warning` variant for orange brackets.
- `.mm-sparkle-host` — adds `::before`/`::after` ✦/✧ glyphs that drift. Variants: `--dense` (with a `.mm-sparkle-extra` child), `--subtle`.
- `.mm-sync-avatar` + `.mm-sync-body` + `.mm-sync-bar` + `.mm-sync-traits` — character avatar with dashed rotating ring and sync ratio bar. Render through `CharacterAvatar` with `syncRatio` and `bondTraits` props.
- `.mm-scanline` — 4%-alpha repeating gradient overlay via `::after`. Children automatically reflowed to `z-index: 1`.
- `magicalmecha-motion.css` defines `mm-spin`, `mm-drift`, `mm-pulse-glow`, `mm-pulse-warning`, `mm-fade-in` keyframes and the global `prefers-reduced-motion` guard.

All patterns honor `prefers-reduced-motion: reduce` automatically through the global guard. Decorative pseudo-elements and ring SVGs must be `aria-hidden` — never the sole source of meaning.
