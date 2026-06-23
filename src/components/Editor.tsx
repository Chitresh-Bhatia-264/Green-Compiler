

import React from 'react';
import { motion } from 'motion/react';
import { Token } from '../types';

interface EditorProps {
  value: string;
  onChange: (val: string) => void;
  lineScores: Record<number, number>;
  tokens: Token[];
}

export const Editor: React.FC<EditorProps> = ({ value, onChange, lineScores, tokens }) => {
  const lines = value.split('\n');

  const getHeatColor = (score: number) => {
    if (score === 0) return 'transparent';
    const heat = Math.min(score / 1500, 1); // Normalize to 0-1500
    // HSL: 120 (green) to 0 (red)
    const hue = 120 - (heat * 120);
    return `hsl(${hue}, 90%, 50%)`;
  };

  const getLineGlow = (score: number) => {
    if (score < 100) return 'transparent';
    const intensity = Math.min((score - 100) / 500, 0.15);
    return `rgba(255, 123, 114, ${intensity})`;
  };

  return (
    <div className="flex bg-[#0d1117] h-full overflow-hidden border border-[#30363d] rounded-xl font-mono shadow-inner group">
      {/* Gutter */}
      <div className="w-12 bg-[#161b22] border-r border-[#30363d] flex flex-col pt-4 select-none">
        {lines.map((_, i) => (
          <div key={i} className="h-6 flex items-center justify-end px-2 text-[10px] text-gray-600 relative">
            <span className="z-10">{i + 1}</span>
            <motion.div 
              initial={false}
              animate={{ 
                backgroundColor: getHeatColor(lineScores[i + 1] || 0),
                width: (lineScores[i+1] || 0) > 0 ? (Math.min((lineScores[i+1] || 0) / 10, 4) + 'px') : '1px'
              }}
              className="absolute right-0 top-0 bottom-0 opacity-80"
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        ))}
      </div>

      {/* Text Area + Overlay */}
      <div className="flex-1 relative overflow-auto pt-4 cursor-text bg-[#0d1117]">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="absolute inset-0 w-full h-full p-0 px-4 bg-transparent text-transparent caret-white resize-none outline-none z-20 leading-6 whitespace-pre font-mono"
          style={{ height: `${lines.length * 24}px` }}
        />
        <div className="absolute inset-0 px-4 leading-6 pointer-events-none whitespace-pre z-10" aria-hidden="true">
          {lines.map((line, i) => (
            <div 
              key={i} 
              className="h-6 flex items-center transition-colors duration-500"
              style={{ backgroundColor: getLineGlow(lineScores[i + 1] || 0) }}
            >
              <span className="text-[#c9d1d9]">{line || ' '}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
