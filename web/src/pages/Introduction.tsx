import { useState, useMemo } from "react";
import { trackEvent } from "../utils/analytics";
import { Link } from "react-router-dom";
import {
  FileCode,
  Binary,
  Braces,
  AlignLeft,
  SearchCheck,
  Database,
  Zap,
  ShieldCheck,
  GitBranch,
  Terminal,
  ArrowRight,
  Cpu,
  ExternalLink,
  Code2,
} from "lucide-react";
import { type DescMessage } from "@bufbuild/protobuf";
import {
  Section,
  SectionTitle,
  CyberPanel,
  ExternalLinkText,
  SyntaxHighlighter,
} from "../components/shared/Common";
import DecodingVisualization from "../components/DecodingVisualization";
import { STATIC_FACES } from "../utils/static-examples";

export const Introduction = ({
  messageSchema,
}: {
  messageSchema: DescMessage | null;
}) => {
  const [activeFace, setActiveFace] = useState("idl");

  const descriptorJson = STATIC_FACES.fds;

  const dynamicExamples = useMemo(() => {
    return {
      hex: STATIC_FACES.bin,
      json: STATIC_FACES.json,
    };
  }, []);

  const faces = [
    {
      id: "idl",
      label: "Schema",
      icon: FileCode,
      title: "The Schema (.proto)",
      desc: "The source of truth. Defines the structure using the Interface Definition Language (IDL).",
      code: STATIC_FACES.idl
        .split("\n")
        .filter(
          (l: string) =>
            !l.includes("import") &&
            !l.includes("package") &&
            !l.includes("syntax") &&
            !l.includes("edition"),
        )
        .join("\n")
        .trim(),
      language: "proto" as const,
      category: "definition",
      panelTitle: "SOURCE_IDL",
    },
    {
      id: "fds",
      label: "Descriptor",
      icon: Code2,
      title: "The Binary Descriptor",
      desc: (
        <>
          The machine-readable version of the schema. This binary message (shown
          here as JSON) describes every type, field, and option in your{" "}
          <code>.proto</code> file, allowing for runtime reflection and dynamic
          tooling.
        </>
      ),
      code: descriptorJson,
      language: "json" as const,
      category: "definition",
      panelTitle: "COMPILED_DESCRIPTOR",
    },
    {
      id: "bin",
      label: "Binary",
      icon: Binary,
      title: "Binary Encoding",
      desc: "What actually travels over the wire. Compact, extremely fast to parse, and machine-optimized.",
      code: dynamicExamples.hex,
      language: null,
      category: "representation",
      panelTitle: "WIRE_FORMAT_HEX",
    },
    {
      id: "json",
      label: "ProtoJSON",
      icon: Braces,
      title: "ProtoJSON Mapping",
      desc: (
        <div className="space-y-4">
          <p>
            A standardized{" "}
            <ExternalLinkText href="https://protobuf.dev/programming-guides/proto3/#json">
              JSON mapping
            </ExternalLinkText>
            . Every binary payload has a deterministic JSON representation.
          </p>
        </div>
      ),
      code: dynamicExamples.json,
      language: "json" as const,
      category: "representation",
      panelTitle: "JSON_REPRESENTATION",
    },
    {
      id: "txt",
      label: "ProtoText",
      icon: AlignLeft,
      title: "ProtoText format",
      desc: (
        <>
          A human-friendly{" "}
          <ExternalLinkText href="https://protobuf.dev/reference/protobuf/textformat-spec/">
            text format
          </ExternalLinkText>{" "}
          often used in CLI tools and server logs. This format is not used as
          often since protojson provides a more standardized and widely
          supported representation that humans can easily read and write.
        </>
      ),
      code: STATIC_FACES.txt,
      language: null,
      category: "representation",
      panelTitle: "TEXT_FORMAT",
    },
    {
      id: "scope",
      label: "Protoscope",
      icon: SearchCheck,
      title: "Protoscope format",
      desc: (
        <>
          A diagnostic language for{" "}
          <ExternalLinkText href="https://github.com/protocolbuffers/protoscope">
            inspecting
          </ExternalLinkText>{" "}
          Protobuf messages. While it can use a schema, it is often used for its
          ability to operate without one, revealing a structural skeleton of the
          binary data through heuristic guesses.
        </>
      ),
      code: STATIC_FACES.scope,
      language: null,
      category: "representation",
      panelTitle: "PROTOSCOPE_DIAGNOSTIC",
    },
  ];

  const current = faces.find((f) => f.id === activeFace)!;

  return (
    <Section id="intro" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto">
      <SectionTitle icon={Database} subtitle="01_DEFINITION" asH1={true}>
        What is Protobuf?
      </SectionTitle>

      <div className="space-y-12 mb-16">
        <div className="space-y-6">
          <p className="text-xl text-[var(--text-color)] font-mono">
            <ExternalLinkText href="https://protobuf.dev/">
              Protocol Buffers
            </ExternalLinkText>{" "}
            (Protobuf) is a binary serialization format built on schemas.
          </p>
          <p className="text-[var(--text-color)] leading-relaxed">
            Developed by{" "}
            <ExternalLinkText href="https://google.com">
              Google
            </ExternalLinkText>{" "}
            for efficient data exchange, it provides a language-neutral way to
            structure information that is smaller and faster than text-based
            formats like JSON or XML.
          </p>
        </div>

        <div className="p-8 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl">
          <h2 className="text-[var(--cyber-neon-blue)] font-cyber uppercase text-sm tracking-widest mb-6">
            Why it matters:
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-8 text-[var(--text-color)]">
            <li className="space-y-3">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-[var(--cyber-neon-pink)]" />
                <span className="font-cyber font-bold text-sm uppercase">
                  Performance
                </span>
              </div>
              <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                Binary encoding is significantly faster to parse and smaller to
                transmit than text-based formats.
              </p>
            </li>
            <li className="space-y-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[var(--cyber-neon-pink)]" />
                <span className="font-cyber font-bold text-sm uppercase">
                  Type Safety
                </span>
              </div>
              <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                Strong schemas prevent a whole class of bugs before they even
                hit production.
              </p>
            </li>
            <li className="space-y-3">
              <div className="flex items-center gap-3">
                <GitBranch className="w-5 h-5 text-[var(--cyber-neon-pink)]" />
                <span className="font-cyber font-bold text-sm uppercase">
                  Compatibility
                </span>
              </div>
              <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                Works with almost every major programming language.
              </p>
            </li>
          </ul>
        </div>
      </div>

      <div className="mb-16 space-y-6">
        <h2 className="text-2xl font-cyber font-bold text-[var(--text-color)] uppercase">
          How it works
        </h2>
        <p className="text-[var(--text-dim)] leading-relaxed">
          Protobuf works by combining a pre-defined <strong>schema</strong> with
          your <strong>data</strong> to produce a compact binary payload. Unlike
          JSON, which carries redundant field names in every message, Protobuf
          uses the schema to identify fields by their number, drastically
          reducing size and increasing parsing speed.
        </p>
        <DecodingVisualization />
      </div>

      <div className="grid grid-cols-1 gap-8 mt-12">
        <CyberPanel title="THE_MANY_FACES_OF_PROTO">
          <div className="p-6 space-y-8">
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              "Protobuf" refers to both an{" "}
              <strong>Interface Definition Language (IDL)</strong> and a
              high-performance <strong>Wire Format</strong>. While the
              machine-optimized binary encoding is the primary target, the
              ecosystem also defines standardized mappings for human-readable
              representations and diagnostic tools. Explore how a single{" "}
              <code className="text-[var(--cyber-neon-blue)]">
                {messageSchema?.name || "User"}
              </code>{" "}
              message can be represented across these different specifications:
            </p>
            <div className="flex flex-col lg:flex-row gap-12 min-h-[350px]">
              {/* Left Nav */}
              <div className="w-full lg:w-64 flex flex-col gap-6">
                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-[0.2em] px-4">
                    Definition
                  </div>
                  {faces
                    .filter((f) => f.category === "definition")
                    .map((face) => (
                      <button
                        key={face.id}
                        onClick={() => {
                          trackEvent("introduction_page_face_click", {
                            face: face.id,
                          });
                          setActiveFace(face.id);
                        }}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left group ${
                          activeFace === face.id
                            ? "bg-[var(--cyber-neon-blue)]/10 border-[var(--cyber-neon-blue)] text-[var(--cyber-neon-blue)]"
                            : "bg-[var(--overlay-bg)] border-[var(--border-light)] text-[var(--text-dim)] hover:border-[var(--cyber-neon-blue)]/50 hover:text-[var(--text-color)]"
                        }`}
                        aria-label={`View ${face.label} representation`}
                      >
                        <face.icon
                          className={`w-5 h-5 ${activeFace === face.id ? "text-[var(--cyber-neon-blue)]" : "text-[var(--text-dim)] group-hover:text-[var(--text-dim)]"}`}
                        />
                        <span className="font-cyber font-bold text-sm tracking-widest uppercase">
                          {face.label}
                        </span>
                      </button>
                    ))}
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-[0.2em] px-4">
                    Representations
                  </div>
                  {faces
                    .filter((f) => f.category === "representation")
                    .map((face) => (
                      <button
                        key={face.id}
                        onClick={() => {
                          trackEvent("introduction_page_face_click", {
                            face: face.id,
                          });
                          setActiveFace(face.id);
                        }}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left group ${
                          activeFace === face.id
                            ? "bg-[var(--cyber-neon-blue)]/10 border-[var(--cyber-neon-blue)] text-[var(--cyber-neon-blue)]"
                            : "bg-[var(--overlay-bg)] border-[var(--border-light)] text-[var(--text-dim)] hover:border-[var(--cyber-neon-blue)]/50 hover:text-[var(--text-color)]"
                        }`}
                        aria-label={`View ${face.label} representation`}
                      >
                        <face.icon
                          className={`w-5 h-5 ${activeFace === face.id ? "text-[var(--cyber-neon-blue)]" : "text-[var(--text-dim)] group-hover:text-[var(--text-dim)]"}`}
                        />
                        <span className="font-cyber font-bold text-sm tracking-widest uppercase">
                          {face.label}
                        </span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 space-y-8 min-w-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-cyber font-bold text-[var(--text-color)] uppercase">
                      {current.title}
                    </h2>
                    <div className="text-[var(--text-dim)] leading-relaxed text-sm max-w-3xl">
                      {current.desc}
                    </div>
                  </div>
                </div>
                <CyberPanel
                  title={current.panelTitle}
                  className="max-w-full overflow-hidden"
                >
                  <div className="p-4 h-[400px] overflow-auto custom-scrollbar">
                    {current.language ? (
                      <SyntaxHighlighter
                        language={current.language}
                        code={current.code}
                      />
                    ) : (
                      <pre className="font-mono text-sm leading-6 text-[var(--cyber-neon-pink)]/80 break-all whitespace-pre-wrap m-0">
                        {current.code}
                      </pre>
                    )}
                  </div>
                </CyberPanel>

                {activeFace === "bin" && (
                  <div className="flex gap-3 p-4 bg-[var(--cyber-neon-pink)]/5 border border-[var(--cyber-neon-pink)]/10 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <Terminal className="w-5 h-5 text-[var(--cyber-neon-pink)] shrink-0" />
                    <p className="text-sm text-[var(--text-dim)] leading-relaxed italic">
                      If you're currently trying to "read" the hex block above
                      and failing: congratulations, you're human. We'll be
                      investigating how machines actually make sense of this
                      chaos in the{" "}
                      <Link
                        to="/binary"
                        className="text-[var(--cyber-neon-pink)] hover:underline"
                      >
                        <strong>Binary</strong>
                      </Link>{" "}
                      section later on.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CyberPanel>
      </div>

      <div className="mt-24 pt-16 border-t border-[var(--border-light)]">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-2xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight mb-2">
            The Compilation Pipeline
          </h2>
          <p className="text-[var(--text-dim)] text-center max-w-2xl">
            How your human-readable schema becomes high-performance code.
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex flex-col md:flex-row items-center gap-8 w-full justify-between max-w-5xl">
            <CyberPanel title="SOURCE" className="w-full md:w-64 text-center">
              <FileCode className="w-12 h-12 text-[var(--cyber-neon-green)] mx-auto mb-4" />
              <span className="font-cyber text-sm">SCHEMA.PROTO</span>
            </CyberPanel>
            <div className="flex flex-col items-center gap-2">
              <ArrowRight className="w-8 h-8 text-[var(--cyber-neon-blue)] rotate-90 md:rotate-0" />
              <span className="text-sm font-mono text-[var(--text-dim)] uppercase">
                <ExternalLinkText href="https://github.com/protocolbuffers/protobuf/releases">
                  protoc
                </ExternalLinkText>{" "}
                /{" "}
                <ExternalLinkText href="https://buf.build/">
                  Buf
                </ExternalLinkText>
              </span>
            </div>
            <CyberPanel
              title="COMPILER"
              className="w-full md:w-64 text-center border-[var(--cyber-neon-blue)] shadow-[0_0_15px_rgba(0,243,255,0.2)]"
            >
              <Cpu className="w-12 h-12 text-[var(--cyber-neon-blue)] mx-auto mb-4 animate-pulse" />
              <span className="font-cyber text-sm text-[var(--cyber-neon-blue)]">
                CODE_GENERATION
              </span>
            </CyberPanel>
            <div className="flex flex-col items-center gap-2">
              <ArrowRight className="w-8 h-8 text-[var(--cyber-neon-pink)] rotate-90 md:rotate-0" />
              <span className="text-sm font-mono text-[var(--text-dim)] uppercase">
                TARGETS
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2 w-full md:w-64">
                <CyberPanel className="flex items-center justify-center p-2 text-sm hover:border-[var(--cyber-neon-blue)] transition-colors group text-center">
                  <ExternalLinkText href="https://protobuf.dev/getting-started/cpptutorial/">
                    C++
                  </ExternalLinkText>
                </CyberPanel>
                <CyberPanel className="flex items-center justify-center p-2 text-sm hover:border-[var(--cyber-neon-blue)] transition-colors group text-center">
                  <ExternalLinkText href="https://protobuf.dev/getting-started/csharptutorial/">
                    C#
                  </ExternalLinkText>
                </CyberPanel>
                <CyberPanel className="flex items-center justify-center p-2 text-sm hover:border-[var(--cyber-neon-blue)] transition-colors group text-center">
                  <ExternalLinkText href="https://protobuf.dev/reference/dart/dart-generated/">
                    Dart
                  </ExternalLinkText>
                </CyberPanel>
                <CyberPanel className="flex items-center justify-center p-2 text-sm hover:border-[var(--cyber-neon-blue)] transition-colors group text-center">
                  <ExternalLinkText href="https://protobuf.dev/getting-started/gotutorial/">
                    Go
                  </ExternalLinkText>
                </CyberPanel>
                <CyberPanel className="flex items-center justify-center p-2 text-sm hover:border-[var(--cyber-neon-blue)] transition-colors group text-center">
                  <ExternalLinkText href="https://protobuf.dev/getting-started/javatutorial/">
                    Java
                  </ExternalLinkText>
                </CyberPanel>
                <CyberPanel className="flex items-center justify-center p-2 text-sm hover:border-[var(--cyber-neon-blue)] transition-colors group text-center">
                  <ExternalLinkText href="https://protobuf.dev/reference/kotlin/kotlin-generated/">
                    Kotlin
                  </ExternalLinkText>
                </CyberPanel>
                <CyberPanel className="flex items-center justify-center p-2 text-sm hover:border-[var(--cyber-neon-blue)] transition-colors group text-center">
                  <ExternalLinkText href="https://protobuf.dev/getting-started/pythontutorial/">
                    Python
                  </ExternalLinkText>
                </CyberPanel>
                <CyberPanel className="flex items-center justify-center p-2 text-sm border-[var(--cyber-neon-green)]/30 bg-[var(--cyber-neon-green)]/5 hover:border-[var(--cyber-neon-green)] transition-colors group text-center">
                  <a
                    href="https://github.com/protocolbuffers/protobuf/blob/main/docs/third_party.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--cyber-neon-green)] font-mono tracking-tighter flex items-center justify-center gap-1 hover:underline text-xs"
                  >
                    Community Plugins
                    <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                  </a>
                </CyberPanel>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center text-[var(--text-dim)] space-y-4">
            <p>
              Compilation translates your language-neutral schema into
              high-performance source code for your specific language. This
              generated code handles all the complexity of bit-packing and
              validation.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Introduction;
