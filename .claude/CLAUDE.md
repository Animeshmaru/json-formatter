# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build         # Production build
npm run build:dev     # Development-mode build (unminified, for debugging build output)
npm run lint           # ESLint over the whole repo
npm run test            # Run vitest once (CI mode)
npm run test:watch       # Run vitest in watch mode
```

Run a single test file: `npx vitest run src/test/example.test.ts`
Run tests matching a name: `npx vitest run -t "some test name"`

There is no separate typecheck script; `npm run build` (via `tsc -b` through Vite) is the way to surface type errors. `@typescript-eslint/no-unused-vars` is turned off in [eslint.config.js](eslint.config.js), so lint will not catch unused variables.

Both `bun.lock` and `package-lock.json` are present; existing scripts and CI assume npm — use `npm` unless told otherwise.

## Architecture

This is a 100% client-side, static single-page app (Vite + React + TypeScript). There is no backend: all JSON processing, storage, and sharing happens in the browser.

**State ownership.** [src/hooks/useTabs.ts](src/hooks/useTabs.ts) is the single source of truth for app state (`AppState` = `tabs[]` + `activeTabId` + `preferences`, defined in [src/types/index.ts](src/types/index.ts)). It's a plain `useState` hook (no context/store library) instantiated once in [src/pages/Index.tsx](src/pages/Index.tsx) and threaded down as props. Every state mutation (add/close/rename tab, edit content, toggle diff mode, update preferences, reorder/restore tabs) is a callback exposed by this hook. `Index.tsx` composes these into UI event handlers (format, copy, download, share, clear, undo-via-toast) and owns view-only state that doesn't need to persist (`isMinified`, `activeDiffSide`).

**Persistence.** [src/utils/storage.ts](src/utils/storage.ts) serializes the entire `AppState` to `localStorage` on every change (effect in `useTabs`). `getStoredState()` backfills missing fields (e.g. new diff-mode fields, new preference keys) so older saved state doesn't break on load — when adding a new `Tab` or `EditorPreferences` field, update the backfill/defaults here too.

**Two editor modes per tab**, toggled by `Tab.isDiffMode`:
- Normal mode: [src/components/Editor/JsonEditor.tsx](src/components/Editor/JsonEditor.tsx), a Monaco wrapper editing `Tab.content`.
- Diff mode: [src/components/Editor/DiffMode.tsx](src/components/Editor/DiffMode.tsx), a two-pane (or unified) Monaco diff view over `Tab.diffLeft`/`Tab.diffRight`. Diff-specific comparison options (ignore key order, ignore array order, keys-only, diff-only view) live in `EditorPreferences` and are applied via [src/utils/diffCompare.ts](src/utils/diffCompare.ts)'s `normalizeJsonForDiff`, which canonicalizes each side (optionally sorting keys/arrays, optionally stripping all leaf values to diff structure only) before Monaco diffs the normalized strings — the underlying tab content is never mutated by these options.

Toolbar actions and keyboard shortcuts ([src/hooks/useKeyboardShortcuts.ts](src/hooks/useKeyboardShortcuts.ts)) branch on `isDiffMode` in `Index.tsx` to act on either the active tab's content or the focused diff side (`activeDiffSide`).

**JSON handling.** [src/utils/jsonFormatter.ts](src/utils/jsonFormatter.ts) is the core parse/format/validate/minify logic; it strips `//` and `/* */` comments before `JSON.parse` (so JSONC-ish input is tolerated) and derives line/column from the error position for `ErrorDisplay`. `diffCompare.ts` builds on top of it rather than duplicating parsing.

**Sharing.** [src/utils/shareUrl.ts](src/utils/shareUrl.ts) round-trips JSON through a `?json=` query param using `lz-string` compression, entirely client-side; `Index.tsx` reads it once on mount and clears the param after loading.

**UI components.** [src/components/ui/](src/components/ui/) is shadcn/ui (see [components.json](components.json) for aliases/config) — treat these as generated/vendored primitives rather than hand-rolled app components; app-specific composition lives in `Editor/`, `Tabs/`, `Layout/`, `Nav/`.
