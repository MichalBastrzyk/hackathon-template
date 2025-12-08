# Copilot Instructions for this repo

- Stack: Next.js 16 (App Router), React 19, TypeScript strict (no JS), Tailwind CSS v4 via `@tailwindcss/postcss`, Biome for lint/format, Turbopack preferred in dev, React Compiler enabled. Runtime: Node v24. Package manager and script runner: Bun (use `bun install`).
- Next config: `reactStrictMode`, `typedRoutes`, `cacheComponents` (PPR), view transitions, inline CSS, typed env, server source maps, Turbopack cache/tree-shake/minify/source maps, React Compiler with `compilationMode: "infer"` and `panicThreshold: "none"`.
- TS rules: `allowJs=false`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `useUnknownInCatchVariables`, path alias `@/*` -> `src/*`, moduleResolution `bundler`. Prefer types-first, narrow types, no `any` unless justified.
- Formatting: use Biome (`bun run format` / `bunx biome format --write`). Keep lines ~100 chars. Imports organized by Biome; use non-relative imports when alias applies.
- Commands: dev `bun run dev`, build `bun run build`, lint `bun run lint`, format `bun run format`. Use Turbopack via `bunx next dev --turbopack` when speed matters.
- React/Next patterns: default to Server Components; use `"use client"` only when required. Prefer `next/navigation` over legacy router. Keep data fetching `async`/`cache`/`revalidate` aligned with App Router defaults. Use `next/image` and `next/font`. Avoid custom webpack unless necessary.
- Style: keep code ASCII, concise comments only when non-obvious. Favor functional, composable utilities. Avoid magic strings; centralize constants. Validate env via typed env.
- Testing/checks: before PR, run lint + build. Add targeted tests when adding logic.
