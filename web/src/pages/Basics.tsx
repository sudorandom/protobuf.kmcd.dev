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
  ArrowRight,
} from "lucide-react";
import {
  Section,
  SectionTitle,
  CyberPanel,
  ExternalLinkText,
  SyntaxHighlighter,
  TechnicalNuance,
} from "../components/shared/Common";

export const SchemaDrivenAPIs = () => (
  <Section
    id="schema"
    className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)] border-t border-[var(--border-light)]"
  >
    <div className="max-w-7xl mx-auto">
      <SectionTitle icon={FileCode} subtitle="02a_ARCHITECTURE">
        Schema-Driven APIs
      </SectionTitle>

      <div className="mb-16 space-y-4 max-w-3xl">
        <p className="text-[var(--text-dim)] leading-relaxed">
          In this section, we'll dive into the Interface Definition Language
          (IDL) and the powerful type system that forms the foundation of every
          Protobuf-powered application.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="space-y-6 text-[var(--text-color)]">
          <h3 className="text-xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight">
            The Source of Truth
          </h3>
          <p>
            In the Protobuf world, the <strong>.proto</strong> file is the
            contract. This encourages <strong>Contract-First</strong>{" "}
            development, where the data model and API surface are defined before
            any code is written.
          </p>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <div className="w-1.5 h-1.5 bg-[var(--cyber-neon-blue)] mt-2 shrink-0"></div>
              <p>
                <strong>Universal Tooling:</strong> Generate code for reading
                and writing protobuf messages for various languages using the{" "}
                <ExternalLinkText href="https://buf.build/docs/bsr/introduction">
                  BSR
                </ExternalLinkText>{" "}
                or local compilers.
              </p>
            </li>
            <li className="flex gap-4">
              <div className="w-1.5 h-1.5 bg-[var(--cyber-neon-pink)] mt-2 shrink-0"></div>
              <p>
                <strong>Compatibility:</strong> Robust rules for adding/removing
                fields without breaking old clients, essential for distributed
                systems.
              </p>
            </li>
            <li className="flex gap-4">
              <div className="w-1.5 h-1.5 bg-[var(--cyber-neon-green)] mt-2 shrink-0"></div>
              <p>
                <strong>Native RPC:</strong> Unlike most serialization formats,
                Protobuf includes native <code>service</code> and{" "}
                <code>rpc</code> definitions. This allows you to define your
                entire API surface in one place, powering frameworks like{" "}
                <ExternalLinkText href="https://grpc.io/">
                  gRPC
                </ExternalLinkText>
                ,{" "}
                <ExternalLinkText href="https://connectrpc.com/">
                  ConnectRPC
                </ExternalLinkText>
                , and{" "}
                <ExternalLinkText href="https://twitchtv.github.io/twirp/">
                  Twirp
                </ExternalLinkText>
                .
              </p>
            </li>
          </ul>
        </div>
        <div className="p-8 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl flex flex-col justify-center">
          <h4 className="text-[var(--cyber-neon-blue)] font-cyber font-bold text-sm tracking-widest uppercase mb-4 text-center">
            THE_WORKFLOW
          </h4>
          <div className="space-y-4 font-mono text-xs font-bold">
            <div className="p-3 bg-[var(--section-bg-dark)] border border-[var(--cyber-neon-blue)]/30 rounded text-[var(--cyber-neon-blue)]">
              1. DEFINE SCHEMA (.proto)
            </div>
            <div className="flex justify-center">
              <ArrowRight className="w-4 h-4 rotate-90 text-[var(--text-dim)]" />
            </div>
            <div className="p-3 bg-[var(--section-bg-dark)] border border-[var(--cyber-neon-pink)]/30 rounded text-[var(--cyber-neon-pink)]">
              2. COMPILE TARGETS (Go, TS, etc.)
            </div>
            <div className="flex justify-center">
              <ArrowRight className="w-4 h-4 rotate-90 text-[var(--text-dim)]" />
            </div>
            <div className="p-3 bg-[var(--section-bg-dark)] border border-[var(--cyber-neon-green)]/30 rounded text-[var(--cyber-neon-green)]">
              3. BUILD & DEPLOY SERVICES
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 space-y-12 border-t border-[var(--border-light)] pt-16">
        <div className="space-y-4">
          <h3 className="text-2xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight">
            Generating Code
          </h3>
          <p className="text-[var(--text-dim)] max-w-3xl">
            Let's see how to generate TypeScript code from a <code>.proto</code>{" "}
            schema using both the traditional <code>protoc</code> compiler and
            the modern <code>buf</code> toolchain.
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
              <h4 className="text-[var(--cyber-neon-green)] font-cyber font-bold text-sm tracking-widest uppercase">
                The Schema Definition
              </h4>
              <div className="space-y-4 text-[var(--text-dim)] leading-relaxed">
                <p>
                  In this <code>user.proto</code> file, we define a{" "}
                  <code>User</code> message with three fields. Each field has a
                  type (<code>string</code>, <code>bool</code>) and a unique{" "}
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
                    schema rules before it ever reaches your application logic.
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
              Protobuf. It requires manual management of plugins and complex CLI
              flags.
            </p>
            <CyberPanel title="TERMINAL">
              <div className="p-4">
                <SyntaxHighlighter
                  language="bash"
                  code={`$ protoc --es_out=src/gen \\ \n    --es_opt=target=ts \\ \n    proto/demo/v1/user.proto`}
                  wrap={true}
                />
              </div>
            </CyberPanel>
          </div>

          <div className="space-y-6">
            <h4 className="text-[var(--cyber-neon-pink)] font-cyber font-bold text-sm tracking-widest uppercase">
              Option 2: The Modern buf
            </h4>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              <code>buf</code> simplifies generation by using a declarative{" "}
              <code>buf.gen.yaml</code> file, making your workflow reproducible
              and easier to share.
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
              <CyberPanel title="TERMINAL">
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
            While this example uses TypeScript, the fundamental process is
            similar across every supported language (Go, Python, Rust, Java,
            etc.). However, there are always language-specific details, such as
            how generated packages are imported, how native structs or objects
            are managed, and how the runtime libraries are integrated into your
            specific build system.
          </TechnicalNuance>
        </div>
      </div>
    </div>
  </Section>
);

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
            Crucially,{" "}
            <ExternalLinkText href="https://protobuf.dev/programming-guides/proto3/#updating">
              Protobuf is designed to be evolvable
            </ExternalLinkText>
            . You can add new fields to these messages without breaking existing
            code, allowing servers and clients to upgrade at their own pace.
            This sounds like a simple thing, but it is an important feature for
            binary-based formats to have and many binary formats do not support
            this level of forward/backward compatibility.
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
            Because Protobuf is strictly typed, it eliminates an entire class of
            runtime errors common in dynamically typed formats like JSON. If a
            client expects an integer, they will never accidentally receive a
            string.
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
          <div className="p-3 bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/20 rounded text-xs space-y-2">
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
          <div className="p-3 bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/20 rounded text-xs space-y-2">
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
      subtitle: "02j_NAMESPACING",
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
      subtitle: "02f_NESTING",
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
      subtitle: "02g_REPEATED",
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
      subtitle: "02h_KEY_VALUE",
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
          <p className="text-xs text-[var(--text-dim)] italic">
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
      subtitle: "02i_POLYMORPHISM",
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
          desc: "A point in time, independent of timezone. Maps to RFC 3339 in JSON.",
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
                  className="font-mono text-xs font-bold text-[var(--cyber-neon-blue)] hover:underline decoration-dotted"
                >
                  {t.name}
                </a>
              ) : (
                <span className="font-mono text-xs font-bold text-[var(--text-color)] group-hover:text-[var(--cyber-neon-blue)]">
                  {t.name}
                </span>
              )}
            </div>
            <div className="text-xs text-[var(--text-dim)] leading-relaxed">
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
                Choosing the right integer type is critical for both wire
                efficiency and language compatibility. Follow these industry
                best practices.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CyberPanel title="DEFAULT_CHOICE">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[var(--cyber-neon-blue)]">
                      int32 / int64
                    </span>
                    <span className="text-xs bg-[var(--cyber-neon-blue)]/10 text-[var(--cyber-neon-blue)] px-1.5 py-0.5 rounded uppercase font-bold">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                    Use for typical signed integers. <code>int32</code> covers
                    most use cases; use <code>int64</code> for large IDs or
                    timestamps.
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[var(--cyber-neon-blue)]" />
                    <span className="text-xs font-mono text-[var(--text-dim)] uppercase">
                      Best for: General Data
                    </span>
                  </div>
                </div>
              </CyberPanel>

              <CyberPanel title="NON_NEGATIVE">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[var(--cyber-neon-green)]">
                      uint32 / uint64
                    </span>
                    <span className="text-xs bg-[var(--cyber-neon-green)]/10 text-[var(--cyber-neon-green)] px-1.5 py-0.5 rounded uppercase font-bold">
                      Efficient
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                    Ideal when you know values will never be negative. Slightly
                    more efficient than <code>int</code> for large positive
                    values.
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[var(--cyber-neon-green)]" />
                    <span className="text-xs font-mono text-[var(--text-dim)] uppercase">
                      Best for: Counts & Sizes
                    </span>
                  </div>
                </div>
              </CyberPanel>

              <CyberPanel title="FIXED_PRECISION">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[var(--cyber-neon-yellow)]">
                      fixed32 / fixed64
                    </span>
                    <span className="text-xs bg-[var(--cyber-neon-yellow)]/10 text-[var(--cyber-neon-yellow)] px-1.5 py-0.5 rounded uppercase font-bold">
                      Specialized
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                    Always uses 4 or 8 bytes. More efficient than varints ONLY
                    if values are consistently greater than 2<sup>28</sup>.
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[var(--cyber-neon-yellow)]" />
                    <span className="text-xs font-mono text-[var(--text-dim)] uppercase">
                      Best for: Large Constants
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
                <div className="p-4 space-y-4 text-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-light)] font-mono text-xs text-[var(--text-dim)] uppercase">
                        <th className="py-2 pr-4 min-w-[200px]">
                          Protobuf Type
                        </th>
                        <th className="py-2 pr-4 min-w-[150px]">
                          JSON Type(s)
                        </th>
                        <th className="py-2 pr-4 min-w-[200px]">
                          JSON Value Example
                        </th>
                        <th className="py-2 min-w-[250px]">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="align-top">
                      {[
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
                          ex: '"YWJjMTIz"',
                          note: "Base64 encoded string.",
                        },
                        {
                          pb: "google.protobuf.Timestamp",
                          json: "String",
                          ex: '"2023-10-01T12:00:00Z"',
                          note: "RFC 3339 formatted timestamp string.",
                        },
                        {
                          pb: "google.protobuf.Duration",
                          json: "String",
                          ex: '"1.000340012s"',
                          note: "Seconds with up to 9 fractional digits.",
                        },
                        {
                          pb: "google.protobuf.Empty",
                          json: "Object",
                          ex: "{}",
                          note: "An empty JSON object.",
                        },
                        {
                          pb: "google.protobuf.Struct",
                          json: "Object",
                          ex: '{"foo": "bar", "baz": 123}',
                          note: "Standard representation for a generic JSON object.",
                        },
                        {
                          pb: "google.protobuf.Value",
                          json: "Any",
                          ex: '{"foo": "bar"}',
                          note: "Can be any valid JSON value.",
                        },
                        {
                          pb: "google.protobuf.Method",
                          json: "String",
                          ex: '"/demo.v1.UserService/GetUser"',
                          note: "String representation of the method.",
                        },
                      ].map((row) => (
                        <tr
                          key={row.pb}
                          className="border-b border-[var(--border-light)]/50 last:border-0"
                        >
                          <td className="py-3 pr-4">
                            <code className="text-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/5 px-1 py-0.5 rounded break-words">
                              {row.pb}
                            </code>
                          </td>
                          <td className="py-3 pr-4 font-mono text-xs text-[var(--cyber-neon-pink)]">
                            {row.json}
                          </td>
                          <td className="py-3 pr-4">
                            <code className="text-[var(--cyber-neon-green)] bg-[var(--cyber-neon-green)]/5 px-1 py-0.5 rounded break-all">
                              {row.ex}
                            </code>
                          </td>
                          <td className="py-3 text-[var(--text-dim)] text-xs">
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
                  The 64-bit Precision
                </h4>
                <p className="text-sm leading-relaxed text-[var(--text-color)]/90">
                  JavaScript numbers are 64-bit floats, which lose precision for
                  integers above 2<sup>53</sup> - 1.
                </p>
                <p className="text-sm leading-relaxed font-bold text-[var(--text-color)]">
                  To prevent data loss, <code>int64</code> and{" "}
                  <code>uint64</code> types MUST be encoded as strings in JSON.
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
