import { useState } from "react";

const parseBigIntSafe = (val: string) => {
  try {
    return BigInt(val);
  } catch {
    return 0n;
  }
};

const VarintExplainer = () => {
  const [inputValue, setInputValue] = useState("150");

  const value = parseBigIntSafe(inputValue);

  const varintBytes = (() => {
    let n = value;
    if (n === 0n) return [0];
    const bytes = [];
    while (n >= 128n) {
      bytes.push(Number((n & 0x7fn) | 0x80n));
      n >>= 7n;
    }
    bytes.push(Number(n));
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
      <div className="absolute -left-48 top-4 hidden 2xl:flex flex-col items-end gap-2 text-[var(--cyber-neon-pink)] pointer-events-none animate-pulse z-10 opacity-70">
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
          <label className="text-sm font-mono text-[var(--text-dim)] uppercase tracking-widest">
            Input Number
          </label>
          <input
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

        <div className="p-4 bg-[var(--cyber-neon-pink)]/5 border border-[var(--cyber-neon-pink)]/20 rounded-lg flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-[var(--cyber-neon-pink)] uppercase tracking-widest">
              Final Varint (Little-Endian)
            </span>
            <span className="text-sm font-mono text-[var(--cyber-neon-pink)]/90 bg-[var(--cyber-neon-pink)]/10 px-2 py-0.5 rounded">
              {varintBytes.length * 8} BITS
            </span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-2 font-mono text-lg md:text-xl">
            {varintBytes.map((byte, i) => {
              const binary = byte.toString(2).padStart(8, "0");
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="inline-block whitespace-nowrap bg-[var(--section-bg-dark)] rounded border border-[var(--cyber-neon-pink)]/20 shadow-inner overflow-hidden flex">
                    <span
                      className={`px-1 py-0.5 ${binary[0] === "1" ? "text-[var(--cyber-neon-pink)] bg-[var(--cyber-neon-pink)]/10" : "text-[var(--text-dim)] bg-[var(--bg-color)]"}`}
                    >
                      {binary[0]}
                    </span>
                    <span className="px-1 py-0.5 text-[var(--cyber-neon-cyan)]">
                      {binary.slice(1)}
                    </span>
                  </span>
                  <span className="text-[10px] font-mono text-[var(--cyber-neon-pink)] uppercase">
                    0x{byte.toString(16).padStart(2, "0").toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VarintExplainer;
