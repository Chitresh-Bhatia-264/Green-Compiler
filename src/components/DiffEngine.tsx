

import React, { useState } from 'react';
import { analyzeCode } from '../compiler';
import { Trash2, Leaf } from 'lucide-react';

export const DiffEngine: React.FC = () => {
  const [codeA, setCodeA] = useState('def is_prime_slow(n):\n  if n <= 1: return False\n  for i in range(2, n):\n    if n % i == 0: return False\n  return True');
  const [codeB, setCodeB] = useState('def is_prime_fast(n):\n  if n <= 1: return False\n  for i in range(2, int(n**0.5) + 1):\n    if n % i == 0: return False\n  return True');
  
  const analysisA = React.useMemo(() => analyzeCode(codeA), [codeA]);
  const analysisB = React.useMemo(() => analyzeCode(codeB), [codeB]);

  const ecsA = analysisA.report.totalECS;
  const ecsB = analysisB.report.totalECS;
  const delta = ecsA - ecsB;
  const percent = ecsA > 0 ? ((delta / ecsA) * 100).toFixed(1) : '0';

  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6 font-mono shadow-2xl relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[80px] pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Leaf size={18} className="text-green-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-green-400">Green Analysis Diff</h2>
          </div>
          <span className="text-[10px] text-gray-500">Comparing: {analysisA.report.maxComplexity} vs {analysisB.report.maxComplexity}</span>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black border transition-all ${delta > 0 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
          {delta > 0 ? `+${percent}% CARBON REDUCTION` : `${Math.abs(Number(percent))}% ENERGY TAX`}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 h-[250px]">
        {/* Version A */}
        <div className="flex flex-col gap-2 group">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-gray-400 font-bold">VERSION_A ({analysisA.report.maxComplexity})</span>
            </div>
            <span className="text-[10px] font-mono text-[#ff7b72] tracking-tighter">{ecsA} ECS</span>
          </div>
          <div className="relative flex-1">
            <textarea 
              value={codeA} 
              onChange={(e) => setCodeA(e.target.value)}
              className="w-full h-full bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-[11px] text-gray-300 resize-none outline-none focus:border-red-500/50 transition-colors scrollbar-hide font-mono"
            />
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <Trash2 size={12} className="text-gray-600 hover:text-red-500 cursor-pointer" onClick={() => setCodeA('')} />
            </div>
          </div>
        </div>

        {/* Version B */}
        <div className="flex flex-col gap-2 group">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] text-gray-400 font-bold">VERSION_B ({analysisB.report.maxComplexity})</span>
            </div>
            <span className="text-[10px] font-mono text-green-500 tracking-tighter">{ecsB} ECS</span>
          </div>
          <div className="relative flex-1">
            <textarea 
              value={codeB} 
              onChange={(e) => setCodeB(e.target.value)}
              className="w-full h-full bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-[11px] text-gray-300 resize-none outline-none focus:border-green-500/50 transition-colors scrollbar-hide font-mono"
            />
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <Trash2 size={12} className="text-gray-600 hover:text-red-500 cursor-pointer" onClick={() => setCodeB('')} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-around bg-[#161b22]/50 p-6 rounded-2xl border border-[#30363d] backdrop-blur-sm relative">
        <div className="text-center">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold">Carbon Saved</div>
            <div className="text-3xl font-black text-green-500 flex items-baseline gap-1">
               {delta > 0 ? delta : 0}
               <span className="text-xs text-green-500/50">CO₂e</span>
            </div>
        </div>
        
        <div className="flex flex-col items-center gap-1 opacity-20">
           <Leaf size={20} className="text-green-400" />
           <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#30363d] to-transparent" />
        </div>

        <div className="text-center">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold">Green Score</div>
            <div className="text-3xl font-black text-blue-400 flex items-baseline gap-1">
              {delta > 0 ? percent : 0}
              <span className="text-xs text-blue-400/50">%</span>
            </div>
        </div>
        
        {/* Comparison Logic Summary */}
        <div className="absolute -bottom-10 left-0 right-0 flex justify-center">
          <div className="px-4 py-1.5 bg-[#21262d] border border-[#30363d] rounded-full text-[9px] text-gray-400 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-blue-500" />
            V-Model Comparison: {ecsA} ➔ {ecsB}
          </div>
        </div>
      </div>
    </div>
  );
};
