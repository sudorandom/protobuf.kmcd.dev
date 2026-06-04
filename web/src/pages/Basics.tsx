import React from "react";
import {
  Box,
  Type,
  Hash,
  List,
  Combine,
  Layers,
  Braces,
  GitBranch,
  FileCode,
} from "lucide-react";
import {
  Section,
  SectionTitle,
  CyberPanel,
  ExternalLinkText,
  SyntaxHighlighter,
  TechnicalNuance,
  RoadmapGrid,
} from "../components/shared/Common";

export const SchemaDrivenAPIs = () => {
  const roadmapItems = [
    {
      id: "generating-code",
      title: "Generating Code",
      desc: "The contract-first workflow using protoc and buf.",
    },
    {
      id: "messages",
      title: "Messages",
      desc: "The primary containers for Protobuf data.",
    },
    {
      id: "fields",
      title: "Fields",
      desc: "Strongly-typed data points with unique identifies.",
    },
    {
      id: "numbers",
      title: "Field Numbers",
      desc: "The critical IDs used for compact binary encoding.",
    },
    {
      id: "enums",
      title: "Enums",
      desc: "Defining a restricted set of named constants.",
    },
    {
      id: "packages",
      title: "Packages",
      desc: "Using namespaces to prevent naming collisions.",
    },
    {
      id: "nested",
      title: "Composition",
      desc: "Building complex models through nesting and imports.",
    },
    {
      id: "repeated",
      title: "Collections",
      desc: "Handling arrays and lists of data efficiently.",
    },
    {
      id: "maps",
      title: "Maps",
      desc: "Using dictionaries for key-value pairs.",
    },
    {
      id: "oneof",
      title: "Oneof",
      desc: "Polymorphic fields for mutually exclusive data.",
    },
    {
      id: "types",
      title: "Type Reference",
      desc: "Reference for all scalar and well-known types.",
    },
  ];

  return (
    <Section
      id="schema"
      className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)] border-t border-[var(--border-light)]"
    >
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={FileCode} subtitle="02a_ARCHITECTURE" asH1={true}>
          Basics
        </SectionTitle>

        <div className="mb-16 max-w-4xl space-y-6 mx-auto text-center">
          <p className="text-lg text-[var(--text-dim)] leading-relaxed">
            Protobuf is built on schemas. Unlike JSON, which is flexible and
            often undefined, Protobuf requires explicit data structures. This
            contract-first approach ensures consistency across your entire
            system.
          </p>
          <div className="pt-8 text-left">
            <RoadmapGrid items={roadmapItems} cols="lg:grid-cols-4" />
          </div>
        </div>

        <section
          id="generating-code"
          className="mt-24 space-y-12 border-t border-[var(--border-light)] pt-16"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight">
              Generating Code
            </h2>
            <p className="text-[var(--text-dim)] max-w-3xl">
              Let's see how to generate TypeScript code from a{" "}
              <code>.proto</code> schema using both the traditional{" "}
              <code>protoc</code> compiler and the modern <code>buf</code>{" "}
              toolchain.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                <CyberPanel title="proto/demo/v1/user.proto">
                  <div className="p-4">
                    <SyntaxHighlighter
                      language="proto"
                      code={`syntax = "proto3";\n\npackage demo.v1;\n\nmessage User {\n  string id = 1;\n  string username = 2;\n  bool is_active = 3;\n}`}
                      wrap={true}
                    />
                  </div>
                </CyberPanel>
              </div>
              <div className="space-y-6">
                <h3 className="text-[var(--cyber-neon-green)] font-cyber font-bold text-sm tracking-widest uppercase">
                  The Schema Definition
                </h3>
                <div className="space-y-4 text-[var(--text-dim)] leading-relaxed">
                  <p>
                    In this <code>user.proto</code> file, we define a{" "}
                    <code>User</code> message with three fields. Each field has
                    a type (<code>string</code>, <code>bool</code>) and a unique{" "}
                    <strong>field number</strong> which identifies it in the
                    binary format.
                  </p>
                  <p>Once you generate code from this schema, you can:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Instantiate:</strong> Create <code>User</code>{" "}
                      objects in your language with full type safety and
                      auto-completion.
                    </li>
                    <li>
                      <strong>Serialize:</strong> Convert objects into highly
                      compressed binary buffers for transmission or storage.
                    </li>
                    <li>
                      <strong>Validate:</strong> Ensure data conforms to the
                      schema rules before it ever reaches your application
                      logic.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h4 className="text-[var(--cyber-neon-blue)] font-cyber font-bold text-sm tracking-widest uppercase">
                Option 1: The Classic protoc
              </h4>
              <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                The <code>protoc</code> compiler is the original tool for
                Protobuf. It requires manual management of plugins and complex
                CLI flags. Using <code>--es_out</code> assumes that there is a
                binary named <code>protoc-gen-es</code> on your system's{" "}
                <code>PATH</code>.
              </p>
              <div className="space-y-4">
                <CyberPanel title="1. INSTALL PLUGIN">
                  <div className="p-4">
                    <SyntaxHighlighter
                      language="bash"
                      code={`$ npm install --save-dev @bufbuild/protoc-gen-es`}
                      wrap={true}
                    />
                  </div>
                </CyberPanel>
                <CyberPanel title="package.json">
                  <div className="p-4 space-y-4">
                    <SyntaxHighlighter
                      language="json"
                      code={`{\n  "scripts": {\n    "gen:proto": "protoc --es_out=src/gen --es_opt=target=ts proto/demo/v1/user.proto"\n  }\n}`}
                      wrap={true}
                    />
                  </div>
                </CyberPanel>
                <CyberPanel title="3. GENERATE CODE">
                  <div className="p-4">
                    <SyntaxHighlighter
                      language="bash"
                      code={`$ npm run gen:proto`}
                      wrap={true}
                    />
                  </div>
                </CyberPanel>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[var(--cyber-neon-pink)] font-cyber font-bold text-sm tracking-widest uppercase">
                Option 2: The Modern buf
              </h4>
              <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                <code>buf</code> simplifies generation by using a declarative{" "}
                <code>buf.gen.yaml</code> file, making your workflow
                reproducible and easier to share.
              </p>
              <div className="space-y-4">
                <CyberPanel title="buf.gen.yaml">
                  <div className="p-4">
                    <SyntaxHighlighter
                      language="yaml"
                      code={`version: v2\nplugins:\n  - remote: buf.build/bufbuild/es:v2.2.3\n    out: src/gen\n    opt: target=ts`}
                      wrap={true}
                    />
                  </div>
                </CyberPanel>
                <CyberPanel title="GENERATE CODE">
                  <div className="p-4">
                    <SyntaxHighlighter
                      language="bash"
                      code={`$ buf generate`}
                      wrap={true}
                    />
                  </div>
                </CyberPanel>
              </div>
            </div>
          </div>

          <div className="mt-24 space-y-8">
            <div className="space-y-4">
              <h4 className="text-[var(--cyber-neon-blue)] font-cyber font-bold text-sm tracking-widest uppercase">
                3. Using the Generated Code
              </h4>
              <p className="text-[var(--text-dim)] max-w-3xl">
                With your code generated via{" "}
                <ExternalLinkText href="https://github.com/bufbuild/protobuf-es">
                  protobuf-es (v2.12.0)
                </ExternalLinkText>
                , you can now use your schema as native TypeScript classes with
                full type safety.
              </p>
            </div>

            <CyberPanel title="src/main.ts">
              <div className="p-4">
                <SyntaxHighlighter
                  language="typescript"
                  code={`import { create, toBinary, toJsonString } from "@bufbuild/protobuf";\nimport { UserSchema } from "./gen/demo/v1/user_pb";\n\n// 1. Create a message using the schema\nconst user = create(UserSchema, {\n  id: "usr_123",\n  username: "cyber_ninja",\n  isActive: true,\n});\n\n// 2. Serialize to binary (Uint8Array)\nconst bytes = toBinary(UserSchema, user);\n\n// 3. Serialize to a JSON string\nconst json = toJsonString(UserSchema, user);`}
                  wrap={true}
                />
              </div>
            </CyberPanel>

            <TechnicalNuance title="Different languages and runtimes">
              <div className="space-y-4">
                <p className="leading-relaxed">
                  While this example uses TypeScript, the fundamental process is
                  similar across every supported language. However, there are
                  always language-specific details, such as how generated
                  packages are imported, how native structs or objects are
                  managed, and how the runtime libraries are integrated into
                  your specific build system.
                </p>
                <div className="space-y-2 pt-2 border-t border-[var(--border-light)]">
                  <p className="font-cyber font-bold text-xs uppercase tracking-widest text-[var(--cyber-neon-blue)]">
                    Official Getting Started Tutorials:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4 text-sm">
                    <ExternalLinkText href="https://protobuf.dev/getting-started/gotutorial/">
                      Go Tutorial
                    </ExternalLinkText>
                    <ExternalLinkText href="https://protobuf.dev/getting-started/pythontutorial/">
                      Python Tutorial
                    </ExternalLinkText>
                    <ExternalLinkText href="https://protobuf.dev/getting-started/javatutorial/">
                      Java Tutorial
                    </ExternalLinkText>
                    <ExternalLinkText href="https://protobuf.dev/getting-started/cpptutorial/">
                      C++ Tutorial
                    </ExternalLinkText>
                    <ExternalLinkText href="https://protobuf.dev/getting-started/csharptutorial/">
                      C# Tutorial
                    </ExternalLinkText>
                    <ExternalLinkText href="https://protobuf.dev/getting-started/kotlintutorial/">
                      Kotlin Tutorial
                    </ExternalLinkText>
                    <ExternalLinkText href="https://protobuf.dev/getting-started/darttutorial/">
                      Dart Tutorial
                    </ExternalLinkText>
                    <ExternalLinkText href="https://github.com/tokio-rs/prost">
                      Rust (prost)
                    </ExternalLinkText>
                  </div>
                </div>
              </div>
            </TechnicalNuance>
          </div>
        </section>
      </div>
    </Section>
  );
};
const TopicSection = ({
  id,
  icon,
  title,
  subtitle,
  panelTitle,
  desc,
  example,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  panelTitle: string;
  desc: React.ReactNode;
  example: string;
}) => (
  <Section
    id={id}
    className={`py-24 px-4 sm:px-8 border-t border-[var(--border-light)]`}
  >
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start scroll-mt-24">
        <div className="space-y-6">
          <SectionTitle icon={icon} subtitle={subtitle}>
            {title}
          </SectionTitle>
          <div className="text-[var(--text-dim)] leading-relaxed text-sm">
            {desc}
          </div>
        </div>
        <CyberPanel title={panelTitle} className="h-full">
          <div className="p-2">
            <SyntaxHighlighter language="proto" code={example} wrap={true} />
          </div>
        </CyberPanel>
      </div>
    </div>
  </Section>
);

export const ProtobufBasics = () => {
  const topics = [
    {
      id: "messages",
      icon: Box,
      title: "Messages",
      subtitle: "02b_STRUCTURE",
      panelTitle: "SCHEMA_DEFINITION",
      desc: (
        <div className="space-y-4">
          <p>
            Messages are the primary logical structure in Protobuf. They act as
            containers for your data, analogous to a <code>struct</code> in
            C/Rust or a <code>class</code> in Java/TypeScript.
          </p>
          <p>
            Think of a message as a <strong>strictly-enforced contract</strong>.
            Once defined in a schema, the Protobuf compiler ensures that every
            system interacting with this data, regardless of the programming
            language, agrees on its structure.
          </p>
          <p>
            One of the best features of Protobuf is that it's{" "}
            <ExternalLinkText href="https://protobuf.dev/programming-guides/proto3/#updating">
              designed to be evolvable
            </ExternalLinkText>
            . You can add new fields to messages without breaking existing code,
            which lets servers and clients upgrade at their own pace. This is a
            big deal for a binary format. Many other formats don't support this
            level of compatibility out of the box.
          </p>
        </div>
      ),
      example: `// A simple message definition
message SearchRequest {
  string query = 1;
  int32 page_number = 2;
  int32 results_per_page = 3;
}`,
    },
    {
      id: "fields",
      icon: Type,
      title: "Fields",
      subtitle: "02c_TYPING",
      panelTitle: "FIELD_DEFINITIONS",
      desc: (
        <div className="space-y-4">
          <p>
            Every field in a message requires a specific type (e.g.,{" "}
            <code>string</code>, <code>int32</code>, <code>bool</code>) and a
            name.
          </p>
          <p>
            Since Protobuf is strictly typed, it catches many of the data-type
            errors that would otherwise only show up at runtime with formats
            like JSON. If a client expects an integer, they will never
            accidentally receive a string.
          </p>
          <p>
            While names are used in your code for readability, they are{" "}
            <strong>mostly ignored on the wire</strong>. This allows you to
            rename fields in your schema without breaking binary compatibility
            (though it may break JSON consumers).
          </p>
        </div>
      ),
      example: `message User {
  string username = 1;
  bool is_active = 2;
  uint32 login_count = 3;
}`,
    },
    {
      id: "numbers",
      icon: Hash,
      title: "Field Numbers",
      subtitle: "02d_WIRE_ID",
      panelTitle: "WIRE_IDENTITY",
      desc: (
        <div className="space-y-4">
          <p>
            Field numbers are the most critical part of a Protobuf message.
            Instead of sending long string names (like <code>"username"</code>)
            over the wire, Protobuf only sends this integer ID.
          </p>
          <p>
            This <strong>"Tag"</strong> is what makes Protobuf so compact.
            Because these numbers identify fields, they{" "}
            <strong>must never be changed</strong> once a message type is in
            use. Reusing a number for a different field will cause catastrophic
            data corruption.
          </p>
          <div className="p-3 bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/20 rounded text-sm space-y-2">
            <p>
              <strong>Optimization Tip:</strong> Numbers 1 through 15 take{" "}
              <strong>1 byte</strong> to encode (including the field number and
              wire type). Numbers 16 through 2047 take 2 bytes. Use 1-15 for
              your most frequently sent fields!
            </p>
          </div>
        </div>
      ),
      example: `message User {
  // "1" is the ID on the wire
  string id = 1;
  
  // Small numbers (1-15) take 1 byte to encode
  string name = 2;
}`,
    },
    {
      id: "enums",
      icon: List,
      title: "Enums",
      subtitle: "02e_CHOICES",
      panelTitle: "ENUM_DEFINITIONS",
      desc: (
        <div className="space-y-4">
          <p>
            Enums allow you to define a restricted set of named constants. This
            is crucial for states, roles, or configurations.
          </p>
          <p>
            In proto3, the first constant{" "}
            <strong>must always map to zero</strong>. This serves as the default
            value when the field is not explicitly set in the binary payload.
          </p>
          <div className="p-3 bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/20 rounded text-sm space-y-2">
            <p className="font-bold text-[var(--cyber-neon-blue)] uppercase">
              Naming Convention
            </p>
            <p>
              To avoid name collisions in languages like C++ or Go (where enum
              values are often in the parent scope), it is a best practice to{" "}
              <strong>prefix values with the enum name</strong>.
            </p>
          </div>
          <p>
            <strong>Open Enums:</strong> Modern Protobuf implementations support
            "open" enums, meaning if a server sends a value that a client
            doesn't recognize, the client will still preserve that value instead
            of crashing.
          </p>
        </div>
      ),
      example: `enum Status {
  // Prefixing avoids collisions
  STATUS_UNSPECIFIED = 0;
  STATUS_ACTIVE = 1;
  STATUS_DEFERRED = 2;
}

message User {
  Status current_status = 1;
}`,
    },
    {
      id: "packages",
      icon: Layers,
      title: "Packages",
      subtitle: "02f_NAMESPACING",
      panelTitle: "PACKAGE_DECLARATION",
      desc: (
        <div className="space-y-4">
          <p>
            As your project grows, you'll likely have many messages with similar
            names. Protobuf uses <code>package</code> declarations to prevent
            name clashes.
          </p>
          <p>
            These packages often map directly to namespaces in C++, packages in
            Go/Java, or modules in TypeScript. They are essential for organizing
            large-scale schemas and ensuring that an <code>Account</code> in the
            billing service doesn't conflict with an <code>Account</code> in the
            identity service.
          </p>
        </div>
      ),
      example: `syntax = "proto3";

// Defines the namespace
package demo.identity.v1;

message Account {
  string id = 1;
}`,
    },
    {
      id: "nested",
      icon: Combine,
      title: "Composition",
      subtitle: "02g_NESTING",
      panelTitle: "COMPOSITIONAL_SCHEMA",
      desc: (
        <div className="space-y-4">
          <p>
            Protobuf supports complex, hierarchical data structures. You can
            define messages within other messages, or use previously defined
            messages as field types.
          </p>
          <p>
            This <strong>Composition</strong> allows you to build highly
            reusable domains of data models. For example, a{" "}
            <code>Location</code> message can be used across <code>User</code>,{" "}
            <code>Event</code>, and <code>Office</code> messages.
          </p>
          <p>
            On the wire, embedded messages are "length-delimited", allowing
            decoders to skip the entire sub-message if they don't have the
            schema for it.
          </p>
        </div>
      ),
      example: `message Result {
  string url = 1;
  string title = 2;
}

message SearchResponse {
  // Result is embedded here
  Result top_result = 1;
}`,
    },
    {
      id: "repeated",
      icon: Layers,
      title: "Collections",
      subtitle: "02h_REPEATED",
      panelTitle: "COLLECTION_SYNTAX",
      desc: (
        <div className="space-y-4">
          <p>
            To represent an array or list of items, use the{" "}
            <code>repeated</code> keyword. These fields can contain zero or more
            elements of the specified type.
          </p>
          <p>
            In modern Protobuf, repeated scalar numeric fields (like{" "}
            <code>int32</code>, <code>float</code>, etc.) are{" "}
            <strong>"packed"</strong> by default. Instead of repeating the field
            tag for every element, they are stored as one single block with a
            length prefix. This is significantly more efficient for large
            arrays.
          </p>
        </div>
      ),
      example: `message SearchResponse {
  // A list of strings
  repeated string related_queries = 1;
  
  // A list of messages
  repeated Result results = 2;
}`,
    },
    {
      id: "maps",
      icon: Braces,
      title: "Maps",
      subtitle: "02i_KEY_VALUE",
      panelTitle: "MAP_STRUCTURE",
      desc: (
        <div className="space-y-4">
          <p>
            Protobuf provides native support for associative maps
            (dictionaries). However, there are strict rules for map keys and
            values:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <strong>Keys:</strong> Can be any integral or string type.{" "}
              <em>Messages, enums, floats, and bytes cannot be keys.</em>
            </li>
            <li>
              <strong>Values:</strong> Can be any type, including another
              message, but <em>cannot</em> be another map or a repeated field.
            </li>
          </ul>
          <p className="text-sm text-[var(--text-dim)] italic">
            Behind the scenes, maps are actually just <code>repeated</code>{" "}
            messages with <code>key</code> and <code>value</code> fields,
            ensuring backward compatibility with older decoders.
          </p>
        </div>
      ),
      example: `message Project {
  string name = 1;
  
  // A dictionary of string keys to string values
  map<string, string> labels = 2;
}`,
    },
    {
      id: "oneof",
      icon: GitBranch,
      title: "Oneof",
      subtitle: "02j_POLYMORPHISM",
      panelTitle: "MUTUAL_EXCLUSION",
      desc: (
        <div className="space-y-4">
          <p>
            If you have a message with multiple fields where{" "}
            <strong>only one can be set at a time</strong>, you can enforce this
            behavior and save memory using the <code>oneof</code> keyword.
          </p>
          <p>
            Setting any field within the <code>oneof</code> automatically clears
            all other fields in that same <code>oneof</code>. This is Protobuf's
            equivalent to a <strong>tagged union</strong> or{" "}
            <code>variant</code>.
          </p>
          <p>
            This is perfect for polymorphism, such as an <code>Event</code> that
            could be a <code>ClickEvent</code>, <code>HoverEvent</code>, or{" "}
            <code>ScrollEvent</code>.
          </p>
        </div>
      ),
      example: `message ErrorStatus {
  string message = 1;
  
  oneof details {
    string stack_trace = 2;
    int32 error_code = 3;
  }
}`,
    },
  ];

  return (
    <>
      {topics.map((topic) => (
        <TopicSection
          key={topic.id}
          id={topic.id}
          icon={topic.icon}
          title={topic.title}
          subtitle={topic.subtitle}
          panelTitle={topic.panelTitle}
          desc={topic.desc}
          example={topic.example}
        />
      ))}
    </>
  );
};

interface TypeGroupDef {
  name: string;
  icon: React.ElementType;
  types: { name: string; desc: React.ReactNode; url?: string }[];
  footer?: React.ReactNode;
}

export const TypeSystem = () => {
  const groups: TypeGroupDef[] = [
    {
      name: "Numeric Types",
      icon: Hash,
      types: [
        {
          name: "int32 / int64",
          desc: "Signed integers. Uses variable-length encoding (varint).",
        },
        {
          name: "uint32 / uint64",
          desc: "Unsigned integers. Efficient for positive-only values.",
        },
        {
          name: "sint32 / sint64",
          desc: (
            <>
              Signed integers. More efficient for negative numbers via{" "}
              <ExternalLinkText href="https://en.wikipedia.org/wiki/Variable-length_quantity#Zigzag_encoding">
                ZigZag
              </ExternalLinkText>
              .
            </>
          ),
        },
        {
          name: "fixed32 / fixed64",
          desc: "Always 4/8 bytes. Efficient for large constants (> 2^28).",
        },
        {
          name: "float / double",
          desc: (
            <>
              32-bit and 64-bit{" "}
              <ExternalLinkText href="https://en.wikipedia.org/wiki/IEEE_754">
                IEEE 754
              </ExternalLinkText>{" "}
              floating point numbers.
            </>
          ),
        },
      ],
    },
    {
      name: "Object Types",
      icon: Type,
      types: [
        {
          name: "string",
          desc: (
            <>
              Always{" "}
              <ExternalLinkText href="https://en.wikipedia.org/wiki/UTF-8">
                UTF-8
              </ExternalLinkText>{" "}
              encoded text. Limited to 2GB.
            </>
          ),
        },
        {
          name: "bytes",
          desc: "Raw byte sequences. Perfect for arbitrary binary data.",
        },
        { name: "bool", desc: "Encoded as a varint 0 or 1." },
        {
          name: "enum",
          desc: "Predefined set of named integers. Defaults to 0.",
        },
      ],
    },
    {
      name: "Well-Known Types",
      icon: Box,
      types: [
        {
          name: "google.protobuf.Empty",
          desc: "Used to indicate an API takes no parameters or returns nothing.",
          url: "https://protobuf.dev/reference/protobuf/google.protobuf/#empty",
        },
        {
          name: "google.protobuf.Timestamp",
          desc: (
            <>
              A point in time, independent of timezone. Maps to{" "}
              <ExternalLinkText href="https://datatracker.ietf.org/doc/html/rfc3339">
                RFC 3339
              </ExternalLinkText>{" "}
              in JSON.
            </>
          ),
          url: "https://protobuf.dev/reference/protobuf/google.protobuf/#timestamp",
        },
        {
          name: "google.protobuf.Duration",
          desc: "A span of time. Maps to a string ending in 's' in JSON (e.g. '1.5s').",
          url: "https://protobuf.dev/reference/protobuf/google.protobuf/#duration",
        },
        {
          name: "google.protobuf.Value",
          desc: "Represents a dynamically typed value, equivalent to any JSON type.",
          url: "https://protobuf.dev/reference/protobuf/google.protobuf/#value",
        },
        {
          name: "google.protobuf.Struct",
          desc: "Maps directly to a free-form JSON object.",
          url: "https://protobuf.dev/reference/protobuf/google.protobuf/#struct",
        },
      ],
    },
  ];

  const TypeGroup = ({
    groupName,
    groupIcon: Icon,
    types,
  }: {
    groupName: string;
    groupIcon: React.ElementType;
    types: { name: string; desc: React.ReactNode; url?: string }[];
  }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[var(--cyber-neon-blue)]">
        <Icon className="w-4 h-4" />
        <h4 className="font-cyber font-bold text-sm tracking-widest uppercase">
          {groupName}
        </h4>
      </div>
      <div className="grid gap-3">
        {types.map((t) => (
          <div
            key={t.name as string}
            className="p-3 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg group hover:border-[var(--cyber-neon-blue)]/30 transition-colors"
          >
            <div className="flex justify-between items-start mb-1">
              {t.url ? (
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm font-bold text-[var(--cyber-neon-blue)] hover:underline decoration-dotted"
                >
                  {t.name}
                </a>
              ) : (
                <span className="font-mono text-sm font-bold text-[var(--text-color)] group-hover:text-[var(--cyber-neon-blue)]">
                  {t.name}
                </span>
              )}
            </div>
            <div className="text-sm text-[var(--text-dim)] leading-relaxed">
              {t.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Section
      id="types"
      className="py-24 px-4 sm:px-8 bg-[var(--section-bg-dark)] border-t border-[var(--border-light)]"
    >
      <div className="max-w-7xl mx-auto space-y-16">
        <div>
          <SectionTitle icon={Combine} subtitle="02k_TYPE_REFERENCE">
            The Type System
          </SectionTitle>
          <div className="mb-12 space-y-4 text-sm text-[var(--text-dim)] leading-relaxed max-w-4xl">
            <p>
              Protobuf's type system is designed for both strictly-enforced
              contracts and maximum binary efficiency.
              <strong> Basic Types</strong> (scalars) map directly to standard
              primitives in your programming language.
            </p>
            <p>
              <strong>Well-Known Types (WKTs)</strong> are specialized schemas
              standardized by Google. They are assumed to be known by all
              Protobuf compilers and have specialized{" "}
              <strong>JSON mappings</strong> to ensure clean, idiomatic
              integration with web APIs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {groups.map((g) => (
              <TypeGroup
                key={g.name}
                groupName={g.name}
                groupIcon={g.icon}
                types={g.types}
              />
            ))}
          </div>
        </div>

        <div className="pt-16 border-t border-[var(--border-light)]">
          <div className="space-y-8">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight">
                Guidelines for Integers
              </h3>
              <p className="text-[var(--text-dim)] text-sm max-w-3xl">
                Choosing the right integer type is important for both message
                size and language compatibility; here are some general
                guidelines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <CyberPanel
                title="DEFAULT_CHOICE"
                className="flex flex-col h-full"
              >
                <div className="p-4 space-y-3 flex-1 flex flex-col">
                  <div className="font-mono text-sm font-bold text-[var(--cyber-neon-blue)]">
                    int32 / int64
                  </div>
                  <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                    Use for typical signed integers. <code>int32</code> covers
                    most use cases; use <code>int64</code> for large IDs or
                    timestamps.
                  </p>
                  <div className="pt-2 flex flex-col gap-1 mt-auto">
                    <span className="text-[11px] font-mono text-[var(--text-dim)] uppercase tracking-wider">
                      Best for:
                    </span>
                    <span className="text-sm font-mono font-bold text-[var(--text-color)] uppercase">
                      General Data
                    </span>
                  </div>
                </div>
              </CyberPanel>

              <CyberPanel title="NON_NEGATIVE" className="flex flex-col h-full">
                <div className="p-4 space-y-3 flex-1 flex flex-col">
                  <div className="font-mono text-sm font-bold text-[var(--cyber-neon-green)]">
                    uint32 / uint64
                  </div>
                  <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                    Ideal when you know values will never be negative. Slightly
                    more efficient than <code>int</code> for large positive
                    values.
                  </p>
                  <div className="pt-2 flex flex-col gap-1 mt-auto">
                    <span className="text-[11px] font-mono text-[var(--text-dim)] uppercase tracking-wider">
                      Best for:
                    </span>
                    <span className="text-sm font-mono font-bold text-[var(--text-color)] uppercase">
                      Counts & Sizes
                    </span>
                  </div>
                </div>
              </CyberPanel>

              <CyberPanel
                title="SIGNED_ZIGZAG"
                className="flex flex-col h-full"
              >
                <div className="p-4 space-y-3 flex-1 flex flex-col">
                  <div className="font-mono text-sm font-bold text-[var(--cyber-neon-pink)]">
                    sint32 / sint64
                  </div>
                  <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                    Crucial when values can be negative. Uses ZigZag encoding to
                    keep small negative numbers compact (1–2 bytes), unlike{" "}
                    <code>int32/int64</code> which require 10 bytes for any
                    negative value.
                  </p>
                  <div className="pt-2 flex flex-col gap-1 mt-auto">
                    <span className="text-[11px] font-mono text-[var(--text-dim)] uppercase tracking-wider">
                      Best for:
                    </span>
                    <span className="text-sm font-mono font-bold text-[var(--text-color)] uppercase">
                      Negative Values
                    </span>
                  </div>
                </div>
              </CyberPanel>

              <CyberPanel
                title="FIXED_PRECISION"
                className="flex flex-col h-full"
              >
                <div className="p-4 space-y-3 flex-1 flex flex-col">
                  <div className="font-mono text-sm font-bold text-[var(--cyber-neon-yellow)]">
                    fixed32 / fixed64
                  </div>
                  <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                    Always uses 4 or 8 bytes. More efficient than varints ONLY
                    if values are consistently greater than 2<sup>28</sup>.
                  </p>
                  <div className="pt-2 flex flex-col gap-1 mt-auto">
                    <span className="text-[11px] font-mono text-[var(--text-dim)] uppercase tracking-wider">
                      Best for:
                    </span>
                    <span className="text-sm font-mono font-bold text-[var(--text-color)] uppercase">
                      Large Constants
                    </span>
                  </div>
                </div>
              </CyberPanel>
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-[var(--border-light)]">
          <div className="grid grid-cols-1 gap-12">
            <div className="space-y-6 text-[var(--text-color)]">
              <h3 className="text-xl font-cyber font-bold text-[var(--text-color)] uppercase">
                ProtoJSON Mapping
              </h3>
              <p>
                While Protobuf is primarily binary, it defines a canonical{" "}
                <ExternalLinkText href="https://protobuf.dev/programming-guides/json/">
                  ProtoJSON
                </ExternalLinkText>{" "}
                mapping. This ensures that every binary payload has a
                deterministic representation in JSON.
              </p>
            </div>

            <div className="space-y-8">
              <CyberPanel title="JSON_MAPPING_RULES">
                <div className="p-4 space-y-4 text-sm">
                  <table className="w-full text-left border-collapse block lg:table">
                    <caption className="sr-only">
                      Protobuf to JSON Type Mapping Rules
                    </caption>
                    <thead className="hidden lg:table-header-group">
                      <tr className="border-b border-[var(--border-light)] font-mono text-sm text-[var(--text-dim)] uppercase bg-[var(--border-light)]/5">
                        <th className="py-3 px-4 min-w-[160px] font-bold tracking-wider text-[var(--text-color)]">
                          Protobuf Type
                        </th>
                        <th className="py-3 px-4 min-w-[120px] font-bold tracking-wider text-[var(--text-color)]">
                          JSON Type(s)
                        </th>
                        <th className="py-3 px-4 min-w-[180px] font-bold tracking-wider text-[var(--text-color)]">
                          JSON Value Example
                        </th>
                        <th className="py-3 px-4 min-w-[200px] font-bold tracking-wider text-[var(--text-color)]">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="align-top block lg:table-row-group">
                      {[
                        {
                          pb: "message",
                          json: "Object",
                          ex: '{"userName": "hiro"}',
                          note: "Serialized as a JSON object. Field names are mapped to lowerCamelCase by default, or the json_name option if set.",
                        },
                        {
                          pb: "repeated",
                          json: "Array",
                          ex: '["a", "b"]',
                          note: "Serialized as a JSON array.",
                        },
                        {
                          pb: "map<K, V>",
                          json: "Object",
                          ex: '{"k": "v"}',
                          note: "Serialized as a JSON object.",
                        },
                        {
                          pb: "int32, float, double",
                          json: "Number",
                          ex: "123.45",
                          note: "Standard JSON numbers.",
                        },
                        {
                          pb: "bool",
                          json: "Boolean",
                          ex: "true",
                          note: "Standard JSON booleans.",
                        },
                        {
                          pb: "int64, uint64",
                          json: "String",
                          ex: '"9007199254740993"',
                          note: "Strings prevent precision loss in JS.",
                        },
                        {
                          pb: "enum",
                          json: "String",
                          ex: '"ROLE_ADMIN"',
                          note: "Uses the string name of the enum value.",
                        },
                        {
                          pb: "bytes",
                          json: "String",
                          ex: '"NDI="',
                          note: "Base64 encoded string.",
                        },
                        {
                          pb: "google.protobuf.Timestamp",
                          json: "String",
                          ex: '"2023-10-01T12:00:00Z"',
                          note: (
                            <>
                              <ExternalLinkText href="https://datatracker.ietf.org/doc/html/rfc3339">
                                RFC 3339
                              </ExternalLinkText>{" "}
                              formatted timestamp string.
                            </>
                          ),
                        },
                        {
                          pb: "google.protobuf.Duration",
                          json: "String",
                          ex: '"1.000340012s"',
                          note: "Seconds with up to 9 fractional digits.",
                        },
                        {
                          pb: "google.protobuf.FieldMask",
                          json: "String",
                          ex: '"f.a,f.b"',
                          note: "Comma-separated paths as a single string.",
                        },
                        {
                          pb: "google.protobuf.Struct",
                          json: "Object",
                          ex: '{"foo": "bar"}',
                          note: "Standard representation for a generic JSON object.",
                        },
                        {
                          pb: "google.protobuf.Value",
                          json: "Any",
                          ex: '"foo" or 123',
                          note: "Can be any valid JSON value (null, number, string, boolean, struct, or list).",
                        },
                        {
                          pb: "google.protobuf.NullValue",
                          json: "null",
                          ex: "null",
                          note: "The JSON null value.",
                        },
                        {
                          pb: "google.protobuf.Empty",
                          json: "Object",
                          ex: "{}",
                          note: "An empty JSON object.",
                        },
                      ].map((row, idx) => (
                        <tr
                          key={row.pb}
                          className={`border-b border-[var(--border-light)]/50 last:border-0 block lg:table-row py-6 lg:py-0 ${
                            idx % 2 === 0 ? "bg-white/[0.02]" : ""
                          }`}
                        >
                          <td className="py-1 lg:py-4 px-4 block lg:table-cell">
                            <span className="lg:hidden text-[10px] font-mono text-[var(--cyber-neon-blue)]/70 font-bold uppercase block mb-1 tracking-tight">
                              Protobuf Type
                            </span>
                            <code className="text-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/5 px-1 py-0.5 rounded break-words">
                              {row.pb}
                            </code>
                          </td>
                          <td className="py-1 lg:py-4 px-4 font-mono text-sm text-[var(--cyber-neon-pink)] block lg:table-cell">
                            <span className="lg:hidden text-[10px] font-mono text-[var(--cyber-neon-blue)]/70 font-bold uppercase block mb-1 tracking-tight">
                              JSON Type
                            </span>
                            {row.json}
                          </td>
                          <td className="py-1 lg:py-4 px-4 block lg:table-cell">
                            <span className="lg:hidden text-[10px] font-mono text-[var(--cyber-neon-blue)]/70 font-bold uppercase block mb-1 tracking-tight">
                              Example
                            </span>
                            <code className="text-[var(--cyber-neon-green)] bg-[var(--cyber-neon-green)]/5 px-1 py-0.5 rounded break-all">
                              {row.ex}
                            </code>
                          </td>
                          <td className="py-1 lg:py-4 px-4 text-[var(--text-dim)] text-sm block lg:table-cell">
                            <span className="lg:hidden text-[10px] font-mono text-[var(--cyber-neon-blue)]/70 font-bold uppercase block mb-1 tracking-tight">
                              Note
                            </span>
                            {row.note}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CyberPanel>

              <div className="p-4 bg-[var(--cyber-neon-yellow)]/5 border border-[var(--cyber-neon-yellow)]/20 rounded-lg space-y-4 max-w-4xl">
                <h4 className="text-[var(--cyber-neon-yellow)] font-cyber font-bold text-sm uppercase tracking-wider">
                  64-bit Precision
                </h4>
                <p className="text-sm leading-relaxed text-[var(--text-color)]/90">
                  JavaScript numbers are 64-bit floats, which lose precision for
                  integers above 2<sup>53</sup> - 1.
                </p>
                <p className="text-sm leading-relaxed font-bold text-[var(--text-color)]">
                  To prevent data loss, 64-bit integer types (<code>int64</code>
                  , <code>fixed64</code>, <code>uint64</code>,{" "}
                  <code>sint64</code>, and <code>sfixed64</code>) are encoded as
                  strings in JSON.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

const Basics = () => (
  <>
    <SchemaDrivenAPIs />
    <ProtobufBasics />
    <TypeSystem />
  </>
);

export default Basics;
