import React from 'react';
import { motion } from 'motion/react';
import { OptimizationSuggestion } from '../types';
import { GitCommit, Zap, ArrowRight, CheckCircle2, Box, Cpu, Code } from 'lucide-react';

interface OptimizationPipelineProps {
  optimizations: OptimizationSuggestion[];
}

export const OptimizationPipeline: React.FC<OptimizationPipelineProps> = ({ optimizations }) => {
  const stages = [
    { name: 'Lexical Analysis', desc: 'Token generation', icon: Code },
    { name: 'Syntax Analysis', desc: 'AST Construction', icon: Box },
    { name: 'Semantic Analysis', desc: 'Energy Weighting', icon: Cpu },
    { name: 'Optimization Passes', desc: 'Transformations', icon: Zap, active: true },
    { name: 'IR Generation', desc: '3-Address Code', icon: GitCommit },
  ];

  return (
    <div className="h-full flex flex-col p-4 bg-[#0d1117] overflow-y-auto scrollbar-hide text-sm">
      {/* Pipeline Visualizer */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Compiler Optimization Pipeline</h2>
        <div className="flex items-start justify-between relative px-2">
          <div className="absolute top-5 left-10 right-10 h-0.5 bg-[#30363d] -z-10" />
          {stages.map((stage, idx) => (
             <div key={idx} className="flex flex-col items-center text-center gap-3 z-10 w-24">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${stage.active ? 'bg-[#238636] text-white shadow-[0_0_15px_rgba(35,134,54,0.5)]' : 'bg-[#161b22] border border-[#30363d] text-gray-500'}`}>
                   <stage.icon size={18} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`text-[10px] leading-tight font-bold ${stage.active ? 'text-[#3fb950]' : 'text-gray-400'}`}>{stage.name}</span>
                  <span className="text-[9px] leading-tight text-gray-600 hidden md:block">{stage.desc}</span>
                </div>
             </div>
          ))}
        </div>
      </div>

      {/* Applied Passes */}
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Zap size={14} className="text-yellow-500" />
        Applied Optimization Passes
      </h2>
      
      {optimizations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-2 border border-dashed border-[#30363d] rounded-xl p-8">
          <CheckCircle2 size={32} className="text-green-500/50" />
          <span className="text-xs">No optimizations required. AST is energy-efficient.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {optimizations.map((opt, i) => (
            <motion.div 
              key={opt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 blur-[40px] pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold rounded uppercase tracking-wider border border-yellow-500/20">
                    {opt.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-400">Line {opt.line}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                   <span className="text-red-400">{opt.originalECS} ECS</span>
                   <ArrowRight size={12} className="text-gray-600" />
                   <span className="text-green-400 font-bold">{opt.optimizedECS} ECS</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-400">{opt.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                 <div className="bg-[#0d1117] rounded-lg p-3 border border-[#30363d] relative">
                    <span className="absolute -top-2.5 left-2 px-1 bg-[#0d1117] text-[9px] font-bold text-red-500">AST_BEFORE</span>
                    <pre className="text-[10px] text-gray-500 font-mono mt-1 opacity-75 whitespace-pre-wrap">{opt.originalCode}</pre>
                 </div>
                 <div className="bg-[#0d1117] rounded-lg p-3 border border-[#30363d] relative">
                    <span className="absolute -top-2.5 left-2 px-1 bg-[#0d1117] text-[9px] font-bold text-green-500">AST_AFTER</span>
                    <pre className="text-[10px] text-green-400 font-mono mt-1 whitespace-pre-wrap">{opt.optimizedCode}</pre>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};