import { Terminal, Play, Code, ListChecks } from "lucide-react";
import { CyberPanel } from "./shared/Common";

export const PracticeStart = () => {
  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Intro Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-cyber font-black tracking-widest text-[var(--text-color)]">
          Protobuf Practice
        </h1>
        <p className="text-sm text-[var(--text-dim)] leading-relaxed max-w-lg mx-auto">
          Short schema exercises with live compiler feedback. Edit the proto,
          satisfy the checks, and move on to the next case.
        </p>
      </div>

      {/* How it Works Panel */}
      <CyberPanel title="WORKFLOW">
        <div className="space-y-4 p-2 text-xs leading-relaxed text-[var(--text-dim)]">
          <div className="flex gap-3">
            <Code className="w-5 h-5 text-[var(--cyber-neon-blue)] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[var(--text-color)] uppercase">
                1. Edit the schema
              </strong>
              <p className="mt-0.5">
                Work directly in a proto editor with the broken schema loaded.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Terminal className="w-5 h-5 text-[var(--cyber-neon-pink)] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[var(--text-color)] uppercase">
                2. Compile live
              </strong>
              <p className="mt-0.5">
                Syntax errors appear as you type, before the exercise checks
                run.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <ListChecks className="w-5 h-5 text-[var(--cyber-neon-green)] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[var(--text-color)] uppercase">
                3. Pass descriptor checks
              </strong>
              <p className="mt-0.5">
                The compiled descriptor is checked for the specific rule the
                exercise is teaching.
              </p>
            </div>
          </div>
        </div>
      </CyberPanel>

      {/* Concepts Tested */}
      <div className="p-4 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg space-y-3 text-xs">
        <span className="font-mono text-[var(--cyber-neon-blue)] uppercase tracking-wider font-bold block">
          Covered topics
        </span>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 list-disc list-inside text-[var(--text-dim)]">
          <li>Tag numbers & field styles</li>
          <li>Varint integer optimizations</li>
          <li>Compatibility & reserved tags</li>
          <li>Optionality & field presence</li>
          <li>Oneof groups & polymorphism</li>
          <li>Standard library imports</li>
        </ul>
      </div>

      {/* Start Button */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <a href="/practice/1/">
          <button className="px-8 py-3.5 font-cyber font-bold uppercase tracking-wider text-xs rounded bg-[var(--cyber-neon-blue)] text-[var(--neon-contrast-text)] border border-[var(--cyber-neon-blue)] shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_35px_rgba(0,243,255,0.8)] hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer">
            <Play className="w-3.5 h-3.5 fill-[var(--neon-contrast-text)] text-[var(--neon-contrast-text)]" />
            Start exercises
          </button>
        </a>
        <span className="text-[9px] font-mono text-[var(--text-dim)]/60 uppercase tracking-widest">
          8 exercises // about 15 minutes
        </span>
      </div>
    </div>
  );
};
