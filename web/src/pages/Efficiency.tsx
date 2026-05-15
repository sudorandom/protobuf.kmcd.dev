import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  BarChart3,
  Settings2,
  Database,
  Tag,
  Maximize,
  Minimize2,
  CircleOff,
} from "lucide-react";
import {
  fromJson,
  toBinary,
  toJsonString,
  type DescMessage,
} from "@bufbuild/protobuf";
import {
  Section,
  SectionTitle,
  CyberPanel,
  ExternalLinkText,
} from "../components/shared/Common";
import { JsonEditor } from "../components/shared/JsonEditor";
import { Modal } from "../components/shared/Modal";
import { InteractiveSchemaEditor } from "../components/shared/InteractiveSchemaEditor";
import { decodeBinary } from "../utils/decoder";
import { generateFake } from "../utils/wasm-parser";
import { SIZE_EXAMPLES, INITIAL_PROTO } from "../utils/constants";

// --- Helpers ---

async function getGzipSize(data: string | Uint8Array): Promise<number> {
  try {
    const stream = new Blob([data as BlobPart])
      .stream()
      .pipeThrough(new CompressionStream("gzip"));
    const response = new Response(stream);
    const buffer = await response.arrayBuffer();
    return buffer.byteLength;
  } catch {
    return 0;
  }
}

export const SizeComparison = ({
  messageSchema,
  fileDescriptorSet,
  protoSource,
  setProtoSource,
}: {
  messageSchema: DescMessage | null;
  fileDescriptorSet: Uint8Array | null;
  protoSource: string;
  setProtoSource: (s: string) => void;
}) => {
  const [activeExample, setActiveExample] = useState<
    keyof typeof SIZE_EXAMPLES | null
  >("BASIC");
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(SIZE_EXAMPLES.BASIC, null, 2),
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [gzipStats, setGzipStats] = useState({ json: 0, pb: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExampleChange = (key: keyof typeof SIZE_EXAMPLES) => {
    setActiveExample(key);
    setJsonInput(JSON.stringify(SIZE_EXAMPLES[key], null, 2));
  };

  const generateFauxData = async () => {
    if (!messageSchema || !fileDescriptorSet) return;
    setIsGenerating(true);
    try {
      const fakeJson = await generateFake(
        messageSchema.typeName,
        fileDescriptorSet,
      );
      setJsonInput(fakeJson);
      setActiveExample(null);
    } catch (e) {
      console.error("Failed to generate faux data:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const stats = useMemo(() => {
    if (!messageSchema)
      return {
        jsonSize: 0,
        pbSize: 0,
        ratio: "0",
        error: "NO_SCHEMA",
        binary: new Uint8Array(),
        segments: [],
      };
    try {
      const obj = JSON.parse(jsonInput);
      const user = fromJson(messageSchema, obj, { ignoreUnknownFields: true });
      const binary = toBinary(messageSchema, user);
      const jsonStr = toJsonString(messageSchema, user);

      const jsonSize = new TextEncoder().encode(jsonStr).length;
      const pbSize = binary.length;
      const ratio =
        jsonSize > 0 ? ((1 - pbSize / jsonSize) * 100).toFixed(1) : "0";

      const segments = decodeBinary(binary);

      return {
        jsonSize,
        pbSize,
        ratio,
        error: null,
        binary,
        segments,
        jsonStr,
      };
    } catch (e: unknown) {
      const error = e instanceof Error ? e.message : String(e);
      return {
        jsonSize: 0,
        pbSize: 0,
        ratio: "0",
        error,
        binary: new Uint8Array(),
        segments: [],
        jsonStr: "",
      };
    }
  }, [jsonInput, messageSchema]);

  useEffect(() => {
    if (stats.error || !stats.jsonStr || !stats.binary.length) return;
    const fetchGzip = async () => {
      const [jSize, pSize] = await Promise.all([
        getGzipSize(stats.jsonStr),
        getGzipSize(stats.binary),
      ]);
      setGzipStats({ json: jSize, pb: pSize });
    };
    fetchGzip();
  }, [stats.jsonStr, stats.binary, stats.error]);

  return (
    <Section
      id="efficiency"
      className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)] border-t border-[var(--border-light)]"
    >
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Zap} subtitle="04_PERFORMANCE">
          Efficiency
        </SectionTitle>

        <div className="mb-12 space-y-12 text-[var(--text-color)] leading-relaxed">
          <div className="space-y-4 text-lg">
            <p>
              The message size savings you can expect from Protobuf highly
              depend on your data. Large strings will always take space, but
              numeric data and sparse messages (many optional fields) see
              massive reductions compared to JSON.
            </p>
            <p className="text-base text-[var(--text-dim)]">
              Try a few different scenarios below: use the preset examples,{" "}
              <span className="text-[var(--cyber-neon-pink)] font-bold uppercase">
                randomize
              </span>{" "}
              (powered by{" "}
              <ExternalLinkText href="https://fauxrpc.com">
                <strong>FauxRPC</strong>
              </ExternalLinkText>
              ), or fill in your own.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch relative">
          {/* Global Interactive Sign for Large Screens */}
          <div className="absolute -left-48 top-48 hidden xl:flex flex-col items-end gap-2 text-[var(--cyber-neon-pink)] pointer-events-none animate-pulse z-10 opacity-70">
            <span className="font-cyber text-xs uppercase tracking-widest text-right">
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

          {/* Left Column: Payload Input */}
          <div className="space-y-4 flex flex-col">
            <div className="flex items-center justify-between h-8">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-cyber font-bold text-[var(--text-color)] uppercase flex items-center gap-2 tracking-widest">
                  <Database className="w-4 h-4 text-[var(--cyber-neon-blue)]" />
                  Payload Input
                </h3>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs font-cyber font-bold text-[var(--cyber-neon-blue)] hover:text-[var(--cyber-neon-blue)]/80 transition-colors uppercase flex items-center gap-1 group"
                  aria-label="Edit Protobuf Schema"
                >
                  <Settings2 className="w-3 h-3 group-hover:rotate-45 transition-transform" />
                  Edit Schema
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              {(
                Object.keys(SIZE_EXAMPLES) as Array<keyof typeof SIZE_EXAMPLES>
              ).map((key) => (
                <button
                  key={key}
                  onClick={() => handleExampleChange(key)}
                  className={`px-3 py-1 text-xs font-mono border transition-all rounded ${
                    activeExample === key
                      ? "bg-[var(--cyber-neon-blue)]/20 border-[var(--cyber-neon-blue)] text-[var(--cyber-neon-blue)]"
                      : "bg-[var(--overlay-bg)] border-[var(--border-light)] text-[var(--text-dim)] hover:border-white/30 hover:text-[var(--text-color)]"
                  }`}
                  aria-label={`Load ${key} example data`}
                >
                  {key}
                </button>
              ))}
              <button
                onClick={generateFauxData}
                disabled={!messageSchema || !fileDescriptorSet || isGenerating}
                className="px-2 py-1 text-xs font-cyber font-bold border border-[var(--cyber-neon-pink)] bg-[var(--cyber-neon-pink)]/10 text-[var(--cyber-neon-pink)] hover:bg-[var(--cyber-neon-pink)]/20 transition-all flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed rounded uppercase tracking-wider"
                aria-label="Generate Random Data"
              >
                <Zap
                  className={`w-2.5 h-2.5 ${isGenerating ? "animate-spin" : ""}`}
                />
                Randomize
              </button>
            </div>

            <CyberPanel
              title="DATA_INPUT (JSON)"
              className="flex-1 min-h-[400px] flex flex-col"
            >
              <div className="flex-1 relative">
                {stats.error && stats.error !== "NO_SCHEMA" && (
                  <div
                    className="absolute top-0 left-0 right-0 p-2 bg-[var(--text-error)]/10 border-b border-[var(--text-error)]/30 text-[var(--text-error)] text-xs font-mono z-30 break-words line-clamp-2"
                    title={stats.error}
                  >
                    {stats.error}
                  </div>
                )}
                <JsonEditor
                  value={jsonInput}
                  onChange={setJsonInput}
                  className="h-full rounded-none border-none bg-transparent"
                />
              </div>
            </CyberPanel>
          </div>

          {/* Right Column: Analysis */}
          <div className="space-y-4 flex flex-col">
            <div className="flex items-center justify-between h-8">
              <h3 className="text-sm font-cyber font-bold text-[var(--text-color)] uppercase flex items-center gap-2 tracking-widest">
                <BarChart3 className="w-4 h-4 text-[var(--cyber-neon-green)]" />
                Real-Time Analysis
              </h3>
            </div>

            <CyberPanel
              title="EFFICIENCY_STATS"
              className="flex-1 min-h-[400px] flex flex-col"
            >
              <div className="flex-1 py-4 px-2 space-y-8">
                <p className="text-xs text-[var(--text-dim)] leading-relaxed uppercase tracking-wide">
                  Compare how Protobuf's binary format reduces overhead by
                  removing field names and structural formatting.
                </p>

                {/* Size Bars */}
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-2 uppercase tracking-widest">
                      <span>JSON_RAW</span>
                      <span className="text-[var(--text-color)]">
                        {stats.jsonSize} B
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--border-light)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--text-dim)] opacity-40"
                        style={{ width: "100%" }}
                      ></div>
                    </div>
                    {gzipStats.json > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs font-mono mb-2 text-[var(--text-dim)] uppercase tracking-widest">
                          <span>WITH_GZIP</span>
                          <span>{gzipStats.json} B</span>
                        </div>
                        <div className="h-2 bg-[var(--border-light)] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${stats.jsonSize > 0 ? (gzipStats.json / stats.jsonSize) * 100 : 0}%`,
                            }}
                            className="h-full bg-[var(--text-dim)] opacity-25"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-2 text-[var(--cyber-neon-green)] uppercase tracking-widest">
                      <span>PROTOBUF_BINARY</span>
                      <span className="text-[var(--cyber-neon-green)] font-bold">
                        {stats.pbSize} B
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--border-light)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${stats.jsonSize > 0 ? (stats.pbSize / stats.jsonSize) * 100 : 0}%`,
                        }}
                        className="h-full bg-[var(--cyber-neon-green)] shadow-[0_0_10px_rgba(0,255,159,0.3)]"
                      />
                    </div>
                    {gzipStats.pb > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs font-mono mb-2 text-[var(--cyber-neon-green)]/80 uppercase tracking-widest">
                          <span>WITH_GZIP</span>
                          <span>{gzipStats.pb} B</span>
                        </div>
                        <div className="h-2 bg-[var(--border-light)] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${stats.jsonSize > 0 ? (gzipStats.pb / stats.jsonSize) * 100 : 0}%`,
                            }}
                            className="h-full bg-[var(--cyber-neon-green)]/30"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-8 border-t border-[var(--border-light)] flex items-end justify-between">
                  <div>
                    <p className="text-5xl font-cyber font-bold text-[var(--cyber-neon-green)] shadow-glow">
                      -{stats.ratio}%
                    </p>
                    <p className="text-xs font-mono text-[var(--text-dim)] mt-2 uppercase tracking-[0.2em]">
                      RAW_PAYLOAD_REDUCTION
                    </p>
                  </div>
                  {gzipStats.json > 0 && gzipStats.pb > 0 && (
                    <div className="text-right">
                      <p
                        className={`text-2xl font-cyber font-bold ${gzipStats.pb < gzipStats.json ? "text-[var(--cyber-neon-blue)]" : "text-[var(--cyber-neon-yellow)]"}`}
                      >
                        {gzipStats.pb < gzipStats.json ? "-" : "+"}
                        {Math.abs(
                          Number(
                            ((1 - gzipStats.pb / gzipStats.json) * 100).toFixed(
                              1,
                            ),
                          ),
                        )}
                        %
                      </p>
                      <p className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest">
                        GZIPPED_PB vs JSON
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CyberPanel>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Tag,
              title: "Numeric Tags",
              desc: "Field names are never sent on the wire, only small numeric tags.",
              color: "var(--cyber-neon-blue)",
            },
            {
              icon: Maximize,
              title: "No Overhead",
              desc: "Eliminates braces, quotes, and commas required by JSON structure.",
              color: "var(--cyber-neon-pink)",
            },
            {
              icon: Minimize2,
              title: "Varints",
              desc: "Small integers are compressed to take only 1-2 bytes of space.",
              color: "var(--cyber-neon-green)",
            },
            {
              icon: CircleOff,
              title: "Zero-Cost Options",
              desc: "Unset fields take exactly zero space in the binary payload.",
              color: "var(--cyber-neon-yellow)",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-4 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg flex flex-col gap-3 group hover:border-[var(--cyber-neon-blue)]/50 transition-all"
            >
              <div
                className="p-2 w-fit rounded-md bg-[var(--bg-color)] border border-[var(--border-light)] group-hover:scale-110 transition-transform"
                style={{ color: item.color }}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4
                  className="text-xs font-cyber font-bold uppercase tracking-widest"
                  style={{ color: item.color }}
                >
                  {item.title}
                </h4>
                <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Schema Definition (.proto)"
        >
          <InteractiveSchemaEditor
            initialValue={protoSource}
            defaultValue={INITIAL_PROTO}
            onSave={async (s, result) => {
              setProtoSource(s);
              if (result) {
                const schema =
                  result.registry.getMessage("demo.v1.User") ||
                  result.registry.getFile("input.proto")?.messages[0];
                if (schema) {
                  try {
                    const fakeJson = await generateFake(
                      schema.typeName,
                      result.fds,
                    );
                    setJsonInput(fakeJson);
                    setActiveExample(null);
                  } catch (e) {
                    console.error(
                      "Failed to generate faux data after save:",
                      e,
                    );
                  }
                }
              }
              setIsModalOpen(false);
            }}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>

        <div className="mt-24 space-y-16">
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight">
              Size vs. Compression
            </h3>
            <p className="text-[var(--text-dim)] leading-relaxed">
              While Protobuf provides a massive reduction in{" "}
              <span className="text-[var(--cyber-neon-green)] font-bold">
                raw payload size (typically 30-50%)
              </span>{" "}
              compared to JSON, the gap often narrows when GZIP or Brotli
              compression is applied. For GZIP compressed payloads, the
              difference is usually in the{" "}
              <span className="text-[var(--cyber-neon-blue)] font-bold">
                15-30% range
              </span>
              .
            </p>
            <p className="text-[var(--text-dim)] leading-relaxed">
              This comes with a tradeoff: while compression reduces size
              further, it introduces CPU overhead for every request. For smaller
              payloads, the time spent on compression can exceed the transfer
              time savings. Uncompressed Protobuf often provides the best
              balance of size and latency.
            </p>{" "}
            <p className="text-[var(--text-dim)] leading-relaxed text-sm">
              Protobuf shines when your data has many numbers, enums, or sparse
              fields. String-heavy payloads benefit less from binary encoding
              but still benefit from Protobuf's schema-driven performance and
              type safety.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 text-[var(--cyber-neon-blue)]">
              <BarChart3 className="w-6 h-6" />
              <h3 className="text-xl sm:text-2xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight">
                The Benchmark Landscape
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h4 className="text-sm font-cyber font-bold text-[var(--cyber-neon-pink)] uppercase tracking-widest">
                  Language Matters
                </h4>
                <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                  Protobuf performance is highly dependent on the language and
                  library implementation. In languages with native binary
                  support like <strong>C++, Go, and Java</strong>, Protobuf can
                  be decodes <strong>5x-10x faster</strong> than JSON.
                </p>
                <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                  In interpreted languages like{" "}
                  <strong>JavaScript (Node.js) or Python</strong>, the gap can
                  be smaller due to the overhead of moving data between the
                  runtime and the binary parser, though it still generally
                  outperforms standard JSON libraries in high-throughput
                  scenarios.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-cyber font-bold text-[var(--cyber-neon-green)] uppercase tracking-widest">
                  Data Type Sensitivity
                </h4>
                <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                  If your payload is 90% long strings (like blog posts),
                  Protobuf will only save you a few percentage points of space.
                  However, if your data is <strong>numeric-heavy</strong> (IDs,
                  timestamps, coordinates, or metrics), Protobuf DECIMATES JSON
                  in both size and speed.
                </p>
                <p className="text-sm text-[var(--text-dim)] leading-relaxed italic border-l-2 border-[var(--cyber-neon-green)]/80 pl-4">
                  "The win isn't just bytes on the wire; it's the CPU cycles
                  saved by not parsing millions of brackets and quotes."
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
                  <h5 className="font-cyber text-xs text-[var(--cyber-neon-blue)] mb-2 group-hover:underline">
                    Auth0 Engineering
                  </h5>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                    Classic deep dive comparing binary vs text overhead in
                    real-world API requests.
                  </p>
                </a>
                <a
                  href="https://grpc.io/docs/guides/benchmarking/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-4 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg hover:border-[var(--cyber-neon-pink)]/40 transition-all"
                >
                  <h5 className="font-cyber text-xs text-[var(--cyber-neon-pink)] mb-2 group-hover:underline">
                    Official gRPC Benchmarks
                  </h5>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                    Throughput and latency metrics for Protobuf-over-HTTP/2
                    across various languages.
                  </p>
                </a>
                <a
                  href="https://www.atlassian.com/blog/atlassian-engineering/using-protobuf-to-make-jira-cloud-faster"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-4 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg hover:border-[var(--cyber-neon-green)]/40 transition-all"
                >
                  <h5 className="font-cyber text-xs text-[var(--cyber-neon-green)] mb-2 group-hover:underline">
                    Atlassian Engineering
                  </h5>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                    A detailed case study on how Jira improved p99 latency by
                    20% and reduced CPU usage by 75% using Protobuf.
                  </p>
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
