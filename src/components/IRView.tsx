
import React from 'react';
import { IRInstruction, EnergySmell } from '../types';
import { Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface IRViewProps {
  instructions: IRInstruction[];
}

export const IRView: React.FC<IRViewProps> = ({ instructions }) => {
  const getIntensity = (ecs: number) => {
    return Math.min(ecs / 150, 1);
  };

  return (
    <div className="h-full overflow-auto bg-[#0d1117] border border-[#30363d] rounded-lg p-4 font-mono text-xs">
      <div className="text-[10px] uppercase text-gray-500 mb-4 tracking-widest flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
          Three-Address Code (TAC) IR
        </div>
        <div className="text-gray-600">v1.2.0-alpha</div>
      </div>
      
      <table className="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr className="text-gray-600 border-b border-[#30363d]">
            <th className="pb-2 font-mono font-normal text-[10px] border-b border-[#30363d] pb-3">ADDR</th>
            <th className="pb-2 font-mono font-normal text-[10px] border-b border-[#30363d] pb-3">OPCODE</th>
            <th className="pb-2 font-mono font-normal text-[10px] border-b border-[#30363d] pb-3">TARGET</th>
            <th className="pb-2 font-mono font-normal text-[10px] border-b border-[#30363d] pb-3">OPERAND</th>
            <th className="pb-2 font-mono font-normal text-[10px] border-b border-[#30363d] pb-3 text-center">BIG_O</th>
            <th className="pb-2 font-mono font-normal text-[10px] border-b border-[#30363d] pb-3 text-right">COST_ECS</th>
          </tr>
        </thead>
        <tbody>
          {instructions.map((inst, i) => (
            <tr key={i} className="group hover:bg-[#1c2128] transition-colors">
              <td className="py-2 text-[10px] text-gray-500 border-b border-[#161b22]">[{inst.line.toString().padStart(3, '0')}]</td>
              <td className="py-2 text-[#ff7b72] font-bold border-b border-[#161b22]">{inst.op}</td>
              <td className="py-2 text-[#79c0ff] border-b border-[#161b22]">{inst.target}</td>
              <td className="py-2 text-[#d2a8ff] border-b border-[#161b22]">{inst.arg1 || '-'}</td>
              <td className="py-2 text-center text-[#8b949e] border-b border-[#161b22] font-xs italic">{inst.complexity || '-'}</td>
              <td className="py-2 text-right border-b border-[#161b22]">
                <div className="flex items-center justify-end gap-1">
                  <span className="font-bold" style={{ color: `hsl(${120 - (getIntensity(inst.ecs) * 120)}, 90%, 50%)` }}>
                    {inst.ecs > 0 ? `+${inst.ecs}` : '0'}
                  </span>
                  {inst.smell !== EnergySmell.NONE && (
                     <Zap size={10} className="text-yellow-400 fill-current" />
                  )}
                </div>
              </td>
            </tr>
          ))}
          {instructions.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-600 italic">No IR generated. Start typing...</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
