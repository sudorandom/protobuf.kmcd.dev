import React, { useState } from 'react';
import {
  Box,
  Type,
  Hash,
  List,
  Combine,
  Layers,
  Braces,
  GitBranch,
  HelpCircle,
  BookOpen,
  FileCode,
  ArrowRight
} from 'lucide-react';
import {
  Section,
  SectionTitle,
  CyberPanel,
  ExternalLinkText,
  SyntaxHighlighter
} from '../components/shared/Common';

export const ProtobufBasics = () => {
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
            Messages are the primary logical structure in Protobuf. They act as containers for your data, analogous to a <code>struct</code> in C/Rust, a <code>class</code> in Java/TypeScript, or a <code>dict</code> in Python.
          </p>
          <p>
            Think of a message as a <strong>strictly-enforced contract</strong>. Once defined in a schema, the Protobuf compiler ensures that every system interacting with this data, regardless of the programming language, agrees on its structure.
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
          <p>
            While names are used in your code for readability, they are <strong>mostly ignored on the wire</strong>. This allows you to rename fields in your schema without breaking binary compatibility (though it may break JSON consumers).
          </p>
        </div>
      ),
      example: 'message User {\n  string username = 1;\n  bool is_active = 2;\n  uint32 login_count = 3;\n}'
    },
    {
      id: 'numbers',
      label: 'Field Numbers',
      icon: Hash,
      title: 'The Wire Identity',
      desc: (
        <div className="space-y-4">
          <p>
            Field numbers are the most critical part of a Protobuf message. Instead of sending long string names (like <code>"username"</code>) over the wire, Protobuf only sends this integer ID.
          </p>
          <p>
            This <strong>"Tag"</strong> is what makes Protobuf so compact. Because these numbers identify fields, they <strong>must never be changed</strong> once a message type is in use. Reusing a number for a different field will cause catastrophic data corruption.
          </p>
          <div className="p-3 bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/20 rounded text-xs space-y-2">
            <p><strong>Optimization Tip:</strong> Numbers 1 through 15 take <strong>1 byte</strong> to encode (including the field number and wire type). Numbers 16 through 2047 take 2 bytes. Use 1-15 for your most frequently sent fields!</p>
          </div>
        </div>
      ),
      example: 'message User {\n  // "1" is the ID on the wire\n  string id = 1;\n  \n  // Small numbers (1-15) take 1 byte to encode\n  string name = 2;\n}'
    },
    {
      id: 'enums',
      label: 'Enums',
      icon: List,
      title: 'The Choices',
      desc: (
        <div className="space-y-4">
          <p>
            Enums allow you to define a restricted set of named constants. This is crucial for states, roles, or configurations.
          </p>
          <p>
            In proto3, the first constant <strong>must always map to zero</strong>. This serves as the default value when the field is not explicitly set in the binary payload.
          </p>
          <p>
            <strong>Open Enums:</strong> Modern Protobuf implementations support "open" enums, meaning if a server sends a value that a client doesn't recognize (e.g., a new state added later), the client will still preserve that value instead of crashing or defaulting to zero.
          </p>
        </div>
      ),
      example: 'enum Corpus {\n  CORPUS_UNSPECIFIED = 0;\n  CORPUS_UNIVERSAL = 1;\n  CORPUS_WEB = 2;\n  CORPUS_IMAGES = 3;\n}\n\nmessage SearchRequest {\n  Corpus corpus = 4;\n}'
    },
    {
      id: 'nested',
      label: 'Embedded',
      icon: Combine,
      title: 'Composition',
      desc: (
        <div className="space-y-4">
          <p>
            Protobuf supports complex, hierarchical data structures. You can define messages within other messages, or use previously defined messages as field types.
          </p>
          <p>
            This <strong>Composition</strong> allows you to build highly reusable domains of data models. For example, a <code>Location</code> message can be used across <code>User</code>, <code>Event</code>, and <code>Office</code> messages.
          </p>
          <p>
            On the wire, embedded messages are "length-delimited", allowing decoders to skip the entire sub-message if they don't have the schema for it.
          </p>
        </div>
      ),
      example: 'message Result {\n  string url = 1;\n  string title = 2;\n}\n\nmessage SearchResponse {\n  // Result is embedded here\n  Result top_result = 1;\n}'
    },
    {
      id: 'repeated',
      label: 'Repeated',
      icon: Layers,
      title: 'Collections',
      desc: (
        <div className="space-y-4">
          <p>
            To represent an array or list of items, use the <code>repeated</code> keyword. These fields can contain zero or more elements of the specified type.
          </p>
          <p>
            In modern Protobuf, repeated scalar numeric fields (like <code>int32</code>, <code>float</code>, etc.) are <strong>"packed"</strong> by default. Instead of repeating the field tag for every element, they are stored as one single block with a length prefix. This is significantly more efficient for large arrays.
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
          <p className="text-xs text-[var(--text-dim)] italic">
            Behind the scenes, maps are actually just <code>repeated</code> messages with <code>key</code> and <code>value</code> fields, ensuring backward compatibility with older decoders.
          </p>
        </div>
      ),
      example: 'message Project {\n  string name = 1;\n  \n  // A dictionary of string keys to string values\n  map<string, string> labels = 2;\n}'
    },
    {
      id: 'oneof',
      label: 'Oneof',
      icon: GitBranch,
      title: 'Mutual Exclusion',
      desc: (
        <div className="space-y-4">
          <p>
            If you have a message with multiple fields where <strong>only one can be set at a time</strong>, you can enforce this behavior and save memory using the <code>oneof</code> keyword.
          </p>
          <p>
            Setting any field within the <code>oneof</code> automatically clears all other fields in that same <code>oneof</code>. This is Protobuf's equivalent to a <strong>tagged union</strong> or <code>variant</code>.
          </p>
          <p>
            This is perfect for polymorphism, such as an <code>Event</code> that could be a <code>ClickEvent</code>, <code>HoverEvent</code>, or <code>ScrollEvent</code>.
          </p>
        </div>
      ),
      example: 'message ErrorStatus {\n  string message = 1;\n  \n  oneof details {\n    string stack_trace = 2;\n    int32 error_code = 3;\n  }\n}'
    },
    {
      id: 'presence',
      label: 'Presence',
      icon: HelpCircle,
      title: 'Zero Values',
      desc: (
        <div className="space-y-4">
          <p>
            In <code>proto3</code>, default scalar values (like <code>0</code>, <code>false</code>, or <code>""</code>) are <strong>not serialized</strong> to save space.
          </p>
          <p className="text-[var(--cyber-neon-pink)] bg-[var(--cyber-neon-pink)]/5 p-3 border border-[var(--cyber-neon-pink)]/20 rounded text-xs italic">
            <strong>The Pitfall:</strong> The receiver cannot distinguish between a field explicitly "set to zero" (e.g., 0 degrees) and one that was never sent.
          </p>
          <p>
            To solve this, use the <code>optional</code> keyword to enable <strong>Explicit Presence</strong> tracking. In the modern <strong>Protobuf Editions</strong> (2023+), you can globally enforce explicit presence, returning to the more predictable behavior of Proto2.
          </p>
        </div>
      ),
      example: 'edition = "2023";\n\nmessage Profile {\n  // Implicit presence (Zero Values)\n  int32 views = 1;\n  \n  // Explicit presence via feature\n  string name = 2 [features.field_presence = EXPLICIT];\n}'
    }
  ];

  const current = tabs.find(t => t.id === activeTab)!;

  return (
    <Section id="basics" className="py-24 px-4 sm:px-8 bg-[var(--section-bg-dark)] border-t border-[var(--border-light)]">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={BookOpen} subtitle="02_BASICS">Protobuf Basics</SectionTitle>

        <div className="flex flex-col lg:flex-row gap-12 min-h-[400px]">
          {/* Left Nav */}
          <div className="w-full lg:w-64 flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all text-left group ${activeTab === tab.id
                  ? 'bg-[var(--cyber-neon-blue)] border-[var(--cyber-neon-blue)] text-black shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                  : 'bg-[var(--overlay-bg)] border-[var(--border-light)] text-[var(--text-dim)] hover:border-white/20 hover:text-[var(--text-color)]'
                  }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-black' : 'text-[var(--text-dim)] group-hover:text-[var(--text-dim)]'}`} />
                <span className="font-cyber font-bold text-sm tracking-widest uppercase">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-cyber font-bold text-[var(--text-color)] uppercase">{current.title}</h3>
                <div className="text-[var(--text-dim)] leading-relaxed text-sm">{current.desc}</div>
              </div>
            </div>
            <CyberPanel title="EXAMPLE_DEFINITION" className="h-full">
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

interface TypeGroupDef {
  name: string;
  icon: React.ElementType;
  types: { name: string, desc: React.ReactNode }[];
  footer?: React.ReactNode;
}

export const TypeSystem = () => {
  const groups: TypeGroupDef[] = [
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
    },
    {
      name: "Well-Known Types",
      icon: Box,
      types: [
        { name: "google.protobuf.Empty", desc: "Used to indicate an API takes no parameters or returns nothing." },
        { name: "google.protobuf.Timestamp", desc: "A point in time, independent of timezone." },
        { name: "google.protobuf.Duration", desc: "A span of time (e.g., 5 seconds, 10 milliseconds)." },
        { name: "google.protobuf.Value", desc: "Represents a dynamically typed value, equivalent to any JSON type." },
        { name: "google.protobuf.Method", desc: "Represents a method of an API interface." },
      ]
    }
  ];

  const TypeGroup = ({ groupName, groupIcon: Icon, types }: { groupName: string, groupIcon: React.ElementType, types: { name: string, desc: React.ReactNode }[] }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[var(--cyber-neon-blue)]">
        <Icon className="w-4 h-4" />
        <h4 className="font-cyber font-bold text-sm tracking-widest uppercase">{groupName}</h4>
      </div>
      <div className="grid gap-3">
        {types.map(t => (
          <div key={t.name as string} className="p-3 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg group hover:border-[var(--cyber-neon-blue)]/30 transition-colors">
            <div className="flex justify-between items-start mb-1">
              <span className="font-mono text-xs font-bold text-[var(--text-color)] group-hover:text-[var(--cyber-neon-blue)]">{t.name}</span>
            </div>
            <div className="text-xs text-[var(--text-dim)] leading-relaxed">{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Section id="types" className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)]/20 border-t border-[var(--border-light)]">
      <div className="max-w-7xl mx-auto space-y-16">
        <div>
          <SectionTitle icon={Combine} subtitle="02b_TYPE_REFERENCE">The Type System</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {groups.map(g => (
              <TypeGroup key={g.name} groupName={g.name} groupIcon={g.icon} types={g.types} />
            ))}
          </div>
        </div>

        <div className="pt-16 border-t border-[var(--border-light)]">
          <div className="grid grid-cols-1 gap-12 text-[var(--text-color)]">
            <div className="space-y-6">
              <h3 className="text-xl font-cyber font-bold text-[var(--text-color)] uppercase">Guidelines for Integers</h3>
              <p>Choosing the right integer type is important for efficiency and compatibility. While Protobuf supports many integer types, keeping things simple is usually best.</p>
              <ul className="list-disc pl-5 space-y-2 text-[var(--text-dim)]">
                <li>Use <code>int32</code> for typical integers where negative numbers might occur.</li>
                <li>Use <code>uint32</code> when you know the value will never be negative.</li>
                <li>Use <code>int64</code> or <code>uint64</code> when values can exceed 2 billion (e.g. timestamps, large IDs). Note that JavaScript will require the use of <code>BigInt</code> objects to represent these precisely.</li>
                <li>Avoid <code>sint32</code> / <code>sint64</code> unless you expect a large number of negative values, as they use ZigZag encoding which is less efficient for mostly positive data.</li>
                <li>Avoid <code>fixed32</code> / <code>fixed64</code> unless you expect mostly large values (&gt; 2^28 for 32-bit), as they don't benefit from varint compression.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-[var(--border-light)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6 text-[var(--text-color)]">
              <h3 className="text-xl font-cyber font-bold text-[var(--text-color)] uppercase">ProtoJSON Mapping</h3>
              <p>
                While Protobuf is primarily binary, it defines a canonical <ExternalLinkText href="https://protobuf.dev/programming-guides/json/">ProtoJSON</ExternalLinkText> mapping. This ensures that every binary payload has a deterministic representation in JSON.
              </p>

              <div className="p-4 bg-[var(--cyber-neon-yellow)]/5 border border-[var(--cyber-neon-yellow)]/20 rounded-lg space-y-4">
                <h4 className="text-[var(--cyber-neon-yellow)] font-cyber font-bold text-sm uppercase tracking-wider">The 64-bit Precision</h4>
                <p className="text-sm leading-relaxed text-[var(--text-color)]/90">
                  JavaScript numbers are 64-bit floats, which lose precision for integers above 2^53 - 1.
                </p>
                <p className="text-sm leading-relaxed font-bold text-[var(--text-color)]">
                  To prevent data loss, <code>int64</code> and <code>uint64</code> types MUST be encoded as strings in JSON.
                </p>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-2">
              <CyberPanel title="JSON_MAPPING_RULES">
                <div className="p-4 space-y-4 text-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-light)] font-mono text-xs text-[var(--text-dim)] uppercase">
                        <th className="py-2 pr-4 min-w-[200px]">Protobuf Type</th>
                        <th className="py-2 pr-4 min-w-[150px]">JSON Type(s)</th>
                        <th className="py-2 pr-4 min-w-[200px]">JSON Value Example</th>
                        <th className="py-2 min-w-[250px]">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="align-top">
                      {[
                        { pb: "int32, float, double", json: "Number", ex: "123.45", note: "Standard JSON numbers." },
                        { pb: "bool", json: "Boolean", ex: "true", note: "Standard JSON booleans." },
                        { pb: "int64, uint64", json: "String", ex: '"9007199254740993"', note: "Strings prevent precision loss in JS." },
                        { pb: "enum", json: "String", ex: '"ROLE_ADMIN"', note: "Uses the string name of the enum value." },
                        { pb: "bytes", json: "String", ex: '"YWJjMTIz"', note: "Base64 encoded string." },
                        { pb: "google.protobuf.Timestamp", json: "String", ex: '"2023-10-01T12:00:00Z"', note: "RFC 3339 formatted timestamp string." },
                        { pb: "google.protobuf.Duration", json: "String", ex: '"1.000340012s"', note: "Seconds with up to 9 fractional digits." },
                        { pb: "google.protobuf.Empty", json: "Object", ex: "{}", note: "An empty JSON object." },
                        { pb: "google.protobuf.Value", json: "Any", ex: '{"foo": "bar"}', note: "Can be any valid JSON value." },
                        { pb: "google.protobuf.Method", json: "String", ex: '"/demo.v1.UserService/GetUser"', note: "String representation of the method." },
                      ].map(row => (
                        <tr key={row.pb} className="border-b border-[var(--border-light)]/50 last:border-0">
                          <td className="py-3 pr-4"><code className="text-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/5 px-1 py-0.5 rounded break-words">{row.pb}</code></td>
                          <td className="py-3 pr-4 font-mono text-xs text-[var(--cyber-neon-pink)]">{row.json}</td>
                          <td className="py-3 pr-4"><code className="text-[var(--cyber-neon-green)] bg-[var(--cyber-neon-green)]/5 px-1 py-0.5 rounded break-all">{row.ex}</code></td>
                          <td className="py-3 text-[var(--text-dim)] text-xs">{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CyberPanel>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export const SchemaDrivenAPIs = () => (
  <Section id="schema" className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)] border-t border-[var(--border-light)]">
    <div className="max-w-7xl mx-auto">
      <SectionTitle icon={FileCode} subtitle="02a_ARCHITECTURE">Schema-Driven APIs</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="space-y-6 text-[var(--text-color)]">
          <h3 className="text-xl font-cyber font-bold text-[var(--text-color)] uppercase">The Source of Truth</h3>
          <p>
            In the Protobuf world, the <strong>.proto</strong> file is the contract. This encourages <strong>Contract-First</strong> development, where the data model and API surface are defined before any code is written.
          </p>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <div className="w-1.5 h-1.5 bg-[var(--cyber-neon-blue)] mt-2 shrink-0"></div>
              <p><strong>Universal Tooling:</strong> Generate clients and servers for various languages from the same file using <ExternalLinkText href="https://buf.build/docs/bsr/introduction">BSR</ExternalLinkText> or local compilers.</p>
            </li>
            <li className="flex gap-4">
              <div className="w-1.5 h-1.5 bg-[var(--cyber-neon-pink)] mt-2 shrink-0"></div>
              <p><strong>Compatibility:</strong> Robust rules for adding/removing fields without breaking old clients, essential for distributed systems.</p>
            </li>
            <li className="flex gap-4">
              <div className="w-1.5 h-1.5 bg-[var(--cyber-neon-green)] mt-2 shrink-0"></div>
              <p>
                <strong>Native RPC:</strong> Unlike most serialization formats, Protobuf includes native <code>service</code> and <code>rpc</code> definitions. This allows you to define your entire API surface in one place, powering frameworks like <ExternalLinkText href="https://grpc.io/">gRPC</ExternalLinkText>, <ExternalLinkText href="https://connectrpc.com/">ConnectRPC</ExternalLinkText>, and <ExternalLinkText href="https://twitchtv.github.io/twirp/">Twirp</ExternalLinkText>.
              </p>
            </li>
          </ul>
        </div>
        <div className="p-8 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl flex flex-col justify-center">
          <h4 className="text-[var(--cyber-neon-blue)] font-cyber font-bold text-sm tracking-widest uppercase mb-4 text-center">THE_WORKFLOW</h4>
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-[var(--section-bg-dark)] border border-[var(--cyber-neon-blue)]/30 rounded text-[var(--cyber-neon-blue)]/80">1. DEFINE SCHEMA (.proto)</div>
            <div className="flex justify-center"><ArrowRight className="w-4 h-4 rotate-90 text-[var(--text-dim)]" /></div>
            <div className="p-3 bg-[var(--section-bg-dark)] border border-[var(--cyber-neon-pink)]/30 rounded text-[var(--cyber-neon-pink)]/80">2. COMPILE TARGETS (Go, TS, etc.)</div>
            <div className="flex justify-center"><ArrowRight className="w-4 h-4 rotate-90 text-[var(--text-dim)]" /></div>
            <div className="p-3 bg-[var(--section-bg-dark)] border border-[var(--cyber-neon-green)]/30 rounded text-[var(--cyber-neon-green)]/80">3. BUILD & DEPLOY SERVICES</div>          </div>
        </div>
      </div>
    </div>
  </Section>
);

const Basics = () => (
  <>
    <ProtobufBasics />
    <TypeSystem />
    <SchemaDrivenAPIs />
  </>
);

export default Basics;
