# @sudobility/sudojo_types

Shared TypeScript type definitions for the Sudojo Sudoku learning platform.

## Installation

This package is published to **GitHub Packages**, not the public npm registry. Configure the `@sudobility` scope and a GitHub token with `read:packages` before installing:

```bash
# project .npmrc (committed here) already routes the scope:
#   @sudobility:registry=https://npm.pkg.github.com
# add auth once, in your user ~/.npmrc (never commit the token):
#   //npm.pkg.github.com/:_authToken=<GH_PAT_with_read:packages>

bun add @sudobility/sudojo_types @sudobility/types
```

`@sudobility/types` is a required peer dependency (also imported at runtime). The package is ESM-only.

## Usage

```typescript
import type { Board, Daily, Level, Technique } from '@sudobility/sudojo_types';
import { TechniqueId, successResponse, errorResponse } from '@sudobility/sudojo_types';
import { techniqueBitmaskOf, hasTechniqueInBitmask, formatTechniqueBitmask } from '@sudobility/sudojo_types';
```

## Types

- **Entities**: `Board`, `Daily`, `Level`, `Technique`, `Learning`, `Challenge`, `Community`, `Strategy`, `TechniqueExample`, `TechniquePractice`
- **Enums**: `TechniqueId` (60 solving techniques, ids 1-60)
- **Requests/Responses**: Create/update request and query-param types for each entity, plus count/stats response data
- **Solver**: `SolveData`, `SolverHints`, `SolverHintStep` (areas, cells, links, groups, localization), `ValidateData`, `GenerateData`
- **Gamification & entitlements**: `GameSession`, `GameStartRequest`, `GameFinishResponse`, badges, `hasRequiredEntitlement()`
- **Response helpers**: `successResponse()`, `errorResponse()` (defined here); `ApiResponse<T>`, `BaseResponse<T>`, `PaginatedResponse<T>`, `Optional<T>` re-exported from `@sudobility/types`
- **Technique bitmasks (exact, BigInt)**: numeric `techniques` / `techniques_bitfield` fields lose low bits as JS numbers once a technique id >= 54 is set. So APIs also send a base-10 string, `techniques_bitmask` / `techniques_bitfield_bitmask`. Read with `techniqueBitmaskOf(obj)`, test with `hasTechniqueInBitmask()` / `techniqueIdsFromBitmask()`, build with `techniqueIdsToBitmask()`, send with `formatTechniqueBitmask()`, parse with `parseTechniqueBitmask()`. `hasTechnique()` / `addTechnique()` are deprecated (lossy); `techniqueToBit()` remains for single bits. Request bitmask fields accept `number | string`, so send `formatTechniqueBitmask(mask)` for ids >= 54
- **Utilities**: board strings, scrambling, belts, cell notation, time formatting, UUID validation

## Development

```bash
bun run build        # Build ESM (dist/index.js + .d.ts)
bun run test:unit    # Run tests once (vitest); test:watch for watch mode
bun run typecheck    # TypeScript check (tsc --noEmit)
bun run lint         # ESLint
bun run verify       # Typecheck + lint + test:unit + build
```

## Related Packages

- `@sudobility/sudojo_client` -- React Query hooks for Sudojo API
- `@sudobility/sudojo_lib` -- Business logic and game state hooks
- `sudojo_api` -- Backend API server
- `@sudobility/sudojo_ui`, `@sudobility/sudojo_ocr` -- UI components and OCR
- `sudojo_app` / `sudojo_app_rn` / `sudojo_extension` / `sudojo_bot` -- Web, mobile, extension and bot clients
- `sudojo_solver` -- C# solver service; authoritative for the solver JSON types

## License

BUSL-1.1
