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

  const isOverflow = (() => {
    if (inputValue === "" || inputValue === "-") return false;
    try {
      const val = BigInt(inputValue);
      return val < -9223372036854775808n || val > 9223372036854775807n;
    } catch {
      return true;
    }
  })();

  const handleAdjust = (delta: bigint) => {
    const newValue = rawValue + delta;
    if (newValue < -9223372036854775808n || newValue > 9223372036854775807n)
      return;
    setInputValue(newValue.toString());
  };

  const toZigZag = (n: bigint) => {
    // Standard 64-bit ZigZag mapping for signed representation:
    // If the input overflowed, we cap the values to prevent weird behavior
    const val = BigInt.asIntN(64, n);
    return (val << 1n) ^ (val >> 63n);
  };

  const getVarintBytes = (n: bigint) => {
    let u64 = BigInt.asUintN(64, n);
    const bytes: number[] = [];
    if (u64 === 0n) return [0];
    while (u64 >= 128n) {
      bytes.push(Number((u64 & 127n) | 128n));
      u64 >>= 7n;
    }
    bytes.push(Number(u64));
    return bytes;
  };

  const zzValue = toZigZag(rawValue);
  const standardBytes = getVarintBytes(rawValue);
  const zigzagBytes = getVarintBytes(zzValue);

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
              const sanitized = val.replace(/[,_ .]/g, "");
              if (sanitized === "" || sanitized === "-" || /^-?\d+$/.test(sanitized)) {
                setInputValue(sanitized);
              }
            }}
            onBlur={() =>
              trackEvent("zigzag_explainer_interact", { value: inputValue })
            }
            className={`bg-[var(--section-bg-dark)] border rounded p-4 font-cyber text-2xl focus:outline-none flex-1 min-w-0 transition-colors ${
              isOverflow
                ? "border-[var(--cyber-neon-pink)] text-[var(--cyber-neon-pink)] focus:border-[var(--cyber-neon-pink)]"
                : "border-[var(--cyber-neon-pink)]/30 text-[var(--cyber-neon-pink)] focus:border-[var(--cyber-neon-pink)]"
            }`}
          />
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => handleAdjust(-1n)}
              className={`p-4 bg-[var(--overlay-bg)] border rounded transition-colors ${
                isOverflow
                  ? "border-[var(--cyber-neon-pink)]/30 text-[var(--cyber-neon-pink)]/50 hover:bg-transparent cursor-not-allowed"
                  : "border-[var(--cyber-neon-pink)]/30 text-[var(--cyber-neon-pink)] hover:bg-[var(--cyber-neon-pink)]/10"
              }`}
              disabled={isOverflow}
              aria-label="Decrement value"
            >
              <Minus className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleAdjust(1n)}
              className={`p-4 bg-[var(--overlay-bg)] border rounded transition-colors ${
                isOverflow
                  ? "border-[var(--cyber-neon-pink)]/30 text-[var(--cyber-neon-pink)]/50 hover:bg-transparent cursor-not-allowed"
                  : "border-[var(--cyber-neon-pink)]/30 text-[var(--cyber-neon-pink)] hover:bg-[var(--cyber-neon-pink)]/10"
              }`}
              disabled={isOverflow}
              aria-label="Increment value"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
        {isOverflow && (
          <p className="text-xs text-[var(--cyber-neon-pink)] font-mono uppercase mt-1">
            ⚠️ Value overflows signed 64-bit integer range
          </p>
        )}
      </div>

      <CyberPanel title="ZIGZAG_TRANSFORMATION">
        {isOverflow ? (
          <div className="p-6 flex flex-col items-center justify-center py-12 text-center space-y-4">
            <span className="text-4xl">⚠️</span>
            <h3 className="font-cyber font-bold text-[var(--cyber-neon-pink)] uppercase tracking-wider">
              Value Overflow
            </h3>
            <p className="text-sm text-[var(--text-dim)] max-w-md leading-relaxed">
              The input value is outside the allowed range for a signed 64-bit
              integer. Please enter a value between{" "}
              <code>-9,223,372,036,854,775,808</code> and{" "}
              <code>9,223,372,036,854,775,807</code>.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-10">
            <div className="flex flex-col md:flex-row items-center justify-around gap-8">
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-mono text-[var(--text-dim)] uppercase">
                  Original Signed
                </span>
                <div className="text-4xl font-cyber font-bold text-[var(--text-color)] break-all max-w-[200px] text-center">
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
                <div className="text-4xl font-cyber font-bold text-[var(--cyber-neon-pink)] break-all max-w-[200px] text-center">
                  {zzValue.toString()}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8 pt-6 border-t border-[var(--border-light)]">
              <div className="space-y-3">
                <div className="flex justify-between items-end mb-2">
                  <h4 className="text-sm font-cyber font-bold text-[var(--cyber-neon-blue)] uppercase tracking-widest">
                    Standard Varint (Two's Complement)
                  </h4>
                  <span className="text-xs font-mono text-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/10 px-2 py-0.5 rounded border border-[var(--cyber-neon-blue)]/30 font-bold">
                    {standardBytes.length} Byte(s)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {standardBytes.map((b, i) => (
                    <div
                      key={i}
                      className="flex gap-0.5 p-1.5 rounded bg-[var(--cyber-neon-blue)]/5 border border-[var(--cyber-neon-blue)]/30"
                    >
                      {b
                        .toString(2)
                        .padStart(8, "0")
                        .split("")
                        .map((bit, j) => (
                          <span
                            key={j}
                            className={`font-mono text-sm sm:text-base ${j === 0 ? "text-[var(--cyber-neon-pink)]" : "text-[var(--cyber-neon-blue)]"} ${bit === "1" ? "font-bold" : "opacity-30"}`}
                          >
                            {bit}
                          </span>
                        ))}
                    </div>
                  ))}
                </div>
                {rawValue < 0n && rawValue >= -10000n && (
                  <p className="text-xs text-[var(--cyber-neon-pink)] font-mono leading-relaxed mt-2 bg-[var(--cyber-neon-pink)]/5 p-2.5 rounded border border-[var(--cyber-neon-pink)]/20">
                    💡 <strong>Silliness Warning:</strong> Because of Two's Complement, a tiny negative number like <code>{rawValue.toString()}</code> requires all {standardBytes.length} bytes (80 bits) under standard varint encoding, while positive <code>1</code> requires only 1 byte! This is a massive 10x space overhead.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end mb-2">
                  <h4 className="text-sm font-cyber font-bold text-[var(--cyber-neon-green)] uppercase tracking-widest">
                    ZigZag Varint
                  </h4>
                  <span className="text-xs font-mono text-[var(--cyber-neon-green)] bg-[var(--cyber-neon-green)]/10 px-2 py-0.5 rounded border border-[var(--cyber-neon-green)]/30 font-bold">
                    {zigzagBytes.length} Byte(s)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {zigzagBytes.map((b, i) => (
                    <div
                      key={i}
                      className="flex gap-0.5 p-1.5 rounded bg-[var(--cyber-neon-green)]/5 border border-[var(--cyber-neon-green)]/30"
                    >
                      {b
                        .toString(2)
                        .padStart(8, "0")
                        .split("")
                        .map((bit, j) => (
                          <span
                            key={j}
                            className={`font-mono text-sm sm:text-base ${j === 0 ? "text-[var(--cyber-neon-pink)]" : "text-[var(--cyber-neon-green)]"} ${bit === "1" ? "font-bold" : "opacity-30"}`}
                          >
                            {bit}
                          </span>
                        ))}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[var(--cyber-neon-green)] font-mono leading-relaxed mt-2 bg-[var(--cyber-neon-green)]/5 p-2.5 rounded border border-[var(--cyber-neon-green)]/20">
                  💡 <strong>ZigZag Scaling:</strong> Space usage is determined strictly by the absolute magnitude of the number rather than its sign. The greater the magnitude, the more bytes will be used. A small negative number like <code>-1</code> takes only 1 byte!
                </p>
              </div>

              <div className="flex justify-between px-1 text-[10px] sm:text-xs font-mono uppercase tracking-tighter">
                <span className="text-[var(--cyber-neon-pink)]">
                  MSB (Continuation Bit)
                </span>
                <span className="text-[var(--text-dim)]">7-Bit Payload</span>
              </div>
            </div>
          </div>
        )}
      </CyberPanel>
    </div>
  );
};
