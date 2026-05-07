import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Cpu,
  Database,
  Zap,
  ChevronRight, ChevronLeft,
  Code2,
  Binary,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  ArrowRight,
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
  HelpCircle,
  GitBranch,
  Package
} from 'lucide-react';
import { fromJson, toJsonString, toBinary, type Registry, type DescMessage } from '@bufbuild/protobuf';
import { SchemaModal } from './components/SchemaModal';
import { createValidator, type Violation } from '@bufbuild/protovalidate';
import VarintExplainer from './components/VarintExplainer';
import { decodeBinary } from './utils/decoder';
import { createDynamicRegistry } from './utils/dynamic-registry';
import { generateFake, convertToPrototext, type CompilationError } from './utils/wasm-parser';

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

export const SyntaxHighlighter = ({ code, language, wrap = false }: { code: string, language: 'proto' | 'json', wrap?: boolean }) => {
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

const SectionTitle = ({ children, icon: Icon, subtitle }: { children: React.ReactNode, icon: React.ElementType, subtitle?: string }) => (
  <div className="flex flex-col mb-12">
    <div className="flex items-center gap-4 mb-2">
      <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
        <Icon className="w-6 h-6 text-[#00f3ff]" />
      </div>
      <h2 className="text-3xl font-cyber font-bold tracking-tight text-white uppercase">
        {children}
      </h2>
    </div>
    {subtitle && <p className="text-slate-400 font-mono text-sm uppercase tracking-widest ml-14">{subtitle}</p>}
  </div>
);

const CyberPanel = ({ children, title, className = "", headerExtra }: { children: React.ReactNode, title?: string, className?: string, headerExtra?: React.ReactNode }) => (
  <div className={`cyber-box cyber-panel ${className}`}>
    {title && (
      <div className="flex items-center justify-between mb-4 border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#00f3ff]" />
          <span className="text-xs font-mono text-[#00f3ff] uppercase tracking-tighter">{title}</span>
        </div>
        {headerExtra}
      </div>
    )}
    {children}
  </div>
);

// --- Sections ---

const Hero = () => (
  <section className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
    <div className="scanline" />
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl z-10 text-center"
    >
      <h1 className="text-6xl md:text-8xl font-cyber font-black mb-6 tracking-tighter leading-none">
        PROTOBUF<br />
        <span className="cyber-text-gradient">EXPLAINER</span>
      </h1>

      <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
        Language-neutral, platform-neutral, extensible mechanism for serializing structured data.
        The backbone of modern high-performance systems.
      </p>

      <div className="flex gap-4 justify-center">
        <a href="#matrix" className="px-8 py-3 bg-[#00f3ff]/10 border border-[#00f3ff] text-[#00f3ff] font-cyber font-bold hover:bg-[#00f3ff]/20 transition-all shadow-[0_0_15px_rgba(0,243,255,0.2)]">
          ENTER_THE_MATRIX
        </a>
        <a href="#efficiency" className="px-8 py-3 bg-transparent border border-white/20 text-white font-cyber hover:border-white/40 transition-all">
          RUN_BENCHMARK
        </a>
      </div>
    </motion.div>

    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
      <ChevronRight className="w-6 h-6 rotate-90" />
    </div>
  </section>
);

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
    <section id="basics" className="py-24 px-8 bg-black/40 border-t border-white/5">
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
    </section>
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
            This URL acts as a globally unique identifier. It doesn't necessarily need to resolve to a webpage; instead, it allows the receiver to look up the correct schema (from a registry or compiled code) and safely unpack the payload.
          </p>
        </div>
      ),
      example: 'import "google/protobuf/any.proto";\n\nmessage Event {\n  string event_type = 1;\n  \n  // Can hold ANY protobuf message\n  // (e.g. a User, a Product)\n  google.protobuf.Any payload = 2;\n}'
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
            This is extremely useful for <strong>partial updates (PATCH)</strong>. Instead of sending an entire massive object when only the <code>email</code> changed, a client can send just the new value and a FieldMask containing <code>"email"</code>.
          </p>
          <p>
            It also allows clients to request only specific fields from a server, minimizing data transfer and improving performance.
          </p>
        </div>
      ),
      example: 'import "google/protobuf/field_mask.proto";\n\nmessage UpdateUserRequest {\n  User user = 1;\n  \n  // Tells the server which fields to actually update\n  // e.g. ["email", "display_name"]\n  google.protobuf.FieldMask update_mask = 2;\n}'
    },
    {
      id: 'reservations',
      label: 'Deprecation',
      icon: ShieldCheck,
      title: 'Evolving Safely',
      desc: (
        <div className="space-y-4">
          <p>
            When removing a field, use <code>reserved</code> to block its number and name from being reused. Reusing old numbers causes catastrophic data corruption.
          </p>
          <p>
            Alternatively, if a field is still in use but shouldn't be used for new code, use <code>[deprecated = true]</code> to warn clients without breaking their builds immediately.
          </p>
        </div>
      ),
      example: 'message User {\n  // Block reuse to prevent corruption\n  reserved 2, 15, 9 to 11;\n  reserved "old_name", "obsolete_field";\n\n  string id = 1;\n  \n  // Warn clients but keep it working\n  string legacy_username = 3 [deprecated = true];\n}'
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
    <section id="advanced" className="py-24 px-8 bg-slate-900/10 border-t border-white/5">
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
    </section>
  );
};

const ProtobufDescriptors = () => (
  <section id="descriptors" className="py-24 px-8 bg-slate-900/20 border-t border-white/5">
    <div className="max-w-7xl mx-auto">
      <SectionTitle icon={Code2} subtitle="03_META_SCHEMA">Protobuf Descriptors</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6 text-slate-300">
          <h3 className="text-xl font-cyber font-bold text-white uppercase">Schemas Describing Schemas</h3>
          <p className="text-sm leading-relaxed">
            When you run the Protobuf compiler (`protoc`), it doesn't just generate code. It can also output a binary representation of your schema called a <strong>FileDescriptorSet</strong>.
          </p>
          <p className="text-sm leading-relaxed">
            Fascinatingly, this `FileDescriptorSet` is itself a Protobuf message! Google defines a schema (<code>descriptor.proto</code>) that describes how to represent `.proto` files. This means you can use Protobuf tools to read and analyze Protobuf schemas dynamically at runtime.
          </p>
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded text-sm text-slate-400 space-y-3">
             <p><strong>Why is this useful?</strong></p>
             <ul className="space-y-2">
               <li className="flex gap-2"><div className="w-1 h-1 bg-[#00f3ff] mt-1.5 shrink-0"></div> <strong>Dynamic Decoding:</strong> Tools like this web explorer use descriptors to decode arbitrary binary data without generating static code.</li>
               <li className="flex gap-2"><div className="w-1 h-1 bg-[#00f3ff] mt-1.5 shrink-0"></div> <strong>Reflection:</strong> gRPC servers can use "Server Reflection" to send their descriptors to clients, allowing tools like Postman or grpcurl to work dynamically.</li>
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
  </section>
);

const Introduction = ({ protoSource, error, compilationErrors, messageSchema, fds, openSchemaEditor }: {
  protoSource: string,
  error: string | null,
  compilationErrors: CompilationError[],
  messageSchema: DescMessage | null,
  fds: Uint8Array | null,
  openSchemaEditor: () => void
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
      code: protoSource.split('\n').filter(l => !l.includes('import') && !l.includes('package') && !l.includes('syntax')).join('\n').trim(),
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
      desc: <>A human-friendly <ExternalLinkText href="https://protobuf.dev/reference/protobuf/textformat-spec/">text format</ExternalLinkText> often used in CLI tools and server logs.</>,
      code: protoTextExample || 'id: "550e8400-e29b-41d4-a716..."\nname: "Hiro Protagonist"\nage: 24',
      language: null
    }
  ];

  const current = faces.find(f => f.id === activeFace)!;

  return (
    <section id="intro" className="py-24 px-8 max-w-7xl mx-auto">
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

      <div className="space-y-6 mb-16">
        <div className="flex justify-center mb-16">
        <button
          onClick={openSchemaEditor}
          className="px-8 py-3 bg-[#00ff9f]/10 border border-[#00ff9f] text-[#00ff9f] font-cyber font-bold hover:bg-[#00ff9f]/20 transition-all shadow-[0_0_15px_rgba(0,255,159,0.2)] flex items-center gap-2"
        >
          <FileCode className="w-5 h-5" />
          CUSTOMIZE_SCHEMA
        </button>
      </div>
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-mono animate-pulse uppercase">
            SCHEMA_ERROR: {error}
          </div>
        )}
        {compilationErrors.length > 0 && (
          <div className="space-y-2">
            {compilationErrors.map((err, i) => (
              <div key={i} className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-mono">
                [LINE {err.line}] {err.message}
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-500 italic text-center">
          "The schema is the source of truth. Edit it above to see the changes reflected live below."
        </p>
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
    </section>
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

const SizeComparison = ({ messageSchema, fileDescriptorSet, openSchemaEditor }: { messageSchema: DescMessage | null, fileDescriptorSet: Uint8Array | null, openSchemaEditor: () => void }) => {
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
    <section id="efficiency" className="py-24 px-8 bg-slate-900/30 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Zap} subtitle="02_PERFORMANCE_METRICS">Efficiency</SectionTitle>

        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-300 leading-relaxed">
          <div className="space-y-4">
            <p>
              The message size savings you can expect from Protobuf highly depend on your data. Large strings will always take space, but numeric data and sparse messages (many optional fields) see massive reductions compared to JSON.
            </p>
            <p>
              Try a few different scenarios below: use the preset examples, <span className="text-[#ff00ff]">generate fake data</span> (powered by <ExternalLinkText href="https://fauxrpc.com"><strong>FauxRPC</strong></ExternalLinkText>), or fill in your own. This demo is live-powered by the schema editor at the top, so feel free to add more fields to see how it scales.
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

        <div className="flex justify-center mb-12">
          <button
            onClick={openSchemaEditor}
            className="px-6 py-2 bg-white/5 border border-white/10 text-slate-300 font-mono text-sm hover:bg-white/10 hover:text-white transition-all rounded flex items-center gap-2"
          >
            <FileCode className="w-4 h-4" />
            CUSTOMIZE_SCHEMA
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2">
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

        <div className="mt-12 p-6 bg-[#00f3ff]/5 border border-[#00f3ff]/20 rounded-lg text-slate-300 leading-relaxed text-sm">
          <p>
            The reduction in payload size ranges from 30-50% for raw payloads. The difference in GZIP compressed payloads is less dramatic at 15-30% but that is also a tradeoff, since compression will add CPU time to requests. It's definitely worth it for larger payloads, but for small ones, maybe it's okay to send the data uncompressed.
          </p>
        </div>

      </div>
    </section>
  );
};

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
    <section id="types" className="py-24 px-8 bg-slate-900/5 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Combine} subtitle="05_TYPE_REFERENCE">The Type System</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {groups.map(g => (
            <TypeGroup key={g.name} groupName={g.name} groupIcon={g.icon} types={g.types} />
          ))}
        </div>
      </div>
    </section>
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
      why: "Deprecated in proto2. Groups were an early attempt at nested messages but were replaced by embedded messages.",
      types: ["group"]
    },
    {
      id: 4,
      name: "EGROUP (End Group)",
      what: "End of a group (deprecated).",
      why: "Deprecated in proto2. Used to signal the end of a group.",
      types: ["group"]
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
      </div>

      <div className="space-y-6">
        {wireTypes.map((wt) => {
          const isDeprecated = wt.id === 3 || wt.id === 4;
          return (
            <div key={wt.id} className={`relative group ${isDeprecated ? 'opacity-50 grayscale hover:grayscale-0 transition-all duration-500' : ''}`}>
              {!isDeprecated && <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ff00ff]/20 to-[#00f3ff]/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />}
              <div className={`relative flex flex-col md:flex-row bg-[#0a0a0a] border ${isDeprecated ? 'border-white/5' : 'border-white/10'} rounded-xl overflow-hidden`}>
                <div className="w-full md:w-32 bg-white/5 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/10 py-6 md:py-0">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-tighter">Wire ID</span>
                    <span className={`text-5xl font-cyber font-black ${isDeprecated ? 'text-slate-500' : 'text-[#ff00ff]'}`}>{wt.id}</span>
                  </div>
                </div>

                <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-4">
                    <div>
                      <h4 className={`text-xl font-cyber font-bold uppercase mb-1 flex items-center gap-2 ${isDeprecated ? 'text-slate-400' : 'text-[#00f3ff]'}`}>
                        {wt.name}
                        {isDeprecated && <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded tracking-widest">DEPRECATED</span>}
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

                  <div className="lg:col-span-4 flex flex-col justify-center gap-4 bg-white/5 p-6 rounded-lg border border-white/5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Mapped Schema Types</span>
                    <div className="flex flex-wrap gap-2">
                      {wt.types.map((t) => (
                        <span key={t} className={`px-2 py-1 bg-black/60 border rounded text-[11px] font-mono ${isDeprecated ? 'border-slate-500/20 text-slate-500' : 'border-[#00f3ff]/20 text-[#00f3ff]'}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


const SchemaDrivenAPIs = () => (
  <section id="schema" className="py-24 px-8 bg-slate-900/20 border-t border-white/5">
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
  </section>
);

const AlternativesLandscape = () => (
  <section id="alternatives" className="py-24 px-8 bg-slate-900/10 border-t border-white/5">
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
  </section>
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
  const displayedByteIndex = safeSelectedByte;

  const currentSegment = displayedByteIndex !== null ? stats.segments[displayedByteIndex] : null;
  const groupedDataBytes = useMemo(() => {
    if (!currentSegment || currentSegment.type !== 'data') return null;
    return stats.segments.filter(s => s.fieldId === currentSegment.fieldId && s.type === 'data');
  }, [currentSegment, stats.segments]);

  return (
    <section id="matrix" className="py-24 px-8 bg-slate-900/5 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Binary} subtitle="03_WIRE_FORMAT">Digging into the binary</SectionTitle>

        <WireFormatBreakdown />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
          <div className="lg:col-span-4 space-y-6 leading-relaxed text-slate-300">
            <h3 className="text-2xl font-cyber font-bold text-white uppercase">Decoding the Stream</h3>
            <div className="flex gap-2 mb-4">
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
            <CyberPanel title="DYNAMIC_BINARY_HEX_STREAM">
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
                        ${selectedByte === i ? 'bg-[#00f3ff]/20 border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.4)] scale-110 z-10' : ''}
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
                    <motion.div key={displayedByteIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Byte Analysis {selectedByte === displayedByteIndex && <span className="text-[#00f3ff] ml-2">[LOCKED]</span>}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setSelectedByte(selectedByte !== null && selectedByte > 0 ? selectedByte - 1 : null)}
                                disabled={selectedByte === null || selectedByte <= 0}
                                className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronLeft className="w-4 h-4 text-white" />
                              </button>
                              <button
                                onClick={() => setSelectedByte(selectedByte !== null && selectedByte < stats.segments.length - 1 ? selectedByte + 1 : null)}
                                disabled={selectedByte === null || selectedByte >= stats.segments.length - 1}
                                className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronRight className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </div>
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
                          <p className="text-xs text-slate-500 italic">
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
                    <div className="flex flex-col items-center justify-center h-40 border border-dashed border-white/10 rounded gap-2 text-slate-600 font-mono text-sm italic text-center">Hover over hex bytes to analyze live...<br />Click to lock focus on a specific byte.</div>
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
    </section>
  );
};

const CompilationSection = () => (
  <section id="compile" className="py-24 px-8 bg-slate-900/10 border-t border-white/5">
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
  </section>
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

const ValidationLab = ({ messageSchema, fds, openSchemaEditor }: {
  messageSchema: DescMessage | null,
  fds: Uint8Array | null,
  openSchemaEditor: () => void
}) => {
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
    <section id="validation" className="py-24 px-8 bg-slate-900/10 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={ShieldCheck} subtitle="04_PROTOVALIDATE">Data Validation</SectionTitle>

        {/* Row 1: Schema Constraints Explanation */}
        <div className="mb-12 space-y-4">
          <h3 className="text-xl font-cyber font-bold text-white uppercase">Schema Constraints</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-400 leading-relaxed">
            <p>
              Protobuf goes beyond simple types. With <ExternalLinkText href="https://protovalidate.com/"><strong>protovalidate</strong></ExternalLinkText>, you can embed complex business rules directly into your <span className="text-[#00f3ff]">.proto</span> files.
            </p>
            <p>
              Validation rules are defined using <ExternalLinkText href="https://cel.dev/"><strong>CEL (Common Expression Language)</strong></ExternalLinkText> expressions. This allows you to create your own custom, high-performance validation logic that runs natively in your generated code.
            </p>
          </div>
        </div>

        {/* Row 2: Schema Rules (Full Width) */}
        <div className="flex justify-center mb-12">
          <button
            onClick={openSchemaEditor}
            className="px-6 py-2 bg-white/5 border border-white/10 text-slate-300 font-mono text-sm hover:bg-white/10 hover:text-white transition-all rounded flex items-center gap-2"
          >
            <FileCode className="w-4 h-4" />
            CUSTOMIZE_SCHEMA_RULES
          </button>
        </div>

        {/* Row 3: Test Data (Full Width) */}
        <div className="space-y-4 mb-8">
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
              GENERATE_FAUX_DATA
            </button>
          </div>
          <CyberPanel title="TEST_DATA">
            <JsonEditor value={jsonInput} onChange={setJsonInput} className="h-64" />
          </CyberPanel>
        </div>

        {/* Row 3: Validation Output */}
        <div className="space-y-4 mb-8">
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
    </section>
  );
};

const References = () => (
  <section className="py-24 px-8 bg-black border-t border-white/5">
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
  </section>
);

const INITIAL_PROTO = `syntax = "proto3";\n\npackage demo.v1;\n\nimport "buf/validate/validate.proto";\n\nmessage User {\n  string id = 1 [(buf.validate.field).string.uuid = true];\n  string name = 2 [(buf.validate.field).string.min_len = 1];\n  string email = 3 [(buf.validate.field).string.email = true];\n  \n  // Numeric data for efficiency demo\n  uint32 age = 4 [(buf.validate.field).uint32.lt = 150];\n  float height_cm = 5 [(buf.validate.field).float = {gte: 0, lte: 500}];\n  double weight_kg = 6 [(buf.validate.field).double = {gte: 0, lte: 2000}];\n  \n  Role role = 7;\n  Date birth_date = 8;\n  User manager = 9;\n\n  enum Role {\n    ROLE_UNSPECIFIED = 0;\n    ROLE_USER = 1;\n    ROLE_ADMIN = 2;\n  }\n}\n\nmessage Date {\n  int32 year = 1 [(buf.validate.field).int32 = {gte: 1900, lte: 2100}];\n  int32 month = 2 [(buf.validate.field).int32 = {gte: 1, lte: 12}];\n  int32 day = 3 [(buf.validate.field).int32 = {gte: 1, lte: 31}];\n}`;

function App() {
  const [protoSource, setProtoSource] = useState(INITIAL_PROTO);
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [fds, setFds] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compilationErrors, setCompilationErrors] = useState<CompilationError[]>([]);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

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
            setCompilationErrors([]);
          } else {
            setRegistry(null);
            setFds(null);
            setError(null);
            setCompilationErrors(result.errors);
          }
        }
      } catch (e: unknown) {
        if (active) {
          const message = e instanceof Error ? e.message : String(e);
          setRegistry(null);
          setFds(null);
          setError(message);
          setCompilationErrors([]);
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
      <header className="h-[80px] border-b border-white/10 bg-[#050505]/90 backdrop-blur-md fixed w-full z-[100] px-8 flex items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00f3ff]/10 rounded border border-[#00f3ff]/30 flex items-center justify-center"><Cpu className="w-6 h-6 text-[#00f3ff]" /></div>
          <div>
            <h1 className="text-xl font-cyber font-bold tracking-tighter text-white uppercase tracking-tighter uppercase text-[#00f3ff]">Protobuf Explainer</h1>
            <div className="text-xs font-mono text-[#00f3ff] tracking-widest -mt-1 uppercase opacity-70">Interactive Explainer</div>
          </div>
        </div>
        {error && <div className="ml-8 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-mono animate-pulse uppercase">SCHEMA_ERROR: {error}</div>}
        <nav className="ml-auto hidden md:flex gap-8">
          {[{ id: 'intro', label: 'INTRO' }, { id: 'basics', label: 'BASICS' }, { id: 'compile', label: 'COMPILE' }, { id: 'schema', label: 'SCHEMA' }, { id: 'types', label: 'TYPES' }, { id: 'efficiency', label: 'EFFICIENCY' }, { id: 'matrix', label: 'BINARY' }, { id: 'validation', label: 'VALIDATION' }, { id: 'alternatives', label: 'ALTERNATIVES' }].map((item) => (
            <a key={item.id} href={`#${item.id}`} className="text-xs font-cyber font-bold tracking-[0.2em] text-slate-400 hover:text-[#00f3ff] transition-colors relative group uppercase">{item.label}<span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#00f3ff] transition-all group-hover:w-full"></span></a>
          ))}
        </nav>
      </header>
      <main>
        <Hero />
        <Introduction
          openSchemaEditor={() => setIsSchemaModalOpen(true)}
          protoSource={protoSource}
          error={error}
          compilationErrors={compilationErrors}
          messageSchema={messageSchema}
          fds={fds}
        />
        <ProtobufBasics />
        <AdvancedProtobuf />
        <ProtobufDescriptors />
        <CompilationSection />
        <SchemaDrivenAPIs />
        <TypeSystem />
        <SizeComparison messageSchema={messageSchema} fileDescriptorSet={fds} openSchemaEditor={() => setIsSchemaModalOpen(true)} />
        <BinaryMatrix messageSchema={messageSchema} />
        <ValidationLab
          openSchemaEditor={() => setIsSchemaModalOpen(true)}
          messageSchema={messageSchema}
          fds={fds}
        />
        <AlternativesLandscape />
        <section className="py-24 px-8 bg-slate-900/10 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <SectionTitle icon={Code2} subtitle="BEHIND_THE_SCENES">How This Website Was Created</SectionTitle>
            <div className="p-6 bg-white/5 border border-white/10 rounded-lg text-slate-300 leading-relaxed text-sm max-w-3xl">
              <p>
                It uses WASM + Go to leverage Go libraries for protobuf parsing and formatting. It uses FauxRPC in the same way to generate fake data.
              </p>
            </div>
          </div>
        </section>
        <References />
      </main>

      <SchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
        protoSource={protoSource}
        setProtoSource={setProtoSource}
        errors={compilationErrors}
      />

      <footer className="py-12 border-t border-white/5 px-8 flex flex-col items-center gap-4">
        <div className="flex gap-8">
          <a href="https://github.com/protocolbuffers/protobuf" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#00f3ff] transition-colors" aria-label="Protobuf GitHub">
            <Code2 className="w-5 h-5" />
          </a>
          <a href="https://buf.build/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#ff00ff] transition-colors" aria-label="Buf Build">
            <Terminal className="w-5 h-5" />
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
