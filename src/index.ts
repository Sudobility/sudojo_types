/**
 * @sudobility/sudojo-types
 * TypeScript types for Sudojo API - Sudoku learning platform
 */

// Re-export common types from @sudobility/types
export type {
  ApiResponse,
  BaseResponse,
  Optional,
  PaginatedResponse,
  PaginationInfo,
  PaginationOptions,
} from '@sudobility/types';

export { SubscriptionPlatform } from '@sudobility/types';

import type { Optional } from '@sudobility/types';
import type { SubscriptionPlatform } from '@sudobility/types';

// =============================================================================
// Entity Types (database models)
// =============================================================================

/**
 * ISO date string type alias for date-only values in YYYY-MM-DD format.
 *
 * Used for fields like {@link Daily.date} that represent calendar dates
 * rather than precise timestamps.
 *
 * @example "2024-01-15"
 */
export type ISODateString = string;

/**
 * A difficulty level grouping for Sudoku techniques.
 * Levels range from 1 (easiest) to 12 (hardest) and map to karate belt colors.
 *
 * Note: Entity timestamps (`created_at`, `updated_at`) are `Date | null` in
 * the database model, but API responses serialize them as ISO 8601 strings.
 */
export interface Level {
  /** Level number (1-12), used as primary key */
  level: number;
  /** Human-readable level name (e.g., "Beginner", "Intermediate") */
  title: string;
  /** Optional description or instructional text for this level */
  text: string | null;
  /** Whether this level requires a paid subscription to access */
  requires_subscription: boolean | null;
  /**
   * Comma-delimited entitlement IDs required to access this level.
   * If null or empty, the level is free. If set, the user needs ANY ONE
   * of the listed entitlements (e.g., "blue_belt,red_belt").
   */
  entitlement: string | null;
  /**
   * RevenueCat offering identifier to show when the user lacks the
   * required entitlement. If null, the generic paywall is shown.
   */
  offer_id: string | null;
  /** Fraction of total boards that belong to this level (0-1) */
  percentage: number | null;
  /** When this record was created (serialized as ISO string in API responses) */
  created_at: Date | null;
  /** When this record was last updated (serialized as ISO string in API responses) */
  updated_at: Date | null;
  /** Optional localization data for i18n translation of title and text */
  localization?: {
    title?: LocalizedHint;
    text?: LocalizedHint;
  };
}

/**
 * A Sudoku solving technique belonging to a difficulty level.
 * Techniques are the core learning units of the platform (e.g., Naked Single, X-Wing).
 *
 * Note: Entity timestamps are `Date | null` in the database model,
 * but API responses serialize them as ISO 8601 strings.
 */
export interface Technique {
  /** Technique number matching the solver engine's SudokuTechnique enum */
  technique: number;
  /** The difficulty level this technique belongs to (1-12), or null if unassigned */
  level: number | null;
  /** The strategy group this technique belongs to, or null if unassigned */
  strategy_id?: number | null;
  /** Human-readable technique name (e.g., "Naked Single", "X-Wing") */
  title: string;
  /** URL-friendly slug for routing (e.g., "naked-single") */
  path: string | null;
  /** Comma-separated list of prerequisite technique IDs */
  dependencies: string | null;
  /** Optional description or instructional text */
  text: string | null;
  /** Fraction of total boards that use this technique (0-1) */
  percentage: number | null;
  /** When this record was created (serialized as ISO string in API responses) */
  created_at: Date | null;
  /** When this record was last updated (serialized as ISO string in API responses) */
  updated_at: Date | null;
  /** Optional localization data for i18n translation of title and text */
  localization?: {
    title?: LocalizedHint;
    text?: LocalizedHint;
  };
}

/**
 * A learning content card for a technique, supporting multiple languages.
 * Each technique can have multiple learning cards ordered by index.
 *
 * Note: Entity timestamps are `Date | null` in the database model,
 * but API responses serialize them as ISO 8601 strings.
 */
export interface Learning {
  /** Unique identifier (UUID v4) */
  uuid: string;
  /** The technique number this learning content belongs to */
  technique: number | null;
  /** Display order within the technique's learning cards (0-based) */
  index: number;
  /** ISO 639-1 language code (e.g., "en", "ja") */
  language_code: string;
  /** Instructional text content (may contain markdown) */
  text: string | null;
  /** URL to an illustrative image */
  image_url: string | null;
  /** When this record was created (serialized as ISO string in API responses) */
  created_at: Date | null;
  /** When this record was last updated (serialized as ISO string in API responses) */
  updated_at: Date | null;
  /** Optional localization data for i18n translation of text */
  localization?: {
    text?: LocalizedHint;
  };
}

/**
 * A Sudoku puzzle board with its solution and metadata.
 *
 * Note: Entity timestamps are `Date | null` in the database model,
 * but API responses serialize them as ISO 8601 strings.
 */
export interface Board {
  /** Unique identifier (UUID v4) */
  uuid: string;
  /** Difficulty level (1-12) assigned to this puzzle */
  level: number | null;
  /** Whether the puzzle has rotational symmetry in its clue placement */
  symmetrical: boolean | null;
  /** 81-character puzzle string where '0' represents empty cells, '1'-'9' are given digits */
  board: string;
  /** 81-character solution string with all cells filled ('1'-'9') */
  solution: string;
  /**
   * Bitmask of techniques required to solve this puzzle.
   * Each bit corresponds to a {@link TechniqueId} enum value (bit N = technique N).
   *
   * **Lossy as a JS number** once any technique with ID >= 54 is set: JSON
   * parsing drops the low bits. Read the exact value with
   * `techniqueBitmaskOf(board)`, which prefers {@link Board.techniques_bitmask}.
   */
  techniques: number | null;
  /**
   * The same bitmask as {@link Board.techniques}, as an exact base-10 string
   * (e.g. `"1152921504606846978"`). `null` when `techniques` is null. Missing
   * from older API deployments. Parse it with `parseTechniqueBitmask()`, or use
   * `techniqueBitmaskOf(board)`.
   */
  techniques_bitmask?: string | null;
  /**
   * Cumulative solving effort: the sum of every solving step's technique score
   * on a ratio scale where Full House = 1. A finer-grained companion to
   * {@link level} (which is only the hardest single technique), so two puzzles
   * at the same level can be ordered by how much work they actually take.
   */
  difficulty_score?: number | null;
  /** When this record was created (serialized as ISO string in API responses) */
  created_at: Date | null;
  /** When this record was last updated (serialized as ISO string in API responses) */
  updated_at: Date | null;
}

/**
 * A daily puzzle published for a specific calendar date.
 * Each date has exactly one daily puzzle.
 *
 * Note: Entity timestamps are `Date | null` in the database model,
 * but API responses serialize them as ISO 8601 strings.
 */
export interface Daily {
  /** Unique identifier (UUID v4) */
  uuid: string;
  /**
   * Calendar date in YYYY-MM-DD format (e.g., "2024-01-15").
   * This is a date-only string, not a full ISO 8601 timestamp.
   */
  date: ISODateString;
  /** UUID of the source board, or null if board data is inlined */
  board_uuid: string | null;
  /** Difficulty level (1-12) assigned to this daily puzzle */
  level: number | null;
  /**
   * Bitmask of techniques required to solve this puzzle.
   * Each bit corresponds to a {@link TechniqueId} enum value (bit N = technique N).
   * Lossy as a JS number once any ID >= 54 is set; see {@link Board.techniques}.
   */
  techniques: number | null;
  /**
   * Exact base-10 string form of {@link Daily.techniques} (`null` when that is
   * null). Missing from older API deployments. See {@link Board.techniques_bitmask}.
   */
  techniques_bitmask?: string | null;
  /** Cumulative solving effort (sum of per-step technique scores). See {@link Board.difficulty_score}. */
  difficulty_score?: number | null;
  /** 81-character puzzle string where '0' represents empty cells */
  board: string;
  /** 81-character solution string with all cells filled */
  solution: string;
  /** When this record was created (serialized as ISO string in API responses) */
  created_at: Date | null;
  /** When this record was last updated (serialized as ISO string in API responses) */
  updated_at: Date | null;
}

/**
 * A challenge puzzle with configurable difficulty.
 *
 * Note: Entity timestamps are `Date | null` in the database model,
 * but API responses serialize them as ISO 8601 strings.
 */
export interface Challenge {
  /** Unique identifier (UUID v4) */
  uuid: string;
  /** UUID of the source board, or null if board data is inlined */
  board_uuid: string | null;
  /** Difficulty level (1-12) assigned to this challenge */
  level: number | null;
  /** Numeric difficulty rating (higher = harder) */
  difficulty: number | null;
  /** Cumulative solving effort (sum of per-step technique scores). See {@link Board.difficulty_score}. */
  difficulty_score?: number | null;
  /** 81-character puzzle string where '0' represents empty cells */
  board: string;
  /** 81-character solution string with all cells filled */
  solution: string;
  /** When this record was created (serialized as ISO string in API responses) */
  created_at: Date | null;
  /** When this record was last updated (serialized as ISO string in API responses) */
  updated_at: Date | null;
}

/**
 * A curated Sudoku community or forum, specific to a language.
 * Unlike other entities, communities are entirely different records per language
 * rather than translated versions of the same record.
 */
export interface Community {
  /** Unique identifier (UUID v4) */
  uuid: string;
  /** ISO 639-1 language code (e.g., "en", "ja", "zh-hant") */
  language_code: string;
  /** Community name in the native language */
  name: string;
  /** Community name in English, if available */
  name_english: string | null;
  /** Short description in the native language */
  description: string;
  /** URL link to the community */
  url: string;
  /** Platform type (e.g., "forum", "discord", "reddit", "telegram", "facebook", "youtube", "website") */
  platform: string;
  /** Display order within a language (lower = first) */
  sort_order: number;
  /** URL to the community's icon, logo, or favicon */
  icon_url: string | null;
  /** When this record was created (serialized as ISO string in API responses) */
  created_at: Date | null;
  /** When this record was last updated (serialized as ISO string in API responses) */
  updated_at: Date | null;
}

/**
 * A strategy grouping related solving techniques by shared algorithmic logic.
 * Strategies organize the 60 techniques into 17 groups (e.g., Naked Subsets, Wings, Forcing).
 *
 * Note: Entity timestamps are `Date | null` in the database model,
 * but API responses serialize them as ISO 8601 strings.
 */
export interface Strategy {
  /** Auto-increment primary key */
  strategy: number;
  /** Unique difficulty ordering value (sequential, used for sorting) */
  difficulty: number;
  /** URL-friendly slug for routing (e.g., "naked-subsets", "forcing") */
  stub: string;
  /** When this record was created (serialized as ISO string in API responses) */
  created_at: Date | null;
  /** When this record was last updated (serialized as ISO string in API responses) */
  updated_at: Date | null;
}

// =============================================================================
// Request Body Types
// =============================================================================

// Level requests
export interface LevelCreateRequest {
  level: number;
  title: string;
  text: Optional<string>;
  requires_subscription: Optional<boolean>;
  entitlement: Optional<string>;
  offer_id: Optional<string>;
  percentage: Optional<number>;
}

export interface LevelUpdateRequest {
  title: Optional<string>;
  text: Optional<string>;
  requires_subscription: Optional<boolean>;
  entitlement: Optional<string>;
  offer_id: Optional<string>;
  percentage: Optional<number>;
}

// Technique requests
export interface TechniqueCreateRequest {
  technique: number;
  level: number;
  title: string;
  text: Optional<string>;
  percentage: Optional<number>;
  strategy_id: Optional<number>;
}

export interface TechniqueUpdateRequest {
  level: Optional<number>;
  title: Optional<string>;
  text: Optional<string>;
  percentage: Optional<number>;
  strategy_id: Optional<number>;
}

// Learning requests
export interface LearningCreateRequest {
  technique: number;
  index: number;
  language_code: Optional<string>;
  text: Optional<string>;
  image_url: Optional<string | null>;
}

export interface LearningUpdateRequest {
  technique: Optional<number>;
  index: Optional<number>;
  language_code: Optional<string>;
  text: Optional<string>;
  image_url: Optional<string | null>;
}

// Board requests
export interface BoardCreateRequest {
  level: Optional<number | null>;
  symmetrical: Optional<boolean>;
  board: string;
  solution: string;
  /**
   * Technique bitmask as a number or a base-10 string. Send a string (e.g.
   * `formatTechniqueBitmask(mask)`) whenever any technique ID >= 54 is set:
   * a JSON number drops the low bits. `sudojo_api` treats `null` as 0 and
   * rejects `""`, negatives and non-integers.
   */
  techniques: Optional<number | string>;
  difficulty_score?: Optional<number>;
}

export interface BoardUpdateRequest {
  level: Optional<number | null>;
  symmetrical: Optional<boolean>;
  board: Optional<string>;
  solution: Optional<string>;
  /**
   * Technique bitmask as a number or a base-10 string. Send a string (e.g.
   * `formatTechniqueBitmask(mask)`) whenever any technique ID >= 54 is set:
   * a JSON number drops the low bits. `sudojo_api` treats `null` as 0 and
   * rejects `""`, negatives and non-integers.
   */
  techniques: Optional<number | string>;
  difficulty_score?: Optional<number>;
}

// Daily requests
export interface DailyCreateRequest {
  date: string;
  board_uuid: Optional<string | null>;
  level: Optional<number | null>;
  /**
   * Technique bitmask as a number or a base-10 string. Send a string (e.g.
   * `formatTechniqueBitmask(mask)`) whenever any technique ID >= 54 is set:
   * a JSON number drops the low bits. `sudojo_api` treats `null` as 0 and
   * rejects `""`, negatives and non-integers.
   */
  techniques: Optional<number | string>;
  difficulty_score?: Optional<number>;
  board: string;
  solution: string;
}

export interface DailyUpdateRequest {
  date: Optional<string>;
  board_uuid: Optional<string | null>;
  level: Optional<number | null>;
  /**
   * Technique bitmask as a number or a base-10 string. Send a string (e.g.
   * `formatTechniqueBitmask(mask)`) whenever any technique ID >= 54 is set:
   * a JSON number drops the low bits. `sudojo_api` treats `null` as 0 and
   * rejects `""`, negatives and non-integers.
   */
  techniques: Optional<number | string>;
  difficulty_score?: Optional<number>;
  board: Optional<string>;
  solution: Optional<string>;
}

// Challenge requests
export interface ChallengeCreateRequest {
  board_uuid: Optional<string | null>;
  level: Optional<number | null>;
  difficulty: Optional<number>;
  difficulty_score?: Optional<number>;
  board: string;
  solution: string;
}

export interface ChallengeUpdateRequest {
  board_uuid: Optional<string | null>;
  level: Optional<number | null>;
  difficulty: Optional<number>;
  difficulty_score?: Optional<number>;
  board: Optional<string>;
  solution: Optional<string>;
}

// Community requests
export interface CommunityCreateRequest {
  language_code: string;
  name: string;
  name_english: Optional<string>;
  description: string;
  url: string;
  platform: string;
  sort_order: Optional<number>;
  icon_url: Optional<string>;
}

export interface CommunityUpdateRequest {
  language_code?: string;
  name?: string;
  name_english?: Optional<string>;
  description?: string;
  url?: string;
  platform?: string;
  sort_order?: number;
  icon_url?: Optional<string>;
}

// Strategy requests
export interface StrategyCreateRequest {
  difficulty: number;
  stub: string;
}

export interface StrategyUpdateRequest {
  difficulty?: number;
  stub?: string;
}

// =============================================================================
// Query Parameter Types
// =============================================================================

export interface CommunityQueryParams {
  language?: string;
}

export interface TechniqueQueryParams {
  level: Optional<number>;
}

export interface LearningQueryParams {
  technique: Optional<number>;
  language_code: Optional<string>;
}

export interface BoardQueryParams {
  level: Optional<number>;
  symmetrical: Optional<boolean>;
  limit: Optional<number>;
  offset: Optional<number>;
  /**
   * Exact techniques bitmask to match (0 also matches NULL), as a number or
   * a base-10 string. Use a string (`formatTechniqueBitmask`) for IDs >= 54.
   */
  techniques: Optional<number | string>;
  /**
   * Match boards with any of these technique bits set, as a number or a
   * base-10 string. Use a string (`formatTechniqueBitmask`) for IDs >= 54.
   */
  technique_bit: Optional<number | string>;
}

export interface ChallengeQueryParams {
  level: Optional<number>;
  difficulty: Optional<string>;
}

export interface TechniqueExampleQueryParams {
  technique: Optional<number>;
}

// =============================================================================
// Counts Response Types
// =============================================================================

/** Response data for /api/v1/boards/counts */
export interface BoardCountsData {
  total: number;
  withoutTechniques: number;
}

/** Response data for /api/v1/boards/counts/by-technique - map of technique ID to board count */
export type BoardCountsByTechniqueData = Record<number, number>;

/** Response data for /api/v1/examples/counts - map of technique ID to count */
export type ExampleCountsData = Record<string, number>;

/** Response data for /api/v1/boards/update-stats */
export interface UpdateStatsData {
  levels: Record<number, number>;
  techniques: Record<number, number>;
}

/** Where the scanned image came from. Chooses the OCR route server-side. */
export type OcrSource = 'camera' | 'library';

/** Response data for /api/v1/ocr/extract */
export interface OCRExtractData {
  board: SolverBoard;
  confidence: number;
  digitCount: number;
  /** Which backend produced this result. Absent on older API versions. */
  engine?: 'ml' | 'paddle';
}

/** Response data for DELETE /api/v1/practices (bulk delete) */
export interface PracticesBulkDeleteData {
  deleted: number;
  message: string;
}

/** A single example/practice that failed to regenerate */
export interface PracticeRegenerateFailure {
  uuid: string;
  table?: string;
  technique: number | null;
  reason: string;
}

/** Response data for POST /api/v1/practices/regenerate-hints */
export interface PracticesRegenerateHintsData {
  examples?: { updated: number; failed: number; total: number };
  practices?: { updated: number; failed: number; total: number };
  updated: number;
  failed: number;
  total: number;
  failures: PracticeRegenerateFailure[];
}

// =============================================================================
// Response Helper Types
// =============================================================================

import type { BaseResponse } from '@sudobility/types';

/** Create a success response */
export function successResponse<T>(data: T): BaseResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

/** Create an error response */
export function errorResponse(error: string): BaseResponse<never> {
  return {
    success: false,
    error,
    timestamp: new Date().toISOString(),
  };
}

// =============================================================================
// Health check response
// =============================================================================

export interface HealthCheckData {
  name: string;
  version: string;
  status: string;
}

// =============================================================================
// Subscription Types (RevenueCat integration)
// =============================================================================

export interface RevenueCatEntitlement {
  expires_date: string | null;
  grace_period_expires_date: string | null;
  product_identifier: string;
  purchase_date: string;
}

export interface SubscriptionResult {
  hasSubscription: boolean;
  entitlements: string[];
  subscriptionStartedAt: string | null;
  platform: SubscriptionPlatform | null;
  productIdentifier: string | null;
  expiresDate: string | null;
  sandbox: boolean;
  store: string | null;
  willRenew: boolean;
  managementUrl: string | null;
}

// =============================================================================
// Solver Types (Sudoku solving/validation/generation)
// =============================================================================

/**
 * Pencilmark data for a Sudoku board.
 * Contains the autopencil setting and pencilmark values for all cells.
 */
export interface SolverPencilmark {
  /** Whether autopencilmark mode is enabled */
  autopencil: boolean;
  /** Comma-delimited string of 81 pencilmark entries (e.g., "123,45,9,...") */
  numbers: string;
}

/**
 * Board state in solver responses.
 * Contains the game state after a hint is applied (for solve endpoint)
 * or the validated/generated puzzle state (for validate/generate endpoints).
 */
export interface SolverBoard {
  /** Original puzzle (81-char string, 0 = empty) */
  original: string;
  /** User's current input after hint applied (81-char string, 0 = empty) */
  user: string;
  /** Pencilmark data including autopencil setting */
  pencilmark: SolverPencilmark;
}

/** Area highlight type */
export type SolverAreaType = 'row' | 'column' | 'block';

/**
 * Color for highlighting.
 *
 * The solver wrapper maps every engine color (`ESudokuColor`, 10 values) to
 * one of these names. Its `"unknown"` fallback is only reachable for an
 * out-of-range enum value, which the engine never produces, so it is not
 * part of this union.
 */
export type SolverColor =
  | 'none'
  | 'clear'
  | 'gray'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'white'
  | 'black';

/** Area to highlight in a hint */
export interface SolverHintArea {
  /** Type of area (row, column, or block) */
  type: SolverAreaType;
  /** Highlight color */
  color: SolverColor;
  /** Area index (0-8) */
  index: number;
}

/** Actions to perform on a cell */
export interface SolverCellActions {
  /** Digit to select as user input */
  select: string;
  /** Digit marked as wrong */
  unselect: string;
  /** Candidates to add as pencilmarks */
  add: string;
  /** Candidates to remove from pencilmarks */
  remove: string;
  /** Candidates to highlight */
  highlight: string;
}

/** Cell information in a hint */
export interface SolverHintCell {
  /** Row index (0-8) */
  row: number;
  /** Column index (0-8) */
  column: number;
  /** Highlight color */
  color: SolverColor;
  /** Whether to fill the cell background */
  fill: boolean;
  /** Actions to perform on this cell */
  actions: SolverCellActions;
}

/** Link type for chain visualization */
export type SolverLinkType = 'strong' | 'weak' | 'conflict';

/** A link between two cells in a chain */
export interface SolverLink {
  /** Start row index (0-8) */
  fromRow: number;
  /** Start column index (0-8) */
  fromCol: number;
  /** End row index (0-8) */
  toRow: number;
  /** End column index (0-8) */
  toCol: number;
  /** Link type: "strong" (conjugate pair) or "weak" (same house) */
  type: SolverLinkType;
  /** The digit this link applies to (1-9) */
  digit: number;
}

/** A group of cells for pattern visualization */
export interface SolverCellGroup {
  /** Group name (e.g., "ALS A", "Conjugate Pair", "UR Corner") */
  name: string;
  /** Highlight color */
  color: SolverColor;
  /** Array of [row, col] pairs */
  cells: number[][];
}

/**
 * Localization data for a hint step.
 * Used for client-side i18n translation of hint text.
 */
export interface LocalizedHint {
  /** The i18n key for this hint text (e.g., "hints.fullHouse.row.step1") */
  stringKey: string;
  /** Interpolation values as strings (e.g., ["3"] for row 3) */
  values: string[];
}

/**
 * A single hint step for solving.
 *
 * Describes a step as `sudojo_api` returns it from `/api/v1/solver/solve`
 * (and stores it in practice/example `hint_data`), which differs from the raw
 * solver JSON in `localization` (see below).
 */
export interface SolverHintStep {
  /**
   * Name of the solving technique, from the solver's `GetTechniqueTitle()`.
   * Correction hints use titles such as `"Invalid Entry"` /
   * `"Invalid Pencilmarks"`, and the autopencil hint uses `"Pencilmarks"`.
   */
  title: string;
  /** Explanation of the technique (fallback text for debugging) */
  text: string;
  /**
   * Areas to highlight.
   *
   * **Wire caveat:** the solver sends `null` (not `[]`) in the synthetic
   * autopencil hint (`technique: 0`, title `"Pencilmarks"`), and `sudojo_api`
   * passes it through. Read it as `step.areas ?? []`.
   */
  areas: SolverHintArea[];
  /**
   * Cells involved in the hint.
   *
   * **Wire caveat:** `null` in the autopencil hint, like {@link areas}.
   * Read it as `step.cells ?? []`.
   */
  cells: SolverHintCell[];
  /** Optional: Links for chain visualization (omitted when empty) */
  links?: SolverLink[];
  /** Optional: Cell groups for pattern visualization (omitted when empty) */
  groups?: SolverCellGroup[];
  /** Optional: Primary digit for single-digit techniques (1-9) */
  digit?: number;
  /**
   * Optional: Localization data for i18n translation of title and text.
   *
   * This is the shape `sudojo_api` produces. The raw solver sends a flat
   * {@link LocalizedHint} (`{stringKey, values}`), and `sudojo_api` rewraps it
   * as `text` and adds a `title` key whenever `technique > 0`. Hints with
   * `technique: 0` are not rewrapped, but the solver emits no localization
   * for them.
   */
  localization?: {
    title?: LocalizedHint;
    text?: LocalizedHint;
  };
}

/**
 * Hints data from solver.
 * Contains the technique used for this hint and multi-step explanations.
 */
export interface SolverHints {
  /**
   * The technique enum value used for this hint.
   * Matches the solver's `SudokuTechnique` enum and {@link TechniqueId}
   * (e.g., 1 = FULL_HOUSE, 2 = HIDDEN_SINGLE, 3 = NAKED_SINGLE).
   *
   * Set to 0 when no technique is involved: the "turn on autopencil" hint and
   * the "Invalid Entry" / "Invalid Pencilmarks" correction hints.
   * {@link TechniqueId} has no 0 member, so this stays a plain `number`.
   */
  technique: number;
  /**
   * Difficulty level for the technique.
   * Set to 0 if no technique is involved.
   */
  level: number;
  /**
   * Solving effort for this hint's technique on the solver's ratio scale
   * (Full House = 1). Set to 0 if no technique is involved.
   *
   * The solver always sends it and `sudojo_api` passes it through. It is
   * optional here because it was added after this type was published, and
   * older stored `hint_data` may lack it. See {@link Board.difficulty_score}
   * for the per-board sum.
   */
  difficulty_score?: number;
  /** Hint steps with explanations and visualizations */
  steps: SolverHintStep[];
}

/**
 * Points earned from using a hint.
 * Returned by /solver/solve when user has an active game session.
 */
export interface HintPointsEarned {
  /** Points earned for this hint (2 × technique level) */
  points: number;
  /** The technique level that determined the points */
  techniqueLevel: number;
}

/**
 * Response data for /solver/solve endpoint.
 * Contains the board state after the hint is applied and hint information.
 */
export interface SolveData {
  /** Board state after hint is applied */
  board: SolverBoard;
  /** Hint information including technique, level, and steps */
  hints: SolverHints;
  /** Points earned for using this hint (only present if user has active session) */
  points?: HintPointsEarned;
}

/**
 * Error codes in the raw solver envelope (C# `ErrorCode` in
 * `sudojo_solver/SudokuApi/Models/ResultModels.cs`).
 *
 * The solver serializes `code` as an **integer**: its `[EnumMember]` string
 * names (`"cannot_solve"`, ...) are not used because no `StringEnumConverter`
 * is registered.
 */
export const SOLVER_ERROR_CODES = {
  /** Invalid request parameters, exceptions, unexpected engine results */
  UNKNOWN: 0,
  /** Auto pencilmarks required (declared by the solver, not currently emitted) */
  AUTO_PENCILMARKS_REQUIRED: 1,
  /** No solution, or the solver could not finish */
  CANNOT_SOLVE: 2,
  /** Brute force found more than one solution */
  MULTIPLE_SOLUTIONS: 3,
} as const;

/** Integer error code in the raw solver envelope. See {@link SOLVER_ERROR_CODES}. */
export type SolverErrorCode =
  (typeof SOLVER_ERROR_CODES)[keyof typeof SOLVER_ERROR_CODES];

/** Error payload in the raw solver envelope (C# `ErrorPayload`). */
export interface SolverErrorPayload {
  /** Integer error code (not a string). See {@link SOLVER_ERROR_CODES}. */
  code: SolverErrorCode;
  /** Human-readable error message */
  message: string;
}

/**
 * Raw envelope returned by the solver's `/api/solve`, `/api/validate` and
 * `/api/generate` (C# `SolveResult` / `ValidateResult`).
 *
 * Every outcome, including bad input, is HTTP 200 with this envelope.
 * Only `sudojo_api` sees it: it rewraps success as `successResponse(data)` and
 * failure as `errorResponse("<code>: <message>")`, so clients never receive
 * `SolverErrorPayload`.
 *
 * For `/solve`, the raw `data.hints.steps[].localization` is a flat
 * {@link LocalizedHint}, not the `{text, title}` shape in {@link SolverHintStep}.
 */
export interface SolverResult<T> {
  /** Whether the solver produced data */
  success: boolean;
  /** Error details when `success` is false, otherwise null */
  error: SolverErrorPayload | null;
  /** Payload when `success` is true, otherwise null */
  data: T | null;
}

// =============================================================================
// Hint Access Control
// =============================================================================

/** User state for hint access control */
export type HintAccessUserState =
  'anonymous' | 'no_subscription' | 'insufficient_tier';

/** Entitlement identifiers for hint access */
export type HintEntitlement = 'blue_belt' | 'red_belt';

/** Error details when hint access is denied (402 response) */
export interface HintAccessDeniedError {
  /** Error code for programmatic handling */
  code: 'HINT_ACCESS_DENIED';
  /** Human-readable error message */
  message: string;
  /** The difficulty level of the requested hint */
  hintLevel: number;
  /** The entitlement required to access this hint level */
  requiredEntitlement: HintEntitlement;
  /** The user's current state */
  userState: HintAccessUserState;
}

/** 402 response structure for hint access denied */
export interface HintAccessDeniedResponse {
  success: false;
  error: HintAccessDeniedError;
  timestamp: string;
}

/**
 * Hint level limits by entitlement.
 * @deprecated Use the `entitlement` field on the Level object instead.
 * Will be removed after all consumers migrate.
 */
export const HINT_LEVEL_LIMITS = {
  red_belt: Infinity,
  blue_belt: 5,
  free: 3,
} as const;

// =============================================================================
// Entitlement Utilities
// =============================================================================

/**
 * Parse a comma-delimited entitlement string into an array of entitlement IDs.
 * Returns an empty array if the input is null, undefined, or empty.
 */
export function parseEntitlements(
  entitlement: string | null | undefined
): HintEntitlement[] {
  if (!entitlement) return [];
  return entitlement
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean) as HintEntitlement[];
}

/**
 * Check if a user has the required entitlement for a level.
 * Returns true if:
 * - The level is free (entitlement is null/empty), OR
 * - The user has ANY ONE of the level's listed entitlements.
 */
export function hasRequiredEntitlement(
  levelEntitlement: string | null | undefined,
  userEntitlements: string[]
): boolean {
  if (!levelEntitlement) return true;
  const required = parseEntitlements(levelEntitlement);
  if (required.length === 0) return true;
  return required.some((e) => userEntitlements.includes(e));
}

/**
 * Derive the subscription offering ID from a level's entitlement.
 *
 * - No entitlement → `undefined` (free level)
 * - Includes `blue_belt` (e.g. `"blue_belt,red_belt"`) → `"1_blue_belt"`
 * - Otherwise (e.g. `"red_belt"`) → `"8_red_belt"`
 */
export function getSubscriptionOfferId(
  entitlement: string | null | undefined
): string | undefined {
  if (!entitlement) return undefined;
  const parsed = parseEntitlements(entitlement);
  if (parsed.length === 0) return undefined;
  if (parsed.includes('blue_belt')) return '1_blue_belt';
  return '8_red_belt';
}

/**
 * Board data for validate/generate endpoints.
 * Includes solution and puzzle metadata (level, techniques bitmask).
 */
export interface ValidateBoardData {
  /** Difficulty level of the puzzle */
  level: number;
  /**
   * Cumulative solving effort: sum of every solving step's technique score
   * (ratio scale, Full House = 1). 0 for generated puzzles. See {@link Board.difficulty_score}.
   *
   * The solver always sends it and `sudojo_api` passes it through. It stays
   * optional for back-compat, because it was added after this type was published.
   */
  difficulty_score?: number;
  /**
   * Bitmask of techniques used to solve (for analytics). The solver sends a
   * C# `ulong`, so this is lossy as a JS number once any ID >= 54 is set.
   */
  techniques: number;
  /**
   * The same bitmask as an exact base-10 string (the solver's
   * `techniques_bitmask`). Missing from older solver/API deployments.
   * Use `techniqueBitmaskOf(board)`.
   */
  techniques_bitmask?: string;
  /** Original puzzle (81-char string) */
  original: string;
  /**
   * Solver's solution as an 81-char string. It holds digits **only at the
   * originally-empty cells**; given cells are `'0'`. To get the full grid,
   * merge it with `original`: `getMergedBoardState(original, solution)`.
   */
  solution: string;
}

/** Response data for /solver/validate endpoint */
export interface ValidateData {
  /** Board with solution and metadata */
  board: ValidateBoardData;
}

/** Response data for /solver/generate endpoint */
export interface GenerateData {
  /** Generated puzzle with solution and metadata */
  board: ValidateBoardData;
}

// =============================================================================
// Technique Bitfield (matches SudokuDefines.h enum SudokuTechnique)
// =============================================================================

// =============================================================================
// Puzzle and level constants
// =============================================================================

/**
 * Fewest givens a Sudoku can have and still have a unique solution. Clients
 * refuse to validate, and scans reject, boards with fewer.
 */
export const MIN_CLUES = 17;

/** Lowest difficulty level (belt). */
export const MIN_LEVEL = 1;

/** Highest difficulty level (belt). Levels run MIN_LEVEL..MAX_LEVEL. */
export const MAX_LEVEL = 12;

/** Whether `level` is an integer difficulty level in MIN_LEVEL..MAX_LEVEL. */
export function isValidLevel(level: unknown): level is number {
  return (
    typeof level === 'number' &&
    Number.isInteger(level) &&
    level >= MIN_LEVEL &&
    level <= MAX_LEVEL
  );
}

/** Every difficulty level, ascending. */
export const ALL_LEVELS: readonly number[] = Array.from(
  { length: MAX_LEVEL - MIN_LEVEL + 1 },
  (_, i) => MIN_LEVEL + i
);

/**
 * Technique IDs matching the solver engine's SudokuTechnique enum.
 * Used as bitfield values in boards.techniques and technique_examples.techniques_bitfield.
 *
 * There is intentionally no 0 member. The engine's `UNKNOWN_TECHNIQUE = 0`
 * appears on the wire only as {@link SolverHints.technique} `0` (autopencil and
 * correction hints). Adding it here would change {@link ALL_TECHNIQUE_IDS} and
 * `Object.values(TechniqueId)` for every consumer.
 */
export enum TechniqueId {
  FULL_HOUSE = 1,
  HIDDEN_SINGLE = 2,
  NAKED_SINGLE = 3,
  HIDDEN_PAIR = 4,
  NAKED_PAIR = 5,
  LOCKED_CANDIDATES = 6,
  HIDDEN_TRIPLE = 7,
  NAKED_TRIPLE = 8,
  HIDDEN_QUAD = 9,
  NAKED_QUAD = 10,
  X_WING = 11,
  SWORDFISH = 12,
  JELLYFISH = 13,
  XY_WING = 14,
  FINNED_X_WING = 15,
  SQUIRMBAG = 16,
  FINNED_SWORDFISH = 17,
  FINNED_JELLYFISH = 18,
  XYZ_WING = 19,
  WXYZ_WING = 20,
  ALMOST_LOCKED_SETS = 21,
  FINNED_SQUIRMBAG = 22,
  ALS_CHAIN = 23,
  SKYSCRAPER = 24,
  TWO_STRING_KITE = 25,
  EMPTY_RECTANGLE = 26,
  SIMPLE_COLORING = 27,
  W_WING = 28,
  REMOTE_PAIRS = 29,
  UNIQUE_RECTANGLE_1 = 30,
  UNIQUE_RECTANGLE_2 = 31,
  BUG_PLUS_1 = 32,
  SUE_DE_COQ = 33,
  ALS_XZ = 34,
  X_CYCLES = 35,
  FORCING_CHAINS = 36,
  MEDUSA_COLORING = 37,
  CRANE = 38,
  UNIQUE_RECTANGLE_3 = 39,
  UNIQUE_RECTANGLE_4 = 40,
  UNIQUE_RECTANGLE_5 = 41,
  X_CHAIN = 42,
  XY_CHAIN = 43,
  VWXYZ_WING = 44,
  UVWXYZ_WING = 45,
  TUVWXYZ_WING = 46,
  STUVWXYZ_WING = 47,
  AIC = 48,
  FORCING_NET = 49,
  AVOIDABLE_RECTANGLE = 50,
  SASHIMI_X_WING = 51,
  SASHIMI_SWORDFISH = 52,
  SASHIMI_JELLYFISH = 53,
  HIDDEN_UNIQUE_RECTANGLE = 54,
  FIREWORK = 55,
  DEATH_BLOSSOM = 56,
  FRANKEN_X_WING = 57,
  FRANKEN_SWORDFISH = 58,
  FRANKEN_JELLYFISH = 59,
  GROUPED_X_CYCLES = 60,
}

/** All technique IDs sorted by value (ascending) */
export const ALL_TECHNIQUE_IDS: TechniqueId[] = Object.values(
  TechniqueId
).filter((v): v is TechniqueId => typeof v === 'number');

/**
 * Convert a TechniqueId to its bit value in the bitfield.
 * TechniqueId N maps to bit N (1 << N).
 *
 * Uses BigInt internally to support techniques >= 32, then converts to Number.
 *
 * **Precision note:** a single bit (2^n) is always exact as a Number, so this
 * function never loses precision. Precision loss only affects combined masks:
 * because bit 0 is never set, a mask stays exact through bit 53 and can drop
 * low bits once any technique with ID >= 54 is included.
 *
 * For combined masks, use the exact BigInt helpers instead, such as
 * {@link techniqueIdsToBitmask} and {@link hasTechniqueInBitmask}.
 *
 * @param techniqueId - The technique ID from {@link TechniqueId} enum
 * @returns The bit value as a number (1 << techniqueId)
 */
export function techniqueToBit(techniqueId: TechniqueId): number {
  return Number(BigInt(1) << BigInt(techniqueId));
}

/**
 * Check if a technique is present in a bitfield.
 * Uses BigInt internally to support techniques >= 32.
 *
 * @deprecated The `number` input is already lossy once any ID >= 54 is set,
 * so this can answer wrongly for low bits. Use
 * `hasTechniqueInBitmask(techniqueBitmaskOf(board), id)` instead.
 *
 * @param bitfield - The techniques bitmask (from {@link Board.techniques} or {@link Daily.techniques})
 * @param techniqueId - The technique ID to check
 * @returns true if the technique bit is set in the bitfield
 */
export function hasTechnique(
  bitfield: number,
  techniqueId: TechniqueId
): boolean {
  const bit = BigInt(1) << BigInt(techniqueId);
  return (BigInt(bitfield) & bit) !== BigInt(0);
}

/**
 * Add a technique to a bitfield by setting its bit.
 * Uses BigInt internally to support techniques >= 32.
 *
 * **Precision warning:** The result is converted back to Number, which may
 * lose precision if the resulting bitfield exceeds `Number.MAX_SAFE_INTEGER`
 * with low bits set. Since bit 0 is never set, that happens once techniques
 * with IDs >= 54 are included.
 *
 * @deprecated Lossy once any ID >= 54 is set. Build exact masks with
 * `techniqueIdsToBitmask(ids)` (or `mask | techniqueIdsToBitmask([id])`) and
 * send them as `formatTechniqueBitmask(mask)`.
 *
 * @param bitfield - The current techniques bitmask
 * @param techniqueId - The technique ID to add
 * @returns The updated bitmask with the technique bit set
 */
export function addTechnique(
  bitfield: number,
  techniqueId: TechniqueId
): number {
  const bit = BigInt(1) << BigInt(techniqueId);
  return Number(BigInt(bitfield) | bit);
}

// -----------------------------------------------------------------------------
// Exact (BigInt) technique bitmasks
//
// Bitmasks can need up to 61 bits (technique 60), which a JS number cannot hold
// exactly. APIs send a companion base-10 string (`techniques_bitmask`,
// `techniques_bitfield_bitmask`) next to each numeric field. Parse it into a
// `bigint` here, do all bit work in `bigint`, and format it back to a string
// to send.
// -----------------------------------------------------------------------------

/** Base-10, non-negative, digits only: no sign, spaces, exponent or hex. */
const TECHNIQUE_BITMASK_PATTERN = /^\d+$/;

function assertTechniqueBitmask(mask: bigint): void {
  if (mask < 0n) {
    throw new RangeError(
      `Invalid technique bitmask: ${mask} (must be non-negative)`
    );
  }
}

function techniqueIdBit(techniqueId: TechniqueId): bigint {
  if (!Number.isInteger(techniqueId) || techniqueId < 0) {
    throw new RangeError(
      `Invalid technique id: ${techniqueId} (must be a non-negative integer)`
    );
  }
  return 1n << BigInt(techniqueId);
}

/**
 * Parse a technique bitmask from the wire into an exact `bigint`.
 *
 * - `string`: the exact base-10 form (`techniques_bitmask`), e.g.
 *   `"1152921504606846978"`.
 * - `number`: fallback for older APIs that only send the numeric field. The
 *   value is taken as-is, so it is exactly as lossy as it already was.
 * - `bigint`: returned unchanged.
 * - `null` / `undefined`: `0n` (no techniques).
 *
 * @throws RangeError for negative values, non-integers, and strings that are
 *   not plain base-10 digits (signs, spaces, `1e3`, `0x10`, empty).
 */
export function parseTechniqueBitmask(
  value: string | number | bigint | null | undefined
): bigint {
  if (value === null || value === undefined) return 0n;
  if (typeof value === 'bigint') {
    assertTechniqueBitmask(value);
    return value;
  }
  if (typeof value === 'number') {
    if (!Number.isInteger(value) || value < 0) {
      throw new RangeError(
        `Invalid technique bitmask: ${value} (must be a non-negative integer)`
      );
    }
    return BigInt(value);
  }
  if (typeof value === 'string' && TECHNIQUE_BITMASK_PATTERN.test(value)) {
    return BigInt(value);
  }
  throw new RangeError(
    `Invalid technique bitmask: ${JSON.stringify(value)} (expected a base-10 digit string)`
  );
}

/**
 * Anything that carries a technique bitmask: a numeric field plus its
 * optional exact string companion. Covers {@link Board}, {@link Daily},
 * {@link ValidateBoardData} (`techniques`) and {@link TechniqueExample}
 * (`techniques_bitfield`).
 */
export interface TechniqueBitmaskSource {
  /** Numeric bitmask (lossy once any ID >= 54 is set) */
  techniques?: number | null;
  /** Exact base-10 string form of `techniques` */
  techniques_bitmask?: string | null;
  /** Numeric bitfield on technique examples (lossy once any ID >= 54 is set) */
  techniques_bitfield?: number | null;
  /** Exact base-10 string form of `techniques_bitfield` */
  techniques_bitfield_bitmask?: string | null;
}

/**
 * Read the exact technique bitmask from an API object.
 *
 * Prefers the exact `<field>_bitmask` string, and falls back to the numeric
 * field for older APIs that don't send it. Returns `0n` when both are null
 * or missing.
 *
 * @example
 * ```typescript
 * const mask = techniqueBitmaskOf(board); // bigint
 * hasTechniqueInBitmask(mask, TechniqueId.GROUPED_X_CYCLES);
 * ```
 *
 * @throws RangeError if a present `<field>_bitmask` string is malformed.
 */
export function techniqueBitmaskOf(source: TechniqueBitmaskSource): bigint {
  const exact = source.techniques_bitmask ?? source.techniques_bitfield_bitmask;
  if (exact !== null && exact !== undefined) {
    return parseTechniqueBitmask(exact);
  }
  return parseTechniqueBitmask(source.techniques ?? source.techniques_bitfield);
}

/**
 * Check if a technique's bit is set in an exact bitmask.
 *
 * @throws RangeError for a negative mask or an invalid technique id.
 */
export function hasTechniqueInBitmask(
  mask: bigint,
  techniqueId: TechniqueId
): boolean {
  assertTechniqueBitmask(mask);
  return (mask & techniqueIdBit(techniqueId)) !== 0n;
}

/**
 * List the {@link TechniqueId}s set in a bitmask, in ascending order.
 * Bits that are not technique ids (e.g. bit 0 or bits above 60) are ignored.
 *
 * @throws RangeError for a negative mask.
 */
export function techniqueIdsFromBitmask(mask: bigint): TechniqueId[] {
  assertTechniqueBitmask(mask);
  return ALL_TECHNIQUE_IDS.filter((id) => (mask & (1n << BigInt(id))) !== 0n);
}

/**
 * Build an exact bitmask from technique ids (bit N = technique N).
 *
 * @throws RangeError for a negative or non-integer id.
 */
export function techniqueIdsToBitmask(
  techniqueIds: Iterable<TechniqueId>
): bigint {
  let mask = 0n;
  for (const id of techniqueIds) {
    mask |= techniqueIdBit(id);
  }
  return mask;
}

/**
 * Format an exact bitmask as the base-10 string used on the wire
 * (`techniques_bitmask`). It round-trips through {@link parseTechniqueBitmask}.
 *
 * @throws RangeError for a negative mask.
 */
export function formatTechniqueBitmask(mask: bigint): string {
  assertTechniqueBitmask(mask);
  return mask.toString(10);
}

// =============================================================================
// Technique Examples (for tutorials)
// =============================================================================

export interface TechniqueExample {
  uuid: string;
  /** Board state (81-char string, current position) */
  board: string;
  /** Pencilmarks at this state (comma-delimited) */
  pencilmarks: string | null;
  /** Solution for reference */
  solution: string;
  /**
   * Bitfield of all techniques applicable at this board state.
   * Lossy as a JS number once any ID >= 54 is set.
   */
  techniques_bitfield: number;
  /**
   * The same bitfield as an exact base-10 string. Missing from older API
   * deployments. Use `techniqueBitmaskOf(example)`.
   */
  techniques_bitfield_bitmask?: string;
  /** Primary technique (the one solver would use first) */
  primary_technique: number;
  /** Hint data as JSON string */
  hint_data: string | null;
  /** Source board UUID for reference */
  source_board_uuid: string | null;
  created_at: Date | null;
}

export interface TechniqueExampleCreateRequest {
  board: string;
  pencilmarks: Optional<string>;
  solution: string;
  /**
   * Technique bitfield (at least one bit set) as a number or a base-10
   * string. Send a string (`formatTechniqueBitmask`) for IDs >= 54.
   */
  techniques_bitfield: number | string;
  primary_technique: number;
  hint_data: Optional<string>;
  source_board_uuid: Optional<string | null>;
}

export interface TechniqueExampleUpdateRequest {
  board: Optional<string>;
  pencilmarks: Optional<string>;
  solution: Optional<string>;
  /**
   * Technique bitfield (at least one bit set) as a number or a base-10
   * string. Send a string (`formatTechniqueBitmask`) for IDs >= 54.
   */
  techniques_bitfield: Optional<number | string>;
  primary_technique: Optional<number>;
  hint_data: Optional<string>;
  source_board_uuid: Optional<string | null>;
}

// =============================================================================
// Technique Practices (for practice mode)
// =============================================================================

export interface TechniquePractice {
  uuid: string;
  /** Reference to the technique this practice is for */
  technique: number | null;
  /** Board state (merged - looks like fresh puzzle) */
  board: string;
  /** Pencilmarks at this state (comma-delimited) */
  pencilmarks: string | null;
  /** Solution for reference */
  solution: string;
  /** Hint data as JSON string */
  hint_data: string | null;
  /** Source example UUID for reference */
  source_example_uuid: string | null;
  created_at: Date | null;
}

export interface TechniquePracticeCreateRequest {
  technique: number;
  board: string;
  pencilmarks: Optional<string>;
  solution: string;
  hint_data: Optional<string>;
  source_example_uuid: Optional<string | null>;
}

/** Practice count item for list endpoint */
export interface TechniquePracticeCountItem {
  technique: number;
  technique_title: string;
  count: number;
  /** Optional localization data for i18n translation of technique title */
  localization?: {
    title?: LocalizedHint;
  };
}

// =============================================================================
// Belt System (Karate belt progression for levels 1-12)
// =============================================================================

/** Belt information for a level */
export interface Belt {
  /** Belt name (e.g., "White", "Yellow") */
  name: string;
  /** Hex color code for main belt color */
  hex: string;
  /** Optional stripe color hex code */
  stripeHex?: string;
}

/** Belt colors mapped to level index (1-12) */
export const BELT_COLORS: Record<number, Belt> = {
  1: { name: 'White', hex: '#FFFFFF' },
  2: { name: 'White (Yellow Stripe)', hex: '#FFFFFF', stripeHex: '#FFEB3B' },
  3: { name: 'Yellow', hex: '#FFEB3B' },
  4: { name: 'Yellow (Orange Stripe)', hex: '#FFEB3B', stripeHex: '#FF9800' },
  5: { name: 'Orange', hex: '#FF9800' },
  6: { name: 'Orange (Green Stripe)', hex: '#FF9800', stripeHex: '#4CAF50' },
  7: { name: 'Green', hex: '#4CAF50' },
  8: { name: 'Blue', hex: '#2196F3' },
  9: { name: 'Purple', hex: '#9C27B0' },
  10: { name: 'Brown', hex: '#795548' },
  11: { name: 'Red', hex: '#F44336' },
  12: { name: 'Black', hex: '#212121' },
};

/** Get the belt for a given level index (1-12) */
export function getBeltForLevel(levelIndex: number): Belt | null {
  return BELT_COLORS[levelIndex] ?? null;
}

/** Get all belts as an array ordered by level */
export function getAllBelts(): Belt[] {
  return Object.values(BELT_COLORS);
}

/**
 * SVG paths for the martial arts belt icon.
 * Based on Wikimedia Commons Judo belt design.
 * ViewBox: 0 0 478.619 184.676
 */
export const BELT_ICON_PATHS = [
  'M192.044,46.054c0,0-1.475,4.952,0.21,7.375c1.686,2.423,24.86,1.791,24.86,1.791L205.845,45L192.044,46.054z',
  'M9.831,23.198c0,0,119.181,32.087,233.779,32.087c114.598,0,214.679-51.187,218.5-53.479c3.819-2.292,12.987,38.963,0.765,48.131c-12.225,9.168-80.983,48.896-216.208,48.896c-135.226,0-233.015-21.392-239.892-29.032C-0.101,62.161-0.101,31.602,9.831,23.198z',
  'M252.014,126.336c0,0-22.156-6.112-28.268-21.392c-6.111-15.279,58.827-29.795,58.827-29.795l-6.112,31.324L252.014,126.336z',
  'M195.479,102.652c0,0,30.56,21.392,35.143,19.1c4.584-2.292,58.827-36.671,58.827-36.671L243.61,51.465l-50.423,38.2L195.479,102.652z',
  'M22.818,152.312c0,0,125.293-76.398,200.928-106.958c75.635-30.56,30.56,29.031,30.56,29.031s-78.69,38.199-110.778,57.299s-81.746,50.424-87.858,51.188C49.558,183.635,22.818,152.312,22.818,152.312z',
  'M255.967,27.303c0,0-5.29-1.851-14.146,8.46c-8.857,10.312,15.07,8.197,15.07,8.197L255.967,27.303z',
  'M232.15,28.546c0,0,94.734,49.659,127.586,60.355c32.851,10.696,113.832,46.603,116.889,55.771s-27.503,30.559-27.503,30.559s-23.685-21.391-54.243-34.379c-30.56-12.987-83.274-34.379-112.306-48.131c-29.031-13.751-89.387-47.367-89.387-47.367L232.15,28.546z',
  'M255.834,27.782c0,0-2.292,92.442-4.584,97.026c-2.293,4.584,42.783-12.987,43.546-18.335c0.765-5.349,6.877-50.423,2.293-55.007S260.417,25.49,255.834,27.782z',
];

/** Original viewBox for the belt icon */
export const BELT_ICON_VIEWBOX = '0 0 478.619 184.676';

/**
 * Generate a complete SVG string for the martial arts belt icon.
 * Uses black stroke for all colors except black belt, which uses white stroke.
 * Supports optional stripe color for striped belt variants.
 *
 * Stripes are placed at the tips/ends of the belt tails (as per real karate belt conventions),
 * not across the center of the belt.
 *
 * @param fill - Fill color for the belt
 * @param width - Width in pixels (default: 100)
 * @param height - Height in pixels (default: 40)
 * @param strokeColor - Stroke color (default: auto-detected based on fill)
 * @param stripeColor - Optional stripe color for striped belt variants (placed at belt tips)
 *
 * @example
 * // Get SVG for blue belt:
 * const svg = getBeltIconSvg('#2196F3');
 *
 * // Get SVG for black belt (auto white stroke):
 * const svg = getBeltIconSvg('#212121');
 *
 * // Get SVG for white belt with yellow stripe:
 * const svg = getBeltIconSvg('#FFFFFF', 100, 40, undefined, '#FFEB3B');
 *
 * // React with dangerouslySetInnerHTML:
 * <div dangerouslySetInnerHTML={{ __html: getBeltIconSvg(belt.hex, 100, 40, undefined, belt.stripeHex) }} />
 */
export function getBeltIconSvg(
  fill: string,
  width: number = 100,
  height: number = 40,
  strokeColor?: string,
  stripeColor?: string
): string {
  // Auto-detect stroke color: use white for dark fills (black belt)
  const stroke =
    strokeColor ??
    (fill.toLowerCase() === '#212121' || fill.toLowerCase() === '#000000'
      ? '#FFFFFF'
      : '#000000');

  const paths = BELT_ICON_PATHS.map(
    (d) => `<path fill="${fill}" stroke="${stroke}" stroke-width="4" d="${d}"/>`
  ).join('');

  // Add stripes at the belt tail tips if stripeColor is provided
  // Real karate belt stripes are placed at the END of the belt (near the tips), not across the center
  // The belt has two tails: left tail (lower-left) and right tail (upper-right)
  const stripes = stripeColor
    ? `
      <rect x="25" y="158" width="50" height="18" fill="${stripeColor}" stroke="${stroke}" stroke-width="1.5" transform="rotate(-20, 50, 167)" clip-path="url(#beltClip)"/>
      <rect x="425" y="148" width="50" height="18" fill="${stripeColor}" stroke="${stroke}" stroke-width="1.5" transform="rotate(20, 450, 157)" clip-path="url(#beltClip)"/>
    `
    : '';

  // Create a clip path using the belt paths for proper stripe clipping
  const clipPath = stripeColor
    ? `<defs><clipPath id="beltClip">${BELT_ICON_PATHS.map((d) => `<path d="${d}"/>`).join('')}</clipPath></defs>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${BELT_ICON_VIEWBOX}" width="${width}" height="${height}">${clipPath}${paths}${stripes}</svg>`;
}

/**
 * Generate belt icon SVG for a specific level index.
 * Convenience function that combines getBeltForLevel and getBeltIconSvg.
 * Automatically includes stripe if the belt has one.
 *
 * @param levelIndex - Level index (1-12)
 * @param width - Width in pixels (default: 100)
 * @param height - Height in pixels (default: 40)
 * @returns SVG string or null if level is invalid
 */
export function getBeltIconForLevel(
  levelIndex: number,
  width: number = 100,
  height: number = 40
): string | null {
  const belt = getBeltForLevel(levelIndex);
  if (!belt) return null;
  return getBeltIconSvg(belt.hex, width, height, undefined, belt.stripeHex);
}

// =============================================================================
// Board Utilities (for parsing and manipulating Sudoku boards)
// =============================================================================

/** Board size constant (9x9 grid) */
export const BOARD_SIZE = 9;

/** Block size constant (3x3 blocks) */
export const BLOCK_SIZE = 3;

/** Total cells in a board */
export const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

/**
 * Parses an 81-character board string into a 2D array of numbers
 * @param boardString - 81-character string where '0' or '.' represents empty cells
 * @returns 9x9 array of numbers (0 = empty, 1-9 = filled)
 */
export function parseBoardString(boardString: string): number[][] {
  if (boardString.length !== TOTAL_CELLS) {
    throw new Error(
      `Invalid board string length: expected ${TOTAL_CELLS}, got ${boardString.length}`
    );
  }

  const board: number[][] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    const rowArray: number[] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      const index = row * BOARD_SIZE + col;
      const char = boardString[index];
      if (char === undefined) {
        throw new Error(`Missing character at position ${index}`);
      }
      const value = char === '.' ? 0 : parseInt(char, 10);
      if (isNaN(value) || value < 0 || value > 9) {
        throw new Error(`Invalid character at position ${index}: '${char}'`);
      }
      rowArray.push(value);
    }
    board.push(rowArray);
  }
  return board;
}

/**
 * Converts a 2D number array back to an 81-character string
 * @param board - 9x9 array of numbers
 * @returns 81-character string
 */
export function stringifyBoard(board: number[][]): string {
  if (board.length !== BOARD_SIZE) {
    throw new Error(
      `Invalid board rows: expected ${BOARD_SIZE}, got ${board.length}`
    );
  }

  let result = '';
  for (let row = 0; row < BOARD_SIZE; row++) {
    if (board[row]?.length !== BOARD_SIZE) {
      throw new Error(
        `Invalid row ${row} length: expected ${BOARD_SIZE}, got ${board[row]?.length}`
      );
    }
    for (let col = 0; col < BOARD_SIZE; col++) {
      const value = board[row]?.[col];
      if (value === undefined || value < 0 || value > 9) {
        throw new Error(`Invalid value at (${row}, ${col}): ${value}`);
      }
      result += value.toString();
    }
  }
  return result;
}

/** Pattern matching a valid 81-character board string (digits 0-9 and dots) */
const BOARD_STRING_PATTERN = /^[0-9.]{81}$/;

/**
 * Validate that a string is a well-formed 81-character board string.
 * A valid board string consists of exactly 81 characters, each being a digit
 * ('0'-'9') or a dot ('.'), where '0' and '.' represent empty cells.
 *
 * This is a lightweight validation that checks format only -- it does not
 * verify that the board represents a solvable or valid Sudoku puzzle.
 *
 * @param s - The string to validate
 * @returns true if the string is a valid board string format
 *
 * @example
 * ```typescript
 * isValidBoardString('530070000600195000098000060800060003400803001700020006060000280000419005000080079'); // true
 * isValidBoardString('.'.repeat(81)); // true (all empty)
 * isValidBoardString('0'.repeat(81)); // true (all empty)
 * isValidBoardString('short');        // false (wrong length)
 * isValidBoardString('x'.repeat(81)); // false (invalid characters)
 * ```
 */
export function isValidBoardString(s: string): boolean {
  return BOARD_STRING_PATTERN.test(s);
}

// =============================================================================
// Scramble Utilities (for creating visually different but equivalent puzzles)
// =============================================================================

/**
 * Scramble configuration options
 */
export interface ScrambleConfig {
  /** Whether to scramble rows within blocks */
  scrambleRows: boolean;
  /** Whether to scramble columns within blocks */
  scrambleColumns: boolean;
  /** Whether to scramble row blocks (groups of 3 rows) */
  scrambleRowBlocks: boolean;
  /** Whether to scramble column blocks (groups of 3 columns) */
  scrambleColumnBlocks: boolean;
  /** Whether to scramble digit mapping (1-9 -> 1-9) */
  scrambleDigits: boolean;
  /** Whether to rotate the board (0, 90, 180, 270 degrees) */
  rotate: boolean;
  /** Whether to mirror the board */
  mirror: boolean;
}

/**
 * Default scramble configuration (all transformations enabled)
 */
export const DEFAULT_SCRAMBLE_CONFIG: ScrambleConfig = {
  scrambleRows: true,
  scrambleColumns: true,
  scrambleRowBlocks: true,
  scrambleColumnBlocks: true,
  scrambleDigits: true,
  rotate: true,
  mirror: true,
};

/**
 * Result of scrambling a board
 */
export interface ScrambleResult {
  /** The scrambled puzzle string */
  puzzle: string;
  /** The scrambled solution string */
  solution: string;
  /**
   * The digit mapping used (original -> scrambled).
   *
   * @deprecated Map does not serialize to JSON. If you need to persist
   * scramble results, convert to a plain object first:
   * `Object.fromEntries(result.digitMapping)`
   */
  digitMapping: Map<number, number>;
  /**
   * The reverse digit mapping (scrambled -> original).
   *
   * @deprecated Map does not serialize to JSON. If you need to persist
   * scramble results, convert to a plain object first:
   * `Object.fromEntries(result.reverseDigitMapping)`
   */
  reverseDigitMapping: Map<number, number>;
}

/**
 * Fisher-Yates shuffle algorithm for arrays.
 *
 * Uses `Math.random()` which is non-deterministic and not
 * cryptographically secure. Scramble results are intended for visual
 * variety, not for security purposes.
 */
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j] as T;
    array[j] = temp as T;
  }
  return array;
}

/**
 * Creates a random digit mapping (1-9 -> 1-9)
 */
function createDigitMapping(): Map<number, number> {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const shuffled = shuffleArray([...digits]);

  const mapping = new Map<number, number>();
  for (let i = 0; i < digits.length; i++) {
    mapping.set(digits[i] as number, shuffled[i] as number);
  }
  return mapping;
}

/**
 * Creates the reverse of a digit mapping
 */
function reverseDigitMapping(
  mapping: Map<number, number>
): Map<number, number> {
  const reverse = new Map<number, number>();
  for (const [original, scrambled] of mapping) {
    reverse.set(scrambled, original);
  }
  return reverse;
}

/**
 * Applies digit mapping to a board
 */
function applyDigitMapping(
  board: number[][],
  mapping: Map<number, number>
): number[][] {
  return board.map((row) =>
    row.map((value) => {
      if (value === 0) return 0;
      return mapping.get(value) ?? value;
    })
  );
}

/**
 * Rotates the board 90 degrees clockwise
 */
function rotateBoard90(board: number[][]): number[][] {
  const rotated: number[][] = [];
  for (let col = 0; col < BOARD_SIZE; col++) {
    const newRow: number[] = [];
    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      newRow.push(board[row]?.[col] ?? 0);
    }
    rotated.push(newRow);
  }
  return rotated;
}

/**
 * Mirrors the board horizontally (left-right)
 */
function mirrorHorizontally(board: number[][]): number[][] {
  return board.map((row) => [...row].reverse());
}

/**
 * Mirrors the board vertically (top-bottom)
 */
function mirrorVertically(board: number[][]): number[][] {
  return [...board].reverse().map((row) => [...row]);
}

/**
 * Scrambles a Sudoku board while preserving its logical structure.
 *
 * Scrambling preserves the logical structure of a Sudoku puzzle while making it
 * appear different. This is useful for:
 * - Preventing players from recognizing puzzles they've seen before
 * - Creating variety from a limited puzzle database
 * - Making it harder to look up solutions online
 *
 * @param puzzle - 81-character puzzle string
 * @param solution - 81-character solution string
 * @param config - Scramble configuration (defaults to all transformations enabled)
 * @returns Scramble result with scrambled puzzle, solution, and digit mapping
 *
 * @example
 * ```typescript
 * const result = scrambleBoard(puzzle, solution);
 * console.log(result.puzzle);      // Scrambled puzzle
 * console.log(result.solution);    // Scrambled solution
 * console.log(result.digitMapping); // Map from original to scrambled digits
 * ```
 */
export function scrambleBoard(
  puzzle: string,
  solution: string,
  config: ScrambleConfig = DEFAULT_SCRAMBLE_CONFIG
): ScrambleResult {
  // Parse the boards
  let puzzleBoard = parseBoardString(puzzle);
  let solutionBoard = parseBoardString(solution);

  // Create digit mapping (applied to both puzzle and solution)
  let digitMapping = new Map<number, number>();
  for (let i = 1; i <= 9; i++) {
    digitMapping.set(i, i); // Identity mapping by default
  }

  if (config.scrambleDigits) {
    digitMapping = createDigitMapping();
    puzzleBoard = applyDigitMapping(puzzleBoard, digitMapping);
    solutionBoard = applyDigitMapping(solutionBoard, digitMapping);
  }

  // Scramble rows within blocks
  if (config.scrambleRows) {
    const rowPermutations: number[][] = [];
    for (let blockRow = 0; blockRow < BLOCK_SIZE; blockRow++) {
      rowPermutations.push(shuffleArray([0, 1, 2]));
    }

    const applyRowPermutation = (board: number[][]): void => {
      for (let blockRow = 0; blockRow < BLOCK_SIZE; blockRow++) {
        const startRow = blockRow * BLOCK_SIZE;
        const perm = rowPermutations[blockRow] as number[];
        const rowsCopy = [
          [...(board[startRow] ?? [])],
          [...(board[startRow + 1] ?? [])],
          [...(board[startRow + 2] ?? [])],
        ];
        for (let i = 0; i < BLOCK_SIZE; i++) {
          board[startRow + i] = rowsCopy[perm[i] as number] as number[];
        }
      }
    };

    applyRowPermutation(puzzleBoard);
    applyRowPermutation(solutionBoard);
  }

  // Scramble columns within blocks
  if (config.scrambleColumns) {
    const colPermutations: number[][] = [];
    for (let blockCol = 0; blockCol < BLOCK_SIZE; blockCol++) {
      colPermutations.push(shuffleArray([0, 1, 2]));
    }

    const applyColPermutation = (board: number[][]): void => {
      for (let blockCol = 0; blockCol < BLOCK_SIZE; blockCol++) {
        const startCol = blockCol * BLOCK_SIZE;
        const perm = colPermutations[blockCol] as number[];
        for (let row = 0; row < BOARD_SIZE; row++) {
          const boardRow = board[row];
          if (boardRow) {
            const colsCopy = [
              boardRow[startCol],
              boardRow[startCol + 1],
              boardRow[startCol + 2],
            ];
            for (let i = 0; i < BLOCK_SIZE; i++) {
              boardRow[startCol + i] = colsCopy[perm[i] as number] as number;
            }
          }
        }
      }
    };

    applyColPermutation(puzzleBoard);
    applyColPermutation(solutionBoard);
  }

  // Scramble row blocks
  if (config.scrambleRowBlocks) {
    const blockOrder = shuffleArray([0, 1, 2]);

    const applyRowBlockPermutation = (board: number[][]): number[][] => {
      const allRows = board.map((row) => [...row]);
      const result: number[][] = [];
      for (let newBlockIndex = 0; newBlockIndex < BLOCK_SIZE; newBlockIndex++) {
        const oldBlockIndex = blockOrder[newBlockIndex] as number;
        for (let i = 0; i < BLOCK_SIZE; i++) {
          result.push(allRows[oldBlockIndex * BLOCK_SIZE + i] as number[]);
        }
      }
      return result;
    };

    puzzleBoard = applyRowBlockPermutation(puzzleBoard);
    solutionBoard = applyRowBlockPermutation(solutionBoard);
  }

  // Scramble column blocks
  if (config.scrambleColumnBlocks) {
    const blockOrder = shuffleArray([0, 1, 2]);

    const applyColBlockPermutation = (board: number[][]): number[][] => {
      const result: number[][] = board.map(() => new Array(BOARD_SIZE).fill(0));
      for (let newBlockIndex = 0; newBlockIndex < BLOCK_SIZE; newBlockIndex++) {
        const oldBlockIndex = blockOrder[newBlockIndex] as number;
        for (let i = 0; i < BLOCK_SIZE; i++) {
          const oldCol = oldBlockIndex * BLOCK_SIZE + i;
          const newCol = newBlockIndex * BLOCK_SIZE + i;
          for (let row = 0; row < BOARD_SIZE; row++) {
            const resultRow = result[row];
            if (resultRow) {
              resultRow[newCol] = board[row]?.[oldCol] ?? 0;
            }
          }
        }
      }
      return result;
    };

    puzzleBoard = applyColBlockPermutation(puzzleBoard);
    solutionBoard = applyColBlockPermutation(solutionBoard);
  }

  // Rotate
  if (config.rotate) {
    const rotations = Math.floor(Math.random() * 4);
    for (let i = 0; i < rotations; i++) {
      puzzleBoard = rotateBoard90(puzzleBoard);
      solutionBoard = rotateBoard90(solutionBoard);
    }
  }

  // Mirror
  if (config.mirror) {
    const mirrorType = Math.floor(Math.random() * 4);
    const applyMirror = (board: number[][]): number[][] => {
      switch (mirrorType) {
        case 1:
          return mirrorHorizontally(board);
        case 2:
          return mirrorVertically(board);
        case 3:
          return mirrorVertically(mirrorHorizontally(board));
        default:
          return board;
      }
    };
    puzzleBoard = applyMirror(puzzleBoard);
    solutionBoard = applyMirror(solutionBoard);
  }

  return {
    puzzle: stringifyBoard(puzzleBoard),
    solution: stringifyBoard(solutionBoard),
    digitMapping,
    reverseDigitMapping: reverseDigitMapping(digitMapping),
  };
}

/**
 * Creates an identity scramble result (no scrambling)
 * @param puzzle - 81-character puzzle string
 * @param solution - 81-character solution string
 * @returns ScrambleResult with identity mapping
 */
export function noScramble(puzzle: string, solution: string): ScrambleResult {
  const identityMapping = new Map<number, number>();
  for (let i = 1; i <= 9; i++) {
    identityMapping.set(i, i);
  }

  return {
    puzzle,
    solution,
    digitMapping: identityMapping,
    reverseDigitMapping: identityMapping,
  };
}

// =============================================================================
// Solver Utilities (shared between frontend and backend)
// =============================================================================

/**
 * Check if all cells are filled (no empty cells remaining).
 * A cell is considered filled if either the original puzzle has a digit
 * or the user has entered a digit.
 *
 * @param original - 81-char original puzzle string (0 = empty)
 * @param user - 81-char user input string (0 = no input)
 * @returns true if all 81 cells have a non-zero digit
 *
 * @example
 * ```typescript
 * const original = '530070000...'; // partial puzzle
 * const user = '000000000...';     // no user input yet
 * isBoardFilled(original, user);   // false
 * ```
 */
export function isBoardFilled(original: string, user: string): boolean {
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const originalChar = original[i] || '0';
    const userChar = user[i] || '0';
    const actualChar = userChar !== '0' ? userChar : originalChar;
    if (actualChar === '0') return false;
  }
  return true;
}

/**
 * Check if all cells are filled AND match the solution.
 * Useful for validating that a puzzle is correctly solved.
 *
 * @param original - 81-char original puzzle string (0 = empty)
 * @param user - 81-char user input string (0 = no input)
 * @param solution - 81-char solution string
 * @returns true if board is filled and all values match solution
 *
 * @example
 * ```typescript
 * isBoardSolved(original, userInput, solution); // true if correctly solved
 * ```
 */
export function isBoardSolved(
  original: string,
  user: string,
  solution: string
): boolean {
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const originalChar = original[i] || '0';
    const userChar = user[i] || '0';
    const solutionChar = solution[i] || '0';
    const actualChar = userChar !== '0' ? userChar : originalChar;
    if (actualChar === '0') return false;
    if (actualChar !== solutionChar) return false;
  }
  return true;
}

/**
 * Get the current board state by merging original puzzle and user input.
 * For each cell, returns the user's input if non-zero, otherwise the original value.
 *
 * @param original - 81-char original puzzle string (0 = empty)
 * @param user - 81-char user input string (0 = no input)
 * @returns 81-char string representing current board state
 *
 * @example
 * ```typescript
 * const original = '530070000...';
 * const user = '006000000...';
 * getMergedBoardState(original, user); // '536070000...'
 * ```
 */
export function getMergedBoardState(original: string, user: string): string {
  let result = '';
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const originalChar = original[i] || '0';
    const userChar = user[i] || '0';
    result += userChar !== '0' ? userChar : originalChar;
  }
  return result;
}

/**
 * Check for "Invalid Pencilmarks" error in hint steps.
 * This indicates the solver detected inconsistent pencilmarks.
 *
 * @param steps - Array of hint steps from solver response
 * @returns true if any step has title "Invalid Pencilmarks"
 *
 * @example
 * ```typescript
 * if (hasInvalidPencilmarksStep(response.data.hints.steps)) {
 *   throw new Error('Invalid pencilmarks detected');
 * }
 * ```
 */
export function hasInvalidPencilmarksStep(
  steps: Array<{ title?: string }> | undefined
): boolean {
  if (!steps) return false;
  return steps.some((step) => step.title === 'Invalid Pencilmarks');
}

/**
 * Check if pencilmarks string has actual content (not just empty commas).
 * Pencilmarks are stored as comma-separated values like "123,45,9,,...".
 * An "empty" pencilmarks string would be all commas: ",,,,,...".
 *
 * @param pencilmarks - Comma-separated pencilmarks string
 * @returns true if there are actual pencilmark values
 *
 * @example
 * ```typescript
 * hasPencilmarkContent('123,45,,9,');  // true
 * hasPencilmarkContent(',,,,,,,,');    // false
 * hasPencilmarkContent('');            // false
 * ```
 */
export function hasPencilmarkContent(pencilmarks: string): boolean {
  return pencilmarks.replace(/,/g, '').length > 0;
}

/**
 * Map from TechniqueId to display title.
 * Covers all defined technique IDs (1-60).
 *
 * These are the display titles: they match `sudojo_api`'s seeded
 * `techniques.title` and the `/technique.<title>.svg` icon file names used by
 * {@link getTechniqueIconUrl}. They equal the solver's hint-step `title` for
 * every technique except AIC, where this is `'AIC'` and the solver says
 * `'Alternating Inference Chain'`. Do not compare them to `step.title`.
 */
const TECHNIQUE_ID_TO_TITLE: Record<TechniqueId, string> = {
  [TechniqueId.FULL_HOUSE]: 'Full House',
  [TechniqueId.HIDDEN_SINGLE]: 'Hidden Single',
  [TechniqueId.NAKED_SINGLE]: 'Naked Single',
  [TechniqueId.HIDDEN_PAIR]: 'Hidden Pair',
  [TechniqueId.NAKED_PAIR]: 'Naked Pair',
  [TechniqueId.LOCKED_CANDIDATES]: 'Locked Candidates',
  [TechniqueId.HIDDEN_TRIPLE]: 'Hidden Triple',
  [TechniqueId.NAKED_TRIPLE]: 'Naked Triple',
  [TechniqueId.HIDDEN_QUAD]: 'Hidden Quad',
  [TechniqueId.NAKED_QUAD]: 'Naked Quad',
  [TechniqueId.X_WING]: 'X-Wing',
  [TechniqueId.SWORDFISH]: 'Swordfish',
  [TechniqueId.JELLYFISH]: 'Jellyfish',
  [TechniqueId.XY_WING]: 'XY-Wing',
  [TechniqueId.FINNED_X_WING]: 'Finned X-Wing',
  [TechniqueId.SQUIRMBAG]: 'Squirmbag',
  [TechniqueId.FINNED_SWORDFISH]: 'Finned Swordfish',
  [TechniqueId.FINNED_JELLYFISH]: 'Finned Jellyfish',
  [TechniqueId.XYZ_WING]: 'XYZ-Wing',
  [TechniqueId.WXYZ_WING]: 'WXYZ-Wing',
  [TechniqueId.ALMOST_LOCKED_SETS]: 'Almost Locked Sets',
  [TechniqueId.FINNED_SQUIRMBAG]: 'Finned Squirmbag',
  [TechniqueId.ALS_CHAIN]: 'ALS Chain',
  [TechniqueId.SKYSCRAPER]: 'Skyscraper',
  [TechniqueId.TWO_STRING_KITE]: 'Two-String Kite',
  [TechniqueId.EMPTY_RECTANGLE]: 'Empty Rectangle',
  [TechniqueId.SIMPLE_COLORING]: 'Simple Coloring',
  [TechniqueId.W_WING]: 'W-Wing',
  [TechniqueId.REMOTE_PAIRS]: 'Remote Pairs',
  [TechniqueId.UNIQUE_RECTANGLE_1]: 'Unique Rectangle Type 1',
  [TechniqueId.UNIQUE_RECTANGLE_2]: 'Unique Rectangle Type 2',
  [TechniqueId.BUG_PLUS_1]: 'BUG+1',
  [TechniqueId.SUE_DE_COQ]: 'Sue de Coq',
  [TechniqueId.ALS_XZ]: 'ALS-XZ',
  [TechniqueId.X_CYCLES]: 'X-Cycles',
  [TechniqueId.FORCING_CHAINS]: 'Forcing Chains',
  [TechniqueId.MEDUSA_COLORING]: '3D Medusa',
  [TechniqueId.CRANE]: 'Crane',
  [TechniqueId.UNIQUE_RECTANGLE_3]: 'Unique Rectangle Type 3',
  [TechniqueId.UNIQUE_RECTANGLE_4]: 'Unique Rectangle Type 4',
  [TechniqueId.UNIQUE_RECTANGLE_5]: 'Unique Rectangle Type 5',
  [TechniqueId.X_CHAIN]: 'X-Chain',
  [TechniqueId.XY_CHAIN]: 'XY-Chain',
  [TechniqueId.VWXYZ_WING]: 'VWXYZ-Wing',
  [TechniqueId.UVWXYZ_WING]: 'UVWXYZ-Wing',
  [TechniqueId.TUVWXYZ_WING]: 'TUVWXYZ-Wing',
  [TechniqueId.STUVWXYZ_WING]: 'STUVWXYZ-Wing',
  [TechniqueId.AIC]: 'AIC',
  [TechniqueId.FORCING_NET]: 'Forcing Net',
  [TechniqueId.AVOIDABLE_RECTANGLE]: 'Avoidable Rectangle',
  [TechniqueId.SASHIMI_X_WING]: 'Sashimi X-Wing',
  [TechniqueId.SASHIMI_SWORDFISH]: 'Sashimi Swordfish',
  [TechniqueId.SASHIMI_JELLYFISH]: 'Sashimi Jellyfish',
  [TechniqueId.HIDDEN_UNIQUE_RECTANGLE]: 'Hidden Unique Rectangle',
  [TechniqueId.FIREWORK]: 'Firework',
  [TechniqueId.DEATH_BLOSSOM]: 'Death Blossom',
  [TechniqueId.FRANKEN_X_WING]: 'Franken X-Wing',
  [TechniqueId.FRANKEN_SWORDFISH]: 'Franken Swordfish',
  [TechniqueId.FRANKEN_JELLYFISH]: 'Franken Jellyfish',
  [TechniqueId.GROUPED_X_CYCLES]: 'Grouped X-Cycles',
};

/**
 * Get the technique title/name from its ID.
 *
 * Returns the display title, which is not always the solver's hint-step
 * `title`. For example, AIC returns `'AIC'`, while the solver uses
 * `'Alternating Inference Chain'`.
 *
 * @param techniqueId - The technique ID number
 * @returns The technique title, or "Technique {id}" if unknown
 *
 * @example
 * ```typescript
 * getTechniqueNameById(1);  // "Full House"
 * getTechniqueNameById(14); // "XY-Wing"
 * getTechniqueNameById(999); // "Technique 999"
 * ```
 */
export function getTechniqueNameById(techniqueId: number): string {
  return (
    TECHNIQUE_ID_TO_TITLE[techniqueId as TechniqueId] ??
    `Technique ${techniqueId}`
  );
}

// =============================================================================
// Board State Constants
// =============================================================================

/**
 * Empty board string (81 zeros) representing no user input.
 * Used as default value for user input in solver APIs.
 */
export const EMPTY_BOARD = '0'.repeat(81);

/**
 * Empty pencilmarks string (80 commas = 81 empty elements).
 * Used as default value for pencilmarks in solver APIs.
 */
export const EMPTY_PENCILMARKS = ','.repeat(80);

// =============================================================================
// Cell Notation Utilities
// =============================================================================

/**
 * Format a cell position in R1C1 notation (1-indexed for human readability).
 *
 * @param row - Row index (0-8)
 * @param col - Column index (0-8)
 * @returns String like "R1C1" for top-left, "R9C9" for bottom-right
 *
 * @example
 * ```typescript
 * cellName(0, 0); // "R1C1"
 * cellName(4, 4); // "R5C5"
 * cellName(8, 8); // "R9C9"
 * ```
 */
export function cellName(row: number, col: number): string {
  return `R${row + 1}C${col + 1}`;
}

/**
 * Format multiple cell positions as a comma-separated list in R1C1 notation.
 *
 * @param cells - Array of [row, col] pairs
 * @returns String like "R1C1, R2C3, R5C5"
 *
 * @example
 * ```typescript
 * cellList([[0, 0], [1, 2], [4, 4]]); // "R1C1, R2C3, R5C5"
 * ```
 */
export function cellList(cells: Array<[number, number]> | number[][]): string {
  return cells.map(([row, col]) => cellName(row ?? 0, col ?? 0)).join(', ');
}

/**
 * Get the block index (0-8) for a given cell position.
 * Blocks are numbered left-to-right, top-to-bottom:
 * ```
 * 0 1 2
 * 3 4 5
 * 6 7 8
 * ```
 *
 * @param row - Row index (0-8)
 * @param col - Column index (0-8)
 * @returns Block index (0-8)
 *
 * @example
 * ```typescript
 * getBlockIndex(0, 0); // 0 (top-left block)
 * getBlockIndex(4, 4); // 4 (center block)
 * getBlockIndex(8, 8); // 8 (bottom-right block)
 * ```
 */
export function getBlockIndex(row: number, col: number): number {
  return (
    Math.floor(row / BLOCK_SIZE) * BLOCK_SIZE + Math.floor(col / BLOCK_SIZE)
  );
}

/**
 * Get the block number (1-9) for a given cell position.
 * Same as getBlockIndex but 1-indexed for human readability.
 *
 * @param row - Row index (0-8)
 * @param col - Column index (0-8)
 * @returns Block number (1-9)
 */
export function getBlockNumber(row: number, col: number): number {
  return getBlockIndex(row, col) + 1;
}

/**
 * Convert a flat cell index (0-80) to row and column.
 *
 * @param index - Flat index (0-80)
 * @returns [row, col] tuple (both 0-8)
 *
 * @example
 * ```typescript
 * indexToRowCol(0);  // [0, 0]
 * indexToRowCol(40); // [4, 4]
 * indexToRowCol(80); // [8, 8]
 * ```
 */
export function indexToRowCol(index: number): [number, number] {
  return [Math.floor(index / BOARD_SIZE), index % BOARD_SIZE];
}

/**
 * Convert row and column to a flat cell index (0-80).
 *
 * @param row - Row index (0-8)
 * @param col - Column index (0-8)
 * @returns Flat index (0-80)
 *
 * @example
 * ```typescript
 * rowColToIndex(0, 0); // 0
 * rowColToIndex(4, 4); // 40
 * rowColToIndex(8, 8); // 80
 * ```
 */
export function rowColToIndex(row: number, col: number): number {
  return row * BOARD_SIZE + col;
}

// =============================================================================
// Time Formatting Utilities
// =============================================================================

/**
 * Format seconds as MM:SS or HH:MM:SS.
 *
 * @param seconds - Total seconds to format
 * @returns Formatted time string
 *
 * @example
 * ```typescript
 * formatTime(65);    // "01:05"
 * formatTime(3661);  // "01:01:01"
 * formatTime(0);     // "00:00"
 * ```
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse MM:SS or HH:MM:SS time string to seconds.
 *
 * @param timeString - Time string in MM:SS or HH:MM:SS format
 * @returns Total seconds, or 0 if invalid format
 *
 * @example
 * ```typescript
 * parseTime("01:05");     // 65
 * parseTime("01:01:01");  // 3661
 * parseTime("invalid");   // 0
 * ```
 */
export function parseTime(timeString: string): number {
  const parts = timeString.split(':').map((p) => parseInt(p, 10));
  if (parts.some(isNaN)) return 0;

  if (parts.length === 2) {
    return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  } else if (parts.length === 3) {
    return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
  }
  return 0;
}

/**
 * Format a set of digits like {1, 2, 3} for display.
 *
 * @param digits - String or array of digits
 * @returns Formatted string like "{1, 2, 3}"
 *
 * @example
 * ```typescript
 * formatDigits("123");     // "{1, 2, 3}"
 * formatDigits([1, 2, 3]); // "{1, 2, 3}"
 * ```
 */
export function formatDigits(digits: string | number[]): string {
  const arr =
    typeof digits === 'string' ? digits.split('') : digits.map(String);
  return `{${arr.join(', ')}}`;
}

// =============================================================================
// UUID Validation Utilities
// =============================================================================

/** UUID regex pattern (lowercase or uppercase) */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Check if a string is a valid UUID format.
 *
 * @param id - String to validate
 * @returns true if valid UUID format
 *
 * @example
 * ```typescript
 * isValidUUID('123e4567-e89b-12d3-a456-426614174000'); // true
 * isValidUUID('not-a-uuid'); // false
 * ```
 */
export function isValidUUID(id: string): boolean {
  return UUID_PATTERN.test(id);
}

/**
 * Validate a UUID and throw if invalid.
 *
 * @param uuid - UUID string to validate
 * @param name - Optional name for error message (e.g., "Board UUID")
 * @returns The validated UUID string
 * @throws Error if UUID is missing or invalid format
 *
 * @example
 * ```typescript
 * const id = validateUUID(params.id, 'Board UUID'); // throws if invalid
 * ```
 */
export function validateUUID(uuid: string, name: string = 'UUID'): string {
  if (!uuid) {
    throw new Error(`${name} is required`);
  }
  if (!isValidUUID(uuid)) {
    throw new Error(
      `Invalid ${name} format: "${uuid}". Expected UUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)`
    );
  }
  return uuid;
}

// =============================================================================
// Solver API Option Types
// =============================================================================

/**
 * Options for the solver /solve API call.
 * Used to get hints for solving a puzzle step by step.
 */
export interface SolveOptions {
  /** 81-character puzzle string (original clues) */
  original: string;
  /** 81-character user input string (current progress) */
  user: string;
  /** Whether auto-pencilmarks are enabled */
  autoPencilmarks?: boolean;
  /** Comma-separated pencilmarks string (81 elements) */
  pencilmarks?: string;
  /**
   * Optional technique filters (legacy).
   * @deprecated Ignored: neither `sudojo_api` nor the solver reads a
   * `filters` parameter. Use {@link SolveOptions.techniques}.
   */
  filters?: string;
  /** Optional comma-delimited list of technique numbers to filter solving (e.g., "1,2,3") */
  techniques?: string;
}

/**
 * Options for the solver /validate API call.
 * Used to validate a puzzle has a unique solution.
 */
export interface ValidateOptions {
  /** 81-character puzzle string */
  original: string;
  /**
   * Whether auto-pencilmarks are enabled (for iterative validation).
   * @deprecated Ignored: `sudojo_client` does not send it, and the solver's
   * `/validate` does not accept it. (`/validate` accepts `brutalForce`, which
   * this type does not expose yet.)
   */
  autoPencilmarks?: boolean;
}

/**
 * Options for the solver /generate API call.
 * Used to generate a new random puzzle.
 */
export interface GenerateOptions {
  /** Whether to generate a symmetrical puzzle */
  symmetrical?: boolean;
}

// =============================================================================
// Technique URL Utilities
// =============================================================================

/**
 * Get technique icon URL from technique ID.
 *
 * @param techniqueId - Technique ID number
 * @returns Icon URL path (e.g., "/technique.full.house.svg")
 *
 * @example
 * ```typescript
 * getTechniqueIconUrl(TechniqueId.FULL_HOUSE); // "/technique.full.house.svg"
 * getTechniqueIconUrl(TechniqueId.X_WING);     // "/technique.x.wing.svg"
 * getTechniqueIconUrl(TechniqueId.XY_WING);    // "/technique.xy.wing.svg"
 * ```
 */
export function getTechniqueIconUrl(techniqueId: number): string {
  const title = getTechniqueNameById(techniqueId);
  const normalized = title
    .toLowerCase()
    .replace(/\s+/g, '.') // spaces to dots
    .replace(/-/g, '.'); // hyphens to dots
  return `/technique.${normalized}.svg`;
}

// =============================================================================
// Gamification Types (Points, Badges, Levels)
// =============================================================================

/** User gamification stats */
export interface UserStats {
  totalPoints: number;
  userLevel: number;
  gamesCompleted: number;
}

/** Badge definition */
export interface BadgeDefinition {
  id: string;
  badgeType: string;
  badgeKey: string;
  title: string;
  description: string | null;
  iconUrl: string | null;
  requirementValue: number | null;
  createdAt: string | null;
  /** Optional localization data for i18n translation of title and description */
  localization?: {
    title?: LocalizedHint;
    description?: LocalizedHint;
  };
}

/** User's earned badge with full badge info */
export interface EarnedBadge {
  badgeKey: string;
  earnedAt: string | null;
  title: string;
  description: string | null;
  iconUrl: string | null;
  badgeType: string;
  requirementValue: number | null;
  /** Optional localization data for i18n translation of title and description */
  localization?: {
    title?: LocalizedHint;
    description?: LocalizedHint;
  };
}

/**
 * An active game session tracking a player's puzzle attempt.
 * Created via {@link GameStartRequest} and completed via {@link GameFinishRequest}.
 *
 * Flow: start (POST /gamification/start) -> hint (POST /solver/solve) -> finish (POST /gamification/finish)
 */
export interface GameSession {
  /** Unique session identifier */
  sessionId: string;
  /** 81-character puzzle string being played */
  board: string;
  /** Difficulty level of the puzzle (1-12) */
  level: number;
  /** Cumulative solving effort (sum of per-step technique scores). See {@link Board.difficulty_score}. */
  difficultyScore: number;
  /** Whether this is a daily puzzle or a level-based puzzle */
  puzzleType: 'daily' | 'level';
  /** Identifier of the specific puzzle (daily UUID or board UUID), or null */
  puzzleId: string | null;
  /** Whether the player has used any hints during this session */
  hintUsed: boolean;
  /** Total number of hints used during this session */
  hintsCount: number;
  /** ISO 8601 timestamp when the session was started */
  startedAt: string;
}

/**
 * Request body to start a new game session.
 * The session tracks hint usage and elapsed time for point calculation.
 *
 * Flow: start (POST /gamification/start) -> hint (POST /solver/solve) -> finish (POST /gamification/finish)
 */
export interface GameStartRequest {
  /** 81-character puzzle string (the starting board state) */
  board: string;
  /** 81-character solution string for validation */
  solution: string;
  /** Difficulty level of the puzzle (1-12), used for point calculation */
  level: number;
  /**
   * Bitmask of techniques required to solve (see {@link Board.techniques}),
   * as a number or a base-10 string. Send a string (e.g.
   * `formatTechniqueBitmask(mask)`) whenever any technique ID >= 54 is set.
   */
  techniques: number | string;
  /** Cumulative solving effort (sum of per-step technique scores). See {@link Board.difficulty_score}. */
  difficultyScore?: number;
  /** Whether this is a daily puzzle or a level-based puzzle */
  puzzleType: 'daily' | 'level';
  /** Optional identifier of the specific puzzle (daily UUID or board UUID) */
  puzzleId?: string;
}

/** Response from starting a game session */
export interface GameStartResponse {
  sessionId: string;
  startedAt: string;
}

/** Request to finish a game session */
export interface GameFinishRequest {
  elapsedTime: number;
}

/** Points breakdown from finishing a game session */
export interface GameFinishPoints {
  /** Base points for puzzle level (2^level) */
  basePoints: number;
  /** Multiplier for completing without hints (10 if no hints, 1 otherwise) */
  noHintMultiplier: number;
  /** Multiplier for completing without interruption (2 if no interruption, 1 otherwise) */
  noInterruptionMultiplier: number;
  /** Total points earned from this puzzle (basePoints × multipliers) */
  totalPoints: number;
}

/** Level up information (only present if user leveled up) */
export interface GameFinishLevel {
  /** The user's new level after leveling up */
  newUserLevel: number;
}

/** Badge earned from game completion */
export interface NewBadge {
  badgeKey: string;
  title: string;
  description: string | null;
  /** Optional localization data for i18n translation of title and description */
  localization?: {
    title?: LocalizedHint;
    description?: LocalizedHint;
  };
}

/**
 * Response from finishing a game session (POST /gamification/finish).
 * Contains the points breakdown, optional level-up info, and any newly earned badges.
 *
 * Note: Hint points are awarded separately via POST /solver/solve during gameplay,
 * not included in this response.
 */
export interface GameFinishResponse {
  /** Points earned from this puzzle (hint points awarded separately via /solver/solve) */
  points: GameFinishPoints;
  /** Level up information (only present if user leveled up) */
  level?: GameFinishLevel;
  /** New badges earned (only present if badges were earned) */
  badges?: NewBadge[];
}

/** Full gamification stats including earned badges */
export interface GamificationStats {
  totalPoints: number;
  userLevel: number;
  gamesCompleted: number;
  badges: EarnedBadge[];
}

/**
 * A record of points earned or spent by a user.
 * Transaction types include "puzzle_complete", "hint_used", "badge_earned", etc.
 */
export interface PointTransaction {
  /** Unique transaction identifier */
  id: string;
  /** Firebase UID of the user */
  userId: string;
  /** Points amount (positive = earned, negative = spent) */
  points: number;
  /** Type of transaction (e.g., "puzzle_complete", "hint_used") */
  transactionType: string;
  /** Additional context for the transaction (e.g., puzzle ID, technique level) */
  metadata: Record<string, unknown> | null;
  /** ISO 8601 timestamp when the transaction was created */
  createdAt: string | null;
}

/** Badge definition create request (admin) */
export interface BadgeDefinitionCreateRequest {
  badgeType: string;
  badgeKey: string;
  title: string;
  description?: string | null;
  iconUrl?: string | null;
  requirementValue?: number | null;
}

/** Badge definition update request (admin) */
export interface BadgeDefinitionUpdateRequest {
  badgeType?: string;
  title?: string;
  description?: string | null;
  iconUrl?: string | null;
  requirementValue?: number | null;
}
