

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ASTNode } from '../types';
import { ChevronRight, ChevronDown, Activity, Zap } from 'lucide-react';

interface ASTVisualizerProps {
  node: ASTNode;
}

const TreeNode: React.FC<{ node: ASTNode; depth: number }> = ({ node, depth }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const getHeatColor = (score: number) => {
    const heat = Math.min(score / 1500, 1);
    const hue = 120 - (heat * 120);
    return `hsl(${hue}, 70%, 40%)`;
  };

  const getLabelColor = (type: string) => {
    switch (type) {
      case 'Loop': return '#d2a8ff';
      case 'IOCall': return '#ffa657';
      case 'MemoryAccess': return '#79c0ff';
      case 'FunctionDef': return '#ff7b72';
      default: return '#8b949e';
    }
  };

  return (
    <div className="ml-4">
      <div 
        className="flex items-center py-1 px-2 hover:bg-[#1f242c] rounded cursor-pointer group transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="w-4 h-4 mr-1 text-gray-500">
          {hasChildren ? (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : null}
        </span>
        <span className="text-sm font-bold mr-2 uppercase tracking-tighter" style={{ fontSize: '10px', color: getLabelColor(node.type) }}>{node.type}</span>
        <span className="text-[#c9d1d9] text-xs truncate max-w-[150px]">{node.value}</span>
        {node.complexity && (
          <span className={`ml-2 text-[8px] px-1 rounded font-mono font-bold border ${
            node.complexity.includes('N²') || node.complexity.includes('2^N') || node.complexity.includes('N³') 
              ? 'bg-red-500/10 text-red-500 border-red-500/20' 
              : 'bg-green-500/10 text-green-500 border-green-500/20'
          }`}>
            {node.complexity}
          </span>
        )}
        
        <div className="ml-auto flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
           <motion.div 
             animate={{ scale: node.energyScore > 100 ? [1, 1.1, 1] : 1 }}
             transition={{ repeat: Infinity, duration: 1.5 }}
             className="px-1.5 py-0.5 rounded text-[9px] font-mono flex items-center"
             style={{ backgroundColor: getHeatColor(node.energyScore) }}
           >
             <Activity size={10} className="mr-1" />
             {node.energyScore}
           </motion.div>
           {node.smell && (
             <Zap size={12} className="ml-2 text-yellow-400 fill-current animate-pulse" />
           )}
        </div>
      </div>
      
      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {node.children.map(child => (
              <TreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ASTVisualizer: React.FC<ASTVisualizerProps> = ({ node }) => {
  return (
    <div className="h-full overflow-auto bg-[#0d1117] border border-[#30363d] rounded-lg p-4 font-mono">
      <div className="text-[10px] uppercase text-gray-500 mb-4 tracking-widest flex items-center">
        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
        Abstract Syntax Tree
      </div>
      <TreeNode node={node} depth={0} />
    </div>
  );
};
