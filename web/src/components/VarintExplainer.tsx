import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { trackEvent } from "../utils/analytics";
import { CyberPanel } from "./shared/Common";

const VarintHTMLDiagram = ({
  partitionedBinary,
}: {
  partitionedBinary: string;
}) => {
  const groups7Bit = partitionedBinary.match(/.{1,7}/g) || [];
  const N = groups7Bit.length;

  const COLORS = [
    "var(--cyber-neon-pink)",
    "var(--cyber-neon-blue)",
    "var(--cyber-neon-green)",
    "var(--cyber-neon-yellow)",
    "var(--cyber-neon-cyan)",
  ];

  return (
    <div className="w-full flex flex-col items-center gap-12 pt-4 pb-8">
      {/* Step 1: 7-Bit Groups */}
      <div className="w-full space-y-6">
        <h4 className="text-sm font-cyber font-bold text-[var(--text-dim)] uppercase tracking-widest text-center">
          Step 1: 7-Bit Groups
        </h4>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-6">
          {groups7Bit.map((groupStr, i) => {
            const groupIndex = N - 1 - i;
            const color = COLORS[groupIndex % COLORS.length];
            return (
              <div
                key={`group-${i}`}
                className="flex flex-col items-center gap-3"
              >
                <span className="text-xs font-mono text-[var(--text-dim)] uppercase">
                  Group {groupIndex}
                </span>
                <div
                  className="flex gap-0.5 p-1.5 rounded border"
                  style={{
                    borderColor: `color-mix(in srgb, ${color}, transparent 70%)`,
                    backgroundColor: `color-mix(in srgb, ${color}, transparent 95%)`,
                  }}
                >
                  {groupStr.split("").map((bit, bitIdx) => (
                    <span
                      key={bitIdx}
                      className={`font-mono text-sm sm:text-base ${bit === "1" ? "font-bold" : "opacity-30"}`}
                      style={{
                        color: color,
                      }}
                    >
                      {bit}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Little-Endian & MSB Flags */}
      <div className="w-full space-y-6">
        <h4 className="text-sm font-cyber font-bold text-[var(--text-dim)] uppercase tracking-widest text-center">
          Step 2: Little-Endian & MSB Flags
        </h4>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-6">
          {groups7Bit.map((_, j) => {
            const i = N - 1 - j;
            const groupStr = groups7Bit[i];
            const isLast = j === N - 1;
            const msb = isLast ? "0" : "1";
            const byteStr = msb + groupStr;
            const groupIndex = N - 1 - i; // equals j
            const color = COLORS[groupIndex % COLORS.length];

            const byteVal = parseInt(byteStr, 2);
            const hexStr =
              "0x" + byteVal.toString(16).toUpperCase().padStart(2, "0");

            return (
              <div
                key={`byte-${j}`}
                className="flex flex-col items-center gap-3"
              >
                <div className="flex flex-col items-center">
                  <span className="text-xs font-mono text-[var(--text-dim)] uppercase mb-1">
                    Byte {j}
                  </span>
                  <div
                    className="flex gap-0.5 p-1.5 rounded border"
                    style={{
                      borderColor: `color-mix(in srgb, ${color}, transparent 70%)`,
                      backgroundColor: `color-mix(in srgb, ${color}, transparent 95%)`,
                    }}
                  >
                    {byteStr.split("").map((bit, bitIdx) => {
                      const isMsbBit = bitIdx === 0;
                      const bitColor = isMsbBit
                        ? isLast
                          ? "var(--text-dim)"
                          : "var(--cyber-neon-pink)"
                        : color;

                      return (
                        <span
                          key={bitIdx}
                          className={`font-mono text-sm sm:text-base ${bit === "1" ? "font-bold" : "opacity-30"}`}
                          style={{
                            color: bitColor,
                          }}
                        >
                          {bit}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex justify-between w-full mt-1 px-1">
                    <span
                      className={`text-[10px] font-mono font-bold ${!isLast ? "text-[var(--cyber-neon-pink)]" : "text-[var(--text-dim)]"}`}
                    >
                      MSB
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-dim)]">
                      DATA
                    </span>
                  </div>
                </div>
                <div className="text-sm font-mono text-[var(--cyber-neon-green)] bg-[var(--cyber-neon-green)]/10 px-2 py-0.5 rounded border border-[var(--cyber-neon-green)]/20">
                  {hexStr}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const VarintExplainer: React.FC = () => {
  const [inputValue, setInputValue] = useState("150");

  const value = (() => {
    try {
      if (inputValue === "" || inputValue === "-") return 0n;
      // We cap it at 64-bit unsigned for visualization
      return BigInt.asUintN(64, BigInt(inputValue));
    } catch {
      return 0n;
    }
  })();

  const handleAdjust = (delta: bigint) => {
    const newValue = value + delta;
    if (newValue < 0n) return;
    setInputValue(newValue.toString());
  };

  const partitionedBinary = (() => {
    if (value === 0n) return "0000000";
    const str = value.toString(2);
    const pad = (7 - (str.length % 7)) % 7;
    return "0".repeat(pad) + str;
  })();

  return (
    <div className="grid grid-cols-1 gap-8 relative">
      {/* Global Interactive Sign for Large Screens */}
      <div className="absolute -left-48 top-4 hidden 2xl:flex flex-col items-end gap-2 text-[var(--cyber-neon-pink)] pointer-events-none z-10">
        <span className="font-cyber text-sm uppercase tracking-widest text-right">
          These Panels
          <br />
          Are Live!
          <br />
          Change The Data
        </span>
        <div className="flex gap-2">
          <svg
            width="40"
            height="24"
            viewBox="0 0 40 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M0 12h30" />
            <path d="M24 6l6 6-6 6" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="varint-input"
            className="text-sm font-mono text-[var(--text-dim)] uppercase tracking-widest"
          >
            Input Number
          </label>
          <div className="flex gap-2">
            <input
              id="varint-input"
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
                trackEvent("varint_explainer_interact", { value: inputValue })
              }
              className="bg-[var(--section-bg-dark)] border border-[var(--cyber-neon-blue)]/30 rounded p-4 font-cyber text-2xl text-[var(--cyber-neon-blue)] focus:outline-none focus:border-[var(--cyber-neon-blue)] flex-1 min-w-0"
            />
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleAdjust(-1n)}
                className="p-4 bg-[var(--overlay-bg)] border border-[var(--cyber-neon-blue)]/30 rounded text-[var(--cyber-neon-blue)] hover:bg-[var(--cyber-neon-blue)]/10 transition-colors"
                aria-label="Decrement value"
              >
                <Minus className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleAdjust(1n)}
                className="p-4 bg-[var(--overlay-bg)] border border-[var(--cyber-neon-blue)]/30 rounded text-[var(--cyber-neon-blue)] hover:bg-[var(--cyber-neon-blue)]/10 transition-colors"
                aria-label="Increment value"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <CyberPanel title="VARINT_ENCODING_STEPS">
          <div className="p-4 space-y-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--cyber-neon-pink)]/20 border border-[var(--cyber-neon-pink)]/40 flex items-center justify-center font-cyber text-[var(--cyber-neon-pink)]">
                    1
                  </div>
                  <h3 className="font-cyber font-bold text-sm uppercase tracking-widest">
                    Chunk Data
                  </h3>
                </div>
                <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                  Split the number into 7-bit groups. Standard bytes are 8 bits,
                  but we reserve the top bit (MSB) as a "continuation bit".
                </p>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--cyber-neon-green)]/20 border border-[var(--cyber-neon-green)]/40 flex items-center justify-center font-cyber text-[var(--cyber-neon-green)]">
                    2
                  </div>
                  <h3 className="font-cyber font-bold text-sm uppercase tracking-widest">
                    Reverse & Add MSB Flag
                  </h3>
                </div>
                <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                  The groups are written in <strong>Little-Endian</strong> order
                  (least significant group first). Set the MSB to <code>1</code>{" "}
                  for all bytes except the last one.
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-[var(--border-light)]">
              <VarintHTMLDiagram partitionedBinary={partitionedBinary} />
            </div>
          </div>
        </CyberPanel>
      </div>
    </div>
  );
};

export default VarintExplainer;
