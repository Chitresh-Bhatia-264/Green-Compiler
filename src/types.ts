

export enum TokenType {
  KEYWORD = 'KEYWORD',
  IDENTIFIER = 'IDENTIFIER',
  LITERAL = 'LITERAL',
  OPERATOR = 'OPERATOR',
  DELIMITER = 'DELIMITER',
  IO_CALL = 'IO_CALL',
  LOOP_START = 'LOOP_START',
  FUNC_DEF = 'FUNC_DEF',
  WHITESPACE = 'WHITESPACE',
  COMMENT = 'COMMENT',
  EOF = 'EOF',
  UNKNOWN = 'UNKNOWN'
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export type ComplexityType = 'O(1)' | 'O(log N)' | 'O(√N)' | 'O(N)' | 'O(N log N)' | 'O(N²)' | 'O(N³)' | 'O(2^N)';

export interface ASTNode {
  id: string;
  type: string;
  value?: any;
  children: ASTNode[];
  lineStart: number;
  lineEnd: number;
  depth: number;
  energyScore: number;
  smell?: EnergySmell;
  optimized?: boolean;
  complexity?: ComplexityType;
  cyclomaticComplexity?: number;
}

export enum EnergySmell {
  LOOP_NESTING = 'LOOP_NESTING',
  IO_IN_LOOP = 'IO_IN_LOOP',
  RECURSION = 'RECURSION',
  CACHE_MISS_RISK = 'CACHE_MISS_RISK',
  HEAVY_ARITHMETIC = 'HEAVY_ARITHMETIC',
  NONE = 'NONE'
}

export interface IRInstruction {
  line: number;
  op: string;
  target: string;
  arg1?: string;
  arg2?: string;
  ecs: number;
  smell: EnergySmell;
  complexity?: ComplexityType;
}

export interface OptimizationSuggestion {
  id: string;
  type: 'IO_HOISTING' | 'LOOP_FLATTENING' | 'CONSTANT_FOLDING' | 'DEAD_CODE_ELIMINATION';
  description: string;
  originalECS: number;
  optimizedECS: number;
  line: number;
  originalCode: string;
  optimizedCode: string;
}

export interface SymbolEntry {
  name: string;
  role: 'Variable' | 'Function' | 'Class';
  scope: string;
  line: number;
  reads: number;
  writes: number;
}

export interface EnergyMap {
  file: string;
  totalECS: number;
  maxComplexity: ComplexityType;
  cyclomaticComplexity: number;
  halsteadVolume: number;
  functions: Array<{
    name: string;
    lineRange: [number, number];
    ecs: number;
    complexity: ComplexityType;
    smells: EnergySmell[];
    suggestion: string;
  }>;
  lineScores: Record<number, number>;
  smellsDistribution: Record<string, number>;
  optimizations: OptimizationSuggestion[];
  symbolTable: SymbolEntry[];
}
