import React, { useState } from 'react';
import { SyntaxHighlighter } from './Common';

export const JsonEditor = ({ value, onChange, className = "h-80" }: { value: string, onChange: (s: string) => void, className?: string }) => {
  const [scroll, setScroll] = useState({ top: 0, left: 0 });

  return (
    <div className={`relative w-full ${className} bg-[var(--overlay-bg)] rounded overflow-hidden`}>
      {/* Background Highlight Layer */}
      <div
        className="absolute top-0 left-0 p-4 font-mono text-sm leading-6 whitespace-pre pointer-events-none select-none"
        style={{
          transform: `translate(-${scroll.left}px, -${scroll.top}px)`,
          width: 'max-content',
          minWidth: '100%'
        }}
      >
        <SyntaxHighlighter language="json" code={value} />
      </div>

      {/* Foreground Interactive Layer */}
      <textarea
        className="absolute inset-0 w-full h-full bg-transparent p-4 font-mono text-sm leading-6 text-transparent caret-white focus:outline-none focus:border-[var(--cyber-neon-blue)]/80 resize-none whitespace-pre overflow-auto custom-scrollbar border-none shadow-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => setScroll({ top: e.currentTarget.scrollTop, left: e.currentTarget.scrollLeft })}
        spellCheck={false}
      />
    </div>
  );
};
