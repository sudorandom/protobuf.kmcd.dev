import { useState } from "react";
import { motion } from "framer-motion";
import { SyntaxHighlighter } from "./Common";
import { type CompilationError } from "../../utils/wasm-parser";

export const SchemaEditor = ({
  value,
  onChange,
  errors,
}: {
  value: string;
  onChange: (s: string) => void;
  errors: CompilationError[];
}) => {
  const [scroll, setScroll] = useState({ top: 0, left: 0 });

  return (
    <div className="relative w-full h-full bg-[var(--overlay-bg)] rounded overflow-hidden">
      {/* Background Highlight Layer */}
      <div
        className="absolute top-0 left-0 p-4 font-mono text-sm leading-6 whitespace-pre pointer-events-none select-none"
        style={{
          transform: `translate(-${scroll.left}px, -${scroll.top}px)`,
          width: "max-content",
          minWidth: "100%",
        }}
      >
        <SyntaxHighlighter language="proto" code={value} />
        {/* Error markers overlay */}
        <div className="absolute inset-0 pointer-events-none p-4">
          {(value || "").split("\n").map((line, i) => {
            const error = errors.find((e) => e.line === i + 1);
            if (!error)
              return (
                <div key={i} className="h-6">
                  {""}
                </div>
              );

            const col = Math.max(0, error.col - 1);
            return (
              <div key={i} className="h-6 relative">
                <div
                  className="absolute -left-4 right-0 h-6 bg-[var(--text-error)]/10 border-l-2 border-[var(--text-error)]"
                  style={{ width: "calc(100% + 1000px)" }}
                />
                <span className="invisible">{line.slice(0, col)}</span>
                <motion.span
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-block h-5 w-[1ch] bg-[var(--text-error)] shadow-[0_0_8px_rgba(239,68,68,0.8)] rounded-sm relative z-10"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Foreground Interactive Layer */}
      <textarea
        className="absolute inset-0 w-full h-full bg-transparent p-4 font-mono text-sm leading-6 text-transparent caret-white focus:outline-none focus:border-[var(--cyber-neon-blue)]/80 resize-none whitespace-pre overflow-auto custom-scrollbar border-none shadow-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) =>
          setScroll({
            top: e.currentTarget.scrollTop,
            left: e.currentTarget.scrollLeft,
          })
        }
        spellCheck={false}
        aria-label="Protobuf Schema Editor"
        aria-invalid={errors.length > 0}
      />
    </div>
  );
};
