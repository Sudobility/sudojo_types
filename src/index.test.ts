import { describe, it, expect, expectTypeOf } from 'vitest';
import {
  successResponse,
  MIN_CLUES,
  MIN_LEVEL,
  MAX_LEVEL,
  ALL_LEVELS,
  isValidLevel,
  errorResponse,
  getBeltForLevel,
  getAllBelts,
  getBeltIconSvg,
  getBeltIconForLevel,
  BELT_COLORS,
  BELT_ICON_PATHS,
  BELT_ICON_VIEWBOX,
  // Board utilities
  BOARD_SIZE,
  BLOCK_SIZE,
  TOTAL_CELLS,
  parseBoardString,
  stringifyBoard,
  isValidBoardString,
  // Scramble utilities
  scrambleBoard,
  noScramble,
  DEFAULT_SCRAMBLE_CONFIG,
  // Solver utilities
  isBoardFilled,
  isBoardSolved,
  getMergedBoardState,
  hasInvalidPencilmarksStep,
  hasPencilmarkContent,
  getTechniqueNameById,
  getTechniqueIconUrl,
  TechniqueId,
  // Bitfield utilities
  ALL_TECHNIQUE_IDS,
  techniqueToBit,
  hasTechnique,
  addTechnique,
  // BigInt bitmask utilities
  parseTechniqueBitmask,
  techniqueBitmaskOf,
  hasTechniqueInBitmask,
  techniqueIdsFromBitmask,
  techniqueIdsToBitmask,
  formatTechniqueBitmask,
  type TechniqueBitmaskSource,
  type TechniqueExample,
  // UUID utilities
  isValidUUID,
  validateUUID,
  // Cell notation utilities
  cellName,
  cellList,
  getBlockIndex,
  getBlockNumber,
  indexToRowCol,
  rowColToIndex,
  // Time formatting utilities
  formatTime,
  parseTime,
  formatDigits,
  // Solver envelope
  SOLVER_ERROR_CODES,
  type SolverErrorCode,
  type SolverErrorPayload,
  type SolverResult,
  type SolverHints,
  type SolverHintStep,
  type SolveData,
  type ValidateBoardData,
  type ValidateData,
  type ScrambleConfig,
  type ScrambleResult,
  type Belt,
  type Level,
  type Technique,
  type Learning,
  type Board,
  type Daily,
  type Challenge,
  type ISODateString,
  type LevelCreateRequest,
  type LevelUpdateRequest,
  type TechniqueCreateRequest,
  type TechniqueUpdateRequest,
  type LearningCreateRequest,
  type BoardCreateRequest,
  type BoardUpdateRequest,
  type DailyCreateRequest,
  type DailyUpdateRequest,
  type TechniqueExampleCreateRequest,
  type TechniqueExampleUpdateRequest,
  type ChallengeCreateRequest,
  type TechniqueQueryParams,
  type LearningQueryParams,
  type BoardQueryParams,
  type ChallengeQueryParams,
  type HealthCheckData,
  type BaseResponse,
  type Optional,
  type GameSession,
  type GameStartRequest,
  type GameFinishResponse,
  type PointTransaction,
} from './index';

// =============================================================================
// Helper Function Tests
// =============================================================================

describe('successResponse', () => {
  it('should create a success response with data', () => {
    const data = { id: 1, name: 'test' };
    const response = successResponse(data);

    expect(response.success).toBe(true);
    expect(response.data).toEqual(data);
    expect(response.timestamp).toBeDefined();
    expect(typeof response.timestamp).toBe('string');
  });

  it('should create valid ISO timestamp', () => {
    const response = successResponse('test');
    const date = new Date(response.timestamp);

    expect(date.toString()).not.toBe('Invalid Date');
  });

  it('should work with different data types', () => {
    expect(successResponse(null).data).toBeNull();
    expect(successResponse(123).data).toBe(123);
    expect(successResponse([1, 2, 3]).data).toEqual([1, 2, 3]);
    expect(successResponse({ nested: { value: true } }).data).toEqual({
      nested: { value: true },
    });
  });
});

describe('errorResponse', () => {
  it('should create an error response with message', () => {
    const response = errorResponse('Something went wrong');

    expect(response.success).toBe(false);
    expect(response.error).toBe('Something went wrong');
    expect(response.timestamp).toBeDefined();
  });

  it('should create valid ISO timestamp', () => {
    const response = errorResponse('error');
    const date = new Date(response.timestamp);

    expect(date.toString()).not.toBe('Invalid Date');
  });
});

// =============================================================================
// Type Tests - Entity Types
// =============================================================================

describe('Entity Types', () => {
  it('Level type should have correct shape', () => {
    const level: Level = {
      level: 1,
      title: 'Beginner',
      text: 'Introduction to Sudoku',
      requires_subscription: false,
      entitlement: null,
      offer_id: null,
      percentage: null,
      created_at: new Date(),
      updated_at: null,
    };

    expectTypeOf(level.level).toBeNumber();
    expectTypeOf(level.title).toBeString();
    expectTypeOf(level.text).toEqualTypeOf<string | null>();
    expectTypeOf(level.requires_subscription).toEqualTypeOf<boolean | null>();
    expectTypeOf(level.offer_id).toEqualTypeOf<string | null>();
    expectTypeOf(level.percentage).toEqualTypeOf<number | null>();
    expectTypeOf(level.created_at).toEqualTypeOf<Date | null>();
    expectTypeOf(level.updated_at).toEqualTypeOf<Date | null>();
  });

  it('Technique type should have correct shape', () => {
    const technique: Technique = {
      technique: 1,
      level: 1,
      title: 'Naked Singles',
      path: 'naked-singles',
      dependencies: null,
      text: null,
      percentage: null,
      created_at: null,
      updated_at: null,
    };

    expectTypeOf(technique.technique).toBeNumber();
    expectTypeOf(technique.level).toEqualTypeOf<number | null>();
    expectTypeOf(technique.title).toBeString();
    expectTypeOf(technique.path).toEqualTypeOf<string | null>();
    expectTypeOf(technique.dependencies).toEqualTypeOf<string | null>();
    expectTypeOf(technique.percentage).toEqualTypeOf<number | null>();
  });

  it('Learning type should have correct shape', () => {
    const learning: Learning = {
      uuid: '789',
      technique: 1,
      index: 0,
      language_code: 'en',
      text: 'Learn this technique',
      image_url: null,
      created_at: null,
      updated_at: null,
    };

    expectTypeOf(learning.technique).toEqualTypeOf<number | null>();
    expectTypeOf(learning.language_code).toBeString();
    expectTypeOf(learning.image_url).toEqualTypeOf<string | null>();
  });

  it('Board type should have correct shape', () => {
    const board: Board = {
      uuid: 'board-1',
      level: 1,
      symmetrical: true,
      board:
        '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
      solution:
        '534678912672195348198342567859761423426853791713924856961537284287419635345286179',
      techniques: 3,
      created_at: null,
      updated_at: null,
    };

    expectTypeOf(board.board).toBeString();
    expectTypeOf(board.solution).toBeString();
    expectTypeOf(board.level).toEqualTypeOf<number | null>();
    expectTypeOf(board.symmetrical).toEqualTypeOf<boolean | null>();
    expectTypeOf(board.techniques).toEqualTypeOf<number | null>();
  });

  it('Daily type should have correct shape', () => {
    const daily: Daily = {
      uuid: 'daily-1',
      date: '2024-01-15',
      board_uuid: 'board-1',
      level: 1,
      techniques: 2,
      board:
        '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
      solution:
        '534678912672195348198342567859761423426853791713924856961537284287419635345286179',
      created_at: null,
      updated_at: null,
    };

    expectTypeOf(daily.date).toBeString();
    expectTypeOf(daily.board_uuid).toEqualTypeOf<string | null>();
    expectTypeOf(daily.level).toEqualTypeOf<number | null>();
  });

  it('Challenge type should have correct shape', () => {
    const challenge: Challenge = {
      uuid: 'challenge-1',
      board_uuid: null,
      level: 1,
      difficulty: 5,
      board:
        '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
      solution:
        '534678912672195348198342567859761423426853791713924856961537284287419635345286179',
      created_at: null,
      updated_at: null,
    };

    expectTypeOf(challenge.level).toEqualTypeOf<number | null>();
    expectTypeOf(challenge.difficulty).toEqualTypeOf<number | null>();
  });

  it('ISODateString should be a string alias', () => {
    const date: ISODateString = '2024-01-15';
    expectTypeOf(date).toBeString();
  });

  it('GameSession type should have correct shape', () => {
    const session: GameSession = {
      sessionId: 'sess-1',
      board: '0'.repeat(81),
      level: 1,
      puzzleType: 'daily',
      puzzleId: null,
      hintUsed: false,
      hintsCount: 0,
      startedAt: '2024-01-15T00:00:00Z',
    };

    expectTypeOf(session.sessionId).toBeString();
    expectTypeOf(session.puzzleType).toEqualTypeOf<'daily' | 'level'>();
    expectTypeOf(session.puzzleId).toEqualTypeOf<string | null>();
    expectTypeOf(session.hintUsed).toBeBoolean();
    expectTypeOf(session.hintsCount).toBeNumber();
  });

  it('GameStartRequest type should have correct shape', () => {
    const request: GameStartRequest = {
      board: '0'.repeat(81),
      solution: '1'.repeat(81),
      level: 1,
      techniques: 3,
      puzzleType: 'level',
    };

    expectTypeOf(request.board).toBeString();
    expectTypeOf(request.level).toBeNumber();
    expectTypeOf<GameStartRequest['techniques']>().toEqualTypeOf<
      number | string
    >();
    expectTypeOf(request.puzzleType).toEqualTypeOf<'daily' | 'level'>();
  });

  it('GameFinishResponse type should have correct shape', () => {
    const response: GameFinishResponse = {
      points: {
        basePoints: 4,
        noHintMultiplier: 10,
        noInterruptionMultiplier: 2,
        totalPoints: 80,
      },
    };

    expectTypeOf(response.points.basePoints).toBeNumber();
    expectTypeOf(response.points.totalPoints).toBeNumber();
  });

  it('PointTransaction type should have correct shape', () => {
    const tx: PointTransaction = {
      id: 'tx-1',
      userId: 'user-1',
      points: 100,
      transactionType: 'puzzle_complete',
      metadata: null,
      createdAt: null,
    };

    expectTypeOf(tx.id).toBeString();
    expectTypeOf(tx.points).toBeNumber();
    expectTypeOf(tx.transactionType).toBeString();
    expectTypeOf(tx.metadata).toEqualTypeOf<Record<string, unknown> | null>();
    expectTypeOf(tx.createdAt).toEqualTypeOf<string | null>();
  });
});

// =============================================================================
// Type Tests - Request Types with Optional<T>
// =============================================================================

describe('Request Types use Optional<T>', () => {
  it('LevelCreateRequest should use Optional for optional fields', () => {
    const request: LevelCreateRequest = {
      level: 1,
      title: 'Test',
      text: undefined,
      requires_subscription: undefined,
      entitlement: undefined,
      offer_id: undefined,
      percentage: undefined,
    };

    expectTypeOf(request.level).toBeNumber();
    expectTypeOf(request.title).toBeString();
    expectTypeOf(request.text).toEqualTypeOf<Optional<string>>();
    expectTypeOf(request.requires_subscription).toEqualTypeOf<
      Optional<boolean>
    >();
    expectTypeOf(request.offer_id).toEqualTypeOf<Optional<string>>();
    expectTypeOf(request.percentage).toEqualTypeOf<Optional<number>>();
  });

  it('LevelUpdateRequest should use Optional for all fields', () => {
    const request: LevelUpdateRequest = {
      title: undefined,
      text: undefined,
      requires_subscription: undefined,
      entitlement: undefined,
      offer_id: undefined,
      percentage: undefined,
    };

    expectTypeOf(request.title).toEqualTypeOf<Optional<string>>();
    expectTypeOf(request.offer_id).toEqualTypeOf<Optional<string>>();
    expectTypeOf(request.percentage).toEqualTypeOf<Optional<number>>();
  });

  it('TechniqueCreateRequest should use Optional for optional fields', () => {
    const request: TechniqueCreateRequest = {
      technique: 1,
      level: 1,
      title: 'Test',
      text: undefined,
      percentage: undefined,
    };

    expectTypeOf(request.technique).toBeNumber();
    expectTypeOf(request.level).toBeNumber();
    expectTypeOf(request.text).toEqualTypeOf<Optional<string>>();
    expectTypeOf(request.percentage).toEqualTypeOf<Optional<number>>();
  });

  it('TechniqueUpdateRequest should use Optional for all fields', () => {
    const request: TechniqueUpdateRequest = {
      level: undefined,
      title: undefined,
      text: undefined,
      percentage: undefined,
    };

    expectTypeOf(request.level).toEqualTypeOf<Optional<number>>();
    expectTypeOf(request.title).toEqualTypeOf<Optional<string>>();
    expectTypeOf(request.percentage).toEqualTypeOf<Optional<number>>();
  });

  it('LearningCreateRequest should handle Optional with null union', () => {
    const request: LearningCreateRequest = {
      technique: 1,
      index: 1,
      language_code: undefined,
      text: undefined,
      image_url: null, // Can be null or undefined
    };

    expectTypeOf(request.image_url).toEqualTypeOf<Optional<string | null>>();
  });

  it('BoardCreateRequest should handle Optional with null union', () => {
    const request: BoardCreateRequest = {
      level: null,
      symmetrical: undefined,
      board: '...',
      solution: '...',
      techniques: undefined,
    };

    expectTypeOf(request.level).toEqualTypeOf<Optional<number | null>>();
    expectTypeOf(request.symmetrical).toEqualTypeOf<Optional<boolean>>();
  });

  it('DailyCreateRequest should use Optional correctly', () => {
    const request: DailyCreateRequest = {
      date: '2024-01-15',
      board_uuid: undefined,
      level: null,
      techniques: undefined,
      board: '...',
      solution: '...',
    };

    expectTypeOf(request.board_uuid).toEqualTypeOf<Optional<string | null>>();
    expectTypeOf<DailyCreateRequest['techniques']>().toEqualTypeOf<
      Optional<number | string>
    >();
  });

  it('ChallengeCreateRequest should use Optional correctly', () => {
    const request: ChallengeCreateRequest = {
      board_uuid: undefined,
      level: undefined,
      difficulty: 5,
      board: '...',
      solution: '...',
    };

    expectTypeOf(request.difficulty).toEqualTypeOf<Optional<number>>();
  });
});

// =============================================================================
// Type Tests - Query Parameter Types
// =============================================================================

describe('Query Parameter Types', () => {
  it('TechniqueQueryParams should use Optional', () => {
    const params: TechniqueQueryParams = {
      level: undefined,
    };

    expectTypeOf(params.level).toEqualTypeOf<Optional<number>>();
  });

  it('LearningQueryParams should use Optional', () => {
    const params: LearningQueryParams = {
      technique: 1,
      language_code: undefined,
    };

    expectTypeOf(params.technique).toEqualTypeOf<Optional<number>>();
    expectTypeOf(params.language_code).toEqualTypeOf<Optional<string>>();
  });

  it('BoardQueryParams should use Optional', () => {
    const params: BoardQueryParams = {
      level: undefined,
    };

    expectTypeOf(params.level).toEqualTypeOf<Optional<number>>();
  });

  it('ChallengeQueryParams should use Optional', () => {
    const params: ChallengeQueryParams = {
      level: undefined,
      difficulty: 'hard',
    };

    expectTypeOf(params.level).toEqualTypeOf<Optional<number>>();
    expectTypeOf(params.difficulty).toEqualTypeOf<Optional<string>>();
  });
});

// =============================================================================
// Type Tests - Response Types
// =============================================================================

describe('Response Types', () => {
  it('successResponse should return BaseResponse<T>', () => {
    const response = successResponse({ id: 1 });

    expectTypeOf(response).toEqualTypeOf<BaseResponse<{ id: number }>>();
  });

  it('errorResponse should return BaseResponse<never>', () => {
    const response = errorResponse('error');

    expectTypeOf(response).toEqualTypeOf<BaseResponse<never>>();
  });

  it('HealthCheckData should have correct shape', () => {
    const health: HealthCheckData = {
      version: '1.0.0',
      status: 'healthy',
    };

    expectTypeOf(health.version).toBeString();
    expectTypeOf(health.status).toBeString();
  });
});

// =============================================================================
// Solver Type Tests
// =============================================================================

describe('Solver Types', () => {
  describe('SOLVER_ERROR_CODES', () => {
    it('matches the C# ErrorCode integer values', () => {
      expect(SOLVER_ERROR_CODES).toEqual({
        UNKNOWN: 0,
        AUTO_PENCILMARKS_REQUIRED: 1,
        CANNOT_SOLVE: 2,
        MULTIPLE_SOLUTIONS: 3,
      });
    });

    it('SolverErrorCode is the integer union 0-3', () => {
      expectTypeOf<SolverErrorCode>().toEqualTypeOf<0 | 1 | 2 | 3>();
    });
  });

  it('SolverResult models the raw solver envelope with integer codes', () => {
    const failure: SolverResult<ValidateData> = JSON.parse(
      '{"success":false,"error":{"code":3,"message":"Multiple possible solutions"},"data":null}'
    );

    expect(failure.error?.code).toBe(SOLVER_ERROR_CODES.MULTIPLE_SOLUTIONS);
    expectTypeOf(failure.success).toBeBoolean();
    expectTypeOf(failure.error).toEqualTypeOf<SolverErrorPayload | null>();
    expectTypeOf(failure.data).toEqualTypeOf<ValidateData | null>();
    expectTypeOf<SolverErrorPayload['code']>().toEqualTypeOf<SolverErrorCode>();
    expectTypeOf<SolverErrorPayload['message']>().toBeString();
  });

  it('SolverHints has optional difficulty_score', () => {
    const hints: SolverHints = {
      technique: 1,
      level: 1,
      difficulty_score: 1,
      steps: [],
    };
    const legacy: SolverHints = { technique: 1, level: 1, steps: [] };

    expect(legacy.difficulty_score).toBeUndefined();
    expectTypeOf(hints.difficulty_score).toEqualTypeOf<number | undefined>();
    expectTypeOf(hints.technique).toBeNumber();
  });

  it('SolverHintStep keeps areas/cells as arrays and nested localization', () => {
    expectTypeOf<SolverHintStep['areas']>().toBeArray();
    expectTypeOf<SolverHintStep['cells']>().toBeArray();
    expectTypeOf<NonNullable<SolverHintStep['localization']>>().toHaveProperty(
      'text'
    );
    expectTypeOf<NonNullable<SolverHintStep['localization']>>().toHaveProperty(
      'title'
    );
  });

  it('SolveData still allows the proxy-added points field', () => {
    expectTypeOf<SolveData['points']>().toEqualTypeOf<
      { points: number; techniqueLevel: number } | undefined
    >();
  });

  it('ValidateBoardData keeps difficulty_score optional', () => {
    const board: ValidateBoardData = {
      level: 3,
      techniques: 6,
      original: '0'.repeat(81),
      solution: '0'.repeat(81),
    };

    expect(board.difficulty_score).toBeUndefined();
    expectTypeOf(board.difficulty_score).toEqualTypeOf<number | undefined>();
  });
});

// =============================================================================
// Belt System Tests
// =============================================================================

describe('Belt System', () => {
  describe('BELT_COLORS', () => {
    it('should have 12 belt colors for levels 1-12', () => {
      expect(Object.keys(BELT_COLORS)).toHaveLength(12);
    });

    it('should have correct belt names in order', () => {
      expect(BELT_COLORS[1].name).toBe('White');
      expect(BELT_COLORS[2].name).toBe('White (Yellow Stripe)');
      expect(BELT_COLORS[3].name).toBe('Yellow');
      expect(BELT_COLORS[4].name).toBe('Yellow (Orange Stripe)');
      expect(BELT_COLORS[5].name).toBe('Orange');
      expect(BELT_COLORS[6].name).toBe('Orange (Green Stripe)');
      expect(BELT_COLORS[7].name).toBe('Green');
      expect(BELT_COLORS[8].name).toBe('Blue');
      expect(BELT_COLORS[9].name).toBe('Purple');
      expect(BELT_COLORS[10].name).toBe('Brown');
      expect(BELT_COLORS[11].name).toBe('Red');
      expect(BELT_COLORS[12].name).toBe('Black');
    });

    it('should have valid hex color codes', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      Object.values(BELT_COLORS).forEach((belt) => {
        expect(belt.hex).toMatch(hexColorRegex);
        if (belt.stripeHex) {
          expect(belt.stripeHex).toMatch(hexColorRegex);
        }
      });
    });

    it('should have stripe colors for striped belts', () => {
      expect(BELT_COLORS[2].stripeHex).toBe('#FFEB3B'); // Yellow stripe
      expect(BELT_COLORS[4].stripeHex).toBe('#FF9800'); // Orange stripe
      expect(BELT_COLORS[6].stripeHex).toBe('#4CAF50'); // Green stripe
    });
  });

  describe('getBeltForLevel', () => {
    it('should return correct belt for valid levels 1-12', () => {
      expect(getBeltForLevel(1)).toEqual({
        name: 'White',
        hex: '#FFFFFF',
      });
      expect(getBeltForLevel(5)).toEqual({
        name: 'Orange',
        hex: '#FF9800',
      });
      expect(getBeltForLevel(12)).toEqual({
        name: 'Black',
        hex: '#212121',
      });
    });

    it('should return striped belts with stripeHex', () => {
      expect(getBeltForLevel(2)).toEqual({
        name: 'White (Yellow Stripe)',
        hex: '#FFFFFF',
        stripeHex: '#FFEB3B',
      });
    });

    it('should return null for invalid level indices', () => {
      expect(getBeltForLevel(0)).toBeNull();
      expect(getBeltForLevel(13)).toBeNull();
      expect(getBeltForLevel(-1)).toBeNull();
    });
  });

  describe('getAllBelts', () => {
    it('should return all 12 belts as an array', () => {
      const belts = getAllBelts();
      expect(belts).toHaveLength(12);
    });

    it('should return belts in order from White to Black', () => {
      const belts = getAllBelts();
      expect(belts[0].name).toBe('White');
      expect(belts[11].name).toBe('Black');
    });
  });

  describe('Belt type', () => {
    it('should have correct shape', () => {
      const belt: Belt = { name: 'White', hex: '#FFFFFF' };

      expectTypeOf(belt.name).toBeString();
      expectTypeOf(belt.hex).toBeString();
    });

    it('should support optional stripeHex', () => {
      const stripedBelt: Belt = {
        name: 'White (Yellow Stripe)',
        hex: '#FFFFFF',
        stripeHex: '#FFEB3B',
      };

      expectTypeOf(stripedBelt.stripeHex).toEqualTypeOf<string | undefined>();
    });
  });

  describe('BELT_ICON_PATHS', () => {
    it('should be an array of SVG path strings', () => {
      expect(Array.isArray(BELT_ICON_PATHS)).toBe(true);
      expect(BELT_ICON_PATHS.length).toBe(8);
      BELT_ICON_PATHS.forEach((path) => {
        expect(typeof path).toBe('string');
        expect(path).toContain('M');
      });
    });
  });

  describe('BELT_ICON_VIEWBOX', () => {
    it('should be the correct viewBox string', () => {
      expect(BELT_ICON_VIEWBOX).toBe('0 0 478.619 184.676');
    });
  });

  describe('getBeltIconSvg', () => {
    it('should return valid SVG string with fill color', () => {
      const svg = getBeltIconSvg('#FF0000');

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('fill="#FF0000"');
      expect(svg).toContain('viewBox="0 0 478.619 184.676"');
    });

    it('should use default size of 100x40', () => {
      const svg = getBeltIconSvg('#2196F3');

      expect(svg).toContain('width="100"');
      expect(svg).toContain('height="40"');
    });

    it('should allow custom dimensions', () => {
      const svg = getBeltIconSvg('#2196F3', 200, 80);

      expect(svg).toContain('width="200"');
      expect(svg).toContain('height="80"');
    });

    it('should use black stroke for non-black belts', () => {
      const svg = getBeltIconSvg('#2196F3');

      expect(svg).toContain('stroke="#000000"');
    });

    it('should auto-detect white stroke for black belt', () => {
      const svg = getBeltIconSvg('#212121');

      expect(svg).toContain('stroke="#FFFFFF"');
    });

    it('should allow custom stroke color override', () => {
      const svg = getBeltIconSvg('#2196F3', 100, 40, '#FF0000');

      expect(svg).toContain('stroke="#FF0000"');
    });
  });

  describe('getBeltIconForLevel', () => {
    it('should return SVG for valid level', () => {
      const svg = getBeltIconForLevel(5);

      expect(svg).not.toBeNull();
      expect(svg).toContain('fill="#FF9800"'); // Orange belt
      expect(svg).toContain('stroke="#000000"');
    });

    it('should return SVG with white stroke for black belt (level 12)', () => {
      const svg = getBeltIconForLevel(12);

      expect(svg).not.toBeNull();
      expect(svg).toContain('fill="#212121"');
      expect(svg).toContain('stroke="#FFFFFF"');
    });

    it('should return null for invalid level', () => {
      expect(getBeltIconForLevel(0)).toBeNull();
      expect(getBeltIconForLevel(13)).toBeNull();
    });

    it('should allow custom dimensions', () => {
      const svg = getBeltIconForLevel(1, 50, 20);

      expect(svg).toContain('width="50"');
      expect(svg).toContain('height="20"');
    });

    it('should include stripe for striped belts', () => {
      const svg = getBeltIconForLevel(2); // White belt with yellow stripe

      expect(svg).not.toBeNull();
      expect(svg).toContain('fill="#FFFFFF"'); // White base
      expect(svg).toContain('#FFEB3B'); // Yellow stripe color
      expect(svg).toContain('clipPath'); // Stripe uses clip path
    });
  });
});

// =============================================================================
// Board Utilities Tests
// =============================================================================

describe('Board Utilities', () => {
  const validPuzzle =
    '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
  const _validSolution =
    '534678912672195348198342567859761423426853791713924856961537284287419635345286179';

  describe('constants', () => {
    it('should have correct BOARD_SIZE', () => {
      expect(BOARD_SIZE).toBe(9);
    });

    it('should have correct BLOCK_SIZE', () => {
      expect(BLOCK_SIZE).toBe(3);
    });

    it('should have correct TOTAL_CELLS', () => {
      expect(TOTAL_CELLS).toBe(81);
    });
  });

  describe('parseBoardString', () => {
    it('should parse valid 81-character string', () => {
      const board = parseBoardString(validPuzzle);

      expect(board).toHaveLength(9);
      board.forEach((row) => {
        expect(row).toHaveLength(9);
      });
    });

    it('should correctly parse digit values', () => {
      const board = parseBoardString(validPuzzle);

      expect(board[0][0]).toBe(5);
      expect(board[0][1]).toBe(3);
      expect(board[0][2]).toBe(0);
    });

    it('should throw error for invalid length', () => {
      expect(() => parseBoardString('12345')).toThrow(
        'Invalid board string length'
      );
    });

    it('should throw error for invalid characters', () => {
      const invalidBoard = 'x'.repeat(81);
      expect(() => parseBoardString(invalidBoard)).toThrow(
        'Invalid character at position'
      );
    });

    it('should handle dots as empty cells', () => {
      const boardWithDots = '.'.repeat(81);
      const board = parseBoardString(boardWithDots);

      expect(board[0][0]).toBe(0);
    });

    it('should parse all-zeros board', () => {
      const board = parseBoardString('0'.repeat(81));

      board.forEach((row) => {
        row.forEach((cell) => {
          expect(cell).toBe(0);
        });
      });
    });

    it('should parse all-nines board', () => {
      const board = parseBoardString('9'.repeat(81));

      board.forEach((row) => {
        row.forEach((cell) => {
          expect(cell).toBe(9);
        });
      });
    });

    it('should parse board with dots mixed with digits', () => {
      const mixed =
        '53.07.000600195000098000060800060003400803001700020006060000280000419005000080079';
      const board = parseBoardString(mixed);

      expect(board[0][0]).toBe(5);
      expect(board[0][1]).toBe(3);
      expect(board[0][2]).toBe(0); // dot -> 0
      expect(board[0][3]).toBe(0); // '0'
      expect(board[0][4]).toBe(7);
      expect(board[0][5]).toBe(0); // dot -> 0
    });
  });

  describe('stringifyBoard', () => {
    it('should convert 2D array back to string', () => {
      const board = parseBoardString(validPuzzle);
      const result = stringifyBoard(board);

      expect(result).toBe(validPuzzle);
    });

    it('should throw error for invalid board size', () => {
      const invalidBoard = [[1, 2, 3]];
      expect(() => stringifyBoard(invalidBoard)).toThrow('Invalid board rows');
    });

    it('should roundtrip all-zeros board', () => {
      const zeros = '0'.repeat(81);
      const board = parseBoardString(zeros);
      expect(stringifyBoard(board)).toBe(zeros);
    });

    it('should roundtrip all-nines board', () => {
      const nines = '9'.repeat(81);
      const board = parseBoardString(nines);
      expect(stringifyBoard(board)).toBe(nines);
    });

    it('should roundtrip dots-mixed board (dots become zeros)', () => {
      const mixed =
        '53.07.000600195000098000060800060003400803001700020006060000280000419005000080079';
      const expected =
        '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
      const board = parseBoardString(mixed);
      expect(stringifyBoard(board)).toBe(expected);
    });
  });

  describe('isValidBoardString', () => {
    it('should return true for valid 81-digit string', () => {
      expect(isValidBoardString(validPuzzle)).toBe(true);
    });

    it('should return true for all-zeros', () => {
      expect(isValidBoardString('0'.repeat(81))).toBe(true);
    });

    it('should return true for all-nines', () => {
      expect(isValidBoardString('9'.repeat(81))).toBe(true);
    });

    it('should return true for all-dots', () => {
      expect(isValidBoardString('.'.repeat(81))).toBe(true);
    });

    it('should return true for mixed dots and digits', () => {
      const mixed =
        '53.07.000600195000098000060800060003400803001700020006060000280000419005000080079';
      expect(isValidBoardString(mixed)).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isValidBoardString('')).toBe(false);
    });

    it('should return false for too-short string', () => {
      expect(isValidBoardString('12345')).toBe(false);
    });

    it('should return false for too-long string', () => {
      expect(isValidBoardString('0'.repeat(82))).toBe(false);
    });

    it('should return false for invalid characters', () => {
      expect(isValidBoardString('x'.repeat(81))).toBe(false);
    });

    it('should return false for string with spaces', () => {
      expect(isValidBoardString(' '.repeat(80) + '1')).toBe(false);
    });

    it('should return false for 81 chars with one invalid char', () => {
      expect(isValidBoardString('0'.repeat(40) + 'x' + '0'.repeat(40))).toBe(
        false
      );
    });
  });
});

// =============================================================================
// Scramble Utilities Tests
// =============================================================================

describe('Scramble Utilities', () => {
  const validPuzzle =
    '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
  const validSolution =
    '534678912672195348198342567859761423426853791713924856961537284287419635345286179';

  describe('DEFAULT_SCRAMBLE_CONFIG', () => {
    it('should have all options enabled by default', () => {
      expect(DEFAULT_SCRAMBLE_CONFIG.scrambleRows).toBe(true);
      expect(DEFAULT_SCRAMBLE_CONFIG.scrambleColumns).toBe(true);
      expect(DEFAULT_SCRAMBLE_CONFIG.scrambleRowBlocks).toBe(true);
      expect(DEFAULT_SCRAMBLE_CONFIG.scrambleColumnBlocks).toBe(true);
      expect(DEFAULT_SCRAMBLE_CONFIG.scrambleDigits).toBe(true);
      expect(DEFAULT_SCRAMBLE_CONFIG.rotate).toBe(true);
      expect(DEFAULT_SCRAMBLE_CONFIG.mirror).toBe(true);
    });
  });

  describe('scrambleBoard', () => {
    it('should return scrambled puzzle and solution', () => {
      const result = scrambleBoard(validPuzzle, validSolution);

      expect(result.puzzle).toHaveLength(81);
      expect(result.solution).toHaveLength(81);
    });

    it('should return valid digit mapping', () => {
      const result = scrambleBoard(validPuzzle, validSolution);

      expect(result.digitMapping.size).toBe(9);
      expect(result.reverseDigitMapping.size).toBe(9);

      // All digits 1-9 should be mapped
      for (let i = 1; i <= 9; i++) {
        expect(result.digitMapping.has(i)).toBe(true);
      }
    });

    it('should preserve the number of clues', () => {
      const result = scrambleBoard(validPuzzle, validSolution);

      const originalClues = validPuzzle
        .split('')
        .filter((c) => c !== '0').length;
      const scrambledClues = result.puzzle
        .split('')
        .filter((c) => c !== '0').length;

      expect(scrambledClues).toBe(originalClues);
    });

    it('should maintain puzzle/solution correspondence', () => {
      const result = scrambleBoard(validPuzzle, validSolution);

      // Each non-zero cell in puzzle should match solution
      for (let i = 0; i < 81; i++) {
        const puzzleVal = result.puzzle[i];
        const solutionVal = result.solution[i];
        if (puzzleVal !== '0') {
          expect(puzzleVal).toBe(solutionVal);
        }
      }
    });

    it('should produce valid Sudoku solution', () => {
      const result = scrambleBoard(validPuzzle, validSolution);
      const board = parseBoardString(result.solution);

      // Check all rows contain 1-9
      for (let row = 0; row < 9; row++) {
        const rowSet = new Set(board[row]);
        expect(rowSet.size).toBe(9);
        for (let d = 1; d <= 9; d++) {
          expect(rowSet.has(d)).toBe(true);
        }
      }

      // Check all columns contain 1-9
      for (let col = 0; col < 9; col++) {
        const colSet = new Set<number>();
        for (let row = 0; row < 9; row++) {
          colSet.add(board[row][col]);
        }
        expect(colSet.size).toBe(9);
      }

      // Check all blocks contain 1-9
      for (let blockRow = 0; blockRow < 3; blockRow++) {
        for (let blockCol = 0; blockCol < 3; blockCol++) {
          const blockSet = new Set<number>();
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
              blockSet.add(board[blockRow * 3 + r][blockCol * 3 + c]);
            }
          }
          expect(blockSet.size).toBe(9);
        }
      }
    });

    it('should respect disabled scramble options', () => {
      const config: ScrambleConfig = {
        scrambleRows: false,
        scrambleColumns: false,
        scrambleRowBlocks: false,
        scrambleColumnBlocks: false,
        scrambleDigits: false,
        rotate: false,
        mirror: false,
      };

      const result = scrambleBoard(validPuzzle, validSolution, config);

      // With all scrambling disabled, output should match input
      expect(result.puzzle).toBe(validPuzzle);
      expect(result.solution).toBe(validSolution);
    });

    it('should produce different output with scrambling enabled', () => {
      // Run multiple times to statistically verify randomness
      let differentCount = 0;
      for (let i = 0; i < 10; i++) {
        const result = scrambleBoard(validPuzzle, validSolution);
        if (result.puzzle !== validPuzzle) {
          differentCount++;
        }
      }
      // Should be different at least once (very high probability)
      expect(differentCount).toBeGreaterThan(0);
    });
  });

  describe('noScramble', () => {
    it('should return unchanged puzzle and solution', () => {
      const result = noScramble(validPuzzle, validSolution);

      expect(result.puzzle).toBe(validPuzzle);
      expect(result.solution).toBe(validSolution);
    });

    it('should return identity digit mapping', () => {
      const result = noScramble(validPuzzle, validSolution);

      for (let i = 1; i <= 9; i++) {
        expect(result.digitMapping.get(i)).toBe(i);
        expect(result.reverseDigitMapping.get(i)).toBe(i);
      }
    });
  });

  describe('ScrambleConfig type', () => {
    it('should have correct shape', () => {
      const config: ScrambleConfig = {
        scrambleRows: true,
        scrambleColumns: false,
        scrambleRowBlocks: true,
        scrambleColumnBlocks: false,
        scrambleDigits: true,
        rotate: false,
        mirror: true,
      };

      expectTypeOf(config.scrambleRows).toBeBoolean();
      expectTypeOf(config.scrambleDigits).toBeBoolean();
      expectTypeOf(config.rotate).toBeBoolean();
    });
  });

  describe('ScrambleResult type', () => {
    it('should have correct shape', () => {
      const result: ScrambleResult = {
        puzzle: validPuzzle,
        solution: validSolution,
        digitMapping: new Map([[1, 2]]),
        reverseDigitMapping: new Map([[2, 1]]),
      };

      expectTypeOf(result.puzzle).toBeString();
      expectTypeOf(result.solution).toBeString();
      expectTypeOf(result.digitMapping).toEqualTypeOf<Map<number, number>>();
      expectTypeOf(result.reverseDigitMapping).toEqualTypeOf<
        Map<number, number>
      >();
    });
  });
});

// =============================================================================
// Solver Utilities Tests
// =============================================================================

describe('Solver Utilities', () => {
  const validPuzzle =
    '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
  const validSolution =
    '534678912672195348198342567859761423426853791713924856961537284287419635345286179';
  const emptyUser = '0'.repeat(81);

  describe('isBoardFilled', () => {
    it('should return false for empty board', () => {
      expect(isBoardFilled(emptyUser, emptyUser)).toBe(false);
    });

    it('should return false for partial puzzle with no user input', () => {
      expect(isBoardFilled(validPuzzle, emptyUser)).toBe(false);
    });

    it('should return true when puzzle + user fills all cells', () => {
      // Create user input that fills in the zeros
      let userInput = '';
      for (let i = 0; i < 81; i++) {
        if (validPuzzle[i] === '0') {
          userInput += validSolution[i];
        } else {
          userInput += '0';
        }
      }
      expect(isBoardFilled(validPuzzle, userInput)).toBe(true);
    });

    it('should return true for fully filled solution', () => {
      expect(isBoardFilled(validSolution, emptyUser)).toBe(true);
    });

    it('should handle user input overriding original', () => {
      // User fills in everything
      expect(isBoardFilled(validPuzzle, validSolution)).toBe(true);
    });
  });

  describe('isBoardSolved', () => {
    it('should return false for empty board', () => {
      expect(isBoardSolved(emptyUser, emptyUser, validSolution)).toBe(false);
    });

    it('should return false for unfilled board', () => {
      expect(isBoardSolved(validPuzzle, emptyUser, validSolution)).toBe(false);
    });

    it('should return true when correctly solved', () => {
      let userInput = '';
      for (let i = 0; i < 81; i++) {
        if (validPuzzle[i] === '0') {
          userInput += validSolution[i];
        } else {
          userInput += '0';
        }
      }
      expect(isBoardSolved(validPuzzle, userInput, validSolution)).toBe(true);
    });

    it('should return false when filled but incorrect', () => {
      // Fill with wrong values
      const wrongSolution = '1'.repeat(81);
      expect(isBoardSolved(emptyUser, wrongSolution, validSolution)).toBe(
        false
      );
    });
  });

  describe('getMergedBoardState', () => {
    it('should return original when user has no input', () => {
      expect(getMergedBoardState(validPuzzle, emptyUser)).toBe(validPuzzle);
    });

    it('should override with user input when present', () => {
      const userInput = '100000000' + '0'.repeat(72);
      const result = getMergedBoardState(validPuzzle, userInput);
      expect(result[0]).toBe('1'); // User override
      expect(result[1]).toBe('3'); // Original preserved
    });

    it('should return complete solution when user fills all', () => {
      let userInput = '';
      for (let i = 0; i < 81; i++) {
        if (validPuzzle[i] === '0') {
          userInput += validSolution[i];
        } else {
          userInput += '0';
        }
      }
      expect(getMergedBoardState(validPuzzle, userInput)).toBe(validSolution);
    });
  });

  describe('hasInvalidPencilmarksStep', () => {
    it('should return false for undefined', () => {
      expect(hasInvalidPencilmarksStep(undefined)).toBe(false);
    });

    it('should return false for empty array', () => {
      expect(hasInvalidPencilmarksStep([])).toBe(false);
    });

    it('should return false for steps without Invalid Pencilmarks', () => {
      const steps = [{ title: 'Naked Single' }, { title: 'Hidden Single' }];
      expect(hasInvalidPencilmarksStep(steps)).toBe(false);
    });

    it('should return true when Invalid Pencilmarks is present', () => {
      const steps = [
        { title: 'Naked Single' },
        { title: 'Invalid Pencilmarks' },
      ];
      expect(hasInvalidPencilmarksStep(steps)).toBe(true);
    });

    it('should handle steps with missing title', () => {
      const steps = [{}, { title: 'Test' }];
      expect(hasInvalidPencilmarksStep(steps)).toBe(false);
    });
  });

  describe('hasPencilmarkContent', () => {
    it('should return false for empty string', () => {
      expect(hasPencilmarkContent('')).toBe(false);
    });

    it('should return false for only commas', () => {
      expect(hasPencilmarkContent(','.repeat(80))).toBe(false);
    });

    it('should return true for string with digits', () => {
      expect(hasPencilmarkContent('123,45,,9,,')).toBe(true);
    });

    it('should return true for single digit', () => {
      expect(hasPencilmarkContent('1' + ','.repeat(80))).toBe(true);
    });
  });

  describe('getTechniqueNameById', () => {
    it('should return correct name for known techniques', () => {
      expect(getTechniqueNameById(TechniqueId.FULL_HOUSE)).toBe('Full House');
      expect(getTechniqueNameById(TechniqueId.HIDDEN_SINGLE)).toBe(
        'Hidden Single'
      );
      expect(getTechniqueNameById(TechniqueId.NAKED_SINGLE)).toBe(
        'Naked Single'
      );
      expect(getTechniqueNameById(TechniqueId.XY_WING)).toBe('XY-Wing');
    });

    it('should return fallback for unknown technique', () => {
      expect(getTechniqueNameById(999)).toBe('Technique 999');
    });

    it('should return the display title for AIC, not the solver step title', () => {
      // Matches sudojo_api's seeded title and the technique.aic.svg icon;
      // the solver's step title is 'Alternating Inference Chain'.
      expect(getTechniqueNameById(TechniqueId.AIC)).toBe('AIC');
    });

    it('should handle all defined TechniqueId values', () => {
      // Verify each TechniqueId has a name
      Object.values(TechniqueId)
        .filter((v): v is number => typeof v === 'number')
        .forEach((id) => {
          const name = getTechniqueNameById(id);
          expect(name).not.toContain('Technique '); // Should have real name
        });
    });
  });
});

// =============================================================================
// Bitfield Utility Tests
// =============================================================================

describe('Bitfield Utilities', () => {
  describe('techniqueToBit', () => {
    it('should return 2 for technique ID 1', () => {
      expect(techniqueToBit(TechniqueId.FULL_HOUSE)).toBe(2);
    });

    it('should return 4 for technique ID 2', () => {
      expect(techniqueToBit(TechniqueId.HIDDEN_SINGLE)).toBe(4);
    });

    it('should return 8 for technique ID 3', () => {
      expect(techniqueToBit(TechniqueId.NAKED_SINGLE)).toBe(8);
    });

    it('should handle technique ID 10 correctly', () => {
      expect(techniqueToBit(TechniqueId.NAKED_QUAD)).toBe(1024);
    });

    it('should handle technique IDs >= 32 using BigInt', () => {
      // BUG_PLUS_1 = 32, so bit = 2^32 = 4294967296
      const bit = techniqueToBit(TechniqueId.BUG_PLUS_1);
      expect(bit).toBe(4294967296);
    });

    it('should handle technique ID 42 (X_CHAIN)', () => {
      // 2^42 = 4398046511104
      const bit = techniqueToBit(TechniqueId.X_CHAIN);
      expect(bit).toBe(4398046511104);
    });
  });

  describe('hasTechnique', () => {
    it('should return true when technique is present in bitfield', () => {
      const bitfield =
        techniqueToBit(TechniqueId.FULL_HOUSE) |
        techniqueToBit(TechniqueId.NAKED_SINGLE);
      expect(hasTechnique(bitfield, TechniqueId.FULL_HOUSE)).toBe(true);
      expect(hasTechnique(bitfield, TechniqueId.NAKED_SINGLE)).toBe(true);
    });

    it('should return false when technique is not in bitfield', () => {
      const bitfield = techniqueToBit(TechniqueId.FULL_HOUSE);
      expect(hasTechnique(bitfield, TechniqueId.HIDDEN_SINGLE)).toBe(false);
    });

    it('should return false for empty bitfield', () => {
      expect(hasTechnique(0, TechniqueId.FULL_HOUSE)).toBe(false);
    });

    it('should handle technique IDs >= 32', () => {
      const bitfield = techniqueToBit(TechniqueId.BUG_PLUS_1);
      expect(hasTechnique(bitfield, TechniqueId.BUG_PLUS_1)).toBe(true);
      expect(hasTechnique(bitfield, TechniqueId.FULL_HOUSE)).toBe(false);
    });

    it('should work with combined high and low IDs', () => {
      const bitfield = addTechnique(
        techniqueToBit(TechniqueId.FULL_HOUSE),
        TechniqueId.X_CHAIN
      );
      expect(hasTechnique(bitfield, TechniqueId.FULL_HOUSE)).toBe(true);
      expect(hasTechnique(bitfield, TechniqueId.X_CHAIN)).toBe(true);
      expect(hasTechnique(bitfield, TechniqueId.HIDDEN_SINGLE)).toBe(false);
    });
  });

  describe('addTechnique', () => {
    it('should add a technique to an empty bitfield', () => {
      const result = addTechnique(0, TechniqueId.FULL_HOUSE);
      expect(result).toBe(techniqueToBit(TechniqueId.FULL_HOUSE));
    });

    it('should add a technique to an existing bitfield', () => {
      const initial = techniqueToBit(TechniqueId.FULL_HOUSE);
      const result = addTechnique(initial, TechniqueId.NAKED_SINGLE);

      expect(hasTechnique(result, TechniqueId.FULL_HOUSE)).toBe(true);
      expect(hasTechnique(result, TechniqueId.NAKED_SINGLE)).toBe(true);
    });

    it('should be idempotent (adding same technique twice)', () => {
      const first = addTechnique(0, TechniqueId.FULL_HOUSE);
      const second = addTechnique(first, TechniqueId.FULL_HOUSE);
      expect(second).toBe(first);
    });

    it('should handle adding technique IDs >= 32', () => {
      const result = addTechnique(0, TechniqueId.BUG_PLUS_1);
      expect(hasTechnique(result, TechniqueId.BUG_PLUS_1)).toBe(true);
    });

    it('should handle adding multiple high-value techniques', () => {
      let bitfield = 0;
      bitfield = addTechnique(bitfield, TechniqueId.SUE_DE_COQ);
      bitfield = addTechnique(bitfield, TechniqueId.ALS_XZ);
      bitfield = addTechnique(bitfield, TechniqueId.X_CYCLES);

      expect(hasTechnique(bitfield, TechniqueId.SUE_DE_COQ)).toBe(true);
      expect(hasTechnique(bitfield, TechniqueId.ALS_XZ)).toBe(true);
      expect(hasTechnique(bitfield, TechniqueId.X_CYCLES)).toBe(true);
      expect(hasTechnique(bitfield, TechniqueId.FULL_HOUSE)).toBe(false);
    });

    it('stays exact through ID 53 and drops low bits once ID >= 54 is set', () => {
      let upTo53 = 0;
      for (const id of ALL_TECHNIQUE_IDS.filter((id) => id <= 53)) {
        upTo53 = addTechnique(upTo53, id);
      }
      expect(upTo53).toBeGreaterThan(Number.MAX_SAFE_INTEGER);
      expect(hasTechnique(upTo53, TechniqueId.FULL_HOUSE)).toBe(true);
      expect(hasTechnique(upTo53, TechniqueId.SASHIMI_JELLYFISH)).toBe(true);

      const with54 = addTechnique(
        techniqueToBit(TechniqueId.FULL_HOUSE),
        TechniqueId.HIDDEN_UNIQUE_RECTANGLE
      );
      expect(hasTechnique(with54, TechniqueId.HIDDEN_UNIQUE_RECTANGLE)).toBe(
        true
      );
      expect(hasTechnique(with54, TechniqueId.FULL_HOUSE)).toBe(false);
    });
  });
});

// =============================================================================
// BigInt Technique Bitmask Tests
// =============================================================================

/** Bit 60 (Grouped X-Cycles) + bit 1 (Full House): needs 61 bits. */
const HIGH_MASK = (1n << 60n) | (1n << 1n);
const HIGH_MASK_STRING = '1152921504606846978';

describe('BigInt Technique Bitmask Utilities', () => {
  it('HIGH_MASK is not representable as a JS number', () => {
    expect(HIGH_MASK.toString()).toBe(HIGH_MASK_STRING);
    expect(BigInt(Number(HIGH_MASK))).not.toBe(HIGH_MASK);
  });

  describe('parseTechniqueBitmask', () => {
    it('parses a base-10 string exactly, beyond 2^53', () => {
      expect(parseTechniqueBitmask(HIGH_MASK_STRING)).toBe(HIGH_MASK);
      expect(parseTechniqueBitmask('0')).toBe(0n);
    });

    it('falls back to a number from older APIs', () => {
      expect(parseTechniqueBitmask(42)).toBe(42n);
      expect(parseTechniqueBitmask(0)).toBe(0n);
      // Already rounded by JSON.parse upstream; kept exactly as lossy as before.
      expect(parseTechniqueBitmask(2 ** 60)).toBe(1n << 60n);
    });

    it('accepts a bigint', () => {
      expect(parseTechniqueBitmask(HIGH_MASK)).toBe(HIGH_MASK);
    });

    it('returns 0n for null and undefined', () => {
      expect(parseTechniqueBitmask(null)).toBe(0n);
      expect(parseTechniqueBitmask(undefined)).toBe(0n);
    });

    it.each([
      ['negative number', -1],
      ['fractional number', 1.5],
      ['NaN', NaN],
      ['Infinity', Infinity],
      ['negative string', '-1'],
      ['fractional string', '1.5'],
      ['exponent string', '1e3'],
      ['hex string', '0x10'],
      ['empty string', ''],
      ['padded string', ' 12'],
      ['word', 'abc'],
      ['negative bigint', -1n],
    ] as const)('rejects a %s with a clear error', (_label, value) => {
      expect(() => parseTechniqueBitmask(value)).toThrow(/technique bitmask/i);
    });
  });

  describe('formatTechniqueBitmask', () => {
    it('round-trips a 61-bit mask exactly', () => {
      expect(formatTechniqueBitmask(HIGH_MASK)).toBe(HIGH_MASK_STRING);
      expect(parseTechniqueBitmask(formatTechniqueBitmask(HIGH_MASK))).toBe(
        HIGH_MASK
      );
      expect(formatTechniqueBitmask(0n)).toBe('0');
    });

    it('rejects a negative mask', () => {
      expect(() => formatTechniqueBitmask(-2n)).toThrow(/technique bitmask/i);
    });
  });

  describe('techniqueIdsToBitmask / techniqueIdsFromBitmask', () => {
    it('builds the exact mask for ids 1 and 60', () => {
      expect(
        techniqueIdsToBitmask([
          TechniqueId.GROUPED_X_CYCLES,
          TechniqueId.FULL_HOUSE,
        ])
      ).toBe(HIGH_MASK);
      expect(techniqueIdsToBitmask([])).toBe(0n);
    });

    it('lists the ids in ascending order', () => {
      expect(techniqueIdsFromBitmask(HIGH_MASK)).toEqual([
        TechniqueId.FULL_HOUSE,
        TechniqueId.GROUPED_X_CYCLES,
      ]);
      expect(techniqueIdsFromBitmask(0n)).toEqual([]);
    });

    it('round-trips every technique id', () => {
      const all = techniqueIdsToBitmask(ALL_TECHNIQUE_IDS);
      expect(techniqueIdsFromBitmask(all)).toEqual(ALL_TECHNIQUE_IDS);
      expect(parseTechniqueBitmask(formatTechniqueBitmask(all))).toBe(all);
    });

    it('ignores bits that are not technique ids', () => {
      expect(techniqueIdsFromBitmask((1n << 0n) | (1n << 61n) | 2n)).toEqual([
        TechniqueId.FULL_HOUSE,
      ]);
    });

    it('rejects invalid ids and negative masks', () => {
      expect(() => techniqueIdsToBitmask([1.5 as TechniqueId])).toThrow(
        /technique id/i
      );
      expect(() => techniqueIdsToBitmask([-1 as TechniqueId])).toThrow(
        /technique id/i
      );
      expect(() => techniqueIdsFromBitmask(-1n)).toThrow(/technique bitmask/i);
    });
  });

  describe('hasTechniqueInBitmask', () => {
    it('checks high and low bits exactly', () => {
      expect(hasTechniqueInBitmask(HIGH_MASK, TechniqueId.FULL_HOUSE)).toBe(
        true
      );
      expect(
        hasTechniqueInBitmask(HIGH_MASK, TechniqueId.GROUPED_X_CYCLES)
      ).toBe(true);
      expect(hasTechniqueInBitmask(HIGH_MASK, TechniqueId.HIDDEN_SINGLE)).toBe(
        false
      );
    });

    it('is correct where the number-based hasTechnique is not', () => {
      const lossy = Number(HIGH_MASK);
      expect(hasTechnique(lossy, TechniqueId.FULL_HOUSE)).toBe(false);
      expect(
        hasTechniqueInBitmask(
          parseTechniqueBitmask(HIGH_MASK_STRING),
          TechniqueId.FULL_HOUSE
        )
      ).toBe(true);
    });

    it('rejects invalid input', () => {
      expect(() => hasTechniqueInBitmask(-1n, TechniqueId.FULL_HOUSE)).toThrow(
        /technique bitmask/i
      );
      expect(() => hasTechniqueInBitmask(2n, 2.5 as TechniqueId)).toThrow(
        /technique id/i
      );
    });
  });

  describe('techniqueBitmaskOf', () => {
    it('prefers techniques_bitmask over the lossy techniques number', () => {
      // What JSON.parse makes of the wire value.
      const lossy = JSON.parse(`{"t":${HIGH_MASK_STRING}}`).t as number;
      const board: Board = {
        uuid: 'b',
        level: 12,
        symmetrical: false,
        board: '0'.repeat(81),
        solution: '0'.repeat(81),
        techniques: lossy,
        techniques_bitmask: HIGH_MASK_STRING,
        created_at: null,
        updated_at: null,
      };
      expect(techniqueBitmaskOf(board)).toBe(HIGH_MASK);
    });

    it('prefers techniques_bitfield_bitmask for technique examples', () => {
      const example: TechniqueExample = {
        uuid: 'e',
        board: '0'.repeat(81),
        pencilmarks: null,
        solution: '0'.repeat(81),
        techniques_bitfield: Number(HIGH_MASK),
        techniques_bitfield_bitmask: HIGH_MASK_STRING,
        primary_technique: 1,
        hint_data: null,
        source_board_uuid: null,
        created_at: null,
      };
      expect(techniqueBitmaskOf(example)).toBe(HIGH_MASK);
    });

    it('falls back to the number when an older API omits the string', () => {
      expect(techniqueBitmaskOf({ techniques: 42 })).toBe(42n);
      expect(techniqueBitmaskOf({ techniques_bitfield: 6 })).toBe(6n);
      expect(
        techniqueBitmaskOf({ techniques: 42, techniques_bitmask: null })
      ).toBe(42n);
    });

    it('returns 0n when both fields are null or missing', () => {
      expect(
        techniqueBitmaskOf({ techniques: null, techniques_bitmask: null })
      ).toBe(0n);
      expect(techniqueBitmaskOf({})).toBe(0n);
    });

    it('throws on a malformed string instead of guessing', () => {
      expect(() =>
        techniqueBitmaskOf({ techniques: 42, techniques_bitmask: 'x' })
      ).toThrow(/technique bitmask/i);
    });

    it('accepts every response type that carries a bitmask', () => {
      expectTypeOf<Board>().toExtend<TechniqueBitmaskSource>();
      expectTypeOf<Daily>().toExtend<TechniqueBitmaskSource>();
      expectTypeOf<TechniqueExample>().toExtend<TechniqueBitmaskSource>();
      expectTypeOf<ValidateBoardData>().toExtend<TechniqueBitmaskSource>();
    });
  });

  describe('companion *_bitmask fields are optional strings', () => {
    it('matches the sudojo_api / solver wire', () => {
      expectTypeOf<Board['techniques_bitmask']>().toEqualTypeOf<
        string | null | undefined
      >();
      expectTypeOf<Daily['techniques_bitmask']>().toEqualTypeOf<
        string | null | undefined
      >();
      expectTypeOf<
        TechniqueExample['techniques_bitfield_bitmask']
      >().toEqualTypeOf<string | undefined>();
      expectTypeOf<ValidateBoardData['techniques_bitmask']>().toEqualTypeOf<
        string | undefined
      >();
    });
  });

  describe('request bitmask fields accept number | string', () => {
    it('widens each field and keeps its optionality and nullability', () => {
      type Opt = Optional<number | string>;
      expectTypeOf<BoardCreateRequest['techniques']>().toEqualTypeOf<Opt>();
      expectTypeOf<BoardUpdateRequest['techniques']>().toEqualTypeOf<Opt>();
      expectTypeOf<DailyCreateRequest['techniques']>().toEqualTypeOf<Opt>();
      expectTypeOf<DailyUpdateRequest['techniques']>().toEqualTypeOf<Opt>();
      expectTypeOf<
        TechniqueExampleCreateRequest['techniques_bitfield']
      >().toEqualTypeOf<number | string>();
      expectTypeOf<
        TechniqueExampleUpdateRequest['techniques_bitfield']
      >().toEqualTypeOf<Opt>();
      expectTypeOf<GameStartRequest['techniques']>().toEqualTypeOf<
        number | string
      >();
      expectTypeOf<BoardQueryParams['techniques']>().toEqualTypeOf<Opt>();
      expectTypeOf<BoardQueryParams['technique_bit']>().toEqualTypeOf<Opt>();
    });

    it('still accepts plain numbers (old callers)', () => {
      const request: BoardCreateRequest = {
        level: 3,
        symmetrical: false,
        board: '0'.repeat(81),
        solution: '0'.repeat(81),
        techniques: 6,
      };
      expect(parseTechniqueBitmask(request.techniques)).toBe(6n);
    });

    it('carries an exact 61-bit mask as a decimal string', () => {
      const mask = techniqueBitmaskOf({ techniques_bitmask: HIGH_MASK_STRING });
      const start: GameStartRequest = {
        board: '0'.repeat(81),
        solution: '0'.repeat(81),
        level: 12,
        techniques: formatTechniqueBitmask(mask),
        puzzleType: 'level',
      };
      const example: TechniqueExampleCreateRequest = {
        board: '0'.repeat(81),
        pencilmarks: null,
        solution: '0'.repeat(81),
        techniques_bitfield: formatTechniqueBitmask(mask),
        primary_technique: TechniqueId.GROUPED_X_CYCLES,
        hint_data: null,
        source_board_uuid: null,
      };

      expect(start.techniques).toBe(HIGH_MASK_STRING);
      expect(parseTechniqueBitmask(start.techniques)).toBe(HIGH_MASK);
      expect(parseTechniqueBitmask(example.techniques_bitfield)).toBe(
        HIGH_MASK
      );
      // The JSON body keeps every digit.
      expect(JSON.parse(JSON.stringify(start)).techniques).toBe(
        HIGH_MASK_STRING
      );
    });
  });
});

// =============================================================================
// UUID Validation Tests
// =============================================================================

describe('UUID Validation', () => {
  describe('isValidUUID', () => {
    it('should return true for valid lowercase UUID', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    });

    it('should return true for valid uppercase UUID', () => {
      expect(isValidUUID('123E4567-E89B-12D3-A456-426614174000')).toBe(true);
    });

    it('should return true for valid mixed-case UUID', () => {
      expect(isValidUUID('123e4567-E89B-12d3-A456-426614174000')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isValidUUID('')).toBe(false);
    });

    it('should return false for non-UUID string', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
    });

    it('should return false for UUID without hyphens', () => {
      expect(isValidUUID('123e4567e89b12d3a456426614174000')).toBe(false);
    });

    it('should return false for UUID with extra characters', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000x')).toBe(false);
    });

    it('should return false for UUID with invalid hex chars', () => {
      expect(isValidUUID('zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz')).toBe(false);
    });
  });

  describe('validateUUID', () => {
    it('should return valid UUID unchanged', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(validateUUID(uuid)).toBe(uuid);
    });

    it('should throw for empty string', () => {
      expect(() => validateUUID('')).toThrow('UUID is required');
    });

    it('should throw for invalid UUID format', () => {
      expect(() => validateUUID('not-a-uuid')).toThrow('Invalid UUID format');
    });

    it('should use custom name in error message', () => {
      expect(() => validateUUID('', 'Board UUID')).toThrow(
        'Board UUID is required'
      );
    });

    it('should include the invalid value in error message', () => {
      expect(() => validateUUID('bad-format', 'Board UUID')).toThrow(
        '"bad-format"'
      );
    });
  });
});

// =============================================================================
// Cell Notation Utility Tests
// =============================================================================

describe('Cell Notation Utilities', () => {
  describe('cellName', () => {
    it('should format top-left cell as R1C1', () => {
      expect(cellName(0, 0)).toBe('R1C1');
    });

    it('should format center cell as R5C5', () => {
      expect(cellName(4, 4)).toBe('R5C5');
    });

    it('should format bottom-right cell as R9C9', () => {
      expect(cellName(8, 8)).toBe('R9C9');
    });

    it('should format arbitrary cell correctly', () => {
      expect(cellName(2, 7)).toBe('R3C8');
    });
  });

  describe('cellList', () => {
    it('should format single cell', () => {
      expect(cellList([[0, 0]])).toBe('R1C1');
    });

    it('should format multiple cells comma-separated', () => {
      expect(
        cellList([
          [0, 0],
          [1, 2],
          [4, 4],
        ])
      ).toBe('R1C1, R2C3, R5C5');
    });

    it('should handle empty array', () => {
      expect(cellList([])).toBe('');
    });
  });

  describe('getBlockIndex', () => {
    it('should return 0 for top-left block cells', () => {
      expect(getBlockIndex(0, 0)).toBe(0);
      expect(getBlockIndex(1, 1)).toBe(0);
      expect(getBlockIndex(2, 2)).toBe(0);
    });

    it('should return 4 for center block cells', () => {
      expect(getBlockIndex(3, 3)).toBe(4);
      expect(getBlockIndex(4, 4)).toBe(4);
      expect(getBlockIndex(5, 5)).toBe(4);
    });

    it('should return 8 for bottom-right block cells', () => {
      expect(getBlockIndex(6, 6)).toBe(8);
      expect(getBlockIndex(7, 7)).toBe(8);
      expect(getBlockIndex(8, 8)).toBe(8);
    });

    it('should return correct block for top-right', () => {
      expect(getBlockIndex(0, 6)).toBe(2);
    });

    it('should return correct block for bottom-left', () => {
      expect(getBlockIndex(6, 0)).toBe(6);
    });
  });

  describe('getBlockNumber', () => {
    it('should return 1 for top-left block', () => {
      expect(getBlockNumber(0, 0)).toBe(1);
    });

    it('should return 5 for center block', () => {
      expect(getBlockNumber(4, 4)).toBe(5);
    });

    it('should return 9 for bottom-right block', () => {
      expect(getBlockNumber(8, 8)).toBe(9);
    });
  });

  describe('indexToRowCol', () => {
    it('should convert index 0 to [0, 0]', () => {
      expect(indexToRowCol(0)).toEqual([0, 0]);
    });

    it('should convert index 40 to [4, 4]', () => {
      expect(indexToRowCol(40)).toEqual([4, 4]);
    });

    it('should convert index 80 to [8, 8]', () => {
      expect(indexToRowCol(80)).toEqual([8, 8]);
    });

    it('should convert index 9 to [1, 0]', () => {
      expect(indexToRowCol(9)).toEqual([1, 0]);
    });

    it('should convert index 8 to [0, 8]', () => {
      expect(indexToRowCol(8)).toEqual([0, 8]);
    });
  });

  describe('rowColToIndex', () => {
    it('should convert (0, 0) to 0', () => {
      expect(rowColToIndex(0, 0)).toBe(0);
    });

    it('should convert (4, 4) to 40', () => {
      expect(rowColToIndex(4, 4)).toBe(40);
    });

    it('should convert (8, 8) to 80', () => {
      expect(rowColToIndex(8, 8)).toBe(80);
    });

    it('should be inverse of indexToRowCol', () => {
      for (let i = 0; i < 81; i++) {
        const [row, col] = indexToRowCol(i);
        expect(rowColToIndex(row, col)).toBe(i);
      }
    });
  });
});

// =============================================================================
// Time Formatting Utility Tests
// =============================================================================

describe('Time Formatting Utilities', () => {
  describe('formatTime', () => {
    it('should format 0 seconds as 00:00', () => {
      expect(formatTime(0)).toBe('00:00');
    });

    it('should format 65 seconds as 01:05', () => {
      expect(formatTime(65)).toBe('01:05');
    });

    it('should format 3661 seconds as 01:01:01', () => {
      expect(formatTime(3661)).toBe('01:01:01');
    });

    it('should format 59 seconds as 00:59', () => {
      expect(formatTime(59)).toBe('00:59');
    });

    it('should format 60 seconds as 01:00', () => {
      expect(formatTime(60)).toBe('01:00');
    });

    it('should format 3600 seconds as 01:00:00', () => {
      expect(formatTime(3600)).toBe('01:00:00');
    });

    it('should pad single digits', () => {
      expect(formatTime(5)).toBe('00:05');
    });
  });

  describe('parseTime', () => {
    it('should parse MM:SS format', () => {
      expect(parseTime('01:05')).toBe(65);
    });

    it('should parse HH:MM:SS format', () => {
      expect(parseTime('01:01:01')).toBe(3661);
    });

    it('should return 0 for invalid format', () => {
      expect(parseTime('invalid')).toBe(0);
    });

    it('should return 0 for empty string', () => {
      expect(parseTime('')).toBe(0);
    });

    it('should parse 00:00 as 0', () => {
      expect(parseTime('00:00')).toBe(0);
    });

    it('should roundtrip with formatTime for MM:SS', () => {
      expect(parseTime(formatTime(65))).toBe(65);
    });

    it('should roundtrip with formatTime for HH:MM:SS', () => {
      expect(parseTime(formatTime(3661))).toBe(3661);
    });

    it('should return 0 for single value (no colon)', () => {
      expect(parseTime('123')).toBe(0);
    });
  });

  describe('formatDigits', () => {
    it('should format string digits', () => {
      expect(formatDigits('123')).toBe('{1, 2, 3}');
    });

    it('should format number array', () => {
      expect(formatDigits([1, 2, 3])).toBe('{1, 2, 3}');
    });

    it('should handle single digit string', () => {
      expect(formatDigits('5')).toBe('{5}');
    });

    it('should handle single element array', () => {
      expect(formatDigits([9])).toBe('{9}');
    });

    it('should handle empty string', () => {
      expect(formatDigits('')).toBe('{}');
    });

    it('should handle empty array', () => {
      expect(formatDigits([])).toBe('{}');
    });
  });
});

// =============================================================================
// Technique Icon URL Tests
// =============================================================================

describe('getTechniqueIconUrl', () => {
  it('should convert Full House to correct URL', () => {
    expect(getTechniqueIconUrl(TechniqueId.FULL_HOUSE)).toBe(
      '/technique.full.house.svg'
    );
  });

  it('should convert X-Wing (with hyphen) to dots', () => {
    expect(getTechniqueIconUrl(TechniqueId.X_WING)).toBe(
      '/technique.x.wing.svg'
    );
  });

  it('should convert XY-Wing to dots', () => {
    expect(getTechniqueIconUrl(TechniqueId.XY_WING)).toBe(
      '/technique.xy.wing.svg'
    );
  });

  it('should handle multi-word technique names', () => {
    expect(getTechniqueIconUrl(TechniqueId.HIDDEN_SINGLE)).toBe(
      '/technique.hidden.single.svg'
    );
  });

  it('should handle technique names with numbers', () => {
    expect(getTechniqueIconUrl(TechniqueId.UNIQUE_RECTANGLE_1)).toBe(
      '/technique.unique.rectangle.type.1.svg'
    );
  });

  it('should handle 3D Medusa (number prefix)', () => {
    expect(getTechniqueIconUrl(TechniqueId.MEDUSA_COLORING)).toBe(
      '/technique.3d.medusa.svg'
    );
  });

  it('should handle unknown technique ID with fallback name', () => {
    expect(getTechniqueIconUrl(999)).toBe('/technique.technique.999.svg');
  });

  it('should map AIC to the existing technique.aic.svg icon', () => {
    expect(getTechniqueIconUrl(TechniqueId.AIC)).toBe('/technique.aic.svg');
  });
});

describe('level constants', () => {
  it('spans levels 1 to 12', () => {
    expect(MIN_LEVEL).toBe(1);
    expect(MAX_LEVEL).toBe(12);
    expect(ALL_LEVELS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('isValidLevel accepts only integers in range', () => {
    expect(isValidLevel(1)).toBe(true);
    expect(isValidLevel(12)).toBe(true);
    for (const bad of [0, 13, 1.5, NaN, '3', null, undefined]) {
      expect(isValidLevel(bad)).toBe(false);
    }
  });

  it('MIN_CLUES is 17', () => {
    expect(MIN_CLUES).toBe(17);
  });
});
