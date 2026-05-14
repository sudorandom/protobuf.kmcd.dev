import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Info,
  Terminal,
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react';

import { SectionIdContext } from './SectionIdContext';

export const TechnicalNuance = ({ children, title = "TECHNICAL_NUANCE" }: { children: React.ReactNode, title?: string }) => (
  <div className="bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/30 rounded-lg p-4 flex gap-4 items-start animate-in fade-in slide-in-from-top-1">
    <div className="p-2 bg-[var(--cyber-neon-blue)]/20 rounded-md">
      <Info className="w-5 h-5 text-[var(--cyber-neon-blue)]" />
    </div>
    <div className="space-y-1">
      <span className="text-xs font-mono text-[var(--cyber-neon-blue)] uppercase tracking-[0.2em] font-bold">{title}</span>
      <div className="text-sm text-[var(--text-color)] leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

export const Section = ({ id, children, className, style }: { id: string, children: React.ReactNode, className?: string, style?: React.CSSProperties }) => (
  <SectionIdContext.Provider value={id}>
    <section id={id} className={className} style={style}>
      {children}
    </section>
  </SectionIdContext.Provider>
);

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const HexViewer = ({ bytes }: { bytes: { val: string, raw: number }[] }) => {
  const chunks = [];
  for (let i = 0; i < bytes.length; i += 8) {
    chunks.push(bytes.slice(i, i + 8));
  }

  return (
    <div className="font-mono text-xs text-[var(--text-dim)] bg-[var(--section-bg-dark)] p-4 rounded border border-[var(--border-light)] space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-[60px_max-content_1fr] gap-8 pb-2 border-b border-[var(--border-light)] opacity-80 mb-2">
        <span>OFFSET</span>
        <span>HEX</span>
        <span>ASCII</span>
      </div>
      {chunks.map((chunk, i) => (
        <div key={i} className="grid grid-cols-[60px_max-content_1fr] gap-8 group hover:bg-[var(--overlay-bg)]">
          <span className="opacity-80">{(i * 8).toString(16).padStart(4, '0')}</span>
          <span className="text-[var(--cyber-neon-green)]/80">
            {chunk.map(b => b.val).join(' ').padEnd(23, ' ')}
          </span>
          <span className="text-[var(--text-color)]">
            {chunk.map(b => (b.raw >= 32 && b.raw <= 126 ? String.fromCharCode(b.raw) : '.')).join('')}
          </span>
        </div>
      ))}
    </div>
  );
};

export const SyntaxHighlighter = ({ code, language, wrap = false }: { code: string, language: 'proto' | 'json' | null, wrap?: boolean }) => {
  const highlight = (text: string) => {
    if (!text) return '';
    let output = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const placeholders: string[] = [];

    const push = (val: string) => {
      const id = `__PH_${placeholders.length}__`;
      placeholders.push(val);
      return id;
    };

    if (language === 'json') {
      output = output.replace(/"([^"]+)":/g, (_, p1) => push(`<span class="text-[var(--cyber-neon-blue)]">"${p1}"</span>`) + ':');
      output = output.replace(/: "([^"]+)"/g, (_, p1) => ': ' + push(`<span class="text-[var(--cyber-neon-green)]">"${p1}"</span>`));
      output = output.replace(/: (-?\d+\.?\d*)/g, (_, p1) => ': ' + push(`<span class="text-[var(--cyber-neon-pink)]">${p1}</span>`));
      output = output.replace(/: (true|false)/g, (_, p1) => ': ' + push(`<span class="text-[var(--cyber-neon-pink)]">${p1}</span>`));
    } else if (language === 'proto') {
      output = output.replace(/\/\/.*$/gm, (match) => push(`<span class="text-[var(--text-dim)]">${match}</span>`));
      output = output.replace(/"([^"]+)"/g, (match) => push(`<span class="text-[var(--cyber-neon-green)]">${match}</span>`));
      output = output.replace(/\b(message|enum|syntax|package|import|option|returns|rpc|service)\b/g, (match) => push(`<span class="text-[var(--cyber-neon-pink)]">${match}</span>`));
      output = output.replace(/\b(string|uint32|int32|bool|float|double|bytes|fixed32|fixed64|sint32|sint64)\b/g, (match) => push(`<span class="text-[var(--cyber-neon-blue)]">${match}</span>`));
      output = output.replace(/= (\d+)/g, (_, p1) => '= ' + push(`<span class="text-[var(--text-color)]">${p1}</span>`));
    }

    for (let i = placeholders.length - 1; i >= 0; i--) {
      output = output.replace(`__PH_${i}__`, placeholders[i]);
    }
    return output;
  };

  return (
    <pre
      className={`font-mono text-sm leading-6 m-0 ${wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'}`}
      dangerouslySetInnerHTML={{ __html: highlight(code) }}
    />
  );
};

export const ExternalLinkText = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-[var(--cyber-neon-blue)] hover:underline inline-flex items-center gap-0.5 group"
  >
    {children}
    <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition-opacity" />
  </a>
);

export const SectionTitle = ({ children, icon: Icon, subtitle }: { children: React.ReactNode, icon: React.ElementType, subtitle?: string }) => {
  const sectionId = React.useContext(SectionIdContext);
  return (
    <div className="flex flex-col mb-12">
      <div className="flex items-center gap-3 md:gap-4 mb-2">
        <div className="p-2 bg-[var(--cyber-neon-blue)]/10 rounded-lg border border-[var(--cyber-neon-blue)]/20 shrink-0">
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-[var(--cyber-neon-blue)]" />
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-cyber font-bold tracking-tight text-[var(--text-color)] uppercase break-words min-w-0 relative group/title">
          <a href={sectionId ? `#${sectionId}` : '#'} className="hover:text-[var(--cyber-neon-blue)] transition-colors">
            {children}
            <LinkIcon className="w-4 h-4 inline-block ml-2 opacity-0 group-hover/title:opacity-80 transition-opacity" />
          </a>
        </h2>
      </div>
      {subtitle && <p className="text-[var(--text-dim)] font-mono text-xs md:text-sm uppercase tracking-widest ml-11 md:ml-14">{subtitle}</p>}
    </div>
  );
};

export const CyberPanel = ({ children, title, className = "", headerExtra }: { children: React.ReactNode, title?: string, className?: string, headerExtra?: React.ReactNode }) => (
  <div className={`cyber-box cyber-panel ${className}`}>
    {title && (
      <div className="flex flex-wrap items-center justify-between mb-4 border-b border-[var(--cyber-neon-blue)]/20 pb-2 gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[var(--cyber-neon-blue)] shrink-0" />
          <span className="text-xs sm:text-xs font-mono text-[var(--cyber-neon-blue)] uppercase tracking-tighter truncate max-w-[150px] sm:max-w-none">{title}</span>
        </div>
        {headerExtra}
      </div>
    )}
    {children}
  </div>
);
