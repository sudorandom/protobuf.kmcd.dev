import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  BarChart3
} from 'lucide-react';
import { fromJson, toBinary, toJsonString, type DescMessage } from '@bufbuild/protobuf';
import {
  Section,
  SectionTitle,
  CyberPanel,
  ExternalLinkText
} from '../components/shared/Common';
import { JsonEditor } from '../components/shared/JsonEditor';
import { decodeBinary } from '../utils/decoder';
import { generateFake } from '../utils/wasm-parser';
import { SIZE_EXAMPLES } from '../utils/constants';

// --- Helpers ---

async function getGzipSize(data: string | Uint8Array): Promise<number> {
  try {
    const stream = new Blob([data as BlobPart]).stream().pipeThrough(new CompressionStream('gzip'));
    const response = new Response(stream);
    const buffer = await response.arrayBuffer();
    return buffer.byteLength;
  } catch {
    return 0;
  }
}

export const SizeComparison = ({ messageSchema, fileDescriptorSet }: { messageSchema: DescMessage | null, fileDescriptorSet: Uint8Array | null }) => {
  const [activeExample, setActiveExample] = useState<keyof typeof SIZE_EXAMPLES | 'FAUX'>('BASIC');
  const [jsonInput, setJsonInput] = useState(JSON.stringify(SIZE_EXAMPLES.BASIC, null, 2));
  const [isGenerating, setIsGenerating] = useState(false);
  const [gzipStats, setGzipStats] = useState({ json: 0, pb: 0 });

  const handleExampleChange = (key: keyof typeof SIZE_EXAMPLES) => {
    setActiveExample(key);
    setJsonInput(JSON.stringify(SIZE_EXAMPLES[key], null, 2));
  };

  const generateFauxData = async () => {
    if (!messageSchema || !fileDescriptorSet) return;
    setIsGenerating(true);
    try {
      const fakeJson = await generateFake(messageSchema.typeName, fileDescriptorSet);
      setJsonInput(fakeJson);
      setActiveExample('FAUX');
    } catch (e) {
      console.error("Failed to generate faux data:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const stats = useMemo(() => {
    if (!messageSchema) return { jsonSize: 0, pbSize: 0, ratio: '0', error: "NO_SCHEMA", binary: new Uint8Array(), segments: [] };
    try {
      const obj = JSON.parse(jsonInput);
      const user = fromJson(messageSchema, obj, { ignoreUnknownFields: true });
      const binary = toBinary(messageSchema, user);
      const jsonStr = toJsonString(messageSchema, user);

      const jsonSize = new TextEncoder().encode(jsonStr).length;
      const pbSize = binary.length;
      const ratio = jsonSize > 0 ? ((1 - pbSize / jsonSize) * 100).toFixed(1) : '0';

      const segments = decodeBinary(binary);

      return { jsonSize, pbSize, ratio, error: null, binary, segments, jsonStr };
    } catch (e: unknown) {
      const error = e instanceof Error ? e.message : String(e);
      return { jsonSize: 0, pbSize: 0, ratio: '0', error, binary: new Uint8Array(), segments: [], jsonStr: '' };
    }
  }, [jsonInput, messageSchema]);

  useEffect(() => {
    if (stats.error || !stats.jsonStr || !stats.binary.length) return;
    const fetchGzip = async () => {
      const [jSize, pSize] = await Promise.all([
        getGzipSize(stats.jsonStr),
        getGzipSize(stats.binary)
      ]);
      setGzipStats({ json: jSize, pb: pSize });
    };
    fetchGzip();
  }, [stats.jsonStr, stats.binary, stats.error]);
  return (
    <Section id="efficiency" className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)] border-t border-[var(--border-light)]">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Zap} subtitle="04_PERFORMANCE">Efficiency</SectionTitle>

        <div className="mb-12 space-y-12 text-[var(--text-color)] leading-relaxed">
          <div className="space-y-4 text-lg">
            <p>
              The message size savings you can expect from Protobuf highly depend on your data. Large strings will always take space, but numeric data and sparse messages (many optional fields) see massive reductions compared to JSON.
            </p>
            <p className="text-base text-[var(--text-dim)]">
              Try a few different scenarios below: use the preset examples, <span className="text-[var(--cyber-neon-pink)] font-bold uppercase">generate fake data</span> (powered by <ExternalLinkText href="https://fauxrpc.com"><strong>FauxRPC</strong></ExternalLinkText>), or fill in your own.
            </p>
          </div>

          <CyberPanel title="TECHNICAL_BENEFIT // PARSING_SPEED" className="border-[var(--cyber-neon-blue)]/20 shadow-[0_0_20px_rgba(0,243,255,0.05)]">
            <div className="p-8 space-y-4">
              <h4 className="text-[var(--text-color)] font-cyber font-bold uppercase text-base flex items-center gap-3">
                <Zap className="w-5 h-5 text-[var(--cyber-neon-blue)]" />
                Beyond Just Size: Parsing Speed
              </h4>
              <p className="text-sm text-[var(--text-dim)] leading-relaxed max-w-4xl">
                While size is a major benefit, Protobuf's real superpower is <strong>parsing performance</strong>. Because the format is binary and avoids expensive string-parsing logic, it can be <ExternalLinkText href="https://auth0.com/blog/beating-json-performance-with-protobuf/">up to 6x faster to parse than JSON</ExternalLinkText>.
              </p>
              <p className="text-sm text-[var(--text-dim)] leading-relaxed max-w-4xl">
                The binary format strikes a careful balance between extreme efficiency and enough structural simplicity to allow for robust, cross-language decoding.
              </p>
            </div>
          </CyberPanel>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {(Object.keys(SIZE_EXAMPLES) as Array<keyof typeof SIZE_EXAMPLES>).map((key) => (
             <button
               key={key}
               onClick={() => handleExampleChange(key)}
               className={`px-4 py-1 text-xs font-cyber font-bold border transition-all rounded-md ${activeExample === key
                 ? 'bg-[var(--cyber-neon-blue)] border-[var(--cyber-neon-blue)] text-black shadow-[0_0_10px_rgba(0,243,255,0.3)]'
                 : 'bg-[var(--overlay-bg)] border-[var(--border-light)] text-[var(--text-dim)] hover:border-white/30 hover:text-[var(--text-color)]'
                 }`}
             >
              {key}
            </button>
          ))}
          <button
            onClick={generateFauxData}
            disabled={!messageSchema || !fileDescriptorSet || isGenerating}
            className={`px-4 py-1.5 text-xs font-cyber font-bold border transition-all flex items-center gap-2 rounded-md ${activeExample === 'FAUX'
              ? 'bg-[var(--cyber-neon-pink)] border-[var(--cyber-neon-pink)] text-black shadow-[0_0_15px_rgba(255,0,255,0.4)]'
              : 'bg-[var(--cyber-neon-pink)]/10 border-[var(--cyber-neon-pink)]/50 text-[var(--cyber-neon-pink)] hover:bg-[var(--cyber-neon-pink)]/20 hover:border-[var(--cyber-neon-pink)] disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(255,0,255,0.1)]'
              }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'GENERATING...' : 'GENERATE_FAUX_DATA'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CyberPanel title="DATA_INPUT (JSON)" headerExtra={stats.error && stats.error !== "NO_SCHEMA" && <span className="text-xs text-[var(--text-error)] font-mono">PARSE_ERROR</span>}>
            <div className="flex flex-col h-80">
              <div className="flex-1 min-h-0">
                <JsonEditor value={jsonInput} onChange={setJsonInput} className="h-full rounded-none border-none bg-transparent" />
              </div>
              {stats.error && stats.error !== "NO_SCHEMA" && (
                <div className="p-2 bg-[var(--text-error)]/10 border-t border-[var(--text-error)]/30 text-[var(--text-error)] text-xs font-mono break-words line-clamp-2" title={stats.error}>
                  {stats.error}
                </div>
              )}
            </div>
          </CyberPanel>

          <CyberPanel title="REAL_TIME_ANALYSIS">
            <div className="space-y-6 py-4">
              <p className="text-sm text-[var(--text-dim)] leading-relaxed mb-4">
                Watch as the binary encoder strips away the redundant field names and formatting that bloats JSON payloads.
              </p>

              {/* Size Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span>JSON_RAW</span>
                    <span className="text-[var(--text-color)]">{stats.jsonSize} B</span>
                  </div>
                  <div className="h-1.5 bg-[var(--border-light)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--text-dim)]" style={{ width: '100%' }}></div>
                  </div>
                  {gzipStats.json > 0 && (
                    <div className="flex justify-between text-xs font-mono mt-1 text-[var(--text-dim)]">
                      <span>WITH_GZIP</span>
                      <span>{gzipStats.json} B</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-2 text-[var(--cyber-neon-green)]">
                    <span>PROTOBUF_BINARY</span>
                    <span className="text-[var(--cyber-neon-green)] font-bold">{stats.pbSize} B</span>
                  </div>
                  <div className="h-1.5 bg-[var(--border-light)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.jsonSize > 0 ? (stats.pbSize / stats.jsonSize) * 100 : 0}%` }}
                      className="h-full bg-[var(--cyber-neon-green)]"
                    />
                  </div>
                  {gzipStats.pb > 0 && (
                    <div className="flex justify-between text-xs font-mono mt-1 text-[var(--cyber-neon-green)]/80">
                      <span>WITH_GZIP</span>
                      <span>{gzipStats.pb} B</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-light)] flex items-end justify-between">
                <div>
                  <p className="text-4xl font-cyber font-bold text-[var(--cyber-neon-green)]">-{stats.ratio}%</p>
                  <p className="text-xs font-mono text-[var(--text-dim)] mt-1 uppercase">RAW_PAYLOAD_REDUCTION</p>
                </div>
                {gzipStats.json > 0 && gzipStats.pb > 0 && (
                  <div className="text-right">
                    <p className={`text-xl font-cyber font-bold ${gzipStats.pb < gzipStats.json ? 'text-[var(--cyber-neon-blue)]' : 'text-[var(--cyber-neon-yellow)]'}`}>
                      {gzipStats.pb < gzipStats.json ? '-' : '+'}{Math.abs(Number(((1 - gzipStats.pb / gzipStats.json) * 100).toFixed(1)))}%
                    </p>
                    <p className="text-[9px] font-mono text-[var(--text-dim)] uppercase">GZIPPED_PB vs GZIPPED_JSON</p>
                  </div>
                )}
              </div>
            </div>
          </CyberPanel>
        </div>

        <div className="mt-8 p-4 bg-[var(--cyber-neon-blue)]/5 border border-[var(--cyber-neon-blue)]/10 rounded text-sm text-[var(--text-dim)] space-y-3">
          <p><strong>How it works:</strong></p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <li className="flex gap-2"><div className="w-1 h-1 bg-[var(--cyber-neon-blue)] mt-1.5 shrink-0"></div> No field names in payload (replaced by small numeric tags).</li>
            <li className="flex gap-2"><div className="w-1 h-1 bg-[var(--cyber-neon-blue)] mt-1.5 shrink-0"></div> No structural overhead: curly braces, brackets, and commas (which each take 1 byte in JSON) are eliminated.</li>
            <li className="flex gap-2"><div className="w-1 h-1 bg-[var(--cyber-neon-blue)] mt-1.5 shrink-0"></div> Varint encoding shrinks small integers to 1-2 bytes.</li>
            <li className="flex gap-2"><div className="w-1 h-1 bg-[var(--cyber-neon-blue)] mt-1.5 shrink-0"></div> Optional fields take zero space if not set.</li>
          </ul>
        </div>

        <div className="mt-24 space-y-16">
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight">Size vs. Compression</h3>
            <p className="text-[var(--text-dim)] leading-relaxed">
              While Protobuf provides a massive reduction in <span className="text-[var(--cyber-neon-green)] font-bold">raw payload size (typically 30-50%)</span> compared to JSON, the gap often narrows when GZIP or Brotli compression is applied. For GZIP compressed payloads, the difference is usually in the <span className="text-[var(--cyber-neon-blue)] font-bold">15-30% range</span>.
            </p>
            <p className="text-[var(--text-dim)] leading-relaxed">
              However, there is a critical tradeoff: compression adds significant CPU overhead to every request. For smaller payloads, the time spent compressing and decompressing can be greater than the time saved by the smaller transfer size. In these cases, sending uncompressed Protobuf is often the most optimal path for overall latency.
            </p>
            <p className="text-[var(--text-dim)] leading-relaxed text-sm">
              Protobuf shines when your data has many numbers, enums, or sparse fields. String-heavy payloads benefit less from binary encoding but still benefit from Protobuf's schema-driven performance and type safety.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 text-[var(--cyber-neon-blue)]">
              <BarChart3 className="w-6 h-6" />
              <h3 className="text-xl sm:text-2xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight">The Benchmark Landscape</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h4 className="text-sm font-cyber font-bold text-[var(--cyber-neon-pink)] uppercase tracking-widest">Language Matters</h4>
                <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                  Protobuf performance is highly dependent on the language and library implementation. In languages with native binary support like <strong>C++, Go, and Java</strong>, Protobuf can be decodes <strong>5x-10x faster</strong> than JSON.
                </p>
                <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                  In interpreted languages like <strong>JavaScript (Node.js) or Python</strong>, the gap can be smaller due to the overhead of moving data between the runtime and the binary parser, though it still generally outperforms standard JSON libraries in high-throughput scenarios.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-cyber font-bold text-[var(--cyber-neon-green)] uppercase tracking-widest">Data Type Sensitivity</h4>
                <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                  If your payload is 90% long strings (like blog posts), Protobuf will only save you a few percentage points of space. However, if your data is <strong>numeric-heavy</strong> (IDs, timestamps, coordinates, or metrics), Protobuf DECIMATES JSON in both size and speed.
                </p>
                <p className="text-sm text-[var(--text-dim)] leading-relaxed italic border-l-2 border-[var(--cyber-neon-green)]/80 pl-4">
                  "The win isn't just bytes on the wire; it's the CPU cycles saved by not parsing millions of brackets and quotes."
                </p>
              </div>
            </div>

            <CyberPanel title="REPUTABLE_ENGINEERING_REPORTS">
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <a
                  href="https://auth0.com/blog/beating-json-performance-with-protobuf/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-4 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg hover:border-[var(--cyber-neon-blue)]/40 transition-all"
                >
                  <h5 className="font-cyber text-xs text-[var(--cyber-neon-blue)] mb-2 group-hover:underline">Auth0 Engineering</h5>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed">Classic deep dive comparing binary vs text overhead in real-world API requests.</p>
                </a>
                <a
                  href="https://grpc.io/docs/guides/benchmarking/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-4 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg hover:border-[var(--cyber-neon-pink)]/40 transition-all"
                >
                  <h5 className="font-cyber text-xs text-[var(--cyber-neon-pink)] mb-2 group-hover:underline">Official gRPC Benchmarks</h5>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed">Throughput and latency metrics for Protobuf-over-HTTP/2 across various languages.</p>
                </a>
                <a
                  href="https://www.atlassian.com/blog/atlassian-engineering/using-protobuf-to-make-jira-cloud-faster"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-4 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg hover:border-[var(--cyber-neon-green)]/40 transition-all"
                >
                  <h5 className="font-cyber text-xs text-[var(--cyber-neon-green)] mb-2 group-hover:underline">Atlassian Engineering</h5>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed">A detailed case study on how Jira improved p99 latency by 20% and reduced CPU usage by 75% using Protobuf.</p>
                </a>
              </div>
            </CyberPanel>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default SizeComparison;
