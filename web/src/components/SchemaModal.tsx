import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileCode } from 'lucide-react';
import { SyntaxHighlighter } from '../App';

const SchemaEditor = ({ value, onChange, errors }: { value: string, onChange: (s: string) => void, errors: CompilationError[] }) => {
  const [scroll, setScroll] = React.useState({ top: 0, left: 0 });

  return (
    <div className="relative w-full h-[500px] bg-black/20 rounded overflow-hidden">
      {/* Background Highlight Layer */}
      <div
        className="absolute top-0 left-0 p-4 font-mono text-sm leading-6 whitespace-pre pointer-events-none select-none"
        style={{
          transform: `translate(-${scroll.left}px, -${scroll.top}px)`,
          width: 'max-content',
          minWidth: '100%'
        }}
      >
        <SyntaxHighlighter language="proto" code={value} />
        {/* Error markers overlay */}
        <div className="absolute inset-0 pointer-events-none p-4">
          {value.split('\n').map((line, i) => {
            const error = errors.find(e => e.line === i + 1);
            if (!error) return <div key={i} className="h-6">{''}</div>;

            const col = Math.max(0, error.col - 1);
            return (
              <div key={i} className="h-6 relative">
                <div className="absolute -left-4 right-0 h-6 bg-red-500/10 border-l-2 border-red-500" style={{ width: 'calc(100% + 1000px)' }} />
                <span className="invisible">{line.slice(0, col)}</span>
                <motion.span
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-block h-5 w-[1ch] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] rounded-sm relative z-10"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Foreground Interactive Layer */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => setScroll({ top: e.currentTarget.scrollTop, left: e.currentTarget.scrollLeft })}
        spellCheck="false"
        className="absolute inset-0 w-full h-full p-4 font-mono text-sm leading-6 text-transparent caret-white resize-none outline-none bg-transparent whitespace-pre overflow-auto"
        style={{ color: 'transparent' }}
      />
    </div>
  );
};
import { type CompilationError } from '../utils/wasm-parser';

export const SchemaModal = ({
  isOpen,
  onClose,
  protoSource,
  setProtoSource,
  errors
}: {
  isOpen: boolean;
  onClose: () => void;
  protoSource: string;
  setProtoSource: (s: string) => void;
  errors: CompilationError[];
}) => {
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-4xl bg-[#0a0a0a] border border-[#00f3ff]/30 rounded-xl shadow-[0_0_50px_rgba(0,243,255,0.1)] overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-[#00f3ff]" />
                <h3 className="font-cyber font-bold text-white uppercase tracking-widest text-sm">
                  SCHEMA_EDITOR
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {errors.length > 0 && (
                <div className="mb-4 space-y-2">
                  {errors.map((err, i) => (
                    <div key={i} className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-mono">
                      [LINE {err.line}] {err.message}
                    </div>
                  ))}
                </div>
              )}
              <div className="border border-white/10 rounded overflow-hidden">
                <SchemaEditor value={protoSource} onChange={setProtoSource} errors={errors} />
              </div>
              <p className="text-xs text-slate-500 italic mt-4">
                Changes made here will instantly update the schema registry and reflect across all demonstrations on the page.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
