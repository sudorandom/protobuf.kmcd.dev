import { useState, useMemo, useCallback } from "react";
import {
  HelpCircle,
  Settings,
  Combine,
  AlertTriangle,
  ShieldCheck,
  FileCode,
  Database,
  Package,
  Code2,
  SearchCheck,
  Zap,
  CheckCircle2,
  Download,
  Terminal,
  Settings2,
} from "lucide-react";
import {
  fromJson,
  type DescMessage,
  fromBinary,
  toJson,
  type Registry,
  type FileRegistry,
} from "@bufbuild/protobuf";
import { FileDescriptorSetSchema } from "@bufbuild/protobuf/wkt";
import { createValidator, type Violation } from "@bufbuild/protovalidate";
import {
  Section,
  SectionTitle,
  CyberPanel,
  ExternalLinkText,
  SyntaxHighlighter,
  TechnicalNuance,
} from "../components/shared/Common";
import { JsonEditor } from "../components/shared/JsonEditor";
import { Modal } from "../components/shared/Modal";
import { generateFake } from "../utils/wasm-parser";
import { InteractiveSchemaEditor } from "../components/shared/InteractiveSchemaEditor";
import { DESCRIPTOR_PROTO, INITIAL_PROTO } from "../utils/constants";

const TopicSection = ({
  id,
  icon,
  title,
  subtitle,
  panelTitle,
  desc,
  example,
  bgClass = "bg-[var(--section-bg-dark)]",
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  panelTitle: string;
  desc: React.ReactNode;
  example: string;
  bgClass?: string;
}) => (
  <Section
    id={id}
    className={`py-24 px-4 sm:px-8 border-t border-[var(--border-light)] ${bgClass}`}
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

export const AdvancedProtobuf = () => {
  const topics = [
    {
      id: "imports",
      icon: FileCode,
      title: "Imports",
      subtitle: "03a_DEPENDENCIES",
      panelTitle: "DEPENDENCY_SCHEMA",
      desc: (
        <div className="space-y-4">
          <p>
            You can use definitions from other .proto files using the{" "}
            <code>import</code> statement. However, this is where many
            developers encounter the "Include Path Nightmare."
          </p>
          <div className="p-4 bg-[var(--text-error)]/5 border border-[var(--text-error)]/10 rounded text-sm space-y-3">
            <p className="leading-relaxed">
              The standard <code>protoc</code> compiler requires you to manually
              specify every include directory via <code>-I</code> (or{" "}
              <code>--proto_path</code>) flags. The compiler resolves files
              based on the current working directory combined with these flags.
            </p>
            <p className="leading-relaxed text-[var(--text-error)]">
              If your import paths are inconsistent across your project (e.g.,
              one file uses <code>import "proto/user.proto"</code> and another
              uses <code>import "user.proto"</code> depending on how{" "}
              <code>protoc</code> was invoked), the compiler will treat them as
              entirely different types. This commonly leads to baffling
              "Duplicate Symbol" errors or "Type not found" failures when
              compiling.
            </p>
          </div>
          <p>
            <ExternalLinkText href="https://buf.build/">Buf</ExternalLinkText>{" "}
            eliminates this by using a <code>buf.yaml</code> to define your
            deterministic module root. It handles imports gracefully, allows for
            remote dependencies (similar to NPM/Cargo), and ensures paths are
            always consistent across your entire team regardless of where the
            build command is run.
          </p>
        </div>
      ),
      example: `edition = "2023";

// Import another file
import "google/protobuf/timestamp.proto";
import "myproject/common.proto";

message Event {
  google.protobuf.Timestamp time = 1;
  myproject.Status status = 2;
}`,
    },
    {
      id: "any",
      icon: Package,
      title: "The Any Type",
      subtitle: "03b_DYNAMIC_DATA",
      panelTitle: "ANY_PAYLOAD",
      desc: (
        <div className="space-y-4">
          <p>
            Sometimes you need to pass dynamic data where the exact schema isn't
            known at compile time.
          </p>
          <p>
            <code>google.protobuf.Any</code> embeds an arbitrary serialized
            Protobuf message along with a URL that identifies its type (e.g.,{" "}
            <code>type.googleapis.com/mypackage.MyMessage</code>).
          </p>
          <p>
            When serialized to ProtoJSON, this type identifier is rendered as a
            special <code>@type</code> property alongside the standard JSON
            fields of the embedded message, allowing parsers to route the
            payload correctly.
          </p>
        </div>
      ),
      example: `// In Proto:
import "google/protobuf/any.proto";

message Event {
  google.protobuf.Any payload = 1;
}

// In ProtoJSON:
// {
//   "payload": {
//     "@type": "type.googleapis.com/demo.User",
//     "name": "Hiro"
//   }
// }`,
    },
    {
      id: "value",
      icon: Database,
      title: "The Value Type",
      subtitle: "03c_ARBITRARY_JSON",
      panelTitle: "VALUE_PAYLOAD",
      desc: (
        <div className="space-y-4">
          <p>
            If you are working with dynamic protobuf messages, use{" "}
            <code>Any</code>. However, if you are working with arbitrary
            structured JSON data that we don't want to model or is completely
            dynamic (like a schema-less JSON object), use{" "}
            <ExternalLinkText href="https://protobuf.dev/reference/protobuf/google.protobuf/#value">
              <code>google.protobuf.Value</code>
            </ExternalLinkText>{" "}
            or{" "}
            <ExternalLinkText href="https://protobuf.dev/reference/protobuf/google.protobuf/#struct">
              <code>google.protobuf.Struct</code>
            </ExternalLinkText>
            .
          </p>
          <p>
            A <code>Value</code> represents a dynamically typed value which can
            be either a null, a number, a string, a boolean, a recursive struct
            (object), or a list of values. It perfectly maps to any valid JSON
            structure.
          </p>
          <p>
            Use this sparingly, as it defeats the purpose of Protobuf's strong
            typing, but it's essential for integrating with schemaless NoSQL
            databases or passing untyped metadata blocks.
          </p>
        </div>
      ),
      example: `// In Proto:
import "google/protobuf/struct.proto";

message Event {
  // Represents any arbitrary JSON value
  google.protobuf.Value metadata = 1;
  
  // Represents specifically a JSON object
  google.protobuf.Struct custom_attributes = 2;
}

// In ProtoJSON:
// {
//   "metadata": "simple string or object",
//   "custom_attributes": {
//     "dynamic_key": [1, 2, 3],
//     "enabled": true
//   }
// }`,
    },
    {
      id: "fieldmask",
      icon: ShieldCheck,
      title: "FieldMask",
      subtitle: "03d_PARTIAL_UPDATES",
      panelTitle: "READ_UPDATE_MASKS",
      desc: (
        <div className="space-y-4">
          <p>
            <ExternalLinkText href="https://protobuf.dev/reference/protobuf/google.protobuf/#field-mask">
              <code>google.protobuf.FieldMask</code>
            </ExternalLinkText>{" "}
            is a well-known type used to identify a subset of fields in a
            request.
          </p>
          <p>
            It is extremely useful for <strong>partial updates (PATCH)</strong>,
            allowing a client to send only the modified fields instead of the
            entire object.
          </p>
          <p>
            Beyond updates, FieldMask is a powerful tool for{" "}
            <strong>tuning read responses</strong>. You can design a single{" "}
            <code>List</code> or <code>Get</code> response that supports many
            optional fields and associations (e.g., <code>user.profile</code>,{" "}
            <code>user.settings</code>). The client passes a{" "}
            <code>read_mask</code> to tell the server exactly which subset of
            data to return, eliminating "over-fetching" without needing multiple
            specialized endpoints.
          </p>
          <div className="p-3 bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded text-[var(--warning-text)] text-sm">
            <strong>Important:</strong> FieldMasks are <em>not automatic</em>.
            They are just a list of strings. The server must explicitly use the
            mask to filter database queries or prune the response message before
            sending.
          </div>
        </div>
      ),
      example: `import "google/protobuf/field_mask.proto";

message GetUserRequest {
  string id = 1;
  // Client requests only specific fields
  // e.g. ["name", "email", "metadata.last_login"]
  google.protobuf.FieldMask read_mask = 2;
}

message UpdateUserRequest {
  User user = 1;
  // Client identifies which fields to update
  google.protobuf.FieldMask update_mask = 2;
}`,
    },
    {
      id: "compat",
      icon: Combine,
      title: "Breaking Changes",
      subtitle: "03d_COMPATIBILITY_CLI",
      panelTitle: "CLI_BREAKING_CHECK",
      desc: (
        <div className="space-y-4">
          <p>
            Protobuf is strictly designed for forward and backward
            compatibility. However, there are strict rules about what you{" "}
            <strong>CANNOT</strong> change.
          </p>
          <p>
            As long as you follow the rules, old clients can read new messages
            (ignoring unknown fields), and new clients can read old messages
            (using default values for missing fields).
          </p>
          <div className="p-3 bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/20 rounded text-xs space-y-2">
            <p className="font-bold text-[var(--cyber-neon-blue)]">
              Automated Enforcement
            </p>
            <p className="text-[var(--text-color)]">
              Tools like{" "}
              <ExternalLinkText href="https://buf.build/docs/breaking/">
                <code>buf breaking</code>
              </ExternalLinkText>{" "}
              automate these checks by comparing your local changes against a
              previous version (e.g., your main branch) and failing if any
              wire-breaking changes are detected.
            </p>
          </div>
        </div>
      ),
      example: `// Check for breaking changes against main branch
$ buf breaking --against .git#branch=main

// Example failure output:
// user.proto:10:3: Field "1" changed type
//   from "string" to "int32".
// user.proto:12:3: Previously present
//   field "3" deleted.`,
    },
    {
      id: "linting",
      icon: SearchCheck,
      title: "Linting",
      subtitle: "03e_STANDARDS_CLI",
      panelTitle: "CLI_LINT_CHECK",
      desc: (
        <div className="space-y-4">
          <p>
            Linting ensures your schemas are consistent, readable, and follow
            industry best practices. This is vital in large organizations where
            hundreds of developers might be defining messages.
          </p>
          <p>
            Tools like{" "}
            <ExternalLinkText href="https://buf.build/">Buf</ExternalLinkText>{" "}
            and{" "}
            <ExternalLinkText href="https://github.com/yoheimuta/protolint">
              protolint
            </ExternalLinkText>{" "}
            enforce rules such as snake_case field names, PascalCase message
            names, and documentation requirements.
          </p>
        </div>
      ),
      example: `// Run linter
$ buf lint

// Output:
// user.proto:5:1: Field name "userID" should be
//   lower_snake_case, such as "user_id".
// user.proto:8:1: Message "user" should be
//   PascalCase, such as "User".`,
    },
    {
      id: "editions",
      icon: Code2,
      title: "Editions",
      subtitle: "03f_FUTURE",
      panelTitle: "EDITION_CONFIG",
      desc: (
        <div className="space-y-4">
          <p>
            <ExternalLinkText href="https://protobuf.dev/programming-guides/editions/">
              Protobuf Editions
            </ExternalLinkText>{" "}
            is the modern evolution of the language, replacing the old{" "}
            <code>proto2</code> and <code>proto3</code> syntax specifiers.
          </p>
          <p>
            Instead of massive, breaking syntax upgrades, Editions allows
            features to be added or deprecated gradually over time. A schema
            specifies its edition (e.g., <code>edition = "2023";</code>), giving
            developers fine-grained control over language features using the{" "}
            <code>features</code> option.
          </p>
        </div>
      ),
      example: `edition = "2023";

// Globally enforce field presence
option features.field_presence = EXPLICIT;

message User {
  // Optional fields are back
  string name = 1;
}`,
    },
    {
      id: "presence",
      icon: HelpCircle,
      title: "Field Presence",
      subtitle: "03g_OPTIONALITY",
      panelTitle: "PRESENCE_COMPARISON",
      desc: (
        <div className="space-y-4">
          <p>
            Field presence defines whether a receiver can distinguish between a
            field that was <strong>never set</strong> and one that was set to
            its <strong>default value</strong> (like <code>0</code> or{" "}
            <code>""</code>).
          </p>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-3 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded">
              <h5 className="text-[var(--cyber-neon-blue)] font-cyber text-xs uppercase mb-1">
                Proto3 (Implicit)
              </h5>
              <p className="text-xs text-[var(--text-dim)]">
                Scalar fields have implicit presence. If a value is{" "}
                <code>0</code>, it's not sent on the wire, and the receiver sees{" "}
                <code>0</code>. You can't tell if it was missing or explicitly
                zero.
              </p>
            </div>
            <div className="p-3 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded">
              <h5 className="text-[var(--cyber-neon-green)] font-cyber text-xs uppercase mb-1">
                Editions (Explicit)
              </h5>
              <p className="text-xs text-[var(--text-dim)]">
                By setting <code>features.field_presence = EXPLICIT</code>,
                presence is tracked for all fields. Receiving a zero means it
                was explicitly sent. If missing, the generated code provides{" "}
                <code>has_field()</code> checks.
              </p>
            </div>
          </div>
          <p className="text-xs italic text-[var(--text-dim)]">
            Editions 2023 allows you to mix and match behaviors or globally
            enforce one, finally resolving the "presence" debate that divided
            Proto2 and Proto3.
          </p>
        </div>
      ),
      example: `// Edition with Explicit Presence
edition = "2023";

message Profile {
  // Globally set explicit presence
  option features.field_presence = EXPLICIT;

  int32 views = 1; // has_views() is available
  string bio = 2;  // has_bio() is available
}

// Proto3 (Implicit)
syntax = "proto3";

message LegacyProfile {
  int32 views = 1; // No "has" check for scalars
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

export const DescriptorsAndReflection = () => {
  const [localFds, setLocalFds] = useState<Uint8Array | null>(null);
  const [localRegistry, setLocalRegistry] = useState<FileRegistry | null>(null);

  const handleCompileSuccess = useCallback(
    (result: {
      fds: Uint8Array;
      userFds: Uint8Array;
      registry: FileRegistry;
    }) => {
      setLocalFds(result.userFds);
      setLocalRegistry(result.registry);
    },
    [],
  );

  const descriptorJson = useMemo(() => {
    if (!localFds) return null;
    try {
      const message = fromBinary(FileDescriptorSetSchema, localFds);
      return JSON.stringify(
        toJson(FileDescriptorSetSchema, message, {
          registry: localRegistry ?? undefined,
        }),
        null,
        2,
      );
    } catch (e) {
      console.error("Failed to convert FDS to JSON:", e);
      return null;
    }
  }, [localFds, localRegistry]);

  const downloadBinary = () => {
    if (!localFds) return;
    const blob = new Blob([localFds.slice()], {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "descriptor.bin";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => {
    if (!descriptorJson) return;
    const blob = new Blob([descriptorJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "descriptor.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Section
      id="reflection"
      className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)] border-t border-[var(--border-light)]"
    >
      <div className="max-w-7xl mx-auto space-y-16">
        <div>
          <SectionTitle icon={Code2} subtitle="03i_REFLECTION">
            Descriptors & Reflection
          </SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6 text-[var(--text-color)]">
              <h3 className="text-xl font-cyber font-bold text-[var(--text-color)] uppercase">
                Schemas Describing Schemas
              </h3>
              <p className="text-sm leading-relaxed">
                When you run the Protobuf compiler (`protoc`), it doesn't just
                generate code. It can also output a binary representation of
                your schema called a <strong>FileDescriptorSet</strong>.
              </p>
              <p className="text-sm leading-relaxed">
                Fascinatingly, this `FileDescriptorSet` is itself a Protobuf
                message! Google defines a schema (
                <ExternalLinkText href="https://github.com/protocolbuffers/protobuf/blob/main/src/google/protobuf/descriptor.proto">
                  <code>descriptor.proto</code>
                </ExternalLinkText>
                ) that describes how to represent `.proto` files. This means you
                can use Protobuf tools to read and analyze Protobuf schemas
                dynamically at runtime.
              </p>
              <div className="p-4 bg-[var(--cyber-neon-blue)]/5 border border-[var(--cyber-neon-blue)]/10 rounded text-sm text-[var(--text-dim)] space-y-3">
                <p>
                  <strong>Why is this useful?</strong>
                </p>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <div className="w-1 h-1 bg-[var(--cyber-neon-blue)] mt-1.5 shrink-0"></div>{" "}
                    <strong>Dynamic Decoding:</strong> Tools like this web
                    explorer use descriptors to decode arbitrary binary data
                    without generating static code.
                  </li>
                  <li className="flex gap-2">
                    <div className="w-1 h-1 bg-[var(--cyber-neon-blue)] mt-1.5 shrink-0"></div>{" "}
                    <strong>Validation:</strong> Complex rule engines (like
                    protovalidate) use descriptors to apply constraints
                    dynamically.
                  </li>
                </ul>
              </div>
            </div>
            <CyberPanel title="DESCRIPTOR.PROTO (SNIPPET)">
              <div className="p-4 h-64 overflow-auto">
                <SyntaxHighlighter
                  language="proto"
                  code={`// The schema that describes a schema
message FileDescriptorSet {
  repeated FileDescriptorProto file = 1;
}

message FileDescriptorProto {
  optional string name = 1;
  optional string package = 2;
  repeated DescriptorProto message_type = 4;
  repeated EnumDescriptorProto enum_type = 5;
  // ...
}

message DescriptorProto {
  optional string name = 1;
  repeated FieldDescriptorProto field = 2;
  // ...
}`}
                />
              </div>
            </CyberPanel>
          </div>
        </div>

        <div className="pt-16 border-t border-[var(--border-light)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <InteractiveSchemaEditor
              initialValue={DESCRIPTOR_PROTO}
              defaultValue={DESCRIPTOR_PROTO}
              onCompileSuccess={handleCompileSuccess}
              title="SCHEMA_EDITOR (.proto)"
            />
            <div className="flex flex-col space-y-4">
              <CyberPanel
                title={
                  <div className="flex items-center gap-2">
                    DESCRIPTOR_OUTPUT
                    {localFds && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--cyber-neon-green)]" />
                    )}
                  </div>
                }
                headerExtra={
                  <div className="flex gap-2">
                    {localFds && (
                      <>
                        <button
                          onClick={downloadBinary}
                          className="px-2 py-0.5 text-xs font-mono rounded border border-[var(--cyber-neon-blue)]/50 text-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/10 hover:bg-[var(--cyber-neon-blue)]/20 transition-all uppercase flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> SAVE_PB
                        </button>
                        <button
                          onClick={downloadJson}
                          className="px-2 py-0.5 text-xs font-mono rounded border border-[var(--cyber-neon-pink)]/50 text-[var(--cyber-neon-pink)] bg-[var(--cyber-neon-pink)]/10 hover:bg-[var(--cyber-neon-pink)]/20 transition-all uppercase flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> SAVE_JSON
                        </button>
                      </>
                    )}
                  </div>
                }
              >
                <div className="h-[400px] lg:h-[500px] flex flex-col">
                  <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                    {descriptorJson ? (
                      <div className="flex-1 min-h-0">
                        <SyntaxHighlighter
                          language="json"
                          code={descriptorJson}
                          wrap
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-[var(--text-dim)] gap-4 py-20">
                        <Terminal className="w-12 h-12 opacity-20" />
                        <p className="font-cyber text-xs uppercase tracking-widest opacity-40 text-center">
                          Correct compilation errors
                          <br />
                          to view descriptor
                        </p>
                      </div>
                    )}
                  </div>
                  {localFds && (
                    <div className="p-4 border-t border-[var(--border-light)] bg-[var(--overlay-bg)]">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-[var(--cyber-neon-blue)]/10 rounded">
                          <Database className="w-4 h-4 text-[var(--cyber-neon-blue)]" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-xs font-cyber font-bold text-[var(--text-color)] uppercase tracking-wider">
                            Reflection Ready
                          </h5>
                          <p className="text-xs text-[var(--text-dim)] leading-relaxed uppercase">
                            This schema is now representable as a{" "}
                            <code>FileDescriptorSet</code> message, enabling
                            dynamic tools and reflection.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CyberPanel>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-16 border-t border-[var(--border-light)]">
          <CyberPanel title="SERVER_REFLECTION">
            <div className="p-4 space-y-4 overflow-x-auto">
              <SyntaxHighlighter
                language="proto"
                code={`// gRPC Server Reflection Protocol
package grpc.reflection.v1alpha;

service ServerReflection {
  // The reflection service is queried by clients to
  // discover the API surface of the server dynamically.
  rpc ServerReflectionInfo(stream ServerReflectionRequest)
      returns (stream ServerReflectionResponse);
}`}
              />
              <div className="mt-4 text-xs font-mono text-[var(--text-dim)]">
                Client: "What services do you have?"
                <br />
                Server: "I have User Service and Auth Service"
                <br />
                Client: "Send me the descriptors for User Service"
                <br />
                Server: *Sends FileDescriptorSet binary*
              </div>
            </div>
          </CyberPanel>
          <div className="space-y-6 text-[var(--text-color)]">
            <h3 className="text-xl font-cyber font-bold text-[var(--text-color)] uppercase flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[var(--cyber-neon-pink)]" />
              Server Reflection
            </h3>
            <p className="text-sm leading-relaxed">
              By combining the standardized RPC mechanism of gRPC with Protobuf
              Descriptors, servers can implement{" "}
              <strong>Server Reflection</strong>. This is a standardized service
              that allows clients to ask the server for its own schema.
            </p>
            <div className="space-y-4 text-sm">
              <h4 className="font-cyber font-bold text-[var(--cyber-neon-blue)] uppercase text-xs tracking-widest">
                The Ecosystem it Enables
              </h4>
              <ul className="list-disc pl-4 space-y-2">
                <li>
                  <strong>CLI Tools:</strong> Tools like{" "}
                  <ExternalLinkText href="https://github.com/fullstorydev/grpcurl">
                    <code>grpcurl</code>
                  </ExternalLinkText>{" "}
                  can interact with your server just like <code>curl</code> does
                  for REST, without needing you to share `.proto` files
                  beforehand.
                </li>
                <li>
                  <strong>GUI Clients:</strong> Postman, Insomnia, and Buf
                  Studio can dynamically generate UI forms for testing your APIs
                  by reading the reflected descriptors.
                </li>
              </ul>
            </div>
            <div className="p-3 bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded text-[var(--warning-text)] text-sm">
              <strong>Security Warning:</strong> Enabling Server Reflection on a
              public-facing API exposes your entire internal data model and
              service structure to the internet. It is highly recommended to{" "}
              <em>
                only enable reflection in development environments or internal
                private networks.
              </em>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export const SchemaEngineering = () => {
  const topics = [
    {
      id: "options",
      icon: Settings,
      title: "Standard Options",
      subtitle: "03h_BUILTINS",
      panelTitle: "OPTIONS_SNIPPET",
      desc: (
        <div className="space-y-4">
          <p>
            Protobuf comes with a wide range of built-in "options" that control
            everything from how code is generated to how data is mapped to JSON.
          </p>
          <p>
            Options are categorized by their scope: <strong>File</strong>{" "}
            (affects the whole file), <strong>Message</strong>,{" "}
            <strong>Field</strong>, or <strong>Service</strong>.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-sm">
            <li>
              <code>option go_package</code>: Defines the import path for
              generated Go code.
            </li>
            <li>
              <code>[deprecated = true]</code>: Marks a field as old/risky to
              use.
            </li>
            <li>
              <code>[json_name = "custom"]</code>: Changes the key used in JSON
              serialization.
            </li>
          </ul>
        </div>
      ),
      example: `edition = "2023";

// File-level option
option go_package = "github.com/example/v1";

message User {
  // Field-level options
  string user_id = 1 [json_name = "uid"];
  string old_field = 2 [deprecated = true];
}`,
    },
    {
      id: "annotations",
      icon: Combine,
      title: "Custom Extensions",
      subtitle: "03i_ANNOTATIONS",
      panelTitle: "CUSTOM_ANNOTATIONS",
      desc: (
        <div className="space-y-4">
          <p>
            Protobuf schemas are extensible. You can define custom "options"
            (often called annotations) to attach metadata to messages, fields,
            or services.
          </p>
          <p>
            These options provide instructions to compiler plugins (like
            generating validation code) or are read dynamically at runtime via
            reflection.
          </p>
          <div className="p-3 bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/20 rounded text-xs space-y-2">
            <p>
              <strong>
                <span className="text-[var(--cyber-neon-blue)]">
                  Historical Note:
                </span>
              </strong>{" "}
              Custom options were originally a <code>proto2</code> feature that
              uses the <code>extend</code> keyword. While <code>proto3</code>{" "}
              removed general-purpose extensions, it kept them for descriptor
              objects specifically so options would continue to work.
            </p>
            <p>
              <strong>
                <span className="text-[var(--cyber-neon-green)]">
                  The Future:
                </span>
              </strong>{" "}
              In <strong>Protobuf Editions</strong> (2023+), this distinction is
              removed. Editions allow native definition of options and introduce{" "}
              <code>features</code>, a specialized type of option used by the
              compiler itself to control behavior.
            </p>
          </div>
        </div>
      ),
      example: `// options.proto (Must be proto2 to define)
syntax = "proto2";
import "google/protobuf/descriptor.proto";

extend google.protobuf.FieldOptions {
  optional bool is_pii = 50001;
}

// user.proto (Modern Edition)
edition = "2023";
import "options.proto";

message User {
  string ssn = 1 [(is_pii) = true];
}`,
    },
    {
      id: "breaking-levels",
      icon: AlertTriangle,
      title: "Levels of Breakage",
      subtitle: "03j_COMPATIBILITY",
      panelTitle: "BREAKAGE_ANALYSIS",
      desc: (
        <div className="space-y-4">
          <p>
            Not all breaking changes are equal. Protobuf has three distinct
            layers of compatibility:
          </p>
          <ul className="list-disc pl-4 space-y-2 text-sm">
            <li>
              <strong>Wire Breakage:</strong> Changing a field number or using
              an incompatible type (e.g., <code>string</code> to{" "}
              <code>int32</code>). Causes catastrophic data corruption.{" "}
              <em>Never do this.</em>
            </li>
            <li>
              <strong>JSON Breakage:</strong> Renaming a field. It's safe on the
              wire, but clients expecting the old JSON key will fail. You can
              mitigate this using the <code>[json_name="old_name"]</code>{" "}
              annotation.
            </li>
            <li>
              <strong>Code Breakage:</strong> Changing a type in a
              wire-compatible way (e.g., <code>int32</code> to{" "}
              <code>int64</code>). The data transmits safely, but when
              developers update their generated code, their builds will fail
              until they update their types.
            </li>
          </ul>
        </div>
      ),
      example: `message Event {
  // Safe on wire, breaks JSON clients
  // unless you use json_name:
  string user_id = 1 [json_name="uid"];

  // Wire compatible, breaks builds
  // (from int32 to int64)
  int64 count = 2;
}`,
    },
    {
      id: "lifecycle",
      icon: ShieldCheck,
      title: "Deprecation",
      subtitle: "03k_EVOLUTION",
      panelTitle: "LIFECYCLE_SCHEMA",
      desc: (
        <div className="space-y-4">
          <p>
            You can never truly delete a field if it was ever in production.
            Instead, you manage its lifecycle:
          </p>
          <ol className="list-decimal pl-4 space-y-2 text-sm">
            <li>
              <strong>Deprecate:</strong> Add <code>[deprecated = true]</code>.
              This warns developers in their IDEs (via generated code
              annotations like <code>@Deprecated</code>) not to use it for new
              features.
            </li>
            <li>
              <strong>Stop Using:</strong> Wait until metrics show zero traffic
              using the field.
            </li>
            <li>
              <strong>Reserve:</strong> Remove the field entirely and add its
              number/name to a <code>reserved</code> block. This prevents future
              developers from accidentally reusing the number and corrupting old
              data that might still be in a database.
            </li>
          </ol>
        </div>
      ),
      example: `message Product {
  // Step 3: Block reuse permanently
  reserved 1, "old_price";

  // Step 1: Warn developers
  int32 price_cents = 2 [deprecated = true];
  
  // The new way
  int64 price_micros = 3;
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
          bgClass="bg-[var(--section-bg-alt)]/20"
        />
      ))}
    </>
  );
};

const VALIDATION_EXAMPLES = {
  VALID: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Hiro Protagonist",
    email: "hiro@metaverse.com",
    age: 30,
    role: 2,
    birthDate: { year: 1996, month: 1, day: 1 },
  },
  INVALID_AGE: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Hiro",
    email: "hiro@metaverse.com",
    age: 200,
    role: 2,
    birthDate: { year: 1996, month: 1, day: 1 },
  },
  INVALID_DATE: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Hiro",
    email: "hiro@metaverse.com",
    age: 30,
    role: 2,
    birthDate: { year: 1850, month: 13, day: 32 },
  },
  INVALID_EMAIL: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Hiro",
    email: "not-an-email",
    age: 30,
    role: 2,
  },
};

export const ValidationLab = ({
  messageSchema,
  fds,
  registry,
  protoSource,
  setProtoSource,
}: {
  messageSchema: DescMessage | null;
  fds: Uint8Array | null;
  registry: Registry | null;
  protoSource: string;
  setProtoSource: (s: string) => void;
}) => {
  const [activeExample, setActiveExample] = useState<
    keyof typeof VALIDATION_EXAMPLES | null
  >("VALID");
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(VALIDATION_EXAMPLES.VALID, null, 2),
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExampleChange = (key: keyof typeof VALIDATION_EXAMPLES) => {
    setActiveExample(key);
    setJsonInput(JSON.stringify(VALIDATION_EXAMPLES[key], null, 2));
  };

  const validator = useMemo(() => {
    return createValidator({
      registry: registry ?? undefined,
    });
  }, [registry]);

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
    <Section
      id="validation"
      className="py-24 px-4 sm:px-8 bg-[var(--section-bg-dark)] border-t border-[var(--border-light)]"
    >
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={ShieldCheck} subtitle="03l_PROTOVALIDATE">
          Data Validation
        </SectionTitle>

        <div className="mb-16 space-y-8">
          <div className="space-y-6 max-w-4xl">
            <h3 className="text-2xl font-cyber font-bold text-[var(--text-color)] uppercase">
              The Source of Truth
            </h3>
            <p className="text-[var(--text-dim)] leading-relaxed text-sm">
              Protobuf goes beyond simple types. With{" "}
              <ExternalLinkText href="https://protovalidate.com/">
                <strong>protovalidate</strong>
              </ExternalLinkText>
              , you can embed complex business rules directly into your schema
              using{" "}
              <ExternalLinkText href="https://cel.dev/">
                <strong>CEL</strong>
              </ExternalLinkText>
              .
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            {/* Left Column: Payload Input */}
            <div className="space-y-4 flex flex-col">
              <div className="flex items-center justify-between h-8">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-cyber font-bold text-[var(--text-color)] uppercase flex items-center gap-2 tracking-widest">
                    <Database className="w-4 h-4 text-[var(--cyber-neon-blue)]" />
                    Test Data (JSON)
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs font-cyber font-bold text-[var(--cyber-neon-blue)] hover:text-[var(--cyber-neon-blue)]/80 transition-colors uppercase flex items-center gap-1 group"
                  >
                    <Settings2 className="w-3 h-3 group-hover:rotate-45 transition-transform" />
                    Edit Schema
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                {(
                  Object.keys(VALIDATION_EXAMPLES) as Array<
                    keyof typeof VALIDATION_EXAMPLES
                  >
                ).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleExampleChange(key)}
                    className={`px-3 py-1 text-xs font-mono border transition-all rounded ${
                      activeExample === key
                        ? "bg-[var(--cyber-neon-blue)]/20 border-[var(--cyber-neon-blue)] text-[var(--cyber-neon-blue)]"
                        : "bg-[var(--overlay-bg)] border-[var(--border-light)] text-[var(--text-dim)] hover:border-white/30 hover:text-[var(--text-color)]"
                    }`}
                  >
                    {key}
                  </button>
                ))}
                <button
                  onClick={async () => {
                    if (!messageSchema || !fds) return;
                    try {
                      const fakeJson = await generateFake(
                        messageSchema.typeName,
                        fds,
                      );
                      setJsonInput(fakeJson);
                      setActiveExample(null);
                    } catch (e) {
                      console.error("Failed to generate faux data:", e);
                    }
                  }}
                  disabled={!messageSchema || !fds}
                  className="px-2 py-1 text-xs font-cyber font-bold border border-[var(--cyber-neon-pink)] bg-[var(--cyber-neon-pink)]/10 text-[var(--cyber-neon-pink)] hover:bg-[var(--cyber-neon-pink)]/20 transition-all flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed rounded uppercase tracking-wider"
                >
                  <Zap className="w-2.5 h-2.5" />
                  Randomize
                </button>
              </div>

              <CyberPanel
                title="JSON_INPUT"
                className="flex-1 min-h-[400px] flex flex-col"
              >
                <div className="flex-1 relative">
                  {validationResults.error &&
                    validationResults.error !== "NO_SCHEMA" && (
                      <div
                        className="absolute top-0 left-0 right-0 p-2 bg-[var(--text-error)]/10 border-b border-[var(--text-error)]/30 text-[var(--text-error)] text-xs font-mono z-30 break-words line-clamp-2"
                        title={validationResults.error}
                      >
                        {validationResults.error}
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

            {/* Right Column: Validation Results */}
            <div className="space-y-4 flex flex-col">
              <div className="flex items-center justify-between h-8">
                <h3 className="text-sm font-cyber font-bold text-[var(--text-color)] uppercase flex items-center gap-2 tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-[var(--cyber-neon-green)]" />
                  Rules Enforcement
                </h3>
              </div>

              <CyberPanel
                title="VALIDATION_STATUS"
                className="flex-1 min-h-[400px] flex flex-col"
              >
                <div className="flex-1 py-4 px-2 overflow-y-auto space-y-4 custom-scrollbar">
                  {validationResults.error ? (
                    <div className="p-4 bg-[var(--text-error)]/10 border border-[var(--text-error)]/30 text-[var(--text-error)] text-xs font-mono">
                      SCHEMA_MISMATCH: {validationResults.error}
                    </div>
                  ) : validationResults.results?.kind === "valid" ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 text-[var(--cyber-neon-green)] py-20">
                      <CheckCircle2 className="w-16 h-16 drop-shadow-[0_0_20px_rgba(0,255,159,0.2)]" />
                      <div className="flex flex-col items-center">
                        <span className="font-cyber text-sm uppercase tracking-[0.2em]">
                          Validation Passed
                        </span>
                        <span className="text-xs text-[var(--text-dim)] mt-2 uppercase text-center tracking-widest">
                          All contract terms satisfied
                        </span>
                      </div>
                    </div>
                  ) : validationResults.results?.kind === "invalid" ? (
                    <div className="grid grid-cols-1 gap-3 p-1">
                      {validationResults.results.violations.map(
                        (v: Violation, i: number) => (
                          <div
                            key={i}
                            className="p-3 bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded flex gap-3 animate-in fade-in slide-in-from-top-2"
                          >
                            <AlertTriangle className="w-4 h-4 text-[var(--cyber-neon-yellow)] shrink-0" />
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-mono text-[var(--cyber-neon-yellow)] uppercase tracking-wider">
                                {v.field.toString()}
                              </span>
                              <p className="text-sm text-[var(--text-color)]">
                                {v.message}
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-[var(--text-dim)] gap-4 opacity-40 py-20">
                      <ShieldCheck className="w-10 h-10" />
                      <p className="font-cyber text-xs uppercase tracking-widest text-center">
                        Waiting for
                        <br />
                        valid input
                      </p>
                    </div>
                  )}
                </div>
              </CyberPanel>
            </div>
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Validation Schema (.proto)"
        >
          <div className="space-y-6 h-full flex flex-col">
            <div className="text-sm text-[var(--text-dim)] leading-relaxed">
              Use <strong>protovalidate</strong> rules to enforce data
              integrity. Changes here update the validation logic in real-time.
            </div>
            <div className="flex-1 min-h-[500px]">
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
            </div>
          </div>
        </Modal>

        {/* Row 4: Pro Tip & External Playground */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-[var(--border-light)]/30 pt-8">
          <div className="md:col-span-2">
            <TechnicalNuance title="VALIDATION_STRATEGY">
              By putting validation in the schema, you ensure that every service
              enforcing the contract (Go, Java, TS) applies the same rules
              consistently. This eliminates "validation drift" across your
              microservices architecture.
            </TechnicalNuance>
          </div>
          <div className="p-4 bg-[var(--cyber-neon-cyan)]/5 border border-[var(--cyber-neon-cyan)]/20 rounded-lg text-sm flex flex-col justify-center hover:bg-[var(--cyber-neon-cyan)]/10 transition-colors group/dive">
            <span className="text-xs font-cyber font-bold text-[var(--cyber-neon-cyan)] uppercase mb-2 tracking-widest">
              Dive Deeper
            </span>
            <ExternalLinkText href="https://protovalidate.com/playground/">
              Official protovalidate Playground
            </ExternalLinkText>
          </div>
        </div>
      </div>
    </Section>
  );
};

const Advanced = ({
  messageSchema,
  fds,
  registry,
  protoSource,
  setProtoSource,
}: {
  messageSchema: DescMessage | null;
  fds: Uint8Array | null;
  registry: Registry | null;
  protoSource: string;
  setProtoSource: (s: string) => void;
}) => (
  <>
    <AdvancedProtobuf />
    <DescriptorsAndReflection />
    <SchemaEngineering />
    <ValidationLab
      messageSchema={messageSchema}
      fds={fds}
      registry={registry}
      protoSource={protoSource}
      setProtoSource={setProtoSource}
    />
  </>
);

export default Advanced;
