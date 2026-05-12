import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Cpu,
  Database,
  Zap,
  ChevronRight,
  ChevronLeft,
  Code2,
  Binary,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  ArrowRight,
  ArrowUp,
  Fingerprint,
  Combine,
  Hash,
  Type,
  ExternalLink,
  BookOpen,
  Layers,
  Box,
  List,
  Braces,
  AlignLeft,
  MousePointer2,
  HelpCircle,
  GitBranch,
  Package,
  Settings,
  X,
  Link as LinkIcon
} from 'lucide-react';
import { fromJson, toJsonString, toBinary, type Registry, type DescMessage } from '@bufbuild/protobuf';
import { createValidator, type Violation } from '@bufbuild/protovalidate';
import VarintExplainer from './components/VarintExplainer';
import { decodeBinary } from './utils/decoder';
import { createDynamicRegistry } from './utils/dynamic-registry';
import { generateFake, convertToPrototext, type CompilationError } from './utils/wasm-parser';

const SectionIdContext = React.createContext<string | null>(null);

const Section = ({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) => (
  <SectionIdContext.Provider value={id}>
    <section id={id} className={className}>
      {children}
    </section>
  </SectionIdContext.Provider>
);

// --- Syntax Highlighting ---

const HexViewer = ({ bytes }: { bytes: { val: string, raw: number }[] }) => {
  const chunks = [];
  for (let i = 0; i < bytes.length; i += 8) {
    chunks.push(bytes.slice(i, i + 8));
  }

  return (
    <div className="font-mono text-xs text-slate-400 bg-black/40 p-4 rounded border border-white/10 space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-[60px_max-content_1fr] gap-8 pb-2 border-b border-white/5 opacity-50 mb-2">
        <span>OFFSET</span>
        <span>HEX</span>
        <span>ASCII</span>
      </div>
      {chunks.map((chunk, i) => (
        <div key={i} className="grid grid-cols-[60px_max-content_1fr] gap-8 group hover:bg-white/5">
          <span className="opacity-50">{(i * 8).toString(16).padStart(4, '0')}</span>
          <span className="text-[#00ff9f]/80">
            {chunk.map(b => b.val).join(' ').padEnd(23, ' ')}
          </span>
          <span className="text-white">
            {chunk.map(b => (b.raw >= 32 && b.raw <= 126 ? String.fromCharCode(b.raw) : '.')).join('')}
          </span>
        </div>
      ))}
    </div>
  );
};

const SyntaxHighlighter = ({ code, language, wrap = false }: { code: string, language: 'proto' | 'json', wrap?: boolean }) => {
  const highlight = (text: string) => {
    let output = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const placeholders: string[] = [];

    const push = (val: string) => {
      const id = `__PH_${placeholders.length}__`;
      placeholders.push(val);
      return id;
    };

    if (language === 'json') {
      output = output.replace(/"([^"]+)":/g, (_, p1) => push(`<span class="text-[#00f3ff]">"${p1}"</span>`) + ':');
      output = output.replace(/: "([^"]+)"/g, (_, p1) => ': ' + push(`<span class="text-[#00ff9f]">"${p1}"</span>`));
      output = output.replace(/: (-?\d+\.?\d*)/g, (_, p1) => ': ' + push(`<span class="text-[#ff00ff]">${p1}</span>`));
      output = output.replace(/: (true|false)/g, (_, p1) => ': ' + push(`<span class="text-[#ff00ff]">${p1}</span>`));
    } else {
      output = output.replace(/\/\/.*$/gm, (match) => push(`<span class="text-slate-500">${match}</span>`));
      output = output.replace(/"([^"]+)"/g, (match) => push(`<span class="text-[#00ff9f]">${match}</span>`));
      output = output.replace(/\b(message|enum|syntax|package|import|option|returns|rpc|service)\b/g, (match) => push(`<span class="text-[#ff00ff]">${match}</span>`));
      output = output.replace(/\b(string|uint32|int32|bool|float|double|bytes|fixed32|fixed64|sint32|sint64)\b/g, (match) => push(`<span class="text-[#00f3ff]">${match}</span>`));
      output = output.replace(/= (\d+)/g, (_, p1) => '= ' + push(`<span class="text-white">${p1}</span>`));
    }

    for (let i = placeholders.length - 1; i >= 0; i--) {
      output = output.replace(`__PH_${i}__`, placeholders[i]);
    }
    return output;
  };

  return (
    <pre
      className={`font-mono text-sm leading-6 m-0 ${wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'}`}
      dangerouslySetInnerHTML={{ __html: highlight(code) }}
    />
  );
};

// --- Shared Components ---

const ExternalLinkText = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-[#00f3ff] hover:underline inline-flex items-center gap-0.5 group"
  >
    {children}
    <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition-opacity" />
  </a>
);

const SectionTitle = ({ children, icon: Icon, subtitle }: { children: React.ReactNode, icon: React.ElementType, subtitle?: string }) => {
  const sectionId = React.useContext(SectionIdContext);
  return (
    <div className="flex flex-col mb-12">
      <div className="flex items-center gap-3 md:gap-4 mb-2">
        <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 shrink-0">
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-[#00f3ff]" />
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-cyber font-bold tracking-tight text-white uppercase break-words min-w-0 relative group/title">
          <a href={sectionId ? `#${sectionId}` : '#'} className="hover:text-[#00f3ff] transition-colors">
            {children}
            <LinkIcon className="w-4 h-4 inline-block ml-2 opacity-0 group-hover/title:opacity-50 transition-opacity" />
          </a>
        </h2>
      </div>
      {subtitle && <p className="text-slate-400 font-mono text-[10px] md:text-sm uppercase tracking-widest ml-11 md:ml-14">{subtitle}</p>}
    </div>
  );
};

const CyberPanel = ({ children, title, className = "", headerExtra }: { children: React.ReactNode, title?: string, className?: string, headerExtra?: React.ReactNode }) => (
  <div className={`cyber-box cyber-panel ${className}`}>
    {title && (
      <div className="flex flex-wrap items-center justify-between mb-4 border-b border-cyan-500/20 pb-2 gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#00f3ff] shrink-0" />
          <span className="text-[10px] sm:text-xs font-mono text-[#00f3ff] uppercase tracking-tighter truncate max-w-[150px] sm:max-w-none">{title}</span>
        </div>
        {headerExtra}
      </div>
    )}
    {children}
  </div>
);

// --- Sections ---

const Hero = () => (
  <Section id="hero" className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
    <div className="scanline" />
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl z-10 text-center"
    >
      <h1 className="text-4xl sm:text-6xl md:text-8xl font-cyber font-black mb-6 tracking-tighter leading-none">
        PROTOBUF<br />
        <span className="cyber-text-gradient">EXPLAINER</span>
      </h1>

      <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
        Language-neutral, platform-neutral, extensible mechanism for serializing structured data.
        The backbone of modern high-performance systems.
      </p>
    </motion.div>

    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
      <ChevronRight className="w-6 h-6 rotate-90" />
    </div>
  </Section>
);

const SchemaEditor = ({ value, onChange, errors }: { value: string, onChange: (s: string) => void, errors: CompilationError[] }) => {
  const [scroll, setScroll] = useState({ top: 0, left: 0 });

  return (
    <div className="relative w-full h-[500px] bg-black/20 rounded overflow-hidden">
      {/* Background Highlight Layer */}
      <div
        className="absolute top-0 left-0 p-4 font-mono text-sm leading-6 whitespace-pre pointer-events-none select-none"
        style={{
          transform: `translate(-${scroll.left}px, -${scroll.top}px)`,
          width: 'max-content',
          minWidth: '100%'
        }}
      >
        <SyntaxHighlighter language="proto" code={value} />
        {/* Error markers overlay */}
        <div className="absolute inset-0 pointer-events-none p-4">
          {value.split('\n').map((line, i) => {
            const error = errors.find(e => e.line === i + 1);
            if (!error) return <div key={i} className="h-6">{''}</div>;

            const col = Math.max(0, error.col - 1);
            return (
              <div key={i} className="h-6 relative">
                <div className="absolute -left-4 right-0 h-6 bg-red-500/10 border-l-2 border-red-500" style={{ width: 'calc(100% + 1000px)' }} />
                <span className="invisible">{line.slice(0, col)}</span>
                <motion.span
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-block h-5 w-[1ch] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] rounded-sm relative z-10"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Foreground Interactive Layer */}
      <textarea
        className="absolute inset-0 w-full h-full bg-transparent p-4 font-mono text-sm leading-6 text-transparent caret-white focus:outline-none focus:border-cyan-500/50 resize-none whitespace-pre overflow-auto custom-scrollbar border-none shadow-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => setScroll({ top: e.currentTarget.scrollTop, left: e.currentTarget.scrollLeft })}
        spellCheck={false}
      />
    </div>
  );
};

const ProtobufBasics = () => {
  const [activeTab, setActiveTab] = useState('messages');

  const tabs = [
    {
      id: 'messages',
      label: 'Messages',
      icon: Box,
      title: 'The Basic Unit',
      desc: (
        <div className="space-y-4">
          <p>
            Messages are the primary logical structure in Protobuf. They act as containers for your data, analogous to a struct in C/Rust, a class in Java/TypeScript, or a dictionary in Python.
          </p>
          <p>
            Once defined in a schema, the Protobuf compiler generates native, type-safe code for every language your team uses.
          </p>
          <p>
            Crucially, <ExternalLinkText href="https://protobuf.dev/programming-guides/proto3/#updating">Protobuf is designed to be evolvable</ExternalLinkText>. You can add new fields to these messages without breaking existing code, allowing servers and clients to upgrade at their own pace.
          </p>
        </div>
      ),
      example: '// A simple message definition\nmessage SearchRequest {\n  string query = 1;\n  int32 page_number = 2;\n  int32 results_per_page = 3;\n}'
    },
    {
      id: 'fields',
      label: 'Fields',
      icon: Type,
      title: 'Typed Data',
      desc: (
        <div className="space-y-4">
          <p>
            Every field in a message requires a specific type (e.g., <code>string</code>, <code>int32</code>, <code>bool</code>) and a name.
          </p>
          <p>
            Because Protobuf is strictly typed, it eliminates an entire class of runtime errors common in dynamically typed formats like JSON. If a client expects an integer, they will never accidentally receive a string.
          </p>
        </div>
      ),
      example: 'message User {\n  string username = 1;\n  bool is_active = 2;\n  uint32 login_count = 3;\n}'
    },
    {
      id: 'numbers',
      label: 'Field Numbers',
      icon: Hash,
      title: 'Field Identifiers',
      desc: (
        <div className="space-y-4">
          <p>
            Field numbers are the most critical part of a Protobuf message. Instead of sending long string names (like "username") over the wire, Protobuf only sends this integer ID. This saves immense amounts of bandwidth.
          </p>
          <p>
            Because these numbers identify fields, they <strong>must never be changed</strong> once a message type is in use. Reusing a number will cause data corruption.
          </p>
          <ul className="list-disc pl-4 space-y-1 mt-2">
            <li>Numbers 1-15 take 1 byte to encode (ideal for frequent fields).</li>
            <li>Numbers 16-2047 take 2 bytes.</li>
          </ul>
        </div>
      ),
      example: 'message User {\n  // "1" is the ID on the wire\n  string id = 1;\n  \n  // Small numbers (1-15) take 1 byte to encode\n  string name = 2;\n}'
    },
    {
      id: 'enums',
      label: 'Enums',
      icon: List,
      title: 'Enumerations',
      desc: (
        <div className="space-y-4">
          <p>
            Enums allow you to define a restricted set of named constants. This is crucial for states, roles, or configurations.
          </p>
          <p>
            In proto3, the first constant <strong>must always map to zero</strong>, which serves as the default value when the field is not explicitly set in the binary payload.
          </p>
        </div>
      ),
      example: 'enum Corpus {\n  CORPUS_UNSPECIFIED = 0;\n  CORPUS_UNIVERSAL = 1;\n  CORPUS_WEB = 2;\n  CORPUS_IMAGES = 3;\n}\n\nmessage SearchRequest {\n  Corpus corpus = 4;\n}'
    },
    {
      id: 'nested',
      label: 'Embedded',
      icon: Combine,
      title: 'Nesting Messages',
      desc: (
        <div className="space-y-4">
          <p>
            Protobuf supports complex, hierarchical data structures. You can define messages within other messages, or use previously defined messages as field types.
          </p>
          <p>
            This composition allows you to build highly reusable domains of data models.
          </p>
        </div>
      ),
      example: 'message Result {\n  string url = 1;\n  string title = 2;\n}\n\nmessage SearchResponse {\n  // Result is embedded here\n  Result top_result = 1;\n}'
    },
    {
      id: 'repeated',
      label: 'Repeated Fields',
      icon: Layers,
      title: 'Arrays and Lists',
      desc: (
        <div className="space-y-4">
          <p>
            To represent an array or list of items, use the <code>repeated</code> keyword. These fields can contain zero or more elements of the specified type.
          </p>
          <p>
            In modern Protobuf, repeated scalar numeric fields are "packed" by default, meaning they are stored with extreme efficiency in the binary stream.
          </p>
        </div>
      ),
      example: 'message SearchResponse {\n  // A list of strings\n  repeated string related_queries = 1;\n  \n  // A list of messages\n  repeated Result results = 2;\n}'
    },
    {
      id: 'maps',
      label: 'Maps',
      icon: Braces,
      title: 'Key-Value Pairs',
      desc: (
        <div className="space-y-4">
          <p>
            Protobuf provides native support for associative maps (dictionaries). However, there are strict rules for map keys and values:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Keys:</strong> Can be any integral or string type. <em>Messages, enums, floats, and bytes cannot be keys.</em></li>
            <li><strong>Values:</strong> Can be any type, including another message, but <em>cannot</em> be another map or a repeated field.</li>
          </ul>
        </div>
      ),
      example: 'message Project {\n  string name = 1;\n  \n  // A dictionary of string keys to string values\n  map<string, string> labels = 2;\n}'
    },
    {
      id: 'oneof',
      label: 'Oneof (Unions)',
      icon: GitBranch,
      title: 'Mutually Exclusive Fields',
      desc: (
        <div className="space-y-4">
          <p>
            If you have a message with multiple fields where only one can be set at a time, you can enforce this behavior and save memory using the <code>oneof</code> keyword.
          </p>
          <p>
            Setting any field within the <code>oneof</code> automatically clears all other fields in that same <code>oneof</code>. This is Protobuf's equivalent to a tagged union or variant.
          </p>
        </div>
      ),
      example: 'message ErrorStatus {\n  string message = 1;\n  \n  oneof details {\n    string stack_trace = 2;\n    int32 error_code = 3;\n  }\n}'
    },
    {
      id: 'presence',
      label: 'Field Presence',
      icon: HelpCircle,
      title: 'Default Values & Presence',
      desc: (
        <div className="space-y-4">
          <p>
            A major gotcha in Protobuf: default zero-values (like <code>0</code> for integers, <code>false</code> for booleans, or <code>""</code> for strings) are <strong>not serialized</strong> over the wire by default.
          </p>
          <p>
            This saves immense space, but it means the receiver cannot distinguish between a field being explicitly "set to zero" and "not set at all".
          </p>
          <p>
            Use the <code>optional</code> keyword if your application needs to explicitly track whether a field was populated (known as tracking "Field Presence").
          </p>
        </div>
      ),
      example: 'message Profile {\n  // 0 is not sent over the wire\n  int32 views = 1;\n  \n  // Tracks if the user explicitly set this to 0\n  // or didn\'t set it at all\n  optional int32 age = 2;\n}'
    }
  ];

  const current = tabs.find(t => t.id === activeTab)!;

  return (
    <Section id="basics" className="py-24 px-4 sm:px-8 bg-black/40 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={BookOpen} subtitle="01_CORE_CONCEPTS">Protobuf Basics</SectionTitle>

        <div className="flex flex-col lg:flex-row gap-12 min-h-[400px]">
          {/* Left Nav */}
          <div className="w-full lg:w-64 flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all text-left group ${activeTab === tab.id
                    ? 'bg-[#00f3ff]/10 border-[#00f3ff] text-[#00f3ff]'
                    : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300'
                  }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-[#00f3ff]' : 'text-slate-600 group-hover:text-slate-400'}`} />
                <span className="font-cyber font-bold text-sm tracking-widest uppercase">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-cyber font-bold text-white uppercase">{current.title}</h3>
                <div className="text-slate-400 leading-relaxed text-sm">{current.desc}</div>
              </div>
            </div>
            <CyberPanel title="EXAMPLE_DEFINITION" className="h-full">
               <div className="p-2">
                  <SyntaxHighlighter language="proto" code={current.example} wrap={true} />
               </div>
            </CyberPanel>          </div>
        </div>
      </div>
    </Section>
  );
};

const DeepDiveSection = () => {
  const [activeTab, setActiveTab] = useState('options');

  const tabs = [
    {
      id: 'options',
      label: 'Standard Options',
      icon: Settings,
      title: 'Built-in Options',
      desc: (
        <div className="space-y-4">
          <p>
            Protobuf comes with a wide range of built-in "options" that control everything from how code is generated to how data is mapped to JSON.
          </p>
          <p>
            Options are categorized by their scope: <strong>File</strong> (affects the whole file), <strong>Message</strong>, <strong>Field</strong>, or <strong>Service</strong>.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-sm">
            <li><code>option go_package</code>: Defines the import path for generated Go code.</li>
            <li><code>[deprecated = true]</code>: Marks a field as old/risky to use.</li>
            <li><code>[json_name = "custom"]</code>: Changes the key used in JSON serialization.</li>
          </ul>
        </div>
      ),
      example: 'syntax = "proto3";\n\n// File-level option\noption go_package = "github.com/example/v1";\n\nmessage User {\n  // Field-level options\n  string user_id = 1 [json_name = "uid"];\n  string old_field = 2 [deprecated = true];\n}'
    },
    {
      id: 'annotations',
      label: 'Custom Extensions',
      icon: Combine,
      title: 'Custom Options',
      desc: (
        <div className="space-y-4">
          <p>
            Protobuf schemas are extensible. You can define custom "options" (often called annotations) to attach metadata to messages, fields, or services.
          </p>
          <p>
            These options provide instructions to compiler plugins (like generating validation code) or are read dynamically at runtime via reflection.
          </p>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-xs space-y-2">
            <p><strong><span className="text-[#00f3ff]">Historical Note:</span></strong> Custom options were originally a <code>proto2</code> feature that uses the <code>extend</code> keyword. While <code>proto3</code> removed general-purpose extensions, it kept them for descriptor objects specifically so options would continue to work.</p>
            <p><strong><span className="text-[#00ff9f]">The Future:</span></strong> In <strong>Protobuf Editions</strong> (2023+), this distinction is removed. Editions allow native definition of options and introduce <code>features</code>, a specialized type of option used by the compiler itself to control behavior.</p>
          </div>
        </div>
      ),
      example: '// options.proto (Must be proto2 to define)\nsyntax = "proto2";\nimport "google/protobuf/descriptor.proto";\n\nextend google.protobuf.FieldOptions {\n  optional bool is_pii = 50001;\n}\n\n// user.proto (Can be proto3 or Editions)\nsyntax = "proto3";\nimport "options.proto";\n\nmessage User {\n  string ssn = 1 [(is_pii) = true];\n}'
    },
    {
      id: 'breaking',
      label: 'Breaking Changes',
      icon: AlertTriangle,
      title: 'The Three Levels of Breakage',
      desc: (
        <div className="space-y-4">
          <p>Not all breaking changes are equal. Protobuf has three distinct layers of compatibility:</p>
          <ul className="list-disc pl-4 space-y-2 text-sm">
            <li><strong>Wire Breakage:</strong> Changing a field number or using an incompatible type (e.g., <code>string</code> to <code>int32</code>). Causes catastrophic data corruption. <em>Never do this.</em></li>
            <li><strong>JSON Breakage:</strong> Renaming a field. It's safe on the wire, but clients expecting the old JSON key will fail. You can mitigate this using the <code>[json_name="old_name"]</code> annotation.</li>
            <li><strong>Code Breakage:</strong> Changing a type in a wire-compatible way (e.g., <code>int32</code> to <code>int64</code>). The data transmits safely, but when developers update their generated code, their builds will fail until they update their types.</li>
          </ul>
        </div>
      ),
      example: 'message Event {\n  // Safe on wire, breaks JSON clients\n  // unless you use json_name:\n  string user_id = 1 [json_name="uid"];\n\n  // Wire compatible, breaks builds\n  // (from int32 to int64)\n  int64 count = 2;\n}'
    },
    {
      id: 'lifecycle',
      label: 'Deprecation',
      icon: ShieldCheck,
      title: 'Evolving Schemas Safely',
      desc: (
        <div className="space-y-4">
          <p>
            You can never truly delete a field if it was ever in production. Instead, you manage its lifecycle:
          </p>
          <ol className="list-decimal pl-4 space-y-2 text-sm">
            <li><strong>Deprecate:</strong> Add <code>[deprecated = true]</code>. This warns developers in their IDEs (via generated code annotations like <code>@Deprecated</code>) not to use it for new features.</li>
            <li><strong>Stop Using:</strong> Wait until metrics show zero traffic using the field.</li>
            <li><strong>Reserve:</strong> Remove the field entirely and add its number/name to a <code>reserved</code> block. This prevents future developers from accidentally reusing the number and corrupting old data that might still be in a database.</li>
          </ol>
        </div>
      ),
      example: 'message Product {\n  // Step 3: Block reuse permanently\n  reserved 1, "old_price";\n\n  // Step 1: Warn developers\n  int32 price_cents = 2 [deprecated = true];\n\n  // The new way\n  int64 price_micros = 3;\n}'
    }
  ];

  const current = tabs.find(t => t.id === activeTab)!;

  return (
    <Section id="deepdive" className="py-24 px-4 sm:px-8 bg-slate-900/15 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Layers} subtitle="02_DEEP_DIVE">Schema Engineering</SectionTitle>

        <div className="flex flex-col lg:flex-row gap-12 min-h-[400px]">
          {/* Left Nav */}
          <div className="w-full lg:w-64 flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all text-left group ${activeTab === tab.id
                    ? 'bg-[#00ff9f]/10 border-[#00ff9f] text-[#00ff9f]'
                    : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300'
                  }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-[#00ff9f]' : 'text-slate-600 group-hover:text-slate-400'}`} />
                <span className="font-cyber font-bold text-sm tracking-widest uppercase">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-cyber font-bold text-white uppercase">{current.title}</h3>
                <div className="text-slate-400 leading-relaxed text-sm">{current.desc}</div>
              </div>
            </div>
            <CyberPanel title="SCHEMA_EXAMPLE" className="h-full">
               <div className="p-2">
                  <SyntaxHighlighter language="proto" code={current.example} wrap={true} />
               </div>
            </CyberPanel>
          </div>
        </div>
      </div>
    </Section>
  );
};

const AdvancedProtobuf = () => {
  const [activeTab, setActiveTab] = useState('imports');

  const tabs = [
    {
      id: 'imports',
      label: 'Imports',
      icon: FileCode,
      title: 'Schema Composition',
      desc: (
        <div className="space-y-4">
          <p>
            You can use definitions from other .proto files using the <code>import</code> statement. This allows you to break large schemas into manageable, reusable modules.
          </p>
          <p>
            The compiler needs to know where to find these files during build time. Modern tools like the <ExternalLinkText href="https://buf.build/">Buf Schema Registry</ExternalLinkText> make this dependency management feel just like NPM or Cargo.
          </p>
        </div>
      ),
      example: 'syntax = "proto3";\n\n// Import another file\nimport "google/protobuf/timestamp.proto";\nimport "myproject/common.proto";\n\nmessage Event {\n  google.protobuf.Timestamp time = 1;\n  myproject.Status status = 2;\n}'
    },
    {
      id: 'wkt',
      label: 'Well-Known Types',
      icon: Database,
      title: 'Standardized Structures',
      desc: (
        <div className="space-y-4">
          <p>
            Google provides a set of <ExternalLinkText href="https://protobuf.dev/reference/protobuf/google.protobuf/">"Well-Known Types" (WKTs)</ExternalLinkText> for common patterns. Using these ensures broad compatibility, especially when mapping to JSON.
          </p>
          <p>
            Protobuf implementations treat these types as special in several cases. For example, many of these have special rules when encoding/decoding to JSON:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li><code>google.protobuf.Timestamp</code> universally maps to an RFC 3339 string.</li>
            <li><code>google.protobuf.Duration</code> maps to a string ending in "s" (e.g. "1.5s").</li>
            <li><code>google.protobuf.Struct</code> maps directly to a free-form JSON object.</li>
          </ul>
        </div>
      ),
      example: 'import "google/protobuf/duration.proto";\nimport "google/protobuf/empty.proto";\n\nmessage Task {\n  google.protobuf.Duration timeout = 1;\n  google.protobuf.Empty no_data = 2;\n}'
    },
    {
      id: 'any',
      label: 'The Any Type',
      icon: Package,
      title: 'Arbitrary Payloads',
      desc: (
        <div className="space-y-4">
          <p>
            Sometimes you need to pass dynamic data where the exact schema isn't known at compile time.
          </p>
          <p>
            <code>google.protobuf.Any</code> embeds an arbitrary serialized Protobuf message along with a URL that identifies its type (e.g., <code>type.googleapis.com/mypackage.MyMessage</code>).
          </p>
          <p>
            When serialized to ProtoJSON, this type identifier is rendered as a special <code>@type</code> property alongside the standard JSON fields of the embedded message, allowing parsers to route the payload correctly.
          </p>
        </div>
      ),
      example: '// In Proto:\nimport "google/protobuf/any.proto";\n\nmessage Event {\n  google.protobuf.Any payload = 1;\n}\n\n// In ProtoJSON:\n// {\n//   "payload": {\n//     "@type": "type.googleapis.com/demo.User",\n//     "name": "Hiro"\n//   }\n// }'
    },
    {
      id: 'fieldmask',
      label: 'FieldMask',
      icon: ShieldCheck,
      title: 'Partial Updates',
      desc: (
        <div className="space-y-4">
          <p>
            <ExternalLinkText href="https://protobuf.dev/reference/protobuf/google.protobuf/#field-mask"><code>google.protobuf.FieldMask</code></ExternalLinkText> is a well-known type used to identify a subset of fields in a request.
          </p>
          <p>
            This is extremely useful for <strong>partial updates (PATCH)</strong>. Instead of sending an entire massive object, a client can send just the new value and a FieldMask containing <code>"email"</code>.
          </p>
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-200/80 text-sm">
            <strong>Important:</strong> FieldMasks are <em>not automatic</em>. They are just a list of strings in the payload. The server developer must explicitly write the code to read the mask and only apply the requested fields to their database.
          </div>
        </div>
      ),
      example: 'import "google/protobuf/field_mask.proto";\n\nmessage UpdateUserRequest {\n  User user = 1;\n  \n  // Tells the server which fields to actually update\n  // e.g. ["email", "display_name"]\n  google.protobuf.FieldMask update_mask = 2;\n}'
    },
    {
      id: 'compat',
      label: 'Compatibility',
      icon: Combine,
      title: 'Evolvable Contracts',
      desc: (
        <div className="space-y-4">
          <p>
            Protobuf is strictly designed for forward and backward compatibility.
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Forward:</strong> Old code can read new messages (unknown fields are parsed and preserved, but safely ignored by the application).</li>
            <li><strong>Backward:</strong> New code can read old messages (missing fields get safe default values like <code>0</code> or <code>""</code>).</li>
          </ul>
        </div>
      ),
      example: '// V1 schema\nmessage Config {\n  bool feature_enabled = 1;\n}\n\n// V2 schema - safely added a field\nmessage Config {\n  bool feature_enabled = 1;\n  int32 max_retries = 2; // Old clients ignore this\n}'
    },
    {
      id: 'checks',
      label: 'Checks',
      icon: AlertTriangle,
      title: 'Linting and Compatibility',
      desc: (
        <div className="space-y-4">
          <p>
            Because Protobuf schemas are contracts, maintaining their quality and backwards compatibility is critical. Tools like <ExternalLinkText href="https://buf.build/">Buf</ExternalLinkText> or <ExternalLinkText href="https://github.com/yoheimuta/protolint">protolint</ExternalLinkText> provide automated checks.
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Linting:</strong> Enforces consistent style (e.g., <code>buf lint</code>).</li>
            <li><strong>Breaking Change Detection:</strong> Ensures changes don't break existing consumers (e.g., <code>buf breaking</code>).</li>
          </ul>
        </div>
      ),
      example: '// Check for breaking changes against main branch\n$ buf breaking --against .git#branch=main\n\n// Output if you break a rule:\n// user.proto:10:3: Field "1" changed type\n//   from "string" to "int32".\n// user.proto:12:3: Previously present\n//   field "3" deleted.'
    },
    {
      id: 'editions',
      label: 'Editions',
      icon: Code2,
      title: 'Protobuf Editions',
      desc: (
        <div className="space-y-4">
          <p>
            <ExternalLinkText href="https://protobuf.dev/programming-guides/editions/">Protobuf Editions</ExternalLinkText> is the modern evolution of the language, replacing the old <code>proto2</code> and <code>proto3</code> syntax specifiers.
          </p>
          <p>
            Instead of massive, breaking syntax upgrades, Editions allows features to be added or deprecated gradually over time. A schema specifies its edition (e.g., <code>edition = "2023";</code>), giving developers fine-grained control over language features using the <code>features</code> option.
          </p>
        </div>
      ),
      example: 'edition = "2023";\n\n// Globally enforce field presence\noption features.field_presence = EXPLICIT;\n\nmessage User {\n  // Optional fields are back\n  string name = 1;\n}'
    }
  ];

  const current = tabs.find(t => t.id === activeTab)!;

  return (
    <Section id="advanced" className="py-24 px-4 sm:px-8 bg-slate-900/10 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Layers} subtitle="02_ADVANCED_TOPICS">Advanced Protobuf</SectionTitle>

        <div className="flex flex-col-reverse lg:flex-row gap-12 min-h-[400px]">
          {/* Content Area */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-cyber font-bold text-white uppercase">{current.title}</h3>
                <div className="text-slate-400 leading-relaxed text-sm">{current.desc}</div>
              </div>
            </div>
            <CyberPanel title={current.id === 'checks' ? 'TERMINAL_OUTPUT' : 'EXAMPLE_DEFINITION'} className="h-full">
              <div className="p-2">
                <SyntaxHighlighter language="proto" code={current.example} wrap={true} />
              </div>
            </CyberPanel>
          </div>

          {/* Right Nav */}
          <div className="w-full lg:w-64 flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all text-left group ${activeTab === tab.id
                    ? 'bg-[#ff00ff]/10 border-[#ff00ff] text-[#ff00ff]'
                    : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300'
                  }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-[#ff00ff]' : 'text-slate-600 group-hover:text-slate-400'}`} />
                <span className="font-cyber font-bold text-sm tracking-widest uppercase">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

const DescriptorsAndReflection = () => (
  <Section id="reflection" className="py-24 px-4 sm:px-8 bg-slate-900/20 border-t border-white/5">
    <div className="max-w-7xl mx-auto space-y-16">
      <div>
        <SectionTitle icon={Code2} subtitle="03_META_SCHEMA">Descriptors & Reflection</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6 text-slate-300">
            <h3 className="text-xl font-cyber font-bold text-white uppercase">Schemas Describing Schemas</h3>
            <p className="text-sm leading-relaxed">
              When you run the Protobuf compiler (`protoc`), it doesn't just generate code. It can also output a binary representation of your schema called a <strong>FileDescriptorSet</strong>.
            </p>
            <p className="text-sm leading-relaxed">
              Fascinatingly, this `FileDescriptorSet` is itself a Protobuf message! Google defines a schema (<ExternalLinkText href="https://github.com/protocolbuffers/protobuf/blob/main/src/google/protobuf/descriptor.proto"><code>descriptor.proto</code></ExternalLinkText>) that describes how to represent `.proto` files. This means you can use Protobuf tools to read and analyze Protobuf schemas dynamically at runtime.
            </p>
            <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded text-sm text-slate-400 space-y-3">
               <p><strong>Why is this useful?</strong></p>
               <ul className="space-y-2">
                 <li className="flex gap-2"><div className="w-1 h-1 bg-[#00f3ff] mt-1.5 shrink-0"></div> <strong>Dynamic Decoding:</strong> Tools like this web explorer use descriptors to decode arbitrary binary data without generating static code.</li>
                 <li className="flex gap-2"><div className="w-1 h-1 bg-[#00f3ff] mt-1.5 shrink-0"></div> <strong>Validation:</strong> Complex rule engines (like protovalidate) use descriptors to apply constraints dynamically.</li>
               </ul>
            </div>
          </div>
          <CyberPanel title="DESCRIPTOR.PROTO (SNIPPET)">
             <div className="p-4 h-64 overflow-auto">
               <SyntaxHighlighter language="proto" code={`// The schema that describes a schema\nmessage FileDescriptorSet {\n  repeated FileDescriptorProto file = 1;\n}\n\nmessage FileDescriptorProto {\n  optional string name = 1;\n  optional string package = 2;\n  repeated DescriptorProto message_type = 4;\n  repeated EnumDescriptorProto enum_type = 5;\n  // ...\n}\n\nmessage DescriptorProto {\n  optional string name = 1;\n  repeated FieldDescriptorProto field = 2;\n  // ...\n}`} />
             </div>
          </CyberPanel>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-16 border-t border-white/5">
        <CyberPanel title="SERVER_REFLECTION">
          <div className="p-4 space-y-4 overflow-x-auto">
             <SyntaxHighlighter language="proto" code={`// gRPC Server Reflection Protocol\npackage grpc.reflection.v1alpha;\n\nservice ServerReflection {\n  // The reflection service is queried by clients to\n  // discover the API surface of the server dynamically.\n  rpc ServerReflectionInfo(stream ServerReflectionRequest)\n      returns (stream ServerReflectionResponse);\n}`} />
             <div className="mt-4 text-xs font-mono text-slate-500">
               Client: "What services do you have?"<br/>
               Server: "I have User Service and Auth Service"<br/>
               Client: "Send me the descriptors for User Service"<br/>
               Server: *Sends FileDescriptorSet binary*
             </div>
          </div>
        </CyberPanel>
        <div className="space-y-6 text-slate-300">
          <h3 className="text-xl font-cyber font-bold text-white uppercase flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#ff00ff]" />
            Server Reflection
          </h3>
          <p className="text-sm leading-relaxed">
            By combining the standardized RPC mechanism of gRPC with Protobuf Descriptors, servers can implement <strong>Server Reflection</strong>. This is a standardized service that allows clients to ask the server for its own schema.
          </p>
          <div className="space-y-4 text-sm">
            <h4 className="font-cyber font-bold text-[#00f3ff] uppercase text-xs tracking-widest">The Ecosystem it Enables</h4>
            <ul className="list-disc pl-4 space-y-2">
              <li><strong>CLI Tools:</strong> Tools like <ExternalLinkText href="https://github.com/fullstorydev/grpcurl"><code>grpcurl</code></ExternalLinkText> can interact with your server just like <code>curl</code> does for REST, without needing you to share `.proto` files beforehand.</li>
              <li><strong>GUI Clients:</strong> Postman, Insomnia, and Buf Studio can dynamically generate UI forms for testing your APIs by reading the reflected descriptors.</li>
            </ul>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-200/80 text-sm">
            <strong>Security Warning:</strong> Enabling Server Reflection on a public-facing API exposes your entire internal data model and service structure to the internet. It is highly recommended to <em>only enable reflection in development environments or internal private networks.</em>
          </div>
        </div>
      </div>
    </div>
  </Section>
);

const Introduction = ({ messageSchema, fds }: {
  messageSchema: DescMessage | null,
  fds: Uint8Array | null
}) => {
  const [activeFace, setActiveFace] = useState('idl');
  const [protoTextExample, setProtoTextExample] = useState<string | null>(null);

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

      return { hex, json };
    } catch {
      return null;
    }
  }, [messageSchema]);

  useEffect(() => {
    let active = true;
    const fetchProtoText = async () => {
      if (!messageSchema || !fds || !dynamicExamples) return;
      try {
        const text = await convertToPrototext(messageSchema.typeName, fds, dynamicExamples.json);
        if (active) {
          setProtoTextExample(text.trim());
        }
      } catch (e) {
        console.error("Failed to convert to ProtoText:", e);
      }
    };
    fetchProtoText();
    return () => { active = false; };
  }, [messageSchema, fds, dynamicExamples]);

  const faces = [
    {
      id: 'idl',
      label: 'Schema',
      icon: FileCode,
      title: 'The Schema (.proto)',
      desc: 'The source of truth. Defines the structure using the Interface Definition Language (IDL).',
      code: INITIAL_PROTO.split('\n').filter(l => !l.includes('import') && !l.includes('package') && !l.includes('syntax')).join('\n').trim(),
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
      desc: <>A standardized <ExternalLinkText href="https://protobuf.dev/programming-guides/proto3/#json">JSON mapping</ExternalLinkText>. Every binary payload has a deterministic JSON representation.</>,
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
    }
  ];

  const current = faces.find(f => f.id === activeFace)!;

  return (
    <Section id="intro" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto">
      <SectionTitle icon={Database} subtitle="01_DEFINITION_LOGS">What is Protobuf?</SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4">
          <p className="text-xl text-white font-cyber">
            <ExternalLinkText href="https://protobuf.dev/">Protocol Buffers</ExternalLinkText> (Protobuf) is a schema-driven, binary serialization format.
          </p>
          <p className="text-slate-300 leading-relaxed">
            Developed by <ExternalLinkText href="https://google.com">Google</ExternalLinkText> as a more efficient alternative to text-based formats, it provides a language-neutral and platform-neutral way to structure and exchange data. Think <ExternalLinkText href="https://developer.mozilla.org/en-US/docs/Web/XML/XML_introduction">XML</ExternalLinkText> or <ExternalLinkText href="https://www.json.org/">JSON</ExternalLinkText>, but with a focus on machine performance and strict contracts.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-[#00f3ff] font-cyber uppercase text-sm tracking-widest">Why it matters:</h3>
          <ul className="space-y-3 text-slate-300">
            <li className="flex gap-3">
              <ChevronRight className="w-4 h-4 text-[#ff00ff] shrink-0 mt-1" />
              <span><strong>Performance:</strong> Binary encoding is significantly faster to parse and smaller to transmit than text-based formats.</span>
            </li>
            <li className="flex gap-3">
              <ChevronRight className="w-4 h-4 text-[#ff00ff] shrink-0 mt-1" />
              <span><strong>Type Safety:</strong> Strong schemas prevent a whole class of bugs before they even hit production.</span>
            </li>
            <li className="flex gap-3">
              <ChevronRight className="w-4 h-4 text-[#ff00ff] shrink-0 mt-1" />
              <span><strong>Backward Compatibility:</strong> Fields can be added or removed without breaking existing deployed services.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 mt-12">
        <CyberPanel title="THE_MANY_FACES_OF_PROTO">
          <div className="p-6 space-y-8">
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              "Protobuf" is often used as a catch-all term, but it actually refers to an entire ecosystem of specifications. Here is how a single <code className="text-[#00f3ff]">{messageSchema?.name || 'User'}</code> message looks in each format:
            </p>

            <div className="flex flex-col lg:flex-row gap-12 min-h-[350px]">
              {/* Left Nav */}
              <div className="w-full lg:w-64 flex flex-col gap-2">
                {faces.map((face) => (
                  <button
                    key={face.id}
                    onClick={() => setActiveFace(face.id)}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all text-left group ${activeFace === face.id
                        ? 'bg-[#00f3ff]/10 border-[#00f3ff] text-[#00f3ff]'
                        : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300'
                      }`}
                  >
                    <face.icon className={`w-5 h-5 ${activeFace === face.id ? 'text-[#00f3ff]' : 'text-slate-600 group-hover:text-slate-400'}`} />
                    <span className="font-cyber font-bold text-sm tracking-widest uppercase">{face.label}</span>
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 space-y-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-cyber font-bold text-white uppercase">{current.title}</h3>
                    <div className="text-slate-400 leading-relaxed text-sm max-w-3xl">{current.desc}</div>
                  </div>
                </div>
                <CyberPanel title="ENCODED_OUTPUT">
                  <div className="p-4 h-auto min-h-[150px] overflow-auto">
                    {current.language ? (
                      <SyntaxHighlighter language={current.language} code={current.code} />
                    ) : (
                      <pre className="font-mono text-sm leading-6 text-[#ff00ff]/80 break-all whitespace-pre-wrap m-0">
                        {current.code}
                      </pre>
                    )}
                  </div>
                </CyberPanel>
                
                {activeFace === 'bin' && (
                  <div className="flex gap-3 p-4 bg-[#ff00ff]/5 border border-[#ff00ff]/10 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <Terminal className="w-5 h-5 text-[#ff00ff] shrink-0" />
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      If you're currently trying to "read" the hex block above and failing: congratulations, you're human. We'll be investigating how machines actually make sense of this chaos in the <a href="#matrix" className="text-[#ff00ff] hover:underline"><strong>Digging into the binary</strong></a> section further down.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CyberPanel>
      </div>
    </Section>
  );
};

const SIZE_EXAMPLES = {
  BASIC: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Hiro Protagonist",
    email: "hiro@metaverse.com",
    age: 24,
    heightCm: 175.5,
    weightKg: 70.2,
    role: 2,
    birthDate: { year: 1992, month: 5, day: 22 }
  },
  'LARGE PAYLOAD': {
    id: "user-ceo",
    name: "CEO",
    email: "ceo@megacorp.com",
    age: 65,
    heightCm: 180.0,
    weightKg: 80.0,
    role: 2,
    birthDate: { year: 1959, month: 1, day: 1 },
    manager: {
      id: "user-vp",
      name: "VP of Engineering",
      email: "vp@megacorp.com",
      age: 50,
      heightCm: 170.0,
      weightKg: 75.0,
      role: 2,
      birthDate: { year: 1974, month: 2, day: 2 },
      manager: {
        id: "user-director",
        name: "Director of Engineering",
        email: "director@megacorp.com",
        age: 40,
        heightCm: 172.0,
        weightKg: 72.0,
        role: 2,
        birthDate: { year: 1984, month: 3, day: 3 },
        manager: {
           id: "user-manager",
           name: "Engineering Manager",
           email: "em@megacorp.com",
           age: 35,
           heightCm: 165.0,
           weightKg: 65.0,
           role: 2,
           birthDate: { year: 1989, month: 4, day: 4 },
           manager: {
              id: "user-ic",
              name: "Software Engineer",
              email: "swe@megacorp.com",
              age: 28,
              heightCm: 175.0,
              weightKg: 70.0,
              role: 1,
              birthDate: { year: 1996, month: 5, day: 5 }
           }
        }
      }
    }
  },
  MINIMAL: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Recursive Node",
    email: "node@cluster.local",
    age: 1,
    role: 0
  }
};

const JsonEditor = ({ value, onChange, className = "h-80" }: { value: string, onChange: (s: string) => void, className?: string }) => {
  const [scroll, setScroll] = useState({ top: 0, left: 0 });

  return (
    <div className={`relative w-full ${className} bg-black/20 rounded overflow-hidden`}>
      {/* Background Highlight Layer */}
      <div
        className="absolute top-0 left-0 p-4 font-mono text-sm leading-6 whitespace-pre pointer-events-none select-none"
        style={{
          transform: `translate(-${scroll.left}px, -${scroll.top}px)`,
          width: 'max-content',
          minWidth: '100%'
        }}
      >
        <SyntaxHighlighter language="json" code={value} />
      </div>

      {/* Foreground Interactive Layer */}
      <textarea
        className="absolute inset-0 w-full h-full bg-transparent p-4 font-mono text-sm leading-6 text-transparent caret-white focus:outline-none focus:border-cyan-500/50 resize-none whitespace-pre overflow-auto custom-scrollbar border-none shadow-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => setScroll({ top: e.currentTarget.scrollTop, left: e.currentTarget.scrollLeft })}
        spellCheck={false}
      />
    </div>
  );
};
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

const SizeComparison = ({ messageSchema, fileDescriptorSet }: { messageSchema: DescMessage | null, fileDescriptorSet: Uint8Array | null }) => {
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
    <Section id="efficiency" className="py-24 px-4 sm:px-8 bg-slate-900/30 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Zap} subtitle="02_PERFORMANCE_METRICS">Efficiency</SectionTitle>

        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-300 leading-relaxed">
          <div className="space-y-4">
            <p>
              The message size savings you can expect from Protobuf highly depend on your data. Large strings will always take space, but numeric data and sparse messages (many optional fields) see massive reductions compared to JSON.
            </p>
            <p>
              Try a few different scenarios below: use the preset examples, <span className="text-[#ff00ff]">generate fake data</span> (powered by <ExternalLinkText href="https://fauxrpc.com"><strong>FauxRPC</strong></ExternalLinkText>), or fill in your own.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-cyber font-bold uppercase text-sm">Beyond Just Size: Parsing Speed</h4>
            <p className="text-sm text-slate-400">
              While size is a major benefit, Protobuf's real superpower is <strong>parsing performance</strong>. Because the format is binary and avoids expensive string-parsing logic, it can be <ExternalLinkText href="https://auth0.com/blog/beating-json-performance-with-protobuf/">up to 6x faster to parse than JSON</ExternalLinkText>.
            </p>
            <p className="text-sm text-slate-400">
              The binary format strikes a careful balance between extreme efficiency and enough structural simplicity to allow for robust, cross-language decoding.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SIZE_EXAMPLES) as Array<keyof typeof SIZE_EXAMPLES>).map((key) => (
                <button
                  key={key}
                  onClick={() => handleExampleChange(key)}
                  className={`px-4 py-1 text-xs font-mono border transition-all ${activeExample === key
                      ? 'bg-[#00f3ff]/10 border-[#00f3ff] text-[#00f3ff]'
                      : 'border-white/10 text-slate-500 hover:border-white/30'
                    }`}
                >
                  {key}
                </button>
              ))}
              <button
                onClick={generateFauxData}
                disabled={!messageSchema || !fileDescriptorSet || isGenerating}
                className={`px-4 py-1 text-xs font-mono border transition-all flex items-center gap-2 ${activeExample === 'FAUX'
                    ? 'bg-[#ff00ff]/10 border-[#ff00ff] text-[#ff00ff]'
                    : 'border-[#ff00ff]/30 text-[#ff00ff]/70 hover:border-[#ff00ff] hover:text-[#ff00ff] disabled:opacity-30 disabled:cursor-not-allowed'
                  }`}
              >
                <Zap className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'GENERATING...' : 'GENERATE_FAUX_DATA'}
              </button>
            </div>
            <CyberPanel title="DATA_INPUT (JSON)" headerExtra={stats.error && <span className="text-xs text-red-500 font-mono">PARSE_ERROR</span>}>
              <JsonEditor value={jsonInput} onChange={setJsonInput} className="h-80" />
            </CyberPanel>
          </div>
          <div className="space-y-6">
            <CyberPanel title="REAL_TIME_ANALYSIS">
              <div className="space-y-6 py-4">
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Watch as the binary encoder strips away the redundant field names and formatting that bloats JSON payloads.
                </p>
                
                {/* Size Bars */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-2">
                      <span>JSON_RAW</span>
                      <span className="text-white">{stats.jsonSize} B</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400" style={{ width: '100%' }}></div>
                    </div>
                    {gzipStats.json > 0 && (
                      <div className="flex justify-between text-[10px] font-mono mt-1 text-slate-500">
                        <span>WITH_GZIP</span>
                        <span>{gzipStats.json} B</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-2 text-[#00ff9f]">
                      <span>PROTOBUF_BINARY</span>
                      <span className="text-[#00ff9f] font-bold">{stats.pbSize} B</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.jsonSize > 0 ? (stats.pbSize / stats.jsonSize) * 100 : 0}%` }}
                        className="h-full bg-[#00ff9f]"
                      />
                    </div>
                    {gzipStats.pb > 0 && (
                      <div className="flex justify-between text-[10px] font-mono mt-1 text-[#00ff9f]/60">
                        <span>WITH_GZIP</span>
                        <span>{gzipStats.pb} B</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-cyber font-bold text-[#00ff9f]">-{stats.ratio}%</p>
                    <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase">RAW_PAYLOAD_REDUCTION</p>
                  </div>
                  {gzipStats.json > 0 && gzipStats.pb > 0 && (
                    <div className="text-right">
                       <p className={`text-xl font-cyber font-bold ${gzipStats.pb < gzipStats.json ? 'text-[#00f3ff]' : 'text-yellow-500'}`}>
                         {gzipStats.pb < gzipStats.json ? '-' : '+'}{Math.abs(Number(((1 - gzipStats.pb / gzipStats.json) * 100).toFixed(1)))}%
                       </p>
                       <p className="text-[9px] font-mono text-slate-500 uppercase">GZIPPED_PB vs GZIPPED_JSON</p>
                    </div>
                  )}
                </div>
              </div>
            </CyberPanel>
            <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded text-sm text-slate-400 space-y-3">
              <p><strong>How it works:</strong></p>
              <ul className="space-y-2">
                <li className="flex gap-2"><div className="w-1 h-1 bg-[#00f3ff] mt-1.5 shrink-0"></div> No field names in payload (replaced by small numeric tags).</li>
                <li className="flex gap-2"><div className="w-1 h-1 bg-[#00f3ff] mt-1.5 shrink-0"></div> Varint encoding shrinks small integers to 1-2 bytes.</li>
                <li className="flex gap-2"><div className="w-1 h-1 bg-[#00f3ff] mt-1.5 shrink-0"></div> Optional fields take zero space if not set.</li>
              </ul>
              <div className="pt-2 border-t border-white/5">
                <p className="text-xs">
                  <strong>Pro Tip:</strong> For specialized high-performance Go applications, <ExternalLinkText href="https://github.com/bufbuild/hyperpb-go"><strong>hyperpb</strong></ExternalLinkText> provides an even faster implementation that avoids reflection and allocation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

const PayloadSizeInsights = () => (
  <Section id="insights" className="py-24 px-4 sm:px-8 bg-black/40 border-t border-white/5">
    <div className="max-w-3xl mx-auto space-y-6">
      <h3 className="text-xl sm:text-2xl md:text-3xl font-cyber font-bold text-white uppercase tracking-tight">Size vs. Compression</h3>
      <p className="text-slate-400 leading-relaxed">
        While Protobuf provides a massive reduction in <span className="text-[#00ff9f] font-bold">raw payload size (typically 30-50%)</span> compared to JSON, the gap often narrows when GZIP or Brotli compression is applied. For GZIP compressed payloads, the difference is usually in the <span className="text-[#00f3ff] font-bold">15-30% range</span>.
      </p>
      <p className="text-slate-400 leading-relaxed">
        However, there is a critical tradeoff: compression adds significant CPU overhead to every request. For smaller payloads, the time spent compressing and decompressing can be greater than the time saved by the smaller transfer size. In these cases, sending uncompressed Protobuf is often the most optimal path for overall latency.
      </p>
      <p className="text-slate-400 leading-relaxed text-sm">
        Protobuf shines when your data has many numbers, enums, or sparse fields. String-heavy payloads benefit less from binary encoding but still benefit from Protobuf's schema-driven performance and type safety.
      </p>
    </div>
  </Section>
);

const TypeSystem = () => {
  const groups = [
    {
      name: "Numeric Types",
      icon: Hash,
      types: [
        { name: "int32 / int64", desc: "Signed integers. Uses variable-length encoding (varint)." },
        { name: "uint32 / uint64", desc: "Unsigned integers. Efficient for positive-only values." },
        { name: "sint32 / sint64", desc: <>Signed integers. More efficient for negative numbers via <ExternalLinkText href="https://en.wikipedia.org/wiki/Variable-length_quantity#Zigzag_encoding">ZigZag</ExternalLinkText>.</> },
        { name: "fixed32 / fixed64", desc: "Always 4/8 bytes. Efficient for large constants (> 2^28)." },
        { name: "float / double", desc: <>32-bit and 64-bit <ExternalLinkText href="https://en.wikipedia.org/wiki/IEEE_754">IEEE 754</ExternalLinkText> floating point numbers.</> },
      ]
    },
    {
      name: "Object Types",
      icon: Type,
      types: [
        { name: "string", desc: <>Always <ExternalLinkText href="https://en.wikipedia.org/wiki/UTF-8">UTF-8</ExternalLinkText> encoded text. Limited to 2GB.</> },
        { name: "bytes", desc: "Raw byte sequences. Perfect for arbitrary binary data." },
        { name: "bool", desc: "Encoded as a varint 0 or 1." },
        { name: "enum", desc: "Predefined set of named integers. Defaults to 0." },
      ]
    }
  ];

  const TypeGroup = ({ groupName, groupIcon: Icon, types }: { groupName: string, groupIcon: React.ElementType, types: { name: string, desc: React.ReactNode }[] }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[#00f3ff]">
        <Icon className="w-4 h-4" />
        <h4 className="font-cyber font-bold text-sm tracking-widest uppercase">{groupName}</h4>
      </div>
      <div className="grid gap-3">
        {types.map(t => (
          <div key={t.name as string} className="p-3 bg-white/5 border border-white/5 rounded-lg group hover:border-[#00f3ff]/30 transition-colors">
            <div className="flex justify-between items-start mb-1">
              <span className="font-mono text-xs font-bold text-white group-hover:text-[#00f3ff]">{t.name}</span>
            </div>
            <div className="text-xs text-slate-400 leading-relaxed">{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Section id="types" className="py-24 px-4 sm:px-8 bg-slate-900/5 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Combine} subtitle="05_TYPE_REFERENCE">The Type System</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {groups.map(g => (
            <TypeGroup key={g.name} groupName={g.name} groupIcon={g.icon} types={g.types} />
          ))}
        </div>
      </div>
    </Section>
  );
};

const WireFormatBreakdown = () => {
  const wireTypes = [
    {
      id: 0,
      name: "VARINT",
      what: "Variable-length integers.",
      why: "Efficiency is paramount. Most numbers in real-world applications are small. VARINTs use between 1 and 10 bytes, allowing a small number like '7' to take just 1 byte instead of the 4 or 8 bytes required by fixed-size formats.",
      types: ["int32", "int64", "uint32", "uint64", "sint32", "sint64", "bool", "enum"]
    },
    {
      id: 1,
      name: "I64 (Fixed 64-bit)",
      what: "A fixed 8-byte payload.",
      why: "Not everything benefits from compression. High-precision decimals (doubles) or large IDs that are consistently huge are faster to process when the decoder knows exactly where the next field starts without bit-shifting groups of 7 bits.",
      types: ["fixed64", "sfixed64", "double"]
    },
    {
      id: 2,
      name: "LEN (Length-Delimited)",
      what: "A VARINT length prefix followed by N bytes of data.",
      why: "This is the 'catch-all' for dynamic data. By prefixing the data with its length, the decoder can instantly skip over massive sub-messages or strings if they aren't needed, providing the performance that makes Protobuf scale.",
      types: ["string", "bytes", "embedded messages", "packed repeated fields"]
    },
    {
      id: 3,
      name: "SGROUP (Start Group)",
      what: "Start of a group (deprecated).",
      why: "Groups were a legacy way to nest messages. They used start/end tags as delimiters instead of length prefixes. While still supported by some decoders for compatibility, they are deprecated and should never be used in new schemas.",
      types: [],
      deprecated: true
    },
    {
      id: 4,
      name: "EGROUP (End Group)",
      what: "End of a group (deprecated).",
      why: "The matching delimiter for SGROUP. Length-delimited sub-messages (Wire Type 2) are significantly more efficient because they allow decoders to skip the entire sub-message without parsing every field inside it.",
      types: [],
      deprecated: true
    },
    {
      id: 5,
      name: "I32 (Fixed 32-bit)",
      what: "A fixed 4-byte payload.",
      why: "The smaller sibling of I64. Perfect for standard floating-point numbers (floats) or 32-bit constants where the overhead of variable-length encoding would actually result in more bytes or unnecessary CPU cycles.",
      types: ["fixed32", "sfixed32", "float"]
    }
  ];

  return (
    <div className="mb-24 space-y-8">
      <div className="flex flex-col gap-2 mb-12">
        <h3 className="text-2xl font-cyber font-bold text-white uppercase flex items-center gap-3">
          <Fingerprint className="w-6 h-6 text-[#ff00ff]" />
          Wire Type Registry
        </h3>
        <p className="text-slate-400 max-w-3xl leading-relaxed">
          The "Wire Type" is the low-level physical format of the data on the disk or wire. While your schema has dozens of types, they all collapse into these four physical representations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-blue-500/5 border border-blue-500/10 rounded-xl p-8 mb-12">
          <div className="space-y-4">
            <h4 className="text-white font-cyber font-bold uppercase text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00f3ff]" />
              Why you need a Schema
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              A raw Protobuf stream is <strong>untyped</strong>. Without a <code>.proto</code> file, a decoder can see that <em>"Field #3 is a Length-Delimited blob"</em>, but it doesn't know if that blob is a UTF-8 <code>string</code>, raw <code>bytes</code>, or a nested <code>message</code>.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-cyber font-bold uppercase text-sm flex items-center gap-2">
              <Combine className="w-4 h-4 text-[#ff00ff]" />
              The Minimal Mapping
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              To fully decode a message, you need a registry that maps every <strong>Field Number</strong> to a <strong>Protobuf Type</strong>. This allows the decoder to interpret the bits correctly (e.g., using ZigZag decoding for <code>sint32</code> vs standard varint for <code>int32</code>).
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {wireTypes.map((wt) => (
          <div key={wt.id} className={`relative group ${wt.deprecated ? 'opacity-70 hover:opacity-100 transition-opacity' : ''}`}>
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${wt.deprecated ? 'from-slate-500/20 to-slate-500/20' : 'from-[#ff00ff]/20 to-[#00f3ff]/20'} rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500`} />
            <div className={`relative flex flex-col md:flex-row bg-[#0a0a0a] border ${wt.deprecated ? 'border-white/10' : 'border-white/10'} rounded-xl overflow-hidden`}>
              <div className="w-full md:w-32 bg-white/5 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/10 py-6 md:py-0">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-tighter">Wire ID</span>
                  <span className={`text-5xl font-cyber font-black ${wt.deprecated ? 'text-slate-500' : 'text-[#ff00ff]'}`}>{wt.id}</span>
                </div>
              </div>

              <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-4">
                  <div>
                    <h4 className={`text-xl font-cyber font-bold ${wt.deprecated ? 'text-slate-300' : 'text-[#00f3ff]'} uppercase mb-1`}>
                      {wt.name} {wt.deprecated && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded ml-2 text-slate-400">DEPRECATED</span>}
                    </h4>
                    <p className="text-sm font-mono text-slate-300">{wt.what}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">RATIONALE // WHY_IT_EXISTS</span>
                    <p className="text-sm text-slate-400 leading-relaxed italic">
                      {wt.why}
                    </p>
                  </div>
                </div>

                <div className={`lg:col-span-4 flex flex-col justify-center gap-4 bg-white/5 p-6 rounded-lg border ${wt.deprecated ? 'border-white/0' : 'border-white/5'}`}>
                  {wt.types.length > 0 ? (
                    <>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Mapped Schema Types</span>
                      <div className="flex flex-wrap gap-2">
                        {wt.types.map((t) => (
                          <span key={t} className="px-2 py-1 bg-black/60 border border-[#00f3ff]/20 rounded text-[11px] font-mono text-[#00f3ff]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                       <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest italic">No modern types map here</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


const SchemaDrivenAPIs = () => (
  <Section id="schema" className="py-24 px-4 sm:px-8 bg-slate-900/20 border-t border-white/5">
    <div className="max-w-7xl mx-auto">
      <SectionTitle icon={FileCode} subtitle="06_ARCHITECTURE">Schema-Driven APIs</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="space-y-6 text-slate-300">
          <h3 className="text-xl font-cyber font-bold text-white uppercase">The Source of Truth</h3>
          <p>
            In the Protobuf world, the <strong>.proto</strong> file is the contract. This encourages <strong>Contract-First</strong> development, where the data model and API surface are defined before any code is written.
          </p>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <div className="w-1.5 h-1.5 bg-[#00f3ff] mt-2 shrink-0"></div>
              <p><strong>Universal Tooling:</strong> Generate clients and servers for various languages from the same file using <ExternalLinkText href="https://buf.build/docs/bsr/introduction">BSR</ExternalLinkText> or local compilers.</p>
            </li>
            <li className="flex gap-4">
              <div className="w-1.5 h-1.5 bg-[#ff00ff] mt-2 shrink-0"></div>
              <p><strong>Compatibility:</strong> Robust rules for adding/removing fields without breaking old clients, essential for distributed systems.</p>
            </li>
            <li className="flex gap-4">
              <div className="w-1.5 h-1.5 bg-[#00ff9f] mt-2 shrink-0"></div>
              <p>
                <strong>Native RPC:</strong> Unlike most serialization formats, Protobuf includes native <code>service</code> and <code>rpc</code> definitions. This allows you to define your entire API surface in one place, powering frameworks like <ExternalLinkText href="https://grpc.io/">gRPC</ExternalLinkText>, <ExternalLinkText href="https://connectrpc.com/">ConnectRPC</ExternalLinkText>, and <ExternalLinkText href="https://twitchtv.github.io/twirp/">Twirp</ExternalLinkText>.
              </p>
            </li>
          </ul>
        </div>
        <div className="p-8 bg-white/5 border border-white/5 rounded-xl flex flex-col justify-center">
          <h4 className="text-[#00f3ff] font-cyber font-bold text-sm tracking-widest uppercase mb-4 text-center">THE_WORKFLOW</h4>
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-black/40 border border-[#00f3ff]/30 rounded text-[#00f3ff]/80">1. DEFINE SCHEMA (.proto)</div>
            <div className="flex justify-center"><ArrowRight className="w-4 h-4 rotate-90 text-slate-600" /></div>
            <div className="p-3 bg-black/40 border border-[#ff00ff]/30 rounded text-[#ff00ff]/80">2. COMPILE TARGETS (Go, TS, etc.)</div>
            <div className="flex justify-center"><ArrowRight className="w-4 h-4 rotate-90 text-slate-600" /></div>
            <div className="p-3 bg-black/40 border border-[#00ff9f]/30 rounded text-[#00ff9f]/80">3. SHIP PERFORMANCE</div>
          </div>
        </div>
      </div>
    </div>
  </Section>
);

const AlternativesLandscape = () => (
  <Section id="alternatives" className="py-24 px-4 sm:px-8 bg-slate-900/10 border-t border-white/5">
    <div className="max-w-7xl mx-auto">
      <SectionTitle icon={Layers} subtitle="09_COMPARISON">The Landscape of Alternatives</SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="space-y-6">
          <h3 className="text-xl font-cyber font-bold text-white uppercase flex items-center gap-3">
            <Code2 className="w-5 h-5 text-[#ff00ff]" />
            The Alternatives
          </h3>
          <p className="text-slate-400">
            While Protobuf is the industry standard for high-performance microservices, other formats exist with different trade-offs. Protobuf is unique in its balance of performance, message size, and complete ecosystem.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "JSON", href: "https://www.json.org/", desc: "Ubiquitous and human-readable, but lacks native schemas and is significantly slower to parse/serialize." },
              { name: "FlatBuffers", href: "https://google.github.io/flatbuffers/", desc: "Extreme performance via zero-copy access. More complex API; ideal for games and embedded systems." },
              { name: "MessagePack", href: "https://msgpack.org/", desc: "A compact binary 'JSON'. Efficient for size, but lacks the strict schema evolution of Protobuf." },
              { name: "Cap'n Proto", href: "https://capnproto.org/", desc: "Zero-copy format with schema evolution. Incredible performance but slightly narrower language support." },
            ].map((alt) => (
              <div key={alt.name} className="p-4 bg-white/5 border border-white/5 rounded-lg group hover:border-white/10 transition-colors">
                <ExternalLinkText href={alt.href}><span className="font-bold text-white">{alt.name}</span></ExternalLinkText>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{alt.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <CyberPanel title="OPENAPI vs PROTOBUF">
            <div className="space-y-6 py-2">
              <div className="grid grid-cols-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest pb-2 border-b border-white/5">
                <span>Feature</span>
                <span>REST / OpenAPI</span>
                <span>gRPC / Protobuf</span>
              </div>
              {[
                { label: "Format", rest: "JSON (Text)", pb: "Binary (Proto)" },
                { label: "Contract", rest: "Optional/Post-hoc", pb: "Mandatory/First" },
                { label: "Efficiency", rest: "Low (Redundant Keys)", pb: "High (Tag IDs)" },
                { label: "Language Support", rest: "Manual/Mixed", pb: "Code Generation" },
                { label: "Streaming", rest: "Request/Response", pb: "Bidirectional" },
              ].map((row) => (
                <div key={row.label} className="grid grid-cols-3 text-sm items-center">
                  <span className="text-slate-400 font-mono text-xs">{row.label}</span>
                  <span className="text-[#ff00ff]/80">{row.rest}</span>
                  <span className="text-[#00f3ff]/80 font-bold">{row.pb}</span>
                </div>
              ))}
            </div>
          </CyberPanel>
        </div>
      </div>

      <div className="bg-[#ff00ff]/5 border border-[#ff00ff]/10 rounded-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h4 className="text-[#ff00ff] font-cyber font-bold text-sm tracking-widest uppercase">The Protobuf Balance</h4>
          </div>
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Performance", icon: CheckCircle2, text: "Fast enough for 99.9% of use cases." },
              { title: "Language Support", icon: CheckCircle2, text: "Best-in-class across nearly every platform." },
              { title: "Extendability", icon: CheckCircle2, text: "Powerful plugin system (protoc-gen-*)." },
              { title: "Completeness", icon: CheckCircle2, text: "Defines both data AND communication (RPC)." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <item.icon className="w-4 h-4 text-[#ff00ff] shrink-0" />
                <p className="text-xs text-slate-400"><strong>{item.title}:</strong> {item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </Section>
);

const BinaryMatrix = ({ messageSchema }: { messageSchema: DescMessage | null }) => {
  const [activeExample, setActiveExample] = useState<keyof typeof SIZE_EXAMPLES>('BASIC');
  const [jsonInput, setJsonInput] = useState(JSON.stringify(SIZE_EXAMPLES.BASIC, null, 2));
  const [selectedByte, setSelectedByte] = useState<number | null>(null);

  const handleExampleChange = (key: keyof typeof SIZE_EXAMPLES) => {
    setActiveExample(key);
    setJsonInput(JSON.stringify(SIZE_EXAMPLES[key], null, 2));
    setSelectedByte(null);
  };

  const stats = useMemo(() => {
    if (!messageSchema) return { segments: [] };
    try {
      const obj = JSON.parse(jsonInput);
      const user = fromJson(messageSchema, obj, { ignoreUnknownFields: true });
      const binary = toBinary(messageSchema, user);
      const segments = decodeBinary(binary);
      return { segments };
    } catch {
      return { segments: [] };
    }
  }, [jsonInput, messageSchema]);

  const getBits = (byte: number) => {
    return byte.toString(2).padStart(8, '0').split('').map((bit, i) => ({
      bit,
      isMSB: i === 0,
      isType: i > 4,
    }));
  };

  const safeSelectedByte = selectedByte !== null && selectedByte < stats.segments.length ? selectedByte : null;
  const currentSegment = safeSelectedByte !== null ? stats.segments[safeSelectedByte] : null;
  
  const groupedDataBytes = useMemo(() => {
    if (!currentSegment || currentSegment.type !== 'data') return null;
    return stats.segments.filter(s => s.fieldId === currentSegment.fieldId && s.type === 'data');
  }, [currentSegment, stats.segments]);

  const goToNext = () => {
    if (selectedByte === null) setSelectedByte(0);
    else if (selectedByte < stats.segments.length - 1) setSelectedByte(selectedByte + 1);
  };

  const goToPrev = () => {
    if (selectedByte === null) setSelectedByte(stats.segments.length - 1);
    else if (selectedByte > 0) setSelectedByte(selectedByte - 1);
  };

  return (
    <Section id="binary" className="py-24 px-4 sm:px-8 bg-slate-900/5 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Binary} subtitle="03_WIRE_FORMAT">Digging into the binary</SectionTitle>

        <WireFormatBreakdown />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
          <div className="lg:col-span-4 space-y-6 leading-relaxed text-slate-300">
            <h3 className="text-2xl font-cyber font-bold text-white uppercase">Decoding the Stream</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {(Object.keys(SIZE_EXAMPLES) as Array<keyof typeof SIZE_EXAMPLES>).map((key) => (
                <button
                  key={key}
                  onClick={() => handleExampleChange(key)}
                  className={`px-3 py-1 text-xs font-mono border transition-all ${activeExample === key
                      ? 'bg-[#00f3ff]/10 border-[#00f3ff] text-[#00f3ff]'
                      : 'border-white/10 text-slate-500 hover:border-white/30'
                    }`}
                >
                  {key}
                </button>
              ))}
            </div>
            <p>
              Protobuf is a binary format. Unlike JSON which is a stream of characters, Protobuf is a stream of bytes where every bit has a job.
            </p>
            <div className="space-y-4 text-sm">
              <p>
                Each field starts with a <strong>Tag</strong> byte (or bytes) which contains the <strong>Field Number</strong> and the <strong>Wire Type</strong>.
              </p>
              <p>
                This allows the decoder to skip fields it doesn't recognize, providing perfect backward and forward compatibility.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <CyberPanel 
              title="DYNAMIC_BINARY_HEX_STREAM"
              headerExtra={
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={goToPrev}
                    disabled={selectedByte === 0 || selectedByte === null}
                    className="p-1 hover:bg-white/10 rounded disabled:opacity-20"
                  >
                    <ChevronLeft className="w-3 h-3 text-[#00f3ff]" />
                  </button>
                  <span className="text-[10px] font-mono text-slate-500 min-w-[50px] sm:min-w-[60px] text-center">
                    {selectedByte !== null ? `${selectedByte + 1} / ${stats.segments.length}` : '-- / --'}
                  </span>
                  <button
                    onClick={goToNext}
                    disabled={selectedByte === stats.segments.length - 1 || selectedByte === null}
                    className="p-1 hover:bg-white/10 rounded disabled:opacity-20"
                  >
                    <ChevronRight className="w-3 h-3 text-[#00f3ff]" />
                  </button>
                </div>
              }            >
              <div className="flex flex-wrap gap-y-3 gap-x-0 font-mono text-xl md:text-2xl p-4 pr-2">
                {stats.segments.map((b, i) => {
                  const isPrevData = i > 0 && stats.segments[i - 1].type === 'data' && stats.segments[i - 1].fieldId === b.fieldId;
                  const isNextData = i < stats.segments.length - 1 && stats.segments[i + 1].type === 'data' && stats.segments[i + 1].fieldId === b.fieldId;
                  const isData = b.type === 'data';

                  return (
                    <motion.div
                      key={i}
                      onClick={() => setSelectedByte(selectedByte === i ? null : i)}
                      className={`
                        px-1 cursor-crosshair transition-all border
                        ${b.type === 'tag' ? 'border-[#00f3ff]/30 text-[#00f3ff] hover:bg-[#00f3ff]/20 rounded' : ''}
                        ${b.type === 'len' ? 'border-[#ff00ff]/30 text-[#ff00ff] hover:bg-[#ff00ff]/20 rounded' : ''}
                        ${isData ? `border-[#00ff9f]/30 text-[#00ff9f] hover:bg-[#00ff9f]/20 
                          ${isPrevData ? 'border-l-0 rounded-l-none' : 'rounded-l'} 
                          ${isNextData ? 'border-r-0 rounded-r-none' : 'rounded-r'}
                        ` : ''}
                        ${selectedByte === i ? 'bg-[#00f3ff]/20 border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.4)] z-10 scale-110' : 'hover:scale-105'}
                      `}
                    >
                      {b.val}
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-8 border-t border-white/5 pt-6 min-h-[220px]">
                <AnimatePresence mode="wait">
                  {currentSegment ? (
                    <motion.div key={safeSelectedByte} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                          <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Byte Analysis <span className="text-[#00f3ff] ml-2">[INDEX {safeSelectedByte}]</span></span>
                          <span className="text-white font-mono text-lg">{currentSegment.desc}</span>
                          <div className="text-sm text-slate-400 mt-2 p-2 bg-white/5 rounded border border-white/5">
                            {currentSegment.type === 'tag' && "This byte identifies which field we're looking at and how to decode the following data."}
                            {currentSegment.type === 'len' && "For strings and sub-messages, this byte tells us exactly how many bytes of data follow."}
                            {currentSegment.type === 'data' && "The actual payload of the field. Below you can see the raw hex and ASCII representation of this field's data."}
                          </div>
                        </div>
                        <div className="flex flex-col gap-4">
                          <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Bit Breakdown (0x{currentSegment.val})</span>
                          <div className="flex gap-1">
                            {getBits(currentSegment.raw).map((bit, i) => (
                              <div key={i} className="flex flex-col items-center">
                                <div className={`w-8 h-10 flex items-center justify-center font-mono text-lg border ${bit.isMSB ? 'border-[#ff00ff]/50 text-[#ff00ff] bg-[#ff00ff]/5' : bit.isType && currentSegment.type === 'tag' ? 'border-[#00f3ff]/50 text-[#00f3ff] bg-[#00f3ff]/5' : 'border-white/10 text-white'}`}>{bit.bit}</div>
                                <span className="text-[10px] font-mono mt-1 text-slate-600">{i === 0 ? 'MSB' : i >= 5 && currentSegment.type === 'tag' ? 'TYPE' : `B${7 - i}`}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-slate-300 italic border-l-2 border-[#00f3ff]/30 pl-3 py-1 bg-[#00f3ff]/5 rounded-r">
                            {currentSegment.type === 'tag' ? "Bits 0-2 (last 3) indicate the Wire Type. Bits 3-7 are the Field Number (if < 16)." : "The Most Significant Bit (MSB) at index 0 indicates if more bytes follow."}
                          </p>
                        </div>
                      </div>

                      {currentSegment.type === 'data' && groupedDataBytes && (
                        <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
                          <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Field Data Viewer</span>
                          <HexViewer bytes={groupedDataBytes} />
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-[#00f3ff]/20 rounded-xl gap-4 bg-[#00f3ff]/5 text-center group"
                    >
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="p-3 bg-[#00f3ff]/10 rounded-full border border-[#00f3ff]/30"
                      >
                        <ArrowUp className="w-6 h-6 text-[#00f3ff]" />
                      </motion.div>
                      <div className="space-y-1">
                        <p className="text-white font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                          <MousePointer2 className="w-4 h-4 text-[#ff00ff]" />
                          Click a hex byte above
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          Analyze the wire format step-by-step.<br />
                          Use the pagination controls to navigate the stream.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CyberPanel>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t border-white/5">
          <div className="lg:col-span-7 space-y-8 text-slate-300">
            <h3 className="text-2xl font-cyber font-bold text-[#ff00ff] uppercase">Varint Encoding</h3>
            <p>Varints are the secret sauce of Protobuf efficiency. They allow us to store integers using between 1 and 10 bytes, where smaller numbers take fewer bytes.</p>
            <div className="p-6 bg-slate-900/50 border-l-2 border-[#ff00ff] space-y-6">
              <div>
                <h4 className="text-[#ff00ff] font-cyber uppercase text-sm mb-4 text-[#ff00ff]">How it works (Step-by-Step)</h4>
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li>Take the binary representation of your number.</li>
                  <li>Split it into groups of 7 bits, starting from the right (LSB).</li>
                  <li>For each group except the last one, add a 1 as the 8th bit (the MSB). This is the "continuation bit".</li>
                  <li>For the very last group, add a 0 as the 8th bit. This tells the decoder "we are done".</li>
                  <li>The resulting bytes are stored in the stream, smallest group first.</li>
                </ol>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <h5 className="text-xs font-mono text-[#00f3ff] uppercase text-[#00f3ff]">Why use Varints?</h5>
                  <p className="text-xs text-slate-400">In most applications, small integers are far more common than large ones. If you have an `int32` but its value is usually `5`, why waste 4 bytes? Varints allow `5` to take only 1 byte.</p>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xs font-mono text-[#ff00ff] uppercase text-[#ff00ff]">The Trade-off</h5>
                  <p className="text-xs text-slate-400 text-slate-400">Large numbers (greater than 2^28) actually take 5 bytes instead of 4. However, the savings on small numbers usually far outweigh this penalty in real-world data.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5">
            <CyberPanel title="VARINT_EXPLORER">
              <VarintExplainer />
            </CyberPanel>
          </div>
        </div>
      </div>
    </Section>
  );
};

const CompilationSection = () => (
  <Section id="compile" className="py-24 px-4 sm:px-8 bg-slate-900/10 border-t border-white/5">
    <div className="max-w-7xl mx-auto">
      <SectionTitle icon={Code2} subtitle="07_PIPELINE">Compile</SectionTitle>
      <div className="flex flex-col items-center">
        <div className="flex flex-col md:flex-row items-center gap-8 w-full justify-between max-w-5xl">
          <CyberPanel title="SOURCE" className="w-full md:w-64 text-center">
            <FileCode className="w-12 h-12 text-[#00ff9f] mx-auto mb-4" />
            <span className="font-cyber text-sm">SCHEMA.PROTO</span>
          </CyberPanel>
          <div className="flex flex-col items-center gap-2">
            <ArrowRight className="w-8 h-8 text-[#00f3ff] rotate-90 md:rotate-0" />
            <span className="text-xs font-mono text-slate-500 uppercase"><ExternalLinkText href="https://github.com/protocolbuffers/protobuf/releases">protoc</ExternalLinkText> / <ExternalLinkText href="https://buf.build/">Buf</ExternalLinkText></span>
          </div>
          <CyberPanel title="COMPILER" className="w-full md:w-64 text-center border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.2)]">
            <Cpu className="w-12 h-12 text-[#00f3ff] mx-auto mb-4 animate-pulse" />
            <span className="font-cyber text-sm text-[#00f3ff]">CODE_GENERATION</span>
          </CyberPanel>
          <div className="flex flex-col items-center gap-2">
            <ArrowRight className="w-8 h-8 text-[#ff00ff] rotate-90 md:rotate-0" />
            <span className="text-xs font-mono text-slate-500 uppercase">TARGETS</span>
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <CyberPanel className="text-center p-3 text-xs">C++</CyberPanel>
              <CyberPanel className="text-center p-3 text-xs">Java</CyberPanel>
              <CyberPanel className="text-center p-3 text-xs">Go</CyberPanel>
              <CyberPanel className="text-center p-3 text-xs">Ruby</CyberPanel>
              <CyberPanel className="text-center p-3 text-xs">C#</CyberPanel>
              <CyberPanel className="text-center p-3 text-xs">Python</CyberPanel>
            </div>
            <div className="p-3 bg-[#00ff9f]/5 border border-[#00ff9f]/20 rounded text-center">
              <span className="text-[10px] font-mono text-[#00ff9f] uppercase block mb-1">Plus Community Tools</span>
              <div className="flex flex-col gap-1">
                <ExternalLinkText href="https://github.com/sudorandom/protoc-gen-connect-openapi"><span className="text-xs">OpenAPI</span></ExternalLinkText>
                <ExternalLinkText href="https://github.com/protocolbuffers/protobuf/blob/main/docs/third_party.md"><span className="text-xs italic">And Many, Many More...</span></ExternalLinkText>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 max-w-3xl text-center text-slate-400 space-y-4">
          <p>
            Compilation translates your language-neutral schema into high-performance source code for your specific language. This generated code handles all the complexity of bit-packing and validation.
          </p>
          <p className="text-sm">
            See the full list of <ExternalLinkText href="https://github.com/protocolbuffers/protobuf/blob/main/docs/third_party.md">Officially and Third-Party Supported Languages</ExternalLinkText>.
          </p>
        </div>
      </div>
    </div>
  </Section>
);

const VALIDATION_EXAMPLES = {
  VALID: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Hiro Protagonist",
    email: "hiro@metaverse.com",
    age: 30,
    role: 2,
    birthDate: { year: 1996, month: 1, day: 1 }
  },
  INVALID_AGE: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Hiro",
    email: "hiro@metaverse.com",
    age: 200,
    role: 2,
    birthDate: { year: 1996, month: 1, day: 1 }
  },
  INVALID_DATE: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Hiro",
    email: "hiro@metaverse.com",
    age: 30,
    role: 2,
    birthDate: { year: 1850, month: 13, day: 32 }
  },
  INVALID_EMAIL: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Hiro",
    email: "not-an-email",
    age: 30,
    role: 2
  }
};

const SchemaEditorModal = ({ isOpen, onClose, value, onApply }: { 
  isOpen: boolean, 
  onClose: () => void, 
  value: string, 
  onApply: (s: string) => void
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [localErrors, setLocalErrors] = useState<CompilationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsValidating(true);
      try {
        const result = await createDynamicRegistry(localValue);
        if (isMounted) {
          if (result.kind === "success") {
            setLocalErrors([]);
          } else {
            setLocalErrors(result.errors);
          }
        }
      } catch (e) {
        console.error("Local validation failed:", e);
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [localValue, isOpen]);

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-[#0a0a0a] border border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.1)] flex flex-col max-h-[90vh]"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-[#00f3ff]" />
            <h2 className="font-cyber font-bold text-white uppercase tracking-wider">Edit_Protobuf_Schema</h2>
            {isValidating && (
              <div className="flex items-center gap-2 ml-4">
                <div className="w-2 h-2 bg-[#00f3ff] rounded-full animate-pulse" />
                <span className="text-[10px] font-mono text-[#00f3ff]/60 uppercase tracking-widest">Validating...</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors group">
            <X className="w-5 h-5 text-slate-500 group-hover:text-white" />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden p-4">
           <SchemaEditor value={localValue} onChange={setLocalValue} errors={localErrors} />
           {localErrors.length > 0 && (
             <div className="mt-4 space-y-2 overflow-y-auto max-h-32">
               {localErrors.map((err, i) => (
                 <div key={i} className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-mono">
                   [LINE {err.line}] {err.message}
                 </div>
               ))}
             </div>
           )}
        </div>
        
        <div className="p-4 bg-white/5 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="text-xs text-slate-500">
             <ExternalLinkText href="https://protovalidate.com/schemas/standard-rules/">View Standard Rules Documentation</ExternalLinkText>
           </div>
           <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
             <button 
               onClick={onClose}
               className="w-full md:w-auto px-6 py-2 border border-white/10 text-slate-400 font-cyber font-bold hover:bg-white/5 transition-all text-xs"
             >
               CANCEL
             </button>
             <button 
               onClick={() => {
                 if (localErrors.length === 0) {
                   onApply(localValue);
                   onClose();
                 }
               }}
               disabled={localErrors.length > 0 || isValidating}
               className="w-full md:w-auto px-4 sm:px-8 py-2 bg-[#00f3ff]/10 border border-[#00f3ff] text-[#00f3ff] font-cyber font-bold hover:bg-[#00f3ff]/20 transition-all text-xs shadow-[0_0_15px_rgba(0,243,255,0.2)] disabled:opacity-30 disabled:cursor-not-allowed"
             >
               APPLY_CHANGES
             </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

const ValidationLab = ({ messageSchema, fds, protoSource, setProtoSource }: {
  messageSchema: DescMessage | null,
  fds: Uint8Array | null,
  protoSource: string,
  setProtoSource: (s: string) => void
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeExample, setActiveExample] = useState<keyof typeof VALIDATION_EXAMPLES>('VALID');
  const [jsonInput, setJsonInput] = useState(JSON.stringify(VALIDATION_EXAMPLES.VALID, null, 2));

  const handleExampleChange = (key: keyof typeof VALIDATION_EXAMPLES) => {
    setActiveExample(key);
    setJsonInput(JSON.stringify(VALIDATION_EXAMPLES[key], null, 2));
  };

  const validator = useMemo(() => createValidator(), []);

  const validationResults = useMemo(() => {
    if (!messageSchema) return { results: null, error: "NO_SCHEMA" };
    try {
      const obj = JSON.parse(jsonInput);
      const user = fromJson(messageSchema, obj, { ignoreUnknownFields: true });
      const results = validator.validate(messageSchema, user);
      return { results, error: null };
    } catch (e: unknown) {
      const error = e instanceof Error ? e.message : String(e);
      return { results: null, error };
    }
  }, [jsonInput, validator, messageSchema]);

  return (
    <Section id="validation" className="py-24 px-4 sm:px-8 bg-slate-900/10 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={ShieldCheck} subtitle="04_PROTOVALIDATE">Data Validation</SectionTitle>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-xl font-cyber font-bold text-white uppercase">The Source of Truth</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Protobuf goes beyond simple types. With <ExternalLinkText href="https://protovalidate.com/"><strong>protovalidate</strong></ExternalLinkText>, you can embed complex business rules directly into your schema using <ExternalLinkText href="https://cel.dev/"><strong>CEL</strong></ExternalLinkText>.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Define constraints like <code>min_len</code>, <code>email</code>, or custom rules to ensure your data adheres to the contract across all services.
            </p>
            
            <CyberPanel 
              title="SCHEMA_EDITOR (.proto)" 
              headerExtra={
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 text-[10px] font-cyber font-bold text-[#00f3ff] hover:text-[#00f3ff]/80 transition-colors uppercase"
                >
                  <Settings className="w-3 h-3" />
                  OPEN_EDITOR
                </button>
              }
            >
              <div className="h-64 overflow-hidden relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10 backdrop-blur-none group-hover:backdrop-blur-[2px]">
                   <span className="px-4 py-2 bg-[#00f3ff]/10 border border-[#00f3ff] text-[#00f3ff] font-cyber text-xs shadow-[0_0_20px_rgba(0,243,255,0.2)]">EDIT_SCHEMA</span>
                </div>
                <div className="p-4 opacity-50 grayscale group-hover:opacity-20 transition-all duration-300">
                  <SyntaxHighlighter language="proto" code={protoSource} wrap />
                </div>
              </div>
            </CyberPanel>

            <SchemaEditorModal
              key={isModalOpen ? `open-${protoSource}` : 'closed'}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              value={protoSource}
              onApply={setProtoSource}
            />

          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-cyber font-bold text-white uppercase">Interactive Playground</h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(VALIDATION_EXAMPLES) as Array<keyof typeof VALIDATION_EXAMPLES>).map((key) => (
                    <button key={key} onClick={() => handleExampleChange(key)} className={`px-3 py-1 text-xs font-mono border transition-all ${activeExample === key ? 'bg-[#00f3ff]/10 border-[#00f3ff] text-[#00f3ff]' : 'border-white/10 text-slate-500 hover:border-white/30'}`}>{key}</button>
                  ))}
                </div>
                <button
                  onClick={async () => {
                    if (!messageSchema || !fds) return;
                    try {
                      const fakeJson = await generateFake(messageSchema.typeName, fds);
                      setJsonInput(fakeJson);
                      setActiveExample('VALID');
                    } catch (e) {
                      console.error("Failed to generate faux data:", e);
                    }
                  }}
                  disabled={!messageSchema || !fds}
                  className="px-3 py-1 text-xs font-mono border border-[#ff00ff]/30 text-[#ff00ff]/70 hover:border-[#ff00ff] hover:text-[#ff00ff] transition-all flex items-center gap-1 disabled:opacity-30"
                >
                  <Zap className="w-3 h-3" />
                  GENERATE_DATA
                </button>
              </div>
              <CyberPanel title="TEST_DATA (JSON)">
                <JsonEditor value={jsonInput} onChange={setJsonInput} className="h-64" />
              </CyberPanel>
            </div>

            <CyberPanel title="VALIDATION_OUTPUT">
              <div className="h-48 overflow-y-auto space-y-4 pr-2 p-2">
                {validationResults.error ? (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">SCHEMA_MISMATCH: {validationResults.error}</div>
                ) : (validationResults.results?.violations?.length ?? 0) === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-[#00ff9f]">
                    <CheckCircle2 className="w-12 h-12" />
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-sm uppercase tracking-widest">Validation Passed</span>
                      <span className="text-[10px] text-slate-500 mt-1 uppercase">Contract terms satisfied</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {validationResults.results?.violations?.map((v: Violation, i: number) => (
                      <div key={i} className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded flex gap-3">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-mono text-yellow-500 uppercase">{v.field.toString()}</span>
                          <p className="text-sm text-slate-300">{v.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CyberPanel>
          </div>
        </div>

        {/* Row 4: Pro Tip & External Playground */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded text-sm text-slate-400">
            <p><strong>Pro Tip:</strong> By putting validation in the schema, you ensure that every service enforcing the contract (Go, Java, TS) applies the same rules consistently. This is easier to implement in languages with robust CEL support.</p>
          </div>
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded text-sm text-slate-400 flex flex-col justify-center">
            <span className="text-xs font-mono text-cyan-500 uppercase mb-2">Dive Deeper</span>
            <ExternalLinkText href="https://protovalidate.com/playground/">Official protovalidate Playground</ExternalLinkText>
          </div>
        </div>
      </div>
    </Section>
  );
};

const EcosystemNextSteps = () => (
  <Section id="ecosystem" className="py-24 px-4 sm:px-8 bg-slate-900/30 border-t border-white/5">
    <div className="max-w-7xl mx-auto">
      <SectionTitle icon={Combine} subtitle="10_NEXT_STEPS">Ecosystem & Next Steps</SectionTitle>
      
      <div className="mb-12 text-slate-400 max-w-3xl leading-relaxed">
        <p>
          Protobuf itself is just a serialization format. Its true power comes from the vast ecosystem of tools built around it. Once you have a strong schema, these tools allow you to generate clients, manage APIs, and enforce quality at scale.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Schema Management */}
        <CyberPanel title="SCHEMA_MANAGEMENT" className="border-[#ff00ff]/30 shadow-[0_0_15px_rgba(255,0,255,0.05)] hover:border-[#ff00ff]/60 transition-colors">
          <div className="p-4 space-y-4">
            <h4 className="font-cyber font-bold text-white">Buf & BSR</h4>
            <p className="text-sm text-slate-400">
              The <ExternalLinkText href="https://buf.build/">Buf CLI</ExternalLinkText> revolutionized Protobuf development. It replaces complex `protoc` bash scripts with a simple `buf.yaml` configuration.
            </p>
            <p className="text-sm text-slate-400">
              The Buf Schema Registry (BSR) acts like NPM for Protobuf. You can push your schemas there, and it automatically manages dependencies, linting, and breaking change detection across your organization.
            </p>
          </div>
        </CyberPanel>

        {/* RPC Frameworks */}
        <CyberPanel title="RPC_FRAMEWORKS" className="border-[#00f3ff]/30 shadow-[0_0_15px_rgba(0,243,255,0.05)] hover:border-[#00f3ff]/60 transition-colors">
          <div className="p-4 space-y-4">
            <h4 className="font-cyber font-bold text-white">gRPC & ConnectRPC</h4>
            <p className="text-sm text-slate-400">
              <ExternalLinkText href="https://grpc.io/">gRPC</ExternalLinkText> is the standard high-performance RPC framework, but it requires HTTP/2 and complex proxies for web clients.
            </p>
            <p className="text-sm text-slate-400">
              <ExternalLinkText href="https://connectrpc.com/">ConnectRPC</ExternalLinkText> is a modern alternative that provides full gRPC compatibility but also supports standard HTTP/1.1 and JSON, making it incredibly easy to use directly from web browsers without a proxy like Envoy.
            </p>
          </div>
        </CyberPanel>

        {/* Testing Tools */}
        <CyberPanel title="TESTING_&_MOCKING" className="border-[#00ff9f]/30 shadow-[0_0_15px_rgba(0,255,159,0.05)] hover:border-[#00ff9f]/60 transition-colors">
          <div className="p-4 space-y-4">
            <h4 className="font-cyber font-bold text-white">FauxRPC & Validation</h4>
            <p className="text-sm text-slate-400">
              Tools like <ExternalLinkText href="https://fauxrpc.com">FauxRPC</ExternalLinkText> (which powers the "Generate Data" buttons on this site) can read your schemas and Protovalidate rules to instantly spin up mock servers and generate realistic test data.
            </p>
            <p className="text-sm text-slate-400">
              This allows frontend teams to build against the schema long before the backend API is actually implemented.
            </p>
          </div>
        </CyberPanel>

      </div>
    </div>
  </Section>
);

const AboutProject = () => (
  <Section id="about" className="py-24 px-4 sm:px-8 bg-slate-900/40 border-t border-white/10">
    <div className="max-w-7xl mx-auto">
      <SectionTitle icon={HelpCircle} subtitle="00_METADATA">How this was built</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[#00f3ff]">
             <Package className="w-5 h-5" />
             <h4 className="font-cyber font-bold text-sm tracking-widest uppercase">WASM + Go</h4>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            The heart of this explainer is a custom <ExternalLinkText href="https://webassembly.org/">WebAssembly</ExternalLinkText> module written in <ExternalLinkText href="https://go.dev/">Go</ExternalLinkText>. This allows us to leverage the official Google Protobuf libraries for parsing, formatting, and descriptor generation directly in your browser.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[#ff00ff]">
             <Zap className="w-5 h-5" />
             <h4 className="font-cyber font-bold text-sm tracking-widest uppercase">FauxRPC</h4>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            We use <ExternalLinkText href="https://fauxrpc.com">FauxRPC</ExternalLinkText> internally to generate context-aware fake data based on your custom schemas. It analyzes your field names and types to provide realistic samples that satisfy your Protovalidate constraints.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[#00ff9f]">
             <Braces className="w-5 h-5" />
             <h4 className="font-cyber font-bold text-sm tracking-widest uppercase">React + Tailwind</h4>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            The frontend is a modern React application utilizing Tailwind CSS for its "Cyberpunk" aesthetic. It's designed to be a lightweight, interactive companion for anyone learning about high-performance data serialization.
          </p>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
           <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Built by</div>
           <ExternalLinkText href="https://kmcd.dev">KMCD.DEV</ExternalLinkText>
        </div>
        <div className="flex items-center gap-6">
           <ExternalLinkText href="https://github.com/sudorandom/protobuf-explainer">View on GitHub</ExternalLinkText>
        </div>
      </div>
    </div>
  </Section>
);

const References = () => (
  <Section id="references" className="py-24 px-4 sm:px-8 bg-black border-t border-white/5">
    <div className="max-w-7xl mx-auto text-slate-400">
      <SectionTitle icon={BookOpen} subtitle="08_BIBLIOGRAPHY">References & Specs</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h4 className="text-[#00f3ff] font-cyber text-sm tracking-widest uppercase">Core Specifications</h4>
          <ul className="space-y-2 text-sm">
            <li><ExternalLinkText href="https://protobuf.dev/programming-guides/encoding/">Protobuf Encoding Specification</ExternalLinkText></li>
            <li><ExternalLinkText href="https://protobuf.dev/programming-guides/proto3/">Proto3 Language Guide</ExternalLinkText></li>
            <li><ExternalLinkText href="https://protobuf.dev/programming-guides/proto3/#json">ProtoJSON Mapping Standard</ExternalLinkText></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-[#ff00ff] font-cyber text-sm tracking-widest uppercase uppercase">Tooling & Ecosystem</h4>
          <ul className="space-y-2 text-sm">
            <li><ExternalLinkText href="https://buf.build/">Buf Schema Registry (BSR)</ExternalLinkText></li>
            <li><ExternalLinkText href="https://github.com/bufbuild/protovalidate">Protovalidate GitHub</ExternalLinkText></li>
            <li><ExternalLinkText href="https://connectrpc.com/">Connect Protocol</ExternalLinkText></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-[#00ff9f] font-cyber text-sm tracking-widest uppercase uppercase tracking-widest">Standards & Protocols</h4>
          <ul className="space-y-2 text-sm">
            <li><ExternalLinkText href="https://grpc.io/">gRPC Remote Procedure Calls</ExternalLinkText></li>
            <li><ExternalLinkText href="https://en.wikipedia.org/wiki/IEEE_754">IEEE 754 Floating Point</ExternalLinkText></li>
            <li><ExternalLinkText href="https://en.wikipedia.org/wiki/UTF-8">UTF-8 Character Encoding</ExternalLinkText></li>
          </ul>
        </div>
      </div>
    </div>
  </Section>
);

const INITIAL_PROTO = `syntax = "proto3";\n\npackage demo.v1;\n\nimport "buf/validate/validate.proto";\n\nmessage User {\n  string id = 1 [(buf.validate.field).string.uuid = true];\n  string name = 2 [(buf.validate.field).string.min_len = 1];\n  string email = 3 [(buf.validate.field).string.email = true];\n  \n  // Numeric data for efficiency demo\n  uint32 age = 4 [(buf.validate.field).uint32.lt = 150];\n  float height_cm = 5 [(buf.validate.field).float = {gte: 0, lte: 500}];\n  double weight_kg = 6 [(buf.validate.field).double = {gte: 0, lte: 2000}];\n  \n  Role role = 7;\n  Date birth_date = 8;\n  User manager = 9;\n\n  enum Role {\n    ROLE_UNSPECIFIED = 0;\n    ROLE_USER = 1;\n    ROLE_ADMIN = 2;\n  }\n}\n\nmessage Date {\n  int32 year = 1 [(buf.validate.field).int32 = {gte: 1900, lte: 2100}];\n  int32 month = 2 [(buf.validate.field).int32 = {gte: 1, lte: 12}];\n  int32 day = 3 [(buf.validate.field).int32 = {gte: 1, lte: 31}];\n}`;

const NAV_ITEMS = [
  { id: 'hero', label: 'HOME' },
  { id: 'intro', label: 'INTRO' },
  { id: 'basics', label: 'BASICS' },
  { id: 'deepdive', label: 'DEEP DIVE' },
  { id: 'advanced', label: 'ADVANCED' },
  { id: 'reflection', label: 'REFLECTION' },
  { id: 'compile', label: 'COMPILE' },
  { id: 'schema', label: 'SCHEMA' },
  { id: 'types', label: 'TYPES' },
  { id: 'efficiency', label: 'EFFICIENCY' },
  { id: 'binary', label: 'BINARY' },
  { id: 'validation', label: 'VALIDATION' },
  { id: 'alternatives', label: 'ALTERNATIVES' },
  { id: 'ecosystem', label: 'ECOSYSTEM' },
  { id: 'about', label: 'ABOUT' },
  { id: 'references', label: 'REFERENCES' }
];

const SECTION_LABELS: Record<string, string> = {
  hero: 'Welcome',
  intro: 'Introduction',
  basics: 'Protobuf Basics',
  deepdive: 'Schema Engineering',
  advanced: 'Advanced Protobuf',
  reflection: 'Descriptors & Reflection',
  compile: 'Compilation',
  schema: 'Schema-Driven APIs',
  types: 'The Type System',
  efficiency: 'Efficiency',
  insights: 'Size vs. Compression',
  binary: 'Binary Format',
  validation: 'Data Validation',
  alternatives: 'Alternatives',
  ecosystem: 'Ecosystem',
  about: 'About',
  references: 'References'
};

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [protoSource, setProtoSource] = useState(INITIAL_PROTO);
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [fds, setFds] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-80px 0px -80% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
          // Update URL without adding to history
          const hash = entry.target.id === 'hero' ? ' ' : `#${entry.target.id}`;
          window.history.replaceState(null, '', window.location.pathname + hash);
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const result = await createDynamicRegistry(protoSource);
        if (active) {
          if (result.kind === "success") {
            setRegistry(result.registry);
            setFds(result.fileDescriptorSet);
            setError(null);
          } else {
            setRegistry(null);
            setFds(null);
            setError(null);
          }
        }
      } catch (e: unknown) {
        if (active) {
          const message = e instanceof Error ? e.message : String(e);
          setRegistry(null);
          setFds(null);
          setError(message);
        }
      }
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [protoSource]);

  const messageSchema = useMemo(() => registry?.getMessage("demo.v1.User") || null, [registry]);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300">
      <header className="h-[80px] border-b border-white/10 bg-[#050505]/90 backdrop-blur-md fixed w-full z-[100] px-4 sm:px-8 flex items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00f3ff]/10 rounded border border-[#00f3ff]/30 flex items-center justify-center"><Cpu className="w-6 h-6 text-[#00f3ff]" /></div>
          <div>
            <a href="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-xl font-mono font-bold tracking-tight text-white">
                protobuf<span className="text-[#00f3ff]">.kmcd.dev</span>
              </h1>
            </a>
            <a href={`#${activeSection}`} className="text-xs font-mono text-[#00f3ff] tracking-widest -mt-1 uppercase opacity-70 hover:opacity-100 transition-opacity block max-w-[150px] truncate lg:max-w-none">
              <span className="lg:hidden">{SECTION_LABELS[activeSection] || 'Welcome'}</span>
              <span className="hidden lg:inline">Interactive Explainer</span>
            </a>
          </div>
        </div>
        {error && <div className="ml-8 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-mono animate-pulse uppercase">SCHEMA_ERROR: {error}</div>}
        
        <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center pointer-events-none">
          <div className="text-[10px] font-mono text-[#00f3ff]/50 uppercase tracking-[0.2em] mb-0.5">Section</div>
          <a href={`#${activeSection}`} className="text-xs font-mono font-bold text-white uppercase tracking-widest bg-white/5 px-3 py-1 rounded border border-white/10 backdrop-blur-sm pointer-events-auto hover:bg-white/10 transition-colors">
            {SECTION_LABELS[activeSection] || 'Welcome'}
          </a>
        </div>

        <button 
          onClick={() => setIsMenuOpen(true)}
          className="ml-auto p-2 text-[#00f3ff] hover:bg-[#00f3ff]/10 rounded border border-[#00f3ff]/20 transition-all group"
          aria-label="Open Menu"
        >
          <AlignLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm z-[120] bg-[#0a0a0f] border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="h-[80px] flex items-center justify-between px-4 sm:px-8 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#00f3ff]/10 rounded border border-[#00f3ff]/30 flex items-center justify-center"><Cpu className="w-3.5 h-3.5 text-[#00f3ff]" /></div>
                  <span className="font-cyber font-bold text-[#00f3ff] text-[10px] tracking-[0.2em] uppercase">Navigation</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="flex-1 overflow-y-auto py-6 px-4 sm:px-8 custom-scrollbar">
                <div className="flex flex-col gap-1">
                  {NAV_ITEMS.map((item, i) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-center justify-between py-4 border-b border-white/5 hover:border-[#00f3ff]/30 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-[#00f3ff]/50 mb-1">0{i + 1}</span>
                        <span className="font-cyber font-bold text-base tracking-wider text-slate-300 group-hover:text-[#00f3ff] transition-colors">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/0 group-hover:text-[#00f3ff] transition-all -translate-x-2 group-hover:translate-x-0" />
                    </a>
                  ))}
                </div>
              </nav>
              
              <div className="p-8 border-t border-white/5 bg-black/20">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">Quick Links</div>
                <div className="flex gap-4">
                  <a href="https://kmcd.dev" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded hover:bg-white/10 transition-colors text-slate-400 hover:text-[#00f3ff]" title="KMCD.DEV"><Fingerprint className="w-4 h-4" /></a>
                  <a href="https://github.com/sudorandom/protobuf.kmcd.dev" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded hover:bg-white/10 transition-colors text-slate-400 hover:text-[#ff00ff]" title="GitHub Repository"><Code2 className="w-4 h-4" /></a>
                  <a href="https://protobuf.dev/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded hover:bg-white/10 transition-colors text-slate-400 hover:text-[#00ff9f]" title="Protobuf Docs"><Database className="w-4 h-4" /></a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main>
        <Hero />
        <Introduction
          messageSchema={messageSchema}
          fds={fds}
        />
        <ProtobufBasics />
        <DeepDiveSection />
        <AdvancedProtobuf />
        <DescriptorsAndReflection />
        <CompilationSection />
        <SchemaDrivenAPIs />
        <TypeSystem />
        <SizeComparison 
          messageSchema={messageSchema} 
          fileDescriptorSet={fds} 
        />
        <PayloadSizeInsights />
        <BinaryMatrix 
          messageSchema={messageSchema} 
        />
        <ValidationLab
          messageSchema={messageSchema}
          fds={fds}
          protoSource={protoSource}
          setProtoSource={setProtoSource}
        />
        <AlternativesLandscape />
        <EcosystemNextSteps />
        <AboutProject />
        <References />
      </main>

      <footer className="py-12 border-t border-white/5 px-4 sm:px-8 flex flex-col items-center gap-4">
        <div className="flex gap-8">
          <a href="https://kmcd.dev" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#00f3ff] transition-colors" aria-label="KMCD.DEV">
            <Fingerprint className="w-5 h-5" />
          </a>
          <a href="https://github.com/sudorandom/protobuf.kmcd.dev" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#ff00ff] transition-colors" aria-label="GitHub Repository">
            <Code2 className="w-5 h-5" />
          </a>
          <a href="https://protobuf.dev/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#00ff9f] transition-colors" aria-label="Protobuf Documentation">
            <Database className="w-5 h-5" />
          </a>
        </div>
        <p className="text-xs font-mono text-slate-600 uppercase tracking-[0.2em]">Powered by Protobuf-ES & KMCD.DEV // Dynamic Schema Enabled</p>
      </footer>
    </div>
  );
}

export default App;
