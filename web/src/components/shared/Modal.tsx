import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-10 lg:inset-20 z-[160] bg-[var(--panel-bg)] border border-[var(--border-light)] shadow-2xl flex flex-col rounded-xl overflow-hidden"
          >
            <div className="h-[64px] flex items-center justify-between px-6 border-b border-[var(--border-light)] bg-[var(--bg-color)]/50 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--cyber-neon-blue)]/10 rounded border border-[var(--cyber-neon-blue)]/30 flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-[var(--cyber-neon-blue)]" />
                </div>
                <span className="font-cyber font-bold text-[var(--cyber-neon-blue)] text-sm tracking-[0.2em] uppercase">
                  {title}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[var(--text-dim)] hover:text-[var(--text-color)] hover:bg-[var(--overlay-bg)] rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-6 bg-[var(--bg-color)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
