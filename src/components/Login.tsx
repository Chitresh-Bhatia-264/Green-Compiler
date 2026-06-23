

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Leaf, Cpu, Github, Mail, ArrowRight, ShieldCheck, Zap, Code2, Globe, Activity } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#0d1117] text-[#c9d1d9] font-sans selection:bg-[#238636] selection:text-white overflow-y-auto">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full h-16 border-b border-[#30363d] bg-[#0d1117]/80 backdrop-blur-md z-50 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#238636] rounded-md flex items-center justify-center shadow-lg shadow-green-900/20">
            <Leaf size={20} className="text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">LUMINA CLOUD</span>
        </div>
        <button 
          onClick={onLogin}
          className="px-5 py-2 text-xs font-bold bg-white text-black rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
        >
          Access Engine
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen text-center z-10">
        
        {/* Decorative Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-[#238636] rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-[#79c0ff] rounded-full blur-[120px] mix-blend-screen" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#238636]/10 border border-[#238636]/20 text-[#3fb950] text-xs font-mono mb-8">
            <Activity size={14} />
            <span>v1.0.0 ECOLOGICAL COMPILER LIVE</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-tight max-w-4xl">
            Compile for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3fb950] to-[#2ea043]">Planet.</span><br />
            Optimize for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#79c0ff] to-[#a5d6ff]">Performance.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
            The world's first static analysis engine that weighs Python code by energy consumption and carbon footprint. Treat Joules as a first-class citizen in your CI/CD pipeline.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md">
            <button 
              onClick={onLogin}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="w-full sm:w-auto px-8 py-4 bg-[#238636] hover:bg-[#2ea043] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all group cursor-pointer shadow-lg shadow-[#238636]/20"
            >
              Start Analyzing
              <motion.div animate={{ x: isHovered ? 5 : 0 }}>
                <ArrowRight size={18} />
              </motion.div>
            </button>
            <button 
              onClick={onLogin}
              className="w-full sm:w-auto px-8 py-4 bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Github size={18} />
              Sign in with GitHub
            </button>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full relative z-10 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl hover:border-[#8b949e] transition-colors"
          >
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 text-blue-400">
              <Code2 size={24} />
            </div>
            <h3 className="text-white font-bold mb-2 text-lg">Energy Weighted AST</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Every node in your Abstract Syntax Tree is evaluated for its CPU wake-cycle cost, giving you pinpoint accuracy on power drain.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl hover:border-[#8b949e] transition-colors"
          >
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 text-green-400">
              <Leaf size={24} />
            </div>
            <h3 className="text-white font-bold mb-2 text-lg">Carbon Reduction Engine</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Automatically recommends architectural refactors like loop-flattening and I/O hoisting to minimize carbon footprint.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 bg-[#161b22] border border-[#30363d] rounded-2xl hover:border-[#8b949e] transition-colors"
          >
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 text-purple-400">
              <Globe size={24} />
            </div>
            <h3 className="text-white font-bold mb-2 text-lg">Enterprise Scale Metrics</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Built-in Cyclomatic Complexity and Halstead Volume calculations ready for major tech company compliance audits.
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#30363d] bg-[#161b22] py-8 text-center text-sm text-gray-500 relative z-10">
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#3fb950]" />
            SOC2 COMPLIANT
          </div>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-yellow-500" />
            REAL-TIME SYNC
          </div>
        </div>
        <p>© {new Date().getFullYear()} Lumina Cloud. Green Compiler Open Source Initiative.</p>
      </footer>
    </div>
  );
};
