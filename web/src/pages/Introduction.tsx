import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Cpu
} from 'lucide-react';
import { fromJson, toBinary, type DescMessage } from '@bufbuild/protobuf';
import {
  Section,
  SectionTitle,
  CyberPanel,
  ExternalLinkText,
  TechnicalNuance,
  SyntaxHighlighter
} from '../components/shared/Common';
import DecodingVisualization from '../components/DecodingVisualization';
import { convertToPrototext, convertToProtoscope } from '../utils/wasm-parser';
import { INITIAL_PROTO, SIZE_EXAMPLES } from '../utils/constants';

export const Introduction = ({ messageSchema, fds }: {
  messageSchema: DescMessage | null,
  fds: Uint8Array | null
}) => {
  const [activeFace, setActiveFace] = useState('idl');
  const [protoTextExample, setProtoTextExample] = useState<string | null>(null);
  const [protoscopeExample, setProtoscopeExample] = useState<string | null>(null);

  const dynamicExamples = useMemo(() => {
    if (!messageSchema) return null;
    try {
      const sample = SIZE_EXAMPLES.BASIC;
      const user = fromJson(messageSchema, sample);
      const binary = toBinary(messageSchema, user);

      // Use standard JSON stringify for guaranteed consistent indentation in the UI
      const json = JSON.stringify(sample, null, 2);

      const hex = Array.from(binary)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ');

      return { hex, json, binary };
    } catch {
      return null;
    }
  }, [messageSchema]);

  useEffect(() => {
    let active = true;
    const fetchExamples = async () => {
      if (!messageSchema || !fds || !dynamicExamples) return;
      try {
        const [text, scope] = await Promise.all([
          convertToPrototext(messageSchema.typeName, fds, dynamicExamples.json),
          convertToProtoscope(dynamicExamples.binary)
        ]);
        if (active) {
          setProtoTextExample(text.trim());
          setProtoscopeExample(scope.trim());
        }
      } catch (e) {
        console.error("Failed to convert examples:", e);
      }
    };
    fetchExamples();
    return () => { active = false; };
  }, [messageSchema, fds, dynamicExamples]);

  const faces = [
    {
      id: 'idl',
      label: 'Schema',
      icon: FileCode,
      title: 'The Schema (.proto)',
      desc: 'The source of truth. Defines the structure using the Interface Definition Language (IDL).',
      code: INITIAL_PROTO.split('\n').filter(l => !l.includes('import') && !l.includes('package') && !l.includes('syntax') && !l.includes('edition')).join('\n').trim(),
      language: 'proto' as const
    },
    {
      id: 'bin',
      label: 'Binary',
      icon: Binary,
      title: 'Binary Encoding',
      desc: 'What actually travels over the wire. Compact, extremely fast to parse, and machine-optimized.',
      code: dynamicExamples?.hex || '0a 24 35 35 30 65 38 34 30 30 2d 65 32 39 62 2d 34 31 64 34 2d 61 37 31 36 2d 34 34 36 36 35 35 34 34 30 30 30 30 12 10 48 69 72 6f 20 50 72 6f 74 61 67 6f 6e 69 73 74 20 18 18',
      language: null
    },
    {
      id: 'json',
      label: 'ProtoJSON',
      icon: Braces,
      title: 'ProtoJSON Mapping',
      desc: (
        <div className="space-y-4">
          <p>
            A standardized <ExternalLinkText href="https://protobuf.dev/programming-guides/proto3/#json">JSON mapping</ExternalLinkText>. Every binary payload has a deterministic JSON representation.
          </p>
          <TechnicalNuance title="JSON_PRECISION">
            To prevent precision loss in JavaScript (which uses 64-bit floats for all numbers), the ProtoJSON standard requires that <strong>int64</strong> and <strong>uint64</strong> fields be encoded as <strong>strings</strong>.
          </TechnicalNuance>
        </div>
      ),
      code: dynamicExamples?.json || '{\n  "id": "550e8400-e2...",\n  "name": "Hiro Protagonist",\n  "age": 24\n}',
      language: 'json' as const
    },
    {
      id: 'txt',
      label: 'ProtoText',
      icon: AlignLeft,
      title: 'ProtoText format',
      desc: <>A human-friendly <ExternalLinkText href="https://protobuf.dev/reference/protobuf/textformat-spec/">text format</ExternalLinkText> often used in CLI tools and server logs. This format is not used as often since protojson provides a more standardized and widely supported representation that humans can easily read and write.</>,
      code: protoTextExample || 'id: "550e8400-e29b-41d4-a716..."\nname: "Hiro Protagonist"\nage: 24',
      language: null
    },
    {
      id: 'scope',
      label: 'Protoscope',
      icon: SearchCheck,
      title: 'Protoscope format',
      desc: <>A diagnostic language for <ExternalLinkText href="https://github.com/protocolbuffers/protoscope">inspecting</ExternalLinkText> Protobuf messages. While it can use a schema, it is often used for its ability to operate without one, revealing a structural skeleton of the binary data through heuristic guesses.</>,
      code: protoscopeExample || '1: "550e8400-e29b-41d4-a716-446655440000"\n2: "Hiro Protagonist"\n3: 24',
      language: null
    }
  ];

  const current = faces.find(f => f.id === activeFace)!;

  return (
    <Section id="intro" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto">
      <SectionTitle icon={Database} subtitle="01_DEFINITION">What is Protobuf?</SectionTitle>


      <div className="space-y-12 mb-16">
        <div className="space-y-6">
          <p className="text-xl text-[var(--text-color)] font-cyber">
            <ExternalLinkText href="https://protobuf.dev/">Protocol Buffers</ExternalLinkText> (Protobuf) is a schema-driven, binary serialization format.
          </p>
          <p className="text-[var(--text-color)] leading-relaxed">
            Developed by <ExternalLinkText href="https://google.com">Google</ExternalLinkText> as a more efficient alternative to text-based formats, it provides a language-neutral and platform-neutral way to structure and exchange data. Think <ExternalLinkText href="https://developer.mozilla.org/en-US/docs/Web/XML/XML_introduction">XML</ExternalLinkText> or <ExternalLinkText href="https://www.json.org/">JSON</ExternalLinkText>, but with a focus on machine performance and strict contracts.
          </p>
        </div>

        <div className="p-8 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl">
          <h3 className="text-[var(--cyber-neon-blue)] font-cyber uppercase text-sm tracking-widest mb-6">Why it matters:</h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-8 text-[var(--text-color)]">
            <li className="space-y-3">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-[var(--cyber-neon-pink)]" />
                <span className="font-cyber font-bold text-sm uppercase">Performance</span>
              </div>
              <p className="text-sm text-[var(--text-dim)] leading-relaxed">Binary encoding is significantly faster to parse and smaller to transmit than text-based formats.</p>
            </li>
            <li className="space-y-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[var(--cyber-neon-pink)]" />
                <span className="font-cyber font-bold text-sm uppercase">Type Safety</span>
              </div>
              <p className="text-sm text-[var(--text-dim)] leading-relaxed">Strong schemas prevent a whole class of bugs before they even hit production.</p>
            </li>
            <li className="space-y-3">
              <div className="flex items-center gap-3">
                <GitBranch className="w-5 h-5 text-[var(--cyber-neon-pink)]" />
                <span className="font-cyber font-bold text-sm uppercase">Compatibility</span>
              </div>
              <p className="text-sm text-[var(--text-dim)] leading-relaxed">Fields can be added or removed without breaking existing deployed services.</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="mb-16 space-y-6">
        <h3 className="text-2xl font-cyber font-bold text-[var(--text-color)] uppercase">How it works</h3>
        <p className="text-[var(--text-dim)] leading-relaxed">
          Protobuf works by combining a pre-defined <strong>schema</strong> with your <strong>data</strong> to produce a compact binary payload.
          Unlike JSON, which carries redundant field names in every message, Protobuf uses the schema to identify fields by their number,
          drastically reducing size and increasing parsing speed.
        </p>
        <DecodingVisualization />
      </div>

      <div className="grid grid-cols-1 gap-8 mt-12">
        <CyberPanel title="THE_MANY_FACES_OF_PROTO">
          <div className="p-6 space-y-8">
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              "Protobuf" is often used as a catch-all term, but it actually refers to an entire ecosystem of specifications. Here is how a single <code className="text-[var(--cyber-neon-blue)]">{messageSchema?.name || 'User'}</code> message looks in each format:
            </p>

            <div className="flex flex-col lg:flex-row gap-12 min-h-[350px]">
              {/* Left Nav */}
              <div className="w-full lg:w-64 flex flex-col gap-2">
                {faces.map((face) => (
                  <button
                    key={face.id}
                    onClick={() => setActiveFace(face.id)}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all text-left group ${activeFace === face.id
                      ? 'bg-[var(--cyber-neon-blue)]/10 border-[var(--cyber-neon-blue)] text-[var(--cyber-neon-blue)]'
                      : 'bg-[var(--overlay-bg)] border-[var(--border-light)] text-[var(--text-dim)] hover:border-white/20 hover:text-[var(--text-color)]'
                      }`}
                  >
                    <face.icon className={`w-5 h-5 ${activeFace === face.id ? 'text-[var(--cyber-neon-blue)]' : 'text-[var(--text-dim)] group-hover:text-[var(--text-dim)]'}`} />
                    <span className="font-cyber font-bold text-sm tracking-widest uppercase">{face.label}</span>
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 space-y-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-cyber font-bold text-[var(--text-color)] uppercase">{current.title}</h3>
                    <div className="text-[var(--text-dim)] leading-relaxed text-sm max-w-3xl">{current.desc}</div>
                  </div>
                </div>
                <CyberPanel title="ENCODED_OUTPUT">
                  <div className="p-4 h-auto min-h-[150px] overflow-auto">
                    {current.language ? (
                      <SyntaxHighlighter language={current.language} code={current.code} />
                    ) : (
                      <pre className="font-mono text-sm leading-6 text-[var(--cyber-neon-pink)]/80 break-all whitespace-pre-wrap m-0">
                        {current.code}
                      </pre>
                    )}
                  </div>
                </CyberPanel>

                {activeFace === 'bin' && (
                  <div className="flex gap-3 p-4 bg-[var(--cyber-neon-pink)]/5 border border-[var(--cyber-neon-pink)]/10 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <Terminal className="w-5 h-5 text-[var(--cyber-neon-pink)] shrink-0" />
                    <p className="text-xs text-[var(--text-dim)] leading-relaxed italic">
                      If you're currently trying to "read" the hex block above and failing: congratulations, you're human. We'll be investigating how machines actually make sense of this chaos in the <Link to="/binary" className="text-[var(--cyber-neon-pink)] hover:underline"><strong>Binary</strong></Link> section further down.
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
          <h3 className="text-2xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight mb-2">The Compilation Pipeline</h3>
          <p className="text-[var(--text-dim)] text-center max-w-2xl">How your human-readable schema becomes high-performance code.</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex flex-col md:flex-row items-center gap-8 w-full justify-between max-w-5xl">
            <CyberPanel title="SOURCE" className="w-full md:w-64 text-center">
              <FileCode className="w-12 h-12 text-[var(--cyber-neon-green)] mx-auto mb-4" />
              <span className="font-cyber text-sm">SCHEMA.PROTO</span>
            </CyberPanel>
            <div className="flex flex-col items-center gap-2">
              <ArrowRight className="w-8 h-8 text-[var(--cyber-neon-blue)] rotate-90 md:rotate-0" />
              <span className="text-xs font-mono text-[var(--text-dim)] uppercase"><ExternalLinkText href="https://github.com/protocolbuffers/protobuf/releases">protoc</ExternalLinkText> / <ExternalLinkText href="https://buf.build/">Buf</ExternalLinkText></span>
            </div>
            <CyberPanel title="COMPILER" className="w-full md:w-64 text-center border-[var(--cyber-neon-blue)] shadow-[0_0_15px_rgba(0,243,255,0.2)]">
              <Cpu className="w-12 h-12 text-[var(--cyber-neon-blue)] mx-auto mb-4 animate-pulse" />
              <span className="font-cyber text-sm text-[var(--cyber-neon-blue)]">CODE_GENERATION</span>
            </CyberPanel>
            <div className="flex flex-col items-center gap-2">
              <ArrowRight className="w-8 h-8 text-[var(--cyber-neon-pink)] rotate-90 md:rotate-0" />
              <span className="text-xs font-mono text-[var(--text-dim)] uppercase">TARGETS</span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                <CyberPanel className="text-center p-3 text-xs">
                  <ExternalLinkText href="https://protobuf.dev/getting-started/cpptutorial/">C++</ExternalLinkText>
                </CyberPanel>
                <CyberPanel className="text-center p-3 text-xs">
                  <ExternalLinkText href="https://protobuf.dev/getting-started/javatutorial/">Java</ExternalLinkText>
                </CyberPanel>
                <CyberPanel className="text-center p-3 text-xs">
                  <ExternalLinkText href="https://protobuf.dev/getting-started/gotutorial/">Go</ExternalLinkText>
                </CyberPanel>
                <CyberPanel className="text-center p-3 text-xs">
                  <ExternalLinkText href="https://protobuf.dev/getting-started/rubytutorial/">Ruby</ExternalLinkText>
                </CyberPanel>
                <CyberPanel className="text-center p-3 text-xs">
                  <ExternalLinkText href="https://protobuf.dev/getting-started/csharptutorial/">C#</ExternalLinkText>
                </CyberPanel>
                <CyberPanel className="text-center p-3 text-xs">
                  <ExternalLinkText href="https://protobuf.dev/getting-started/pythontutorial/">Python</ExternalLinkText>
                </CyberPanel>
              </div>
              <div className="p-3 bg-[var(--cyber-neon-green)]/5 border border-[var(--cyber-neon-green)]/20 rounded text-center">
                <span className="text-xs font-mono text-[var(--cyber-neon-green)] uppercase block mb-1">Plus Community Tools</span>
                <div className="flex flex-col gap-1">
                  <ExternalLinkText href="https://github.com/sudorandom/protoc-gen-connect-openapi"><span className="text-xs">OpenAPI</span></ExternalLinkText>
                  <ExternalLinkText href="https://github.com/protocolbuffers/protobuf/blob/main/docs/third_party.md"><span className="text-xs italic">And Many, Many More...</span></ExternalLinkText>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center text-[var(--text-dim)] space-y-4">
            <p>
              Compilation translates your language-neutral schema into high-performance source code for your specific language. This generated code handles all the complexity of bit-packing and validation.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Introduction;
