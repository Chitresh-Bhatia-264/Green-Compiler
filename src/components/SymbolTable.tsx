import React from 'react';
import { SymbolEntry } from '../types';
import { Database, AlertTriangle } from 'lucide-react';

interface SymbolTableProps {
  symbols: SymbolEntry[];
}

export const SymbolTable: React.FC<SymbolTableProps> = ({ symbols }) => {
  return (
    <div className="h-full overflow-auto bg-[#0d1117] border border-[#30363d] rounded-lg p-4 font-mono text-xs">
      <div className="text-[10px] uppercase text-gray-500 mb-4 tracking-widest flex items-center justify-between">
        <div className="flex items-center">
          <Database size={14} className="text-purple-500 mr-2" />
          Semantic Analysis: Symbol Table
        </div>
        <div className="text-gray-600">O(1) Hash Map</div>
      </div>
      
      <table className="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr className="text-gray-600 border-b border-[#30363d]">
            <th className="pb-2 font-mono font-normal text-[10px] border-b border-[#30363d] pb-3">IDENTIFIER</th>
            <th className="pb-2 font-mono font-normal text-[10px] border-b border-[#30363d] pb-3">SCOPE</th>
            <th className="pb-2 font-mono font-normal text-[10px] border-b border-[#30363d] pb-3">ROLE</th>
            <th className="pb-2 font-mono font-normal text-[10px] border-b border-[#30363d] pb-3">LINE</th>
            <th className="pb-2 font-mono font-normal text-[10px] border-b border-[#30363d] pb-3 text-center">REFERENCES (R/W)</th>
            <th className="pb-2 font-mono font-normal text-[10px] border-b border-[#30363d] pb-3 text-right">LIVENESS</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((sym, i) => {
            const isDead = sym.role === 'Variable' && sym.reads === 0 && sym.writes > 0;
            
            return (
              <tr key={i} className={`group hover:bg-[#1c2128] transition-colors ${isDead ? 'bg-red-500/5' : ''}`}>
                <td className={`py-2 font-bold border-b border-[#161b22] ${sym.role === 'Function' ? 'text-[#79c0ff]' : 'text-[#ff7b72]'}`}>{sym.name}</td>
                <td className="py-2 text-[#d2a8ff] border-b border-[#161b22]">{sym.scope}</td>
                <td className="py-2 text-gray-400 border-b border-[#161b22]">{sym.role}</td>
                <td className="py-2 text-[10px] text-gray-500 border-b border-[#161b22]">[{sym.line}]</td>
                <td className="py-2 text-center text-[#8b949e] border-b border-[#161b22]">
                  <span className="text-green-400">{sym.reads}</span> / <span className="text-orange-400">{sym.writes}</span>
                </td>
                <td className="py-2 text-right border-b border-[#161b22]">
                  {isDead ? (
                    <span className="inline-flex items-center text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                      <AlertTriangle size={10} className="mr-1" /> DEAD
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-green-400">ACTIVE</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};