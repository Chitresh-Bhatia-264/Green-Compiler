
import { TokenType, Token, ASTNode, EnergySmell, IRInstruction, EnergyMap, ComplexityType, OptimizationSuggestion, SymbolEntry } from '../types';


 // HAND-WRITTEN LEXER


export class Lexer {
  private pos = 0;
  private line = 1;
  private column = 1;
  private source: string;

  private readonly KEYWORDS = ['def', 'for', 'while', 'if', 'else', 'return', 'in', 'range'];
  private readonly IO_FUNCS = ['print', 'read', 'write', 'fetch', 'log'];

  constructor(source: string) {
    this.source = source;
  }

  private peek() {
    return this.source[this.pos];
  }

  private advance() {
    const char = this.source[this.pos++];
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.pos < this.source.length) {
      const char = this.peek();

      // Whitespace
      if (/\s/.test(char)) {
        this.advance();
        continue;
      }

      // Comments
      if (char === '#') {
        while (this.pos < this.source.length && this.peek() !== '\n') {
          this.advance();
        }
        continue;
      }

      // Identifiers & Keywords
      if (/[a-zA-Z_]/.test(char)) {
        let value = '';
        const startLine = this.line;
        const startCol = this.column;
        while (this.pos < this.source.length && /[a-zA-Z0-9_]/.test(this.peek())) {
          value += this.advance();
        }

        if (this.KEYWORDS.includes(value)) {
          tokens.push({ type: value === 'def' ? TokenType.FUNC_DEF : (['for', 'while'].includes(value) ? TokenType.LOOP_START : TokenType.KEYWORD), value, line: startLine, column: startCol });
        } else if (this.IO_FUNCS.includes(value)) {
          tokens.push({ type: TokenType.IO_CALL, value, line: startLine, column: startCol });
        } else {
          tokens.push({ type: TokenType.IDENTIFIER, value, line: startLine, column: startCol });
        }
        continue;
      }

      // Numbers
      if (/[0-9]/.test(char)) {
        let value = '';
        const startLine = this.line;
        const startCol = this.column;
        while (this.pos < this.source.length && /[0-9.]/.test(this.peek())) {
          value += this.advance();
        }
        tokens.push({ type: TokenType.LITERAL, value, line: startLine, column: startCol });
        continue;
      }

      // Strings
      if (char === '"' || char === "'") {
        const quote = this.advance();
        let value = '';
        const startLine = this.line;
        const startCol = this.column;
        while (this.pos < this.source.length && this.peek() !== quote) {
          value += this.advance();
        }
        this.advance(); // consume closing quote
        tokens.push({ type: TokenType.LITERAL, value: `${quote}${value}${quote}`, line: startLine, column: startCol });
        continue;
      }

      // Operators
      if (['+', '-', '*', '/', '=', '<', '>', '!', '%', '&', '|'].includes(char)) {
        const startLine = this.line;
        const startCol = this.column;
        let value = this.advance();
        
        // Handle double operators: **, //, ==, <=, >=, !=
        const next = this.peek();
        if ((value === '*' && next === '*') || 
            (value === '/' && next === '/') || 
            (value === '=' && next === '=') ||
            (value === '<' && next === '=') ||
            (value === '>' && next === '=') ||
            (value === '!' && next === '=') ||
            (['+', '-', '*', '/', '%'].includes(value) && next === '=')) {
          value += this.advance();
        }
        
        tokens.push({ type: TokenType.OPERATOR, value, line: startLine, column: startCol });
        continue;
      }

      // Delimiters
      if (['(', ')', '[', ']', '{', '}', ':', ',', '.'].includes(char)) {
        const startLine = this.line;
        const startCol = this.column;
        const value = this.advance();
        tokens.push({ type: TokenType.DELIMITER, value, line: startLine, column: startCol });
        continue;
      }

      // Fallback
      this.advance();
    }

    tokens.push({ type: TokenType.EOF, value: '', line: this.line, column: this.column });
    return tokens;
  }
}

/**
 * RECURSIVE DESCENT PARSER
 * Builds an AST with energy metadata.
 */
export class Parser {
  private tokens: Token[];
  private pos = 0;
  private nodeId = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek() { return this.tokens[this.pos]; }
  private advance() { return this.tokens[this.pos++]; }

  public parse(): ASTNode {
    const root: ASTNode = {
      id: 'root',
      type: 'Program',
      children: [],
      lineStart: 1,
      lineEnd: this.tokens[this.tokens.length - 1].line,
      depth: 0,
      energyScore: 0,
      complexity: 'O(1)',
      cyclomaticComplexity: 0
    };

    while (this.peek().type !== TokenType.EOF) {
      const node = this.parseStatement(1);
      if (node) root.children.push(node);
    }

    return root;
  }

  private parseStatement(depth: number): ASTNode | null {
    const token = this.peek();

    if (token.type === TokenType.FUNC_DEF) {
      return this.parseFunction(depth);
    }

    if (token.type === TokenType.LOOP_START) {
      return this.parseLoop(depth);
    }

    if (token.type === TokenType.KEYWORD && ['if', 'elif', 'else'].includes(token.value)) {
      return this.parseCondition(depth);
    }

    // Default: Expression/Assignment
    const startLine = token.line;
    let node: ASTNode = {
      id: `node_${this.nodeId++}`,
      type: 'Expression',
      value: '',
      children: [],
      lineStart: startLine,
      lineEnd: startLine,
      depth,
      energyScore: 0,
      complexity: 'O(1)'
    };

    while (this.pos < this.tokens.length && this.peek().line === startLine && this.peek().type !== TokenType.EOF) {
      const t = this.advance();
      if (t.type === TokenType.IO_CALL) {
        node.children.push({
          id: `node_${this.nodeId++}`,
          type: 'IOCall',
          value: t.value,
          children: [],
          lineStart: t.line,
          lineEnd: t.line,
          depth: depth + 1,
          energyScore: 0
        });
      }
      
      // Memory Access Detection (Index Access)
      if (t.value === '[' && node.children.length === 0) {
        node.type = 'MemoryAccess';
      }

      node.value += t.value + ' ';
    }
    return node;
  }

  private parseCondition(depth: number): ASTNode {
    const startToken = this.advance();
    let header = startToken.value + ' ';
    
    while (this.pos < this.tokens.length && this.peek().value !== ':' && this.peek().type !== TokenType.EOF) {
      header += this.advance().value + ' ';
    }
    if (this.peek().type !== TokenType.EOF) header += this.advance().value;

    const node: ASTNode = {
      id: `cond_${this.nodeId++}`,
      type: 'Condition',
      value: header,
      children: [],
      lineStart: startToken.line,
      lineEnd: startToken.line,
      depth,
      energyScore: 0,
      complexity: 'O(1)'
    };

    const condCol = startToken.column;
    while (this.peek().type !== TokenType.EOF) {
      const nextToken = this.peek();
      if (nextToken.type === TokenType.FUNC_DEF) break;
      if (nextToken.line > startToken.line && nextToken.column <= condCol) break;

      const child = this.parseStatement(depth + 1);
      if (child) {
        node.children.push(child);
        node.lineEnd = child.lineEnd;
      } else {
        this.advance();
      }
    }
    return node;
  }

  private parseFunction(depth: number): ASTNode {
    const startToken = this.advance(); // def
    const name = this.advance().value; // name
    
    // Skip params for simplicity in this demo parser
    while (this.peek().value !== ':') this.advance();
    this.advance(); // :

    const node: ASTNode = {
      id: `func_${this.nodeId++}`,
      type: 'FunctionDef',
      value: name,
      children: [],
      lineStart: startToken.line,
      lineEnd: startToken.line,
      depth,
      energyScore: 0,
      complexity: 'O(1)'
    };

    // Parse body (heuristic: consume tokens that are indented more than the function start)
    const funcCol = startToken.column;
    while (this.peek().type !== TokenType.EOF) {
      const nextToken = this.peek();
      
      // Stop if we see another top-level function at same or lower indentation
      if (nextToken.type === TokenType.FUNC_DEF && nextToken.column <= funcCol) break;
      
      // Block end: token on a new line with indentation <= funcCol
      if (nextToken.line > startToken.line && nextToken.column <= funcCol) break;

      const child = this.parseStatement(depth + 1);
      if (child) {
        node.children.push(child);
        node.lineEnd = child.lineEnd;
      } else {
        this.advance();
      }
    }

    return node;
  }

  private parseLoop(depth: number): ASTNode {
    const startToken = this.advance(); // for/while
    let header = startToken.value + ' ';
    
    // Capture loop header (e.g., "for i in range(2, n):")
    while (this.pos < this.tokens.length && this.peek().value !== ':' && this.peek().type !== TokenType.EOF) {
      header += this.advance().value + ' ';
    }
    if (this.peek().type !== TokenType.EOF) header += this.advance().value; // Add the ':'

    const node: ASTNode = {
      id: `loop_${this.nodeId++}`,
      type: 'Loop',
      value: header,
      children: [],
      lineStart: startToken.line,
      lineEnd: startToken.line,
      depth,
      energyScore: 0,
      complexity: 'O(N)'
    };

    const loopCol = startToken.column;
    
    // Body parsing heuristic: consume tokens that are indented more than the loop start
    while (this.peek().type !== TokenType.EOF) {
      const nextToken = this.peek();
      
      // If we see a new function def, stop
      if (nextToken.type === TokenType.FUNC_DEF) break;
      
      
      // Note: This is a simple heuristic for Python-like indentation
      if (nextToken.line > startToken.line && nextToken.column <= loopCol) {
        break;
      }

      const child = this.parseStatement(depth + 1);
      if (child) {
        node.children.push(child);
        node.lineEnd = child.lineEnd;
      } else {
        this.advance(); // skip unrecognized
      }
    }

    return node;
  }
}

//ENERGY VISITOR
 // Applies the formal cost model with recursion detection and complexity propagation.
 
export class EnergyVisitor {
  private costModel = {
    loopBase: 10,
    ioBase: 50,
    recursionBase: 100,
    memBase: 5,
    callBase: 15
  };

  private currentFunction: string | null = null;
  private functionComplexities: Record<string, ComplexityType> = {};

  private complexityWeights: Record<string, number> = {
    'O(1)': 1,
    'O(log N)': 2,
    'O(√N)': 2,
    'O(N)': 3,
    'O(N log N)': 4,
    'O(N²)': 5,
    'O(N³)': 6,
    'O(2^N)': 7
  };

  private compareComplexity(a: any, b: any): any {
    const valA = a === 'RECURSIVE_CALL' ? 'O(1)' : a;
    const valB = b === 'RECURSIVE_CALL' ? 'O(1)' : b;
    const wA = this.complexityWeights[valA] || 0;
    const wB = this.complexityWeights[valB] || 0;
    return wA >= wB ? valA : valB;
  }

  public visit(node: ASTNode, parentLoopDepth: number = 0): number {
    let score = node.type === 'Expression' ? 10 : 2; // Base costs
    node.cyclomaticComplexity = 0;

    if (node.type === 'Loop') {
      node.cyclomaticComplexity = 1;
      const currentLoopDepth = parentLoopDepth + 1;
      let childrenScore = 0;
      let maxChildComp: any = 'O(1)';
      
      node.children.forEach(child => {
        childrenScore += this.visit(child, currentLoopDepth);
        maxChildComp = this.compareComplexity(maxChildComp, child.complexity || 'O(1)');
      });

      // Complexity detection (Advanced Heuristic for loop limits)
      const sanitizedValue = (node.value || '').toLowerCase().replace(/\s+/g, '');
      const isOptimizedLimit = sanitizedValue.includes('**0.5') || 
                               sanitizedValue.includes('sqrt') ||
                               node.children.some(c => c.type === 'Expression' && (c.value||'').replace(/\s+/g, '').match(/[a-z]\*[a-z]<=/));
      
      const isLogarithmic = this.containsLogPattern(node);

      let loopBaseComp: ComplexityType = 'O(N)';
      if (isOptimizedLimit) loopBaseComp = 'O(√N)';
      else if (isLogarithmic) loopBaseComp = 'O(log N)';

      // Dynamically combine parent boundary logic with max inner child limit
      if (loopBaseComp === 'O(log N)') {
        if (maxChildComp === 'O(N)') node.complexity = 'O(N log N)';
        else if (maxChildComp === 'O(N²)') node.complexity = 'O(N²)';
        else node.complexity = 'O(log N)';
        score = (childrenScore + this.costModel.loopBase) * Math.pow(currentLoopDepth, 1.05) * 0.02;
      } else if (loopBaseComp === 'O(√N)') {
        node.complexity = maxChildComp === 'O(N)' ? 'O(N²)' : 'O(√N)';
        score = (childrenScore + this.costModel.loopBase) * Math.pow(currentLoopDepth, 1.1) * 0.05;
      } else {
        if (maxChildComp === 'O(1)') node.complexity = 'O(N)';
        else if (maxChildComp === 'O(log N)') node.complexity = 'O(N log N)';
        else if (maxChildComp === 'O(N)') node.complexity = 'O(N²)';
        else if (maxChildComp === 'O(N log N)') node.complexity = 'O(N²)';
        else if (maxChildComp === 'O(N²)') node.complexity = 'O(N³)';
        else if (maxChildComp === 'O(2^N)') node.complexity = 'O(2^N)';
        else node.complexity = 'O(N³)';
        
        score = (childrenScore + this.costModel.loopBase) * Math.pow(currentLoopDepth, 2);
      }

      if (currentLoopDepth > 1) {
        node.smell = EnergySmell.LOOP_NESTING;
      }
      
      const hasIO = node.children.some(c => this.containsIO(c));
      if (hasIO) {
        node.smell = EnergySmell.IO_IN_LOOP;
      }

    } else if (node.type === 'Condition') {
      node.cyclomaticComplexity = 1;
      node.complexity = 'O(1)';
      let childrenScore = 0;
      let maxChildComp: any = 'O(1)';
      
      node.children.forEach(child => {
        childrenScore += this.visit(child, parentLoopDepth);
        maxChildComp = this.compareComplexity(maxChildComp, child.complexity || 'O(1)');
      });
      node.complexity = maxChildComp;
      score = childrenScore + 5;
    } else if (node.type === 'IOCall') {
      const factor = parentLoopDepth > 0 ? 5 : 1;
      score = this.costModel.ioBase * factor * Math.pow(parentLoopDepth + 1, 2);
      if (parentLoopDepth > 0) node.smell = EnergySmell.IO_IN_LOOP;
      node.complexity = 'O(1)';
    } else if (node.type === 'MemoryAccess') {
      const strideFactor = parentLoopDepth > 1 ? 2.5 : 1;
      score = this.costModel.memBase * strideFactor * Math.pow(parentLoopDepth + 1, 2);
      node.complexity = 'O(1)';
    } else if (node.type === 'FunctionDef') {
      const prevFunc = this.currentFunction;
      const funcName = node.value || '';
      this.currentFunction = funcName;
      
      let childrenScore = 0;
      let maxComp: any = 'O(1)';
      
      node.children.forEach(child => {
        childrenScore += this.visit(child, parentLoopDepth);
        maxComp = this.compareComplexity(maxComp, child.complexity || 'O(1)');
      });
      
      const isRecursive = this.containsRecursionCall(node, funcName);
      const isHalving = this.containsLogPattern(node);
      
      if (isRecursive && isHalving) {
        if (maxComp === 'O(N)') {
          node.complexity = 'O(N log N)';
          score = childrenScore * 1.5 + this.costModel.recursionBase;
        } else if (maxComp === 'O(1)' || maxComp === 'O(log N)') {
          node.complexity = 'O(log N)';
          score = childrenScore * 1.2 + this.costModel.recursionBase;
        } else {
          node.complexity = maxComp; // fallback
          score = childrenScore * 1.5 + this.costModel.recursionBase;
        }
      } else if (isRecursive) {
        node.complexity = 'O(2^N)';
        score = childrenScore + this.costModel.recursionBase * 5;
      } else {
        node.complexity = maxComp;
        score = childrenScore + this.costModel.callBase;
      }
      
      // Cache function complexity for calls
      this.functionComplexities[funcName] = node.complexity;
      this.currentFunction = prevFunc;
    } else if (node.type === 'Expression') {
      // Improved call Detection
      const calledFuncs = Array.from(node.value?.matchAll(/([a-zA-Z_]\w*)\s*\(/g) || []).map(m => m[1]);

      if (this.currentFunction && calledFuncs.includes(this.currentFunction)) {
        node.complexity = 'RECURSIVE_CALL';
        score = this.costModel.recursionBase;
      } else {
        const knownCall = calledFuncs.find(f => this.functionComplexities[f] || f === 'merge' || f === 'sorted' || f === 'sort');
        if (knownCall) {
          node.complexity = this.functionComplexities[knownCall] || (knownCall === 'merge' ? 'O(N)' : 'O(N log N)');
          score = this.costModel.callBase * (this.complexityWeights[node.complexity as ComplexityType] || 1);
        } else {
          score = 15 * Math.pow(parentLoopDepth + 1, 2);
          node.complexity = 'O(1)';
        }
      }
    } else {
      let childrenScore = 0;
      node.children.forEach(child => {
        childrenScore += this.visit(child, parentLoopDepth);
      });
      score += childrenScore;
    }

    // Rollup Cyclomatic Complexity
    node.children.forEach(c => { node.cyclomaticComplexity! += (c.cyclomaticComplexity || 0); });
    node.energyScore = Math.floor(score);
    return node.energyScore;
  }

  private containsRecursionCall(node: ASTNode, funcName: string): boolean {
    if (node.type === 'Expression' && node.complexity === 'RECURSIVE_CALL') return true;
    return node.children.some(c => this.containsRecursionCall(c, funcName));
  }

  private containsLogPattern(node: ASTNode): boolean {
    const value = (node.value || '').toLowerCase().replace(/\s+/g, '');
    // Patterns indicative of O(log N) - halving the search space or division-based splitting
    if (value.includes('//2') || value.includes('/2') || value.includes('>>1') || 
        value.includes('*=2') || value.includes('/=2') || value.includes('//=2') ||
        value.includes('[:mid]') || value.includes('[mid:]')) {
      return true;
    }
    // Scope logarithmic pattern checks purely to current body's expressions to prevent poisoning parent loops
    return node.children.some(c => 
      (c.type === 'Expression' || c.type === 'Condition') && this.containsLogPattern(c)
    );
  }

  private containsIO(node: ASTNode): boolean {
    if (node.type === 'IOCall') return true;
    return node.children.some(c => this.containsIO(c));
  }
}

/**
 * SEMANTIC ANALYZER
 * Builds the Symbol Table and tracks Data Flow Liveness (Reads vs Writes).
 */
export class SemanticAnalyzer {
  public symbols: Map<string, SymbolEntry> = new Map();

  public analyze(node: ASTNode, scope: string = 'global') {
    let currentScope = scope;

    if (node.type === 'FunctionDef') {
      const funcName = node.value?.split('(')[0].trim() || 'unknown';
      this.addSymbol(funcName, 'Function', scope, node.lineStart, 0, 1);
      currentScope = funcName;
    } else if (node.type === 'Expression') {
      const assignMatch = node.value?.match(/([a-zA-Z_]\w*)\s*=/);
      if (assignMatch) this.addSymbol(assignMatch[1], 'Variable', currentScope, node.lineStart, 0, 1);
      
      const words = Array.from(node.value?.matchAll(/[a-zA-Z_]\w*/g) || []).map(m => m[0]);
      words.forEach(w => {
        if (!['if','else','for','while','def','return','in','range','True','False','int','len','append','extend'].includes(w)) {
          if (!(assignMatch && assignMatch[1] === w)) this.addSymbol(w, 'Variable', currentScope, node.lineStart, 1, 0);
        }
      });
    } else if (node.type === 'Condition' || node.type === 'Loop') {
      const words = Array.from(node.value?.matchAll(/[a-zA-Z_]\w*/g) || []).map(m => m[0]);
      words.forEach(w => {
        if (!['if','else','elif','for','while','in','range','True','False','len'].includes(w)) {
          this.addSymbol(w, 'Variable', currentScope, node.lineStart, 1, 0);
        }
      });
    }

    node.children.forEach(c => this.analyze(c, currentScope));
  }

  private addSymbol(name: string, role: any, scope: string, line: number, reads: number, writes: number) {
    const key = `${scope}::${name}`;
    if (this.symbols.has(key)) {
      const s = this.symbols.get(key)!;
      s.reads += reads;
      s.writes += writes;
    } else {
      this.symbols.set(key, { name, role, scope, line, reads, writes });
    }
  }
}

/**
 * OPTIMIZATION ENGINE
 * Recommends transformations based on code smells.
 */
export class OptimizationEngine {
  public optimize(ast: ASTNode, symbols: SymbolEntry[]): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    this.traverse(ast, suggestions);

    // Dead Code Elimination (DCE) Pass
    symbols.forEach(s => {
      if (s.role === 'Variable' && s.writes > 0 && s.reads === 0) {
        suggestions.push({
          id: `dce_${s.name}_${s.line}`,
          type: 'DEAD_CODE_ELIMINATION',
          description: `Variable '${s.name}' is declared but never read. Eliminating it frees up memory allocation.`,
          originalECS: 15,
          optimizedECS: 0,
          line: s.line,
          originalCode: `${s.name} = <assigned_value>`,
          optimizedCode: `# Dead code eliminated`
        });
      }
    });
    return suggestions;
  }

  private traverse(node: ASTNode, suggestions: OptimizationSuggestion[]) {
    if (node.smell === EnergySmell.IO_IN_LOOP) {
      suggestions.push({
        id: `opt_${node.id}`,
        type: 'IO_HOISTING',
        description: 'Hoist I/O operations outside of loops to prevent redundant CPU wake-up interrupts.',
        originalECS: node.energyScore,
        optimizedECS: Math.floor(node.energyScore * 0.4),
        line: node.lineStart,
        originalCode: `for ...:\n  ${node.value}(data)`,
        optimizedCode: `results = []\nfor ...:\n  results.append(data)\n${node.value}(results)`
      });
    } else if (node.smell === EnergySmell.LOOP_NESTING) {
      suggestions.push({
        id: `opt_${node.id}`,
        type: 'LOOP_FLATTENING',
        description: 'Flatten nested loops into linear complexity O(N) where possible to reduce quadratic energy drain.',
        originalECS: node.energyScore,
        optimizedECS: Math.floor(node.energyScore * 0.15),
        line: node.lineStart,
        originalCode: `for i in range(100):\n  for j in range(100):\n    do_task(i, j)`,
        optimizedCode: `for k in range(10000):\n  i, j = k // 100, k % 100\n  do_task(i, j)`
      });
    }

    // Constant Folding Detection (Compiler Pass)
    if (node.type === 'Expression' && node.value) {
      const val = node.value.trim();
      const isMath = /^[0-9]+\s*[\+\-\*\/]\s*[0-9]+/.test(val);
      if (isMath) {
        suggestions.push({
          id: `opt_${node.id}`,
          type: 'CONSTANT_FOLDING',
          description: 'Arithmetic between constants detected. Fold this at compile time to save CPU cycles at runtime.',
          originalECS: node.energyScore || 10,
          optimizedECS: 1,
          line: node.lineStart,
          originalCode: val,
          optimizedCode: '<evaluated_constant_value>'
        });
      }
    }
    node.children.forEach(c => this.traverse(c, suggestions));
  }
}

/**
 * IR EMITTER
 * Converts AST to Three-Address Code with energy annotations.
 */
export class IREmitter {
  public emit(node: ASTNode, instructions: IRInstruction[] = []): IRInstruction[] {
    if (node.type === 'IOCall') {
      instructions.push({
        line: node.lineStart,
        op: 'WAKE_CPU',
        target: 'IRQ_BUS',
        arg1: node.value,
        ecs: node.energyScore,
        smell: node.smell || EnergySmell.NONE,
        complexity: node.complexity
      });
      instructions.push({
        line: node.lineStart,
        op: 'SYSCALL',
        target: 'IO_MANAGER',
        arg1: 'BLOCKING_WAIT',
        ecs: 5,
        smell: EnergySmell.NONE,
        complexity: 'O(1)'
      });
    } else if (node.type === 'Loop') {
      const loopLabel = `L_${node.id}`;
      instructions.push({
        line: node.lineStart,
        op: 'LABEL',
        target: loopLabel,
        ecs: 0,
        smell: EnergySmell.NONE,
        complexity: node.complexity
      });
      instructions.push({
        line: node.lineStart,
        op: 'CMP',
        target: 'iter',
        arg1: 'limit',
        ecs: 2,
        smell: EnergySmell.NONE,
        complexity: 'O(1)'
      });
      
      node.children.forEach(c => this.emit(c, instructions));
      
      instructions.push({
        line: node.lineEnd,
        op: 'JMP',
        target: loopLabel,
        ecs: node.energyScore,
        smell: node.smell || EnergySmell.NONE,
        complexity: node.complexity
      });
    } else if (node.type === 'Expression') {
      const isRecursion = node.complexity === 'O(2^N)';
      instructions.push({
        line: node.lineStart,
        op: isRecursion ? 'STACK_PUSH' : 'MOV',
        target: isRecursion ? 'FRAME_PTR' : 't1',
        arg1: isRecursion ? 'RET_ADDR' : 'src',
        ecs: node.energyScore,
        smell: EnergySmell.NONE,
        complexity: node.complexity
      });
    } else if (node.type === 'Condition') {
      const condLabel = `COND_${node.id}`;
      instructions.push({
        line: node.lineStart,
        op: 'CMP_BRANCH',
        target: condLabel,
        ecs: node.energyScore,
        smell: EnergySmell.NONE,
        complexity: node.complexity
      });
      node.children.forEach(c => this.emit(c, instructions));
    } else {
      node.children.forEach(c => this.emit(c, instructions));
    }
    return instructions;
  }
}

export function analyzeCode(source: string): { tokens: Token[], ast: ASTNode, ir: IRInstruction[], report: EnergyMap } {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  
  const parser = new Parser(tokens);
  const ast = parser.parse();
  
  const visitor = new EnergyVisitor();
  const totalScore = visitor.visit(ast);
  
  const semanticAnalyzer = new SemanticAnalyzer();
  semanticAnalyzer.analyze(ast);
  const symbolTable = Array.from(semanticAnalyzer.symbols.values());

  const optimizer = new OptimizationEngine();
  const optimizations = optimizer.optimize(ast, symbolTable);

  const emitter = new IREmitter();
  const ir = emitter.emit(ast).slice(0, 100); // Limit IR for performance

  const lineScores: Record<number, number> = {};
  const fillLineScores = (n: ASTNode) => {
    // To prevent double counting in the HEATMAP, we calculate the intrinsic score
    // for container nodes (like Loops and Functions) separately.
    let childrenSum = 0;
    n.children.forEach(c => childrenSum += c.energyScore);
    
    const intrinsic = Math.max(5, n.energyScore - childrenSum);
    lineScores[n.lineStart] = (lineScores[n.lineStart] || 0) + intrinsic;
    
    n.children.forEach(fillLineScores);
  };
  fillLineScores(ast);

  const complexityWeights: Record<string, number> = {
    'O(1)': 1,
    'O(log N)': 2,
    'O(√N)': 2,
    'O(N)': 3,
    'O(N log N)': 4,
    'O(N²)': 5,
    'O(N³)': 6,
    'O(2^N)': 7
  };

  const smellsDistribution: Record<string, number> = {};
  const collectSmells = (n: ASTNode) => {
    if (n.smell && n.smell !== EnergySmell.NONE) {
      smellsDistribution[n.smell] = (smellsDistribution[n.smell] || 0) + 1;
    }
    n.children.forEach(collectSmells);
  };
  collectSmells(ast);

  // Data Flow / Vocabulary Estimation for Halstead Metrics
  const n1 = new Set(); // Unique operators/keywords
  const n2 = new Set(); // Unique operands
  let N1 = 0; let N2 = 0;
  
  tokens.forEach(t => {
    if (t.type === TokenType.OPERATOR || t.type === TokenType.KEYWORD) {
      n1.add(t.value); N1++;
    } else if (t.type === TokenType.IDENTIFIER || t.type === TokenType.LITERAL) {
      n2.add(t.value); N2++;
    }
  });

  const n = n1.size + n2.size;
  const N = N1 + N2;
  const halsteadVolume = n === 0 ? 0 : Math.round(N * Math.log2(n));
  const cyclomaticComplexity = 1 + (ast.cyclomaticComplexity || 0);

  const report: EnergyMap = {
    file: 'source.py',
    totalECS: totalScore,
    maxComplexity: ast.children.reduce((acc, f) => {
      const wAcc = complexityWeights[acc] || 0;
      const wChild = complexityWeights[f.complexity || 'O(1)'] || 0;
      return wChild > wAcc ? (f.complexity as any) : acc;
    }, 'O(1)' as any),
    cyclomaticComplexity,
    halsteadVolume,
    functions: ast.children
      .filter(c => c.type === 'FunctionDef')
      .map(f => {
        const fSmells: EnergySmell[] = [];
        const findSmells = (n: ASTNode) => {
          if (n.smell) fSmells.push(n.smell);
          n.children.forEach(findSmells);
        };
        findSmells(f);
        
        return {
          name: f.value,
          lineRange: [f.lineStart, f.lineEnd],
          ecs: f.energyScore,
          complexity: f.complexity,
          smells: fSmells,
          suggestion: fSmells.includes(EnergySmell.LOOP_NESTING) 
            ? 'Flatten nested loops to reduce quadratic energy growth' 
            : fSmells.includes(EnergySmell.IO_IN_LOOP) 
              ? 'Move I/O operations outside tight loops' 
              : 'Code is following optimal energy patterns'
        };
      }),
    lineScores,
    smellsDistribution,
    optimizations,
    symbolTable
  };

  return { tokens, ast, ir, report };
}
