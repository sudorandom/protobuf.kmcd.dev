import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { trackEvent } from "../utils/analytics";
import { CyberPanel } from "./shared/Common";

export const ZigZagExplainer = () => {
  const [inputValue, setInputValue] = useState("-1");

  const rawValue = (() => {
    try {
      if (inputValue === "" || inputValue === "-") return 0n;
      return BigInt(inputValue);
    } catch {
      return 0n;
    }
  })();

  const handleAdjust = (delta: bigint) => {
    const newValue = rawValue + delta;
    setInputValue(newValue.toString());
  };

  const toZigZag = (n: bigint) => {
    return (n << 1n) ^ (n >> 63n);
  };

  const zzValue = toZigZag(rawValue);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="zigzag-input"
          className="text-sm font-mono text-[var(--text-dim)] uppercase tracking-widest"
        >
          Signed Input
        </label>
        <div className="flex gap-2">
          <input
            id="zigzag-input"
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || val === "-" || /^-?\d+$/.test(val)) {
                setInputValue(val);
              }
            }}
            onBlur={() =>
              trackEvent("zigzag_explainer_interact", { value: inputValue })
            }
            className="bg-[var(--section-bg-dark)] border border-[var(--cyber-neon-pink)]/30 rounded p-4 font-cyber text-2xl text-[var(--cyber-neon-pink)] focus:outline-none focus:border-[var(--cyber-neon-pink)] flex-1 min-w-0"
          />
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => handleAdjust(-1n)}
              className="p-4 bg-[var(--overlay-bg)] border border-[var(--cyber-neon-pink)]/30 rounded text-[var(--cyber-neon-pink)] hover:bg-[var(--cyber-neon-pink)]/10 transition-colors"
              aria-label="Decrement value"
            >
              <Minus className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleAdjust(1n)}
              className="p-4 bg-[var(--overlay-bg)] border border-[var(--cyber-neon-pink)]/30 rounded text-[var(--cyber-neon-pink)] hover:bg-[var(--cyber-neon-pink)]/10 transition-colors"
              aria-label="Increment value"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <CyberPanel title="ZIGZAG_TRANSFORMATION">
        <div className="p-6 space-y-10">
          <div className="flex flex-col md:flex-row items-center justify-around gap-8">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-mono text-[var(--text-dim)] uppercase">
                Original Signed
              </span>
              <div className="text-4xl font-cyber font-bold text-[var(--text-color)]">
                {rawValue.toString()}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="text-[var(--cyber-neon-pink)] text-2xl font-bold animate-pulse">
                →
              </div>
              <div className="text-[10px] font-mono text-[var(--text-dim)] uppercase bg-[var(--overlay-bg)] px-2 py-1 rounded border border-[var(--border-light)]">
                (n &lt;&lt; 1) ^ (n &gt;&gt; 63)
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-mono text-[var(--text-dim)] uppercase">
                Encoded Unsigned
              </span>
              <div className="text-4xl font-cyber font-bold text-[var(--cyber-neon-pink)]">
                {zzValue.toString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[var(--border-light)]">
            <div className="space-y-3">
              <h4 className="text-sm font-cyber font-bold text-[var(--text-color)] uppercase tracking-widest">
                The Problem
              </h4>
              <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                Standard varints treat negative numbers as very large 64-bit
                unsigned integers. This means `-1` would normally take 10 bytes
                on the wire.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight">
                The Solution
              </h4>
              <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                ZigZag maps signed numbers to small positive numbers. Even
                numbers are positive (`0, 2, 4...`), and odd numbers are
                negative (`1, 3, 5...`).
              </p>
            </div>
          </div>
        </div>
      </CyberPanel>
    </div>
  );
};
