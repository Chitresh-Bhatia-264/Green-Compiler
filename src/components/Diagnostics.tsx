

import React from 'react';
import { EnergyMap } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, Download, ArrowRight, Zap, CloudLightning, Code2, GitMerge, Database } from 'lucide-react';

interface DiagnosticsProps {
  report: EnergyMap;
}

export const Diagnostics: React.FC<DiagnosticsProps> = ({ report }) => {
  const chartData = Object.entries(report.smellsDistribution).map(([name, value]) => ({ name, value }));
  
  // Fallback if no smells are found
  const displayData = chartData.length > 0 
    ? chartData 
    : [{ name: 'OPTIMAL', value: 1 }];
    
  const COLORS = ['#ff7b72', '#d2a8ff', '#79c0ff', '#ffa657', '#3fb950'];

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `lumina_energy_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-lg">
          <div className="text-[10px] text-gray-500 uppercase mb-1">Total ECS</div>
          <div className="text-xl md:text-2xl font-bold flex items-center text-[#ff7b72]">
            <Activity className="mr-2" size={24} />
            {report.totalECS}
          </div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-lg">
          <div className="text-[10px] text-gray-500 uppercase mb-1">Max Complexity</div>
          <div className="text-xl md:text-2xl font-bold flex items-center text-[#79c0ff]">
            <CloudLightning className="mr-2" size={24} />
            {report.maxComplexity}
          </div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-lg">
          <div className="text-[10px] text-gray-500 uppercase mb-1">Cyclomatic CC</div>
          <div className="text-xl md:text-2xl font-bold flex items-center text-[#d2a8ff]">
            <GitMerge className="mr-2" size={24} />
            {report.cyclomaticComplexity}
          </div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-lg">
          <div className="text-[10px] text-gray-500 uppercase mb-1" title="Algorithmic Effort (Bits)">Halstead Vol</div>
          <div className="text-xl md:text-2xl font-bold flex items-center text-[#a5d6ff]">
            <Database className="mr-2" size={24} />
            {report.halsteadVolume}
          </div>
        </div>
      </div>

      {/* Compiler Wisdom */}
      <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-lg">
        <div className="text-xs font-bold text-[#f78166] mb-3 flex items-center">
          <Code2 size={14} className="mr-2" />
          STATIC ANALYSIS HEURISTICS
        </div>
        <div className="space-y-2">
          {(report.maxComplexity as string).includes('N²') || (report.maxComplexity as string).includes('N³') ? (
            <div className="text-[10px] p-2 bg-red-500/5 border border-red-500/20 rounded text-red-200">
              <span className="font-bold text-red-400">CRITICAL:</span> Non-linear complexity detected. This algorithmic growth exceeds mobile battery discharge envelopes.
            </div>
          ) : (
            <div className="text-[10px] p-2 bg-green-500/5 border border-green-500/20 rounded text-green-200">
              <span className="font-bold text-green-400">PASSED:</span> Complexity is within acceptable linear bounds. Efficient IR mapping confirmed.
            </div>
          )}
          {report.functions.some(f => f.complexity === 'O(2^N)') && (
            <div className="text-[10px] p-2 bg-yellow-500/5 border border-yellow-500/20 rounded text-yellow-200">
              <span className="font-bold text-yellow-400">WARNING:</span> Recursive execution detected. Stack integrity monitoring is recommended for bare-metal targets.
            </div>
          )}
        </div>
      </div>

      {/* Smell Breakdown */}
      <div className="flex-1 bg-[#161b22] border border-[#30363d] p-4 rounded-lg flex flex-col">
        <div className="text-xs font-bold text-gray-400 mb-4 flex items-center">
          <Activity size={14} className="mr-2" />
          DISTRIBUTION BY CATEGORY
        </div>
        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {displayData.map((d, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={d.name === 'OPTIMAL' ? '#3fb950' : COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', fontSize: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          {displayData.map((d, i) => (
            <div key={d.name} className="flex items-center">
              <div 
                className="w-2 h-2 rounded-full mr-2" 
                style={{ backgroundColor: d.name === 'OPTIMAL' ? '#3fb950' : COLORS[i % COLORS.length] }} 
              />
              <span className="text-gray-400 uppercase">{d.name.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Panel */}
      <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-lg flex flex-col gap-3">
        <div className="text-xs font-bold text-[#79c0ff] flex items-center">
          <Zap size={14} className="mr-2" />
          ENERGY REWRITES
        </div>
        <div className="space-y-3">
          {report.optimizations.map(opt => (
            <div key={opt.id} className="p-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-[10px] group transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-[#c9d1d9]">{opt.type}</span>
              </div>
              <p className="text-gray-500 mb-2 leading-relaxed">{opt.description}</p>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-red-500/5 border border-red-500/10 p-1.5 rounded text-[8px] font-mono">
                  <div className="text-red-500 mb-1">BEFORE</div>
                  <div className="text-gray-500 line-through opacity-50 whitespace-pre">{opt.originalCode}</div>
                </div>
                <div className="bg-green-500/5 border border-green-500/10 p-1.5 rounded text-[8px] font-mono">
                  <div className="text-green-500 mb-1">AFTER</div>
                  <div className="text-gray-300 whitespace-pre">{opt.optimizedCode}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px]">
                <div className="flex items-center gap-2">
                   <span className="text-red-400 font-bold">{opt.originalECS}</span>
                   <ArrowRight size={10} className="text-gray-600" />
                   <span className="text-green-400 font-bold">{opt.optimizedECS} ECS</span>
                </div>
                <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded font-bold">-{Math.floor((1 - opt.optimizedECS/opt.originalECS) * 100)}%</span>
              </div>
            </div>
          ))}
          {report.optimizations.length === 0 && (
            <div className="text-center py-4 text-gray-600 italic text-[10px]">Current AST state is highly optimized.</div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-lg max-h-[300px] overflow-auto">
        <div className="text-xs font-bold text-gray-400 mb-4">CRITICAL FUNCTIONS</div>
        <div className="space-y-3">
          {report.functions.sort((a,b) => b.ecs - a.ecs).map(f => (
            <div key={f.name} className="flex flex-col p-2 hover:bg-[#1f242c] rounded border border-transparent hover:border-[#30363d] transition-all">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                   <span className="text-[#79c0ff] font-bold text-xs">{f.name}()</span>
                   <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded font-mono italic">{f.complexity}</span>
                </div>
                <span className="text-[10px] bg-[#ff7b7233] text-[#ff7b72] px-1.5 py-0.5 rounded font-mono">{f.ecs} ECS</span>
              </div>
              <div className="text-[10px] text-gray-500 italic flex items-start">
               <Zap size={10} className="mr-1 mt-0.5 text-yellow-500 shrink-0" />
               {f.suggestion}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={handleExport}
        className="w-full py-3 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg flex items-center justify-center font-bold text-sm transition-colors shadow-lg cursor-pointer"
      >
        <Download size={16} className="mr-2" />
        EXPORT ENERGY AUDIT
      </button>
    </div>
  );
};
