import React from 'react';
import { Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export const CyberSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-4">
      <div className="relative flex items-center justify-center w-16 h-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[var(--cyber-neon-blue)] opacity-50 shadow-[0_0_15px_rgba(0,243,255,0.5)]"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border-b-2 border-l-2 border-[var(--cyber-neon-pink)] opacity-50 shadow-[0_0_15px_rgba(255,0,255,0.5)]"
        />
        <Cpu className="w-6 h-6 text-[var(--cyber-neon-blue)] animate-pulse" />
      </div>
      <div className="font-mono text-sm tracking-[0.2em] text-[var(--cyber-neon-blue)] uppercase animate-pulse">
        Loading_
      </div>
    </div>
  );
};
