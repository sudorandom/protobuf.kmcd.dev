import React, { useState } from "react";
import { ArrowRight, Info } from "lucide-react";
import { CyberPanel } from "./shared/Common";

const VarintExplainer: React.FC = () => {
  const [inputValue, setInputValue] = useState("150");

  const value = (() => {
    try {
      return BigInt(inputValue);
    } catch {
      return 0n;
    }
  })();

  const varintBytes = (() => {
    const bytes = [];
    let temp = value;
    if (temp === 0n) return [0];
    while (temp > 0n) {
      let byte = Number(temp & 0x7fn);
      temp >>= 7n;
      if (temp > 0n) {
        byte |= 0x80;
      }
      bytes.push(byte);
    }
    return bytes;
  })();

  const standardBinary = (() => {
    if (value === 0n) return "00000000";
    const str = value.toString(2);
    const pad = (8 - (str.length % 8)) % 8;
    return "0".repeat(pad) + str;
  })();

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
          <input
            id="varint-input"
            type="number"
            min="0"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value || "0");
            }}
            className="bg-[var(--section-bg-dark)] border border-[var(--cyber-neon-blue)]/30 rounded p-4 font-cyber text-2xl text-[var(--cyber-neon-blue)] focus:outline-none focus:border-[var(--cyber-neon-blue)] w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[var(--cyber-neon-blue)]/5 border border-[var(--cyber-neon-blue)]/20 rounded-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-[var(--cyber-neon-blue)] uppercase tracking-widest">
                Standard Binary
              </span>
              <span className="text-sm font-mono text-[var(--cyber-neon-blue)]/90 bg-[var(--cyber-neon-blue)]/10 px-2 py-0.5 rounded">
                {standardBinary.length} BITS
              </span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-2 font-mono text-[var(--cyber-neon-blue)] text-base">
              {(standardBinary.match(/.{1,8}/g) || []).map((chunk, i) => (
                <span
                  key={i}
                  className="inline-block whitespace-nowrap bg-[var(--section-bg-dark)] px-1.5 py-0.5 rounded border border-[var(--cyber-neon-blue)]/20 shadow-inner"
                >
                  {chunk}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 bg-[var(--cyber-neon-cyan)]/5 border border-[var(--cyber-neon-cyan)]/20 rounded-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-[var(--cyber-neon-cyan)] uppercase tracking-widest">
                7-Bit Partitioning
              </span>
              <span className="text-sm font-mono text-[var(--cyber-neon-cyan)]/90 bg-[var(--cyber-neon-cyan)]/10 px-2 py-0.5 rounded">
                {partitionedBinary.length} BITS
              </span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-2 font-mono text-[var(--cyber-neon-cyan)] text-base">
              {(partitionedBinary.match(/.{1,7}/g) || []).map((chunk, i) => (
                <span
                  key={i}
                  className="inline-block whitespace-nowrap bg-[var(--section-bg-dark)] px-1.5 py-0.5 rounded border border-[var(--cyber-neon-cyan)]/20 shadow-inner"
                >
                  {chunk}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center py-4">
          <ArrowRight className="w-8 h-8 text-[var(--cyber-neon-pink)] rotate-90" />
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
                    Add MSB Flag
                  </h3>
                </div>
                <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                  Set the MSB to <code>1</code> for all bytes except the last
                  one. This tells the parser to keep reading the next byte.
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-[var(--border-light)]">
              <div className="flex flex-wrap gap-6 justify-center">
                {varintBytes.map((byte, i) => {
                  const isLast = i === varintBytes.length - 1;
                  const bits = byte.toString(2).padStart(8, "0").split("");
                  return (
                    <div key={i} className="flex flex-col items-center gap-3">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-mono text-[var(--text-dim)] uppercase mb-1">
                          Byte {i}
                        </span>
                        <div className="flex gap-1">
                          {bits.map((bit, bitIdx) => (
                            <div
                              key={bitIdx}
                              className={`w-7 h-9 flex items-center justify-center font-mono border rounded-sm ${
                                bitIdx === 0
                                  ? isLast
                                    ? "border-[var(--cyber-neon-green)]/30 text-[var(--cyber-neon-green)]"
                                    : "border-[var(--cyber-neon-pink)] text-[var(--cyber-neon-pink)] bg-[var(--cyber-neon-pink)]/10 font-bold"
                                  : "border-[var(--cyber-neon-blue)]/30 text-[var(--cyber-neon-blue)]"
                              }`}
                            >
                              {bit}
                            </div>
                          ))}
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
                        0x{byte.toString(16).toUpperCase().padStart(2, "0")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-[var(--cyber-neon-blue)]/5 border border-[var(--cyber-neon-blue)]/20 rounded-lg flex gap-4">
              <div className="p-2 bg-[var(--cyber-neon-blue)]/20 rounded shrink-0 h-fit">
                <Info className="w-5 h-5 text-[var(--cyber-neon-blue)]" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-cyber font-bold text-[var(--cyber-neon-blue)] uppercase tracking-widest">
                  Did you notice?
                </h4>
                <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                  The bytes are stored in <strong>Little-Endian</strong> order.
                  The least significant group of 7 bits is written first. For
                  the number 150 (<code>10010110</code>), the first byte
                  contains the lower 7 bits (<code>0010110</code>) plus the MSB
                  continuation flag.
                </p>
              </div>
            </div>
          </div>
        </CyberPanel>
      </div>
    </div>
  );
};

export default VarintExplainer;
