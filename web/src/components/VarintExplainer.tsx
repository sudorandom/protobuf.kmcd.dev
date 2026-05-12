import { useState } from 'react';

const parseBigIntSafe = (val: string) => {
  try {
    return BigInt(val);
  } catch {
    return 0n;
  }
};

const VarintExplainer = () => {
  const [inputValue, setInputValue] = useState('150');

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

  // Calculate 7-bit groups for diagram
  const bitGroups = (() => {
    let n = value;
    const groups = [];
    if (n === 0n) return ['0000000'];
    while (n > 0n) {
      groups.push((n & 0x7fn).toString(2).padStart(7, '0'));
      n >>= 7n;
    }
    return groups;
  })();

  const binaryString = (() => {
    if (value === 0n) return '0000000';
    const str = value.toString(2);
    // Pad to multiple of 7
    const pad = (7 - (str.length % 7)) % 7;
    return '0'.repeat(pad) + str;
  })();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-mono text-slate-500 uppercase tracking-widest">Input Number</label>
          <input 
            type="text" 
            inputMode="numeric"
            value={inputValue} 
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              setInputValue(val || '0');
            }}
            className="bg-black/40 border border-cyan-500/30 rounded p-4 font-cyber text-2xl text-[#00f3ff] focus:outline-none focus:border-[#00f3ff] w-full"
          />
        </div>
        <div className="p-4 bg-[#00f3ff]/5 border border-[#00f3ff]/20 rounded-lg flex flex-col gap-3">
           <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest">Binary Representation</span>
              <span className="text-[10px] font-mono text-cyan-500/70 bg-cyan-500/10 px-2 py-0.5 rounded">{binaryString.length} BITS</span>
           </div>
           <div className="flex flex-wrap gap-x-3 gap-y-2 font-mono text-[#00f3ff] text-lg md:text-xl">
              {(binaryString.match(/.{1,7}/g) || []).map((chunk, i) => (
                <span key={i} className="inline-block whitespace-nowrap bg-black/40 px-1.5 py-0.5 rounded border border-[#00f3ff]/20 shadow-inner">
                  {chunk}
                </span>
              ))}
           </div>
        </div>

        <div className="p-4 bg-[#ff00ff]/5 border border-[#ff00ff]/20 rounded-lg flex flex-col gap-3">
           <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#ff00ff] uppercase tracking-widest">Varint Representation</span>
              <span className="text-[10px] font-mono text-[#ff00ff]/70 bg-[#ff00ff]/10 px-2 py-0.5 rounded">{varintBytes.length * 8} BITS</span>
           </div>
           <div className="flex flex-wrap gap-x-3 gap-y-2 font-mono text-lg md:text-xl">
              {varintBytes.map((byte, i) => {
                const binary = byte.toString(2).padStart(8, '0');
                return (
                  <span key={i} className="inline-block whitespace-nowrap bg-black/40 rounded border border-[#ff00ff]/20 shadow-inner overflow-hidden flex">
                    <span className={`px-1 py-0.5 ${binary[0] === '1' ? 'text-[#ff00ff] bg-[#ff00ff]/10' : 'text-slate-600 bg-slate-900'}`}>
                      {binary[0]}
                    </span>
                    <span className="px-1 py-0.5 text-cyan-200">
                      {binary.slice(1)}
                    </span>
                  </span>
                );
              })}
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <label className="text-sm font-mono text-slate-500 uppercase tracking-widest text-cyan-500">Bit Mapping Diagram</label>
        
        <div className="p-6 bg-black/20 border border-white/5 rounded-lg relative">
          {/* Header Row */}
          <div className="hidden sm:grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-4 pb-2 border-b border-white/5">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Original 7-Bit Chunk</span>
            </div>
            <div className="w-16"></div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-[#ff00ff] uppercase ml-1">MSB</span>
              <span className="text-[10px] font-mono text-cyan-500 uppercase ml-2">7-Bit Payload</span>
            </div>
          </div>

          <div className="flex flex-col gap-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
            {bitGroups.map((group, i) => {
              const targetByte = varintBytes[i];
              const targetBinary = targetByte !== undefined ? targetByte.toString(2).padStart(8, '0') : '00000000';

              return (
                <div key={i} className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 group/bitgroup border-b border-white/5 pb-6 sm:pb-0 sm:border-0 last:border-0">
                  {/* Source Header (Mobile only) */}
                  <div className="sm:hidden text-[9px] font-mono text-slate-500 uppercase self-start">Original 7-Bit Chunk</div>

                  {/* Left Column: Source */}
                  <div className="flex flex-col items-center sm:items-end gap-1 w-full sm:w-auto">
                    <div className="flex items-center gap-3">
                      <div className="p-2 border border-dashed border-white/20 rounded font-mono text-lg text-slate-400 group-hover/bitgroup:border-cyan-500/50 group-hover/bitgroup:text-cyan-200 transition-colors">
                        {group}
                      </div>
                    </div>
                    <span className="hidden sm:inline text-[9px] font-mono text-slate-600 uppercase">Group {i}</span>
                  </div>

                  {/* Middle: Connector */}
                  <div className="flex flex-col sm:flex-row items-center gap-1">
                    <div className="h-4 w-px sm:h-px sm:w-16 bg-gradient-to-b sm:bg-gradient-to-r from-cyan-500/40 to-[#ff00ff]/40 relative">
                       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-[1px] w-1.5 h-1.5 border-b border-r border-[#ff00ff]/40 rotate-45 sm:bottom-auto sm:top-1/2 sm:left-full sm:-translate-y-1/2 sm:-ml-[1px] sm:rotate-[-45deg] sm:border-b-0 sm:border-t"></div>
                    </div>
                  </div>

                  {/* Destination Header (Mobile only) */}
                  <div className="sm:hidden text-[9px] font-mono text-[#ff00ff] uppercase self-start mt-2">Varint Byte (MSB + 7-Bit Payload)</div>

                  {/* Right Column: Destination */}
                  <div className="flex flex-col items-center sm:items-start gap-1 w-full sm:w-auto">
                    <div className="flex items-center gap-3">
                      <div className="flex border border-[#ff00ff]/30 rounded overflow-hidden shadow-[0_0_10px_rgba(255,0,255,0.05)] group-hover/bitgroup:shadow-[0_0_15px_rgba(255,0,255,0.15)] transition-all">
                        <div className={`px-1.5 py-1.5 font-mono text-lg leading-none ${targetBinary[0] === '1' ? 'bg-[#ff00ff]/20 text-[#ff00ff]' : 'bg-slate-800 text-slate-500'}`}>
                            {targetBinary[0]}
                        </div>
                        <div className="px-1.5 py-1.5 bg-cyan-500/10 text-cyan-200 font-mono text-lg leading-none">
                            {targetBinary.slice(1)}
                        </div>
                      </div>
                      <div className="flex flex-col">                        <span className="text-[8px] font-mono text-slate-600 uppercase">Byte {i}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5">
             <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-[#ff00ff]/20 border border-[#ff00ff]/50 rounded-sm"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-mono uppercase leading-none">MSB (Prefix)</span>
                  <span className="text-[9px] text-slate-600 font-mono">1 = More bytes, 0 = Last byte</span>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-cyan-500/20 border border-cyan-500/50 rounded-sm"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-mono uppercase leading-none">Data Payload</span>
                  <span className="text-[9px] text-slate-600 font-mono">Mapped 7-bit chunks</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VarintExplainer;
