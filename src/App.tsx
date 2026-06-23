

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Activity, Code2, Cpu, BarChart3, ArrowRight, CloudLightning } from 'lucide-react';
import { Editor } from './components/Editor';
import { ASTVisualizer } from './components/ASTVisualizer';
import { IRView } from './components/IRView';
import { Diagnostics } from './components/Diagnostics';
import { Login } from './components/Login';
import { TokenTape } from './components/TokenTape';
import { DiffEngine } from './components/DiffEngine';
import { OptimizationPipeline } from './components/OptimizationPipeline';
import { SymbolTable } from './components/SymbolTable';
import { analyzeCode } from './compiler';

const INITIAL_CODE = `# The Green Compiler: Ecological Optimization Study
# Analyzing structural carbon footprint of algorithms

def compute_constants():
    # Compile-time evaluation opportunity (Constant Folding)
    seconds_in_day = 60 * 60 * 24
    
    # Semantic Analysis Target (Dead Code Elimination)
    unused_buffer = 1024 * 1024
    
    return seconds_in_day

def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    # Divide & Conquer (Recursive splitting)
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    # Linear merge operation O(N)
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result

merge_sort([5, 3, 8, 1])
`;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [source, setSource] = useState(INITIAL_CODE);
  const [activeTab, setActiveTab] = useState<'AST' | 'IR' | 'TOKENS' | 'DIFF' | 'OPTIMIZE' | 'SYMBOLS'>('AST');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const [prevECS, setPrevECS] = useState(412);
  
  // Track last build ECS for footer delta
  useEffect(() => {
    if (analysis) {
       const timer = setTimeout(() => {
         setPrevECS(analysis.report.totalECS);
       }, 5000); // 5s build lag simulation
       return () => clearTimeout(timer);
    }
  }, [analysis]);

  // Server-side analysis on change
  useEffect(() => {
    if (!isLoggedIn) return;
    const timer = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source }),
        });
        const data = await response.json();
        if (data && !data.error) {
          setAnalysis(data);
        }
      } catch (e) {
        console.error('Fetch Error:', e);
        // Fallback to local
        setAnalysis(analyzeCode(source));
      } finally {
        setIsAnalyzing(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [source, isLoggedIn]);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  if (!analysis) return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0d1117]">
      <div className="flex flex-col items-center gap-4">
        <Cpu size={48} className="text-[#238636] animate-spin" />
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Warming Up Compiler Engine...</span>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0d1117] text-[#c9d1d9] overflow-hidden">
      {/* Top Navbar */}
      <nav className="h-14 border-b border-[#30363d] px-6 flex items-center justify-between bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#238636] rounded-md flex items-center justify-center">
            <Leaf size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">GREEN COMPILER</h1>
            <p className="text-[10px] text-green-500 font-mono tracking-widest uppercase">ECOLOGICAL ANALYSIS v1.0.0</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-[10px] text-gray-500">ENGINE STATUS:</span>
            {isAnalyzing ? (
              <span className="text-[10px] text-blue-400 flex items-center">
                <CloudLightning size={12} className="mr-1.5 animate-bounce" />
                ANALYZING (SERVER)
              </span>
            ) : (
              <span className="text-[10px] text-green-500 flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                SYNCED
              </span>
            )}
          </div>
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="text-[10px] px-3 py-1 bg-[#21262d] border border-[#30363d] rounded hover:border-[#8b949e] transition-colors font-bold uppercase"
          >
            Log Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col xl:flex-row overflow-hidden p-4 gap-4">
        {/* Left Panel: Editor */}
        <section className="flex-[4] flex flex-col min-w-0 min-h-[300px] xl:min-h-0">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 size={16} className="text-gray-400" />
              <span className="text-xs font-bold font-mono">SOURCE_ENTRY.PY</span>
            </div>
          </div>
          <Editor 
            value={source} 
            onChange={setSource} 
            lineScores={analysis.report.lineScores}
            tokens={analysis.tokens}
          />
        </section>

        {/* Center Panel: AST / IR / TOKENS */}
        <section className="flex-[3] flex flex-col min-w-0 gap-4 min-h-[400px] xl:min-h-0">
          <div className="flex gap-2 border-b border-[#30363d] overflow-x-auto scrollbar-hide px-2 pt-2">
            <button 
              onClick={() => setActiveTab('TOKENS')}
              className={`px-4 py-2 text-xs font-bold relative transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === 'TOKENS' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              1. LEXER
              {activeTab === 'TOKENS' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f78166]" />}
            </button>
            <button 
              onClick={() => setActiveTab('AST')}
              className={`px-4 py-2 text-xs font-bold relative transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === 'AST' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              2. PARSER
              {activeTab === 'AST' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f78166]" />}
            </button>
            <button 
              onClick={() => setActiveTab('SYMBOLS')}
              className={`px-4 py-2 text-xs font-bold relative transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === 'SYMBOLS' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              3. SYMBOLS
              {activeTab === 'SYMBOLS' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f78166]" />}
            </button>
            <button 
              onClick={() => setActiveTab('OPTIMIZE')}
              className={`px-4 py-2 text-xs font-bold relative transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === 'OPTIMIZE' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              4. OPTIMIZER
              {activeTab === 'OPTIMIZE' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f78166]" />}
            </button>
            <button 
              onClick={() => setActiveTab('IR')}
              className={`px-4 py-2 text-xs font-bold relative transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === 'IR' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              5. EMITTER
              {activeTab === 'IR' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f78166]" />}
            </button>
            <button 
              onClick={() => setActiveTab('DIFF')}
              className={`px-4 py-2 text-xs font-bold relative transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === 'DIFF' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              6. DELTA
              {activeTab === 'DIFF' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f78166]" />}
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'AST' && (
                <motion.div key="ast" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="h-full">
                  <ASTVisualizer node={analysis.ast} />
                </motion.div>
              )}
              {activeTab === 'SYMBOLS' && (
                <motion.div key="symbols" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="h-full">
                  <SymbolTable symbols={analysis.report.symbolTable} />
                </motion.div>
              )}
              {activeTab === 'OPTIMIZE' && (
                <motion.div key="optimize" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="h-full">
                  <OptimizationPipeline optimizations={analysis.report.optimizations} />
                </motion.div>
              )}
              {activeTab === 'IR' && (
                <motion.div key="ir" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="h-full">
                  <IRView instructions={analysis.ir} />
                </motion.div>
              )}
              {activeTab === 'TOKENS' && (
                <motion.div key="tokens" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="h-full">
                  <TokenTape tokens={analysis.tokens} />
                </motion.div>
              )}
              {activeTab === 'DIFF' && (
                <motion.div key="diff" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="h-full">
                   <DiffEngine />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Right Panel: Diagnostics */}
        <section className="flex-[2] min-w-[300px] flex flex-col min-h-[400px] xl:min-h-0">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <BarChart3 size={16} />
              <span className="text-xs font-bold font-mono uppercase tracking-widest">Diagnostics</span>
            </div>
          </div>
          <Diagnostics report={analysis.report} />
        </section>
      </main>

      {/* Beta: Delta Engine Footer */}
      <footer className="h-12 border-t border-[#30363d] bg-[#161b22] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-blue-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delta Engine</span>
          </div>
          <div className="h-4 w-px bg-[#30363d]" />
          <div className="flex items-center gap-4 text-[10px] font-mono">
             <div className="flex items-center gap-1.5">
               <span className="text-gray-500">LAST_BUILD:</span>
               <span className="text-white">{prevECS} ECS</span>
             </div>
             <ArrowRight size={12} className="text-gray-600" />
             <div className="flex items-center gap-1.5">
               <span className="text-gray-500">LIVE:</span>
               <span className={analysis.report.totalECS <= prevECS ? "text-green-500" : "text-red-500"}>
                 {analysis.report.totalECS} ECS
               </span>
               <span className={`px-1 rounded ${analysis.report.totalECS <= prevECS ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                 {(((analysis.report.totalECS - prevECS) / prevECS) * 100).toFixed(1)}%
               </span>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-[#161b22] bg-[#30363d] overflow-hidden bg-cover" style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i+10})` }} />
            ))}
          </div>
          <span className="text-[10px] text-gray-500">3 ENGINEERS ANALYZING</span>
        </div>
      </footer>
    </div>
  );
}
