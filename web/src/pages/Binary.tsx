import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Binary,
  Layers,
  SearchCheck,
  Zap,
  Database,
  Hash,
  MousePointer2
} from 'lucide-react';
import { fromJson, toBinary, type DescMessage } from '@bufbuild/protobuf';
import {
  Section,
  SectionTitle,
  CyberPanel,
  TechnicalNuance
} from '../components/shared/Common';
import { JsonEditor } from '../components/shared/JsonEditor';
import VarintExplainer from '../components/VarintExplainer';
import { decodeBinary, type DecodedSegment } from '../utils/decoder';
import { SIZE_EXAMPLES } from '../utils/constants';
import { generateFake, convertToProtoscope } from '../utils/wasm-parser';

// --- Static Envelope Diagrams ---

const PacketDiagram = ({ title = "Length-Delimited Field (Wire Type 2)" }: { title?: string }) => (
  <div className="w-full max-w-2xl mx-auto my-12">
    <div className="flex items-stretch gap-1 h-20">
      <div className="flex-1 bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-blue)] font-mono text-xs relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-xs uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Hash className="w-3 h-3" /> Tag
        </div>
        <span className="font-bold">VARINT</span>
        <span className="text-xs opacity-60">(Field # | Type)</span>
      </div>
      <div className="flex-[0.7] bg-[var(--cyber-neon-yellow)]/10 border border-[var(--cyber-neon-yellow)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-yellow)] font-mono text-xs relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-xs uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Zap className="w-3 h-3" /> Length
        </div>
        <span className="font-bold">VARINT</span>
        <span className="text-xs opacity-60">N Bytes</span>
      </div>
      <div className="flex-[2] bg-[var(--cyber-neon-green)]/10 border border-[var(--cyber-neon-green)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-green)] font-mono text-xs relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-xs uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Database className="w-3 h-3" /> Payload
        </div>
        <span className="font-bold">DATA</span>
        <span className="text-xs opacity-60">Binary Bytes</span>
      </div>
    </div>
    <div className="flex justify-between mt-8 px-2">
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-[9px] font-mono text-[var(--text-dim)] uppercase">1-5 Bytes</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-[9px] font-mono text-[var(--text-dim)] uppercase">1-5 Bytes</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-[9px] font-mono text-[var(--text-dim)] uppercase">N Bytes</span>
      </div>
    </div>
    <div className="text-xs font-mono text-[var(--text-dim)] uppercase text-center mt-4 italic border-t border-[var(--border-light)] pt-4">
      Anatomy of a {title}
    </div>
  </div>
);

const FixedPacketDiagram = ({ title = "Fixed-Size Field (Wire Type 1 or 5)", size = "4 or 8 Bytes" }: { title?: string, size?: string }) => (
  <div className="w-full max-w-2xl mx-auto my-12">
    <div className="flex items-stretch gap-1 h-20">
      <div className="flex-1 bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-blue)] font-mono text-xs relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-xs uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Hash className="w-3 h-3" /> Tag
        </div>
        <span className="font-bold">VARINT</span>
        <span className="text-xs opacity-60">(Field # | Type)</span>
      </div>
      <div className="flex-[2.7] bg-[var(--cyber-neon-green)]/10 border border-[var(--cyber-neon-green)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-green)] font-mono text-xs relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-xs uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Database className="w-3 h-3" /> Payload
        </div>
        <span className="font-bold">DATA</span>
        <span className="text-xs opacity-60">{size}</span>
      </div>
    </div>
    <div className="flex justify-between mt-8 px-2">
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-[9px] font-mono text-[var(--text-dim)] uppercase">1-5 Bytes</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-[9px] font-mono text-[var(--text-dim)] uppercase">{size}</span>
      </div>
    </div>
    <div className="text-xs font-mono text-[var(--text-dim)] uppercase text-center mt-4 italic border-t border-[var(--border-light)] pt-4">
      Anatomy of a {title}
    </div>
  </div>
);

const VarintPacketDiagram = () => (
  <div className="w-full max-w-2xl mx-auto my-12">
    <div className="flex items-stretch gap-1 h-20">
      <div className="flex-1 bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-blue)] font-mono text-xs relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-xs uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Hash className="w-3 h-3" /> Tag
        </div>
        <span className="font-bold">VARINT</span>
        <span className="text-xs opacity-60">(Field # | Type)</span>
      </div>
      <div className="flex-[2.7] bg-[var(--cyber-neon-green)]/10 border border-[var(--cyber-neon-green)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-green)] font-mono text-xs relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-xs uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Database className="w-3 h-3" /> Payload
        </div>
        <span className="font-bold">VARINT</span>
        <span className="text-xs opacity-60">1-10 Bytes</span>
      </div>
    </div>
    <div className="flex justify-between mt-8 px-2">
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-[9px] font-mono text-[var(--text-dim)] uppercase">1-5 Bytes</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-[9px] font-mono text-[var(--text-dim)] uppercase">1-10 Bytes</span>
      </div>
    </div>
    <div className="text-xs font-mono text-[var(--text-dim)] uppercase text-center mt-4 italic border-t border-[var(--border-light)] pt-4">
      Anatomy of a Varint Field (Wire Type 0)
    </div>
  </div>
);

// --- Sub-components for Binary Matrix ---

const ByteBreakdown = ({ label, bytes, color }: { label: string, bytes: Uint8Array, color: string }) => {
  if (!bytes || bytes.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest">{label}</span>
        <span className="text-[9px] font-mono text-[var(--text-dim)] opacity-60 uppercase">{bytes.length} {bytes.length === 1 ? 'Byte' : 'Bytes'}</span>
      </div>
      <div className="flex flex-col gap-2 p-3 bg-[var(--section-bg-dark)]/50 border border-[var(--border-light)] rounded">
        <div className="flex flex-wrap gap-2 font-mono text-sm" style={{ color }}>
          {Array.from(bytes).map((b, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-[var(--overlay-bg)] rounded border border-[var(--border-light)]">
              {b.toString(16).padStart(2, '0').toUpperCase()}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] opacity-70 break-all" style={{ color }}>
          {Array.from(bytes).map((b, i) => (
            <span key={i} className="whitespace-nowrap">
              {b.toString(2).padStart(8, '0')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const WireFormatBreakdown = () => {
  const wireTypes = [
    { 
      type: 0, 
      label: 'Varint', 
      desc: 'Most numeric types. Variable length allows small numbers to take very little space.', 
      types: ['int32', 'int64', 'uint32', 'uint64', 'bool', 'enum'],
      color: 'var(--cyber-neon-green)'
    },
    { 
      type: 1, 
      label: 'I64', 
      desc: 'Fixed 64-bit values. Used when values are frequently large or need exact precision.', 
      types: ['fixed64', 'sfixed64', 'double'],
      color: 'var(--cyber-neon-blue)'
    },
    { 
      type: 2, 
      label: 'LEN', 
      desc: 'Length-delimited blobs. Includes a length prefix followed by the payload data.', 
      types: ['string', 'bytes', 'message', 'repeated'],
      color: 'var(--cyber-neon-pink)'
    },
    { 
      type: 5, 
      label: 'I32', 
      desc: 'Fixed 32-bit values. Efficient for common hardware types.', 
      types: ['fixed32', 'sfixed32', 'float'],
      color: 'var(--cyber-neon-yellow)'
    },
  ];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {wireTypes.map((wt) => (
          <CyberPanel key={wt.type} title={`WIRE_TYPE_${wt.type}`} className="hover:border-[var(--cyber-neon-blue)]/50 transition-colors">
            <div className="p-4 space-y-3">
              <h4 className="font-cyber font-bold uppercase text-sm tracking-widest" style={{ color: wt.color }}>{wt.label}</h4>
              <p className="text-xs text-[var(--text-dim)] leading-relaxed min-h-[40px]">{wt.desc}</p>
              <div className="pt-3 border-t border-[var(--border-light)]">
                <div className="flex flex-wrap gap-1">
                  {wt.types.map(t => (
                    <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded opacity-80">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </CyberPanel>
        ))}
      </div>

      <div className="space-y-16">
        <div className="space-y-6">
          <div className="max-w-4xl">
            <h3 className="text-[var(--cyber-neon-pink)] font-cyber uppercase text-sm font-bold tracking-[0.2em] mb-4">Length-Delimited (Wire Type 2)</h3>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              Strings, bytes, and nested messages use <strong>Length-Delimited</strong> encoding. These fields include an explicit length byte (encoded as a varint) immediately after the tag, telling the decoder exactly how many subsequent bytes belong to this field.
            </p>
          </div>
          <PacketDiagram />
        </div>

        <div className="pt-12 border-t border-[var(--border-light)]/30 space-y-6">
          <div className="max-w-4xl">
            <h3 className="text-[var(--cyber-neon-green)] font-cyber uppercase text-sm font-bold tracking-[0.2em] mb-4">Varint Fields (Wire Type 0)</h3>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              Most numeric types use <strong>Wire Type 0</strong>. The length is implicit because the decoder reads bytes one by one until it finds a byte where the MSB (Most Significant Bit) is 0. This "continuation bit" logic allows the payload to be self-delimiting.
            </p>
          </div>
          <VarintPacketDiagram />
        </div>

        <div className="pt-12 border-t border-[var(--border-light)]/30 space-y-6">
          <div className="max-w-4xl">
            <h3 className="text-[var(--cyber-neon-blue)] font-cyber uppercase text-sm font-bold tracking-[0.2em] mb-4">Fixed-Size Fields (Wire Type 1, 5)</h3>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              For <code>double</code>, <code>fixed64</code> (Wire Type 1), and <code>float</code>, <code>fixed32</code> (Wire Type 5), the length is hard-coded into the specification. The decoder knows to read exactly 8 or 4 bytes respectively immediately following the tag.
            </p>
          </div>
          <FixedPacketDiagram />
        </div>
      </div>
    </div>
  );
};

export const BinaryMatrix = ({ messageSchema, fds }: { messageSchema: DescMessage | null, fds: Uint8Array | null }) => {
  const [activeExample, setActiveExample] = useState<keyof typeof SIZE_EXAMPLES | null>('BASIC');
  const [jsonInput, setJsonInput] = useState(JSON.stringify(SIZE_EXAMPLES.BASIC, null, 2));
  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState<number | null>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'hex' | 'scope'>('hex');
  const [protoscopeOutput, setProtoscopeOutput] = useState('');

  const stats = useMemo(() => {
    if (!messageSchema) return { binary: new Uint8Array(), segments: [], error: "NO_SCHEMA" };
    try {
      const obj = JSON.parse(jsonInput);
      const user = fromJson(messageSchema, obj, { ignoreUnknownFields: true });
      const binary = toBinary(messageSchema, user);
      const segments = decodeBinary(binary, messageSchema);
      return { binary, segments, error: null };
    } catch (e: unknown) {
      const error = e instanceof Error ? e.message : String(e);
      return { binary: new Uint8Array(), segments: [], error };
    }
  }, [jsonInput, messageSchema]);

  React.useEffect(() => {
    if (stats.binary.length > 0) {
      convertToProtoscope(stats.binary).then(setProtoscopeOutput).catch(console.error);
    }
  }, [stats.binary]);

  const handleExampleChange = (key: keyof typeof SIZE_EXAMPLES) => {
    setActiveExample(key);
    const example = SIZE_EXAMPLES[key];
    setJsonInput(JSON.stringify(example, null, 2));
    setSelectedSegmentIdx(0);
  };

  const handleGenerateFake = async () => {
    if (!fds || !messageSchema) return;
    setIsGenerating(true);
    try {
      const fakeData = await generateFake(messageSchema.typeName, fds);
      setJsonInput(fakeData);
      setActiveExample(null);
      setSelectedSegmentIdx(0);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedSegment = selectedSegmentIdx !== null ? stats.segments[selectedSegmentIdx] : null;

  const getSegmentColor = (seg: DecodedSegment) => {
    switch (seg.wireType) {
      case 0: return 'var(--cyber-neon-green)';
      case 1: return 'var(--cyber-neon-blue)';
      case 2: return 'var(--cyber-neon-pink)';
      case 5: return 'var(--cyber-neon-yellow)';
      default: return 'var(--text-dim)';
    }
  };

  return (
    <Section id="matrix" className="py-24 px-4 sm:px-8 bg-[var(--section-bg-dark)] border-t border-[var(--border-light)]">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Binary} subtitle="05b_EXPLORER">Digging into the binary</SectionTitle>

        <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SIZE_EXAMPLES) as Array<keyof typeof SIZE_EXAMPLES>).map((key) => (
              <button
                key={key}
                onClick={() => handleExampleChange(key)}
                className={`px-3 py-1 text-xs font-cyber font-bold border transition-all rounded-md ${activeExample === key
                  ? 'bg-[var(--cyber-neon-blue)] border-[var(--cyber-neon-blue)] text-black shadow-[0_0_10px_rgba(0,243,255,0.3)]'
                  : 'bg-[var(--overlay-bg)] border-[var(--border-light)] text-[var(--text-dim)] hover:border-white/30 hover:text-[var(--text-color)]'
                  }`}
              >
                {key}
              </button>
            ))}
          </div>
          <button
            onClick={handleGenerateFake}
            disabled={isGenerating || !fds}
            className="px-4 py-1.5 text-xs font-cyber font-bold border border-[var(--cyber-neon-pink)] bg-[var(--cyber-neon-pink)] text-black hover:bg-[var(--cyber-neon-pink)]/90 transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed rounded-md shadow-[0_0_15px_rgba(255,0,255,0.4)]"
          >
            <Zap className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'GENERATING...' : 'GENERATE_FAUX_DATA'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Input & Hex View */}
          <div className="space-y-8">
            <CyberPanel title="JSON_INPUT">
              <div className="h-64">
                <JsonEditor value={jsonInput} onChange={setJsonInput} className="h-full rounded-none border-none bg-transparent" />
              </div>
            </CyberPanel>

            <CyberPanel 
              title={viewMode === 'hex' ? 'ENCODED_STREAM (HEX)' : 'PROTOSCOPE_VIEW'}
              headerExtra={
                <div className="flex bg-[var(--overlay-bg)] p-1 rounded border border-[var(--border-light)]">
                  <button
                    onClick={() => setViewMode('hex')}
                    className={`px-3 py-1 text-[10px] font-mono rounded transition-all ${viewMode === 'hex' ? 'bg-[var(--cyber-neon-blue)]/20 text-[var(--cyber-neon-blue)]' : 'text-[var(--text-dim)] hover:text-[var(--text-color)]'}`}
                  >
                    HEX
                  </button>
                  <button
                    onClick={() => setViewMode('scope')}
                    className={`px-3 py-1 text-[10px] font-mono rounded transition-all ${viewMode === 'scope' ? 'bg-[var(--cyber-neon-pink)]/20 text-[var(--cyber-neon-pink)]' : 'text-[var(--text-dim)] hover:text-[var(--text-color)]'}`}
                  >
                    SCOPE
                  </button>
                </div>
              }
            >
              <div className="p-4 space-y-4">
                {viewMode === 'hex' ? (
                  <>
                    <div className="flex flex-wrap gap-y-3 gap-x-2 font-mono text-sm leading-relaxed">
                      {stats.segments.map((seg, i) => {
                        const color = getSegmentColor(seg);
                        const isActive = selectedSegmentIdx === i;
                        
                        return (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedSegmentIdx(i)}
                            className={`group relative flex flex-wrap items-center transition-all ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                          >
                            <div className="flex flex-wrap gap-1">
                              {seg.rawHex.map((byte, byteIdx) => {
                                let byteColor = color;
                                if (byteIdx === 0) byteColor = 'var(--cyber-neon-blue)';
                                else if (seg.wireType === 2 && byteIdx === 1) byteColor = 'var(--cyber-neon-yellow)';
                                
                                return (
                                  <span 
                                    key={byteIdx} 
                                    className={`px-1.5 py-0.5 rounded border ${isActive ? 'bg-opacity-20' : 'bg-opacity-5'}`}
                                    style={{ 
                                      borderColor: isActive ? byteColor : 'var(--border-light)',
                                      backgroundColor: byteColor + (isActive ? '33' : '11'),
                                      color: isActive ? byteColor : 'var(--text-color)'
                                    }}
                                  >
                                    {byte}
                                  </span>
                                );
                              })}
                            </div>
                            {isActive && (
                              <motion.div 
                                layoutId="active-indicator"
                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                    <div className="pt-4 border-t border-[var(--border-light)] flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--cyber-neon-blue)]" />
                        <span className="text-[9px] font-mono text-[var(--text-dim)] uppercase">Tag</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--cyber-neon-yellow)]" />
                        <span className="text-[9px] font-mono text-[var(--text-dim)] uppercase">Length</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--cyber-neon-green)]" />
                        <span className="text-[9px] font-mono text-[var(--text-dim)] uppercase">Payload</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <pre className="font-mono text-sm text-[var(--cyber-neon-pink)] leading-relaxed h-64 overflow-auto custom-scrollbar p-2 bg-[var(--section-bg-dark)]/30 rounded border border-[var(--border-light)]">
                    {protoscopeOutput}
                  </pre>
                )}
                <p className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest">
                  {viewMode === 'hex' ? 'Click a segment to investigate its structure' : 'Disassembled binary stream (schema-agnostic)'}
                </p>
              </div>
            </CyberPanel>
          </div>

          {/* Right: Segment Analysis */}
          <div className="space-y-8">
            <CyberPanel title="SEGMENT_INSPECTOR" className="h-full flex flex-col min-h-[500px]">
              <div className="p-6 flex-1 space-y-8">
                {selectedSegment ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest">
                          {selectedSegment.fieldName ? `Field: ${selectedSegment.fieldName}` : 'Field ID'}
                        </span>
                        <div className="text-2xl font-cyber font-bold text-[var(--text-color)]">#{selectedSegment.tag}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest">Wire Type</span>
                        <div className="text-2xl font-cyber font-bold text-[var(--cyber-neon-blue)]">{selectedSegment.wireType}</div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <ByteBreakdown 
                        label="Tag Section" 
                        bytes={selectedSegment.tagBytes} 
                        color="var(--cyber-neon-blue)" 
                      />
                      {selectedSegment.lengthBytes && (
                        <ByteBreakdown 
                          label="Length Section" 
                          bytes={selectedSegment.lengthBytes} 
                          color="var(--cyber-neon-yellow)" 
                        />
                      )}
                      <ByteBreakdown 
                        label="Payload Section" 
                        bytes={selectedSegment.payloadBytes} 
                        color={getSegmentColor(selectedSegment)} 
                      />
                    </div>

                    <div className="p-4 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase">
                           Semantic Value {selectedSegment.fieldType && `(${selectedSegment.fieldType})`}
                         </span>
                         <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[var(--cyber-neon-blue)]/10 text-[var(--cyber-neon-blue)] rounded uppercase">
                           {selectedSegment.wireType === 0 ? 'Varint' : selectedSegment.wireType === 2 ? 'Length-Delimited' : 'Fixed'}
                         </span>
                      </div>
                      <div className="text-lg font-mono text-[var(--text-color)] break-all">
                        {selectedSegment.value.toString()}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MousePointer2 className="w-4 h-4 text-[var(--cyber-neon-blue)]" />
                        <span className="text-xs font-cyber font-bold uppercase tracking-widest">Wire Logic</span>
                      </div>
                      <pre className="p-4 bg-[var(--section-bg-dark)] border border-[var(--border-light)] rounded font-mono text-xs leading-relaxed text-[var(--text-dim)]">
                        {selectedSegment.wireType === 0 && `// Wire Type 0: Read varint until MSB=0\nval = decodeVarint(stream)`}
                        {selectedSegment.wireType === 2 && `// Wire Type 2: Read length varint, then N bytes\nlen = decodeVarint(stream)\ndata = readBytes(len)`}
                        {(selectedSegment.wireType === 1 || selectedSegment.wireType === 5) && `// Fixed Size: Read exactly ${selectedSegment.wireType === 1 ? '8' : '4'} bytes\ndata = readBytes(${selectedSegment.wireType === 1 ? '8' : '4'})`}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--text-dim)] gap-4 py-20">
                    <SearchCheck className="w-12 h-12 opacity-20" />
                    <p className="font-cyber text-sm uppercase tracking-widest opacity-40">Select a segment to analyze</p>
                  </div>
                )}
              </div>
            </CyberPanel>
          </div>
        </div>
      </div>
    </Section>
  );
};

const BinaryPage = ({ messageSchema, fds }: { messageSchema: DescMessage | null, fds: Uint8Array | null }) => (
  <>
    {/* 1. Introduction & Varints First */}
    <Section id="binary-intro" className="py-24 px-4 sm:px-8 bg-[var(--bg-color)]">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Binary} subtitle="05_WIRE_FORMAT">Digging into the binary</SectionTitle>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <h3 className="text-3xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight">Understanding Varints</h3>
              <p className="text-lg text-[var(--text-dim)] leading-relaxed">
                Before we look at the physical wire types, we need to understand the fundamental building block of Protobuf efficiency: <strong>Varints</strong> (variable length integers).
              </p>
              <p className="text-[var(--text-dim)] leading-relaxed">
                Standard integers in memory take 4 or 8 bytes regardless of their value. Varints allow Protobuf to represent smaller numbers with fewer bytes, using the <strong>Most Significant Bit (MSB)</strong> as a continuation flag.
              </p>
            </div>

            <div className="p-6 bg-[var(--cyber-neon-blue)]/5 border border-[var(--cyber-neon-blue)]/20 rounded-xl space-y-4">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-[var(--cyber-neon-blue)]" />
                <h4 className="font-cyber font-bold text-sm uppercase">Minimal Overhead</h4>
              </div>
              <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                Most applications deal with small numbers (IDs, counters, enums). By using Varints, Protobuf often reduces these values to a single byte on the wire, providing massive savings over fixed-width formats.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <VarintExplainer />
          </div>
        </div>
      </div>
    </Section>

    {/* 2. Wire Types & Envelope Strategies */}
    <Section id="wire-types" className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)]/20 border-y border-[var(--border-light)]">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Layers} subtitle="05a_STRUCTURE">Wire Types & Envelopes</SectionTitle>
        <div className="mb-16 max-w-3xl">
          <p className="text-[var(--text-dim)] leading-relaxed">
            Every field on the wire is wrapped in an "envelope" that tells the decoder two things: <strong>which field number</strong> it is, and <strong>how to read</strong> the payload. These are packed into a single Tag byte.
          </p>
        </div>
        <WireFormatBreakdown />
      </div>
    </Section>

    {/* 3. The Explorer Matrix */}
    <BinaryMatrix messageSchema={messageSchema} fds={fds} />

    {/* 4. Protoscope Section */}
    <Section id="protoscope" className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)] border-t border-[var(--border-light)]">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={SearchCheck} subtitle="05c_DEBUGGING">Protoscope</SectionTitle>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-widest">The Schema-Ignorant Debugger</h3>
              <p className="text-[var(--text-dim)] leading-relaxed">
                Protoscope is a diagnostic language for inspecting Protobuf messages. Unlike standard decoders, it doesn't require a <code>.proto</code> file. Instead, it uses heuristics to guess the structure of the binary stream.
              </p>
            </div>

            <div className="space-y-4">
              <TechnicalNuance title="THE_SEMANTIC_GAP">
                Because Protoscope is schema-ignorant, it can reveal the <strong>physical structure</strong> (field numbers and wire types) but cannot know the <strong>semantic meaning</strong> (field names or exact numeric types like signed vs unsigned).
              </TechnicalNuance>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg space-y-3">
                <h4 className="font-cyber font-bold text-xs text-[var(--cyber-neon-blue)] uppercase tracking-widest">Structural Analysis</h4>
                <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                  Reveals the physical layout and nesting level of the message without needing any external definitions.
                </p>
              </div>
              <div className="p-4 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg space-y-3">
                <h4 className="font-cyber font-bold text-xs text-[var(--cyber-neon-pink)] uppercase tracking-widest">Binary Integrity</h4>
                <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                  Perfect for debugging malformed streams or truncated data that would cause standard decoders to fail.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <CyberPanel title="PROTOSCOPE_VS_HEX">
              <div className="p-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest">Hex Stream</span>
                    <pre className="text-xs font-mono text-[var(--cyber-neon-blue)] bg-[var(--section-bg-dark)] p-3 rounded border border-[var(--border-light)]">
                      08 96 01{"\n"}
                      12 05 41 6c 69 63 65
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest">Protoscope</span>
                    <pre className="text-xs font-mono text-[var(--cyber-neon-pink)] bg-[var(--section-bg-dark)] p-3 rounded border border-[var(--border-light)]">
                      1: 150{"\n"}
                      2: "Alice"
                    </pre>
                  </div>
                </div>
                <div className="p-6 bg-[var(--cyber-neon-pink)]/5 border border-[var(--cyber-neon-pink)]/20 rounded-xl italic text-sm text-[var(--text-color)] leading-relaxed">
                  "Protoscope removes the mechanical overhead of bit-packing to show you the structural skeleton, but it lacks the semantic soul of the schema."
                </div>
              </div>
            </CyberPanel>
          </div>
        </div>
      </div>
    </Section>
  </>
);

export default BinaryPage;
