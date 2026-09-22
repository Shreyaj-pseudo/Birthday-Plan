# Repository Guidelines

## Project Structure & Module Organization

This is a local-first React and TypeScript birthday website built with Vite. `src/App.tsx` manages navigation, selection, and watched progress; `src/Cake.tsx` renders the Three.js cake through React Three Fiber; `src/VideoPlayer.tsx` handles playback and placeholders. Keep recipient details and the nine slice definitions in `src/content.ts`, and visual styling in `src/styles.css`.

Store videos and optional posters in `public/videos/`. Component tests live in `src/App.test.tsx`; browser checks live in `tests/browser.mjs`. Generated `dist/`, `.artifacts/`, and `node_modules/` directories are ignored.

## Build, Test, and Development Commands

Use Node.js 22 or newer.

- `npm ci`: install dependencies from the committed lockfile.
- `npm run dev`: start the localhost development server.
- `npm run build`: run TypeScript checks and generate `dist/`.
- `npm run preview`: serve the production build locally, normally on port 4173.
- `npm test`: run Vitest tests with React Testing Library and jsdom.
- `node tests/browser.mjs`: run Playwright checks using installed Google Chrome; requires preview running at `http://127.0.0.1:4173`. Screenshots go to `.artifacts/`.

## Coding Style & Naming Conventions

Use strict TypeScript, explicit prop types, functional React components, and hooks. Use two-space indentation, single-quoted TypeScript strings, and semicolons. Name components in PascalCase, functions and variables in camelCase, and slice IDs in kebab-case, such as `red-velvet`. No formatter or linter is configured; avoid unrelated formatting changes.

## Testing Guidelines

Name component tests `*.test.tsx` under `src/`. Add focused behavioral coverage for changed interactions; no numerical coverage threshold is configured. Verify slice-to-video mapping, playback cleanup, watched persistence, and error states. For visual or interaction changes, also check desktop/mobile layouts, drag versus click, keyboard focus, reduced motion, and WebGL fallback. Run tests and the production build before submitting.

## Commit & Pull Request Guidelines

This workspace has no Git history available, so no existing commit convention can be inferred. Use concise imperative messages, for example `Fix video cleanup when switching slices`. PRs should explain the behavior change, include validation results, link relevant issues when available, and attach screenshots for visual changes.

## Content & Configuration

Preserve exactly nine slices and stable IDs: watched progress uses IDs in localStorage. Keep runtime assets local for offline presentation. Empty video paths intentionally show placeholders. Do not publish personal videos or add external hosting without explicit authorization.
