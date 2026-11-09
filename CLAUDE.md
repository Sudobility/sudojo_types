# CLAUDE.md

> **Git policy — never auto-commit or auto-push.** Leave work in the working tree.
> Run `git commit`, `git push`, `gh pr create`, or `scripts/push_all.sh` **only when the user
> explicitly asks in that turn**; approval for an earlier change does not carry forward, and
> finishing a task is not permission to commit it. Do not use feature branches — stay on the
> current branch.

Context for AI assistants working on this codebase.

## Project Overview

`@sudobility/sudojo_types` is the **shared type contract** for the Sudojo Sudoku-learning family. It holds:

- entity, request, query and response types for `sudojo_api`
- mirrors of the C# solver's JSON (`sudojo_solver`)
- gamification and entitlement types
- a small set of pure runtime utilities: board strings, technique bitmasks, belts, scrambling, cell notation, time, UUID

Everything lives in one source file, `src/index.ts`. The package is **ESM-only** and ships runtime code (not types-only). Any change can break ~10 sibling repos (see [Consumers](#consumers)).

## Commands

**This project uses Bun** (`bun.lock`). Do not use npm, yarn, or pnpm locally. There is **no `test` script** — use `test:unit`.

| Command | What it runs | Verified 2026-11-08 |
|---|---|---|
| `bun install` | install deps (needs GitHub Packages auth, see below) | ok |
| `bun run typecheck` | `tsc --noEmit` (tsconfig.json, excludes `*.test.ts`) | passes |
| `bun run lint` / `lint:fix` | `eslint src --ext .ts` using **`eslint.config.js`** (also lints tests) | clean |
| `bun run format` / `format:check` | Prettier on `src/**/*.{ts,js,json,md}` | check clean |
| `bun run test:unit` / `test:watch` | `vitest run` / `vitest` on `src/index.test.ts` | 249 pass |
| `bun run test:coverage` | `vitest --coverage` | **broken**: `@vitest/coverage-v8` is not installed |
| `bun run build` | `tsc -p tsconfig.esm.json` → `dist/index.{js,d.ts}` + maps (**ESM only**) | compiles |
| `bun run clean` | `rimraf dist` | ok |
| `bun run dev` | `tsc --watch` on tsconfig.json (`noEmit`): watch-mode typecheck, **emits nothing** | — |
| `bun run verify` | typecheck → lint → test:unit → build | the four above |

- `bun run test` **fails** (`bun run test:unit` is the real command).
- `prepublishOnly` = `bun run clean && bun run verify`.

### Release / publish (document only; never run unless the user explicitly asks)

- **Registry is GitHub Packages, not public npm** (migrated commits `e0c9cbe`/`bc51889`). Repo `.npmrc` routes `@sudobility:registry=https://npm.pkg.github.com`; auth token (`//npm.pkg.github.com/:_authToken=…` with `read:packages`) lives in **`~/.npmrc`**, never committed.
- **CI:** `.github/workflows/ci-cd.yml` calls `johnqh/workflows/.github/workflows/unified-cicd.yml@main` with `publish-target: github`. Runs on push/PR to `main` and `develop`; publishes when the `package.json` version is not already published.
- **Family release:** `~/projects/sudojo_app/scripts/push_all.sh`. `sudojo_types` is first in `PROJECTS` with a ~60 s wait so CI publishes before dependents resolve it.
- `package.json` `files` = `dist/**/*` + **`CLAUDE.md`**, so this file ships in the tarball.
- Commit style: `feat:`, `fix:`, `chore: bump @sudobility/types to X and bump version to Y`.

## Repo Map

```
src/index.ts          every export (~2850 lines, banner-comment sections)
src/index.test.ts     vitest: runtime tests + expectTypeOf shape tests (~2160 lines, 249 tests)
dist/                 build output (gitignored, ESM only)
plans/IMPROVEMENTS.md improvement backlog (partly stale — most items are done)
.github/workflows/ci-cd.yml   thin caller of johnqh/workflows unified CI/CD
eslint.config.js      ACTIVE ESLint flat config (TS + prettier, lints tests)
eslint.config.mjs     DEAD: ESLint 9 resolves eslint.config.js first
tsconfig.json         typecheck config (ES2020, strict, noEmit, excludes tests)
tsconfig.esm.json     build config (extends tsconfig.json, emits to dist/)
```

Exports are grouped by banner comments (`// ====`) in `src/index.ts` roughly in this order: re-exports from `@sudobility/types` → entity types → request/query types → counts/response helpers → subscription → solver types → hint access → entitlement utils → puzzle/level constants → technique bitfield → examples/practices → belts → board/scramble/solver utils → cell/time/UUID → solver option types → gamification. ~96 interfaces/types, ~41 functions, ~12 consts, 1 enum (`TechniqueId`), 7 re-exports.

Signatures easy to get wrong:

```ts
isBoardFilled(original, user)             // user digit wins; no length check, missing chars = '0'
isBoardSolved(original, user, solution)
getMergedBoardState(original, user)       // 81-char merged string
hasRequiredEntitlement(levelEntitlement, userEntitlements)  // CSV, ANY-of; null/'' = free
getSubscriptionOfferId(entitlement)       // blue_belt → '1_blue_belt'; else '8_red_belt'; none → undefined
getBeltIconSvg(fill, width = 100, height = 40, strokeColor?, stripeColor?)
getBeltIconForLevel(level, width?, height?)  // null outside 1–12
scrambleBoard(puzzle, solution, config = DEFAULT_SCRAMBLE_CONFIG)  // Math.random; Map digit mappings
parseBoardString(s)  // accepts '0' or '.', throws on bad input; stringifyBoard always writes '0'
```

## Conventions

- **Entities** (DB models) use `T | null` for nullable columns. Timestamps typed `Date | null`, but JSON carries ISO strings.
- **Request/query types** use required keys typed `Optional<T>` (`= T | undefined | null`), e.g. `name: Optional<string>`. When adding a field to an already-published type, make it `?` so dependents don't break. (Existing `?` exceptions: `CommunityUpdateRequest`, `StrategyUpdateRequest`, `CommunityQueryParams`, `BadgeDefinition{Create,Update}Request`, and every `difficulty_score?`.)
- **Mirror the wire casing exactly.** snake_case for DB/API entity and solver board fields (`difficulty_score`, `board_uuid`); camelCase for gamification/subscription types (`sessionId`) and solver link coordinates (`fromRow`).
- **Naming:** `{Entity}CreateRequest` / `UpdateRequest` / `QueryParams`, `{Thing}Data` for payloads. Functions camelCase, constants UPPER_SNAKE_CASE. `TechniqueId` enum is PascalCase with UPPER_SNAKE_CASE members.
- Put new exports in the matching banner section, JSDoc each field, add an `expectTypeOf` shape test (types) and runtime tests (functions) to `src/index.test.ts`, then `bun run verify`.
- **Keep the single-file layout** unless the owner decides otherwise.

## Solver JSON Contract

Authority is `~/projects/sudojo_solver`: `SudokuApi/Models/{Board,Hint,Result}Models.cs`, `docs/API.md`, `docs/HINT.md`. Clients never call the solver directly — `sudojo_api` (`src/services/solver-proxy.ts`, `src/routes/solver.ts`) proxies it at `/api/v1/solver/{solve,validate,generate}` and rewraps the solver envelope into `successResponse()` / `errorResponse(string)`.

Non-obvious points:

- `SolveData` = `{board, hints}`; the proxy adds `points?: HintPointsEarned` (2 × level).
- `SolverBoard.numbers` / pencilmarks are state **after** the last step; 81 comma-separated entries.
- `SolverHints.technique: 0` = autopencil/correction hint (emits no localization). `TechniqueId` has **no 0 member** on purpose (adding one changes `ALL_TECHNIQUE_IDS` for every consumer). Id 1 = FULL_HOUSE, 2 = HIDDEN_SINGLE, 3 = NAKED_SINGLE.
- `SolverCellActions`: `select`/`unselect` use `"0"` for none; `add`/`remove`/`highlight` use `""` for none.
- `SolverResult<T>` / `SolverErrorPayload` / `SOLVER_ERROR_CODES`: raw envelope seen only by `sudojo_api`; `code` is an integer 0–3 (Unknown, AutoPencilmarksRequired, CannotSolve, MultipleSolutions). Clients only get `errorResponse("<code>: <message>")`.
- `ValidateBoardData.solution` has `'0'` at given cells — merge with `getMergedBoardState(original, solution)`.

Open contract items (owner action needed):

- `SolverHintStep.areas`/`cells` can be `null` in the `technique: 0` autopencil hint (proxy passes it through). Only JSDoc is updated; widening to `| null` breaks typecheck and is a latent crash at `sudojo_lib/src/utils/hintExplanation.ts:105,122,141` and `sudojo_bot/src/cards/hintCard.ts:81,115`. Guard with `?? []` first, then widen in a coordinated release.
- `sudojo_api/src/services/solver-proxy.ts` types `code` as `string`; should use `SolverResult<T>` from this package.
- `/validate` accepts `brutalForce` but `ValidateOptions` lacks it (deliberately — the solver currently fails with `brutalForce=false`). Add it here + forward in `sudojo_client` once the solver is fixed.

## Gotchas

- **ESM-only.** `exports` has only `import` + `types` (no `require`/`default`). Consumers must install the `@sudobility/types` peer (imported at runtime for `SubscriptionPlatform`).
- **Technique bitmasks lose precision** once any technique id ≥ 54 is set: numeric `techniques` / `techniques_bitfield` fields drop low bits as JS doubles. Read with `techniqueBitmaskOf(obj)` (prefers the exact base-10 string companion `*_bitmask`, falls back to the number, returns `0n` for null/missing); test with `hasTechniqueInBitmask()` / `techniqueIdsFromBitmask()`; build with `techniqueIdsToBitmask()`; send with `formatTechniqueBitmask()`; parse any wire value with `parseTechniqueBitmask()`. All throw `RangeError` on bad input. `hasTechnique()` / `addTechnique()` are **deprecated** (lossy); `techniqueToBit()` stays (one bit is exact). Request bitmask fields accept `number | string` — send `formatTechniqueBitmask(mask)` for ids ≥ 54. `*_bitmask` fields are optional here (older deployments omit them). BigInt literals (`1n`) are fine — `tsconfig` targets ES2020.
- **`HINT_LEVEL_LIMITS` is deprecated.** Gate on `Level.entitlement` with `hasRequiredEntitlement()`. `sudojo_api` no longer returns 402 (gating is client-side), but `sudojo_client`/`sudojo_lib` still use `HintAccessDenied*`.
- **`solution` fields in `sudojo_api` GET responses are AES-256-GCM encrypted** when `SOLUTION_ENCRYPTION_KEY` is set (`sudojo_api/src/middleware/encryptSolutions.ts`); `sudojo_client` decrypts. So `solution: string` on the wire may be ciphertext, not 81 digits.
- **`hasInvalidPencilmarksStep()` depends on the exact solver title** `"Invalid Pencilmarks"`.
- **Type tests are not typechecked by default.** `vitest run` does not check `expectTypeOf`, and `tsconfig.json` excludes `*.test.ts`. Running `tsc` directly over the test file surfaces a few pre-existing fixture errors.
- **Puzzle/level constants** (`MIN_CLUES` 17, `MIN_LEVEL` 1, `MAX_LEVEL` 12, `ALL_LEVELS`, `isValidLevel()`) are the single source — import them, never hard-code 17 / 1–12.

## Consumers

Depend on this package: `sudojo_api`, `sudojo_app`, `sudojo_app_rn`, `sudojo_bot`, `sudojo_extension` (dependencies); `@sudobility/sudojo_client`, `@sudobility/sudojo_lib`, `@sudobility/sudojo_ui` (peer + dev); `@sudobility/sudojo_ocr` (peer). `sudojo_solver` (C#) and `sudojo_ocr_ml` (Python) do **not** consume it. Peer/dev dependency `@sudobility/types` provides `Optional`, `BaseResponse`, pagination types and `SubscriptionPlatform`.
