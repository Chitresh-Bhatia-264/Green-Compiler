

import React from 'react';
import { Token, TokenType } from '../types';
import { motion } from 'motion/react';

interface TokenTapeProps {
  tokens: Token[];
}

export const TokenTape: React.FC<TokenTapeProps> = ({ tokens }) => {
  const getColor = (type: TokenType) => {
    switch (type) {
      case TokenType.KEYWORD: return '#ff7b72';
      case TokenType.IDENTIFIER: return '#79c0ff';
      case TokenType.LITERAL: return '#a5d6ff';
      case TokenType.OPERATOR: return '#d2a8ff';
      case TokenType.DELIMITER: return '#8b949e';
      case TokenType.IO_CALL: return '#ffa657';
      case TokenType.LOOP_START: return '#ff7b72';
      case TokenType.FUNC_DEF: return '#ff7b72';
      default: return '#c9d1d9';
    }
  };

  return (
    <div className="h-full bg-[#0d1117] border border-[#30363d] rounded-lg p-4 font-mono overflow-auto flex flex-col">
       <div className="text-[10px] uppercase text-gray-500 mb-4 tracking-widest flex items-center">
        <div className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
        Lexical Token Stream
      </div>
      <div className="flex flex-wrap gap-2">
        {tokens.map((token, i) => (
          <motion.div
            key={`${token.value}-${i}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.01, duration: 0.2 }}
            className="px-2 py-1 rounded text-[10px] flex flex-col border border-white/5"
            style={{ backgroundColor: `${getColor(token.type)}15`, borderColor: `${getColor(token.type)}30` }}
          >
            <span style={{ color: getColor(token.type) }} className="font-bold">{token.type}</span>
            <span className="text-white opacity-80">{token.value || 'EOF'}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
