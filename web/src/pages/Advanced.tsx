import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Combine,
  AlertTriangle,
  ShieldCheck,
  Layers,
  FileCode,
  Database,
  Package,
  Code2,
  SearchCheck,
  Zap,
  X,
  CheckCircle2
} from 'lucide-react';
import { fromJson, type DescMessage } from '@bufbuild/protobuf';
import { createValidator, type Violation } from '@bufbuild/protovalidate';
import {
  Section,
  SectionTitle,
  CyberPanel,
  ExternalLinkText,
  SyntaxHighlighter
} from '../components/shared/Common';
import { SchemaEditor } from '../components/shared/SchemaEditor';
import { JsonEditor } from '../components/shared/JsonEditor';
import { createDynamicRegistry } from '../utils/dynamic-registry';
import { generateFake, type CompilationError } from '../utils/wasm-parser';

export const DeepDiveSection = () => {
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
      example: 'edition = "2023";\n\n// File-level option\noption go_package = "github.com/example/v1";\n\nmessage User {\n  // Field-level options\n  string user_id = 1 [json_name = "uid"];\n  string old_field = 2 [deprecated = true];\n}'
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
          <div className="p-3 bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/20 rounded text-xs space-y-2">
            <p><strong><span className="text-[var(--cyber-neon-blue)]">Historical Note:</span></strong> Custom options were originally a <code>proto2</code> feature that uses the <code>extend</code> keyword. While <code>proto3</code> removed general-purpose extensions, it kept them for descriptor objects specifically so options would continue to work.</p>
            <p><strong><span className="text-[var(--cyber-neon-green)]">The Future:</span></strong> In <strong>Protobuf Editions</strong> (2023+), this distinction is removed. Editions allow native definition of options and introduce <code>features</code>, a specialized type of option used by the compiler itself to control behavior.</p>
          </div>
        </div>
      ),
      example: '// options.proto (Must be proto2 to define)\nsyntax = "proto2";\nimport "google/protobuf/descriptor.proto";\n\nextend google.protobuf.FieldOptions {\n  optional bool is_pii = 50001;\n}\n\n// user.proto (Modern Edition)\nedition = "2023";\nimport "options.proto";\n\nmessage User {\n  string ssn = 1 [(is_pii) = true];\n}'
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
    <Section id="deepdive" className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)]/20 border-t border-[var(--border-light)]">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Layers} subtitle="03b_ENGINEERING">Schema Engineering</SectionTitle>

        <div className="flex flex-col lg:flex-row gap-12 min-h-[400px]">
          {/* Left Nav */}
          <div className="w-full lg:w-64 flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all text-left group ${activeTab === tab.id
                  ? 'bg-[var(--cyber-neon-green)] border-[var(--cyber-neon-green)] text-black shadow-[0_0_15px_rgba(0,255,159,0.3)]'
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

export const AdvancedProtobuf = () => {
  const [activeTab, setActiveTab] = useState('imports');

  const tabs = [
    {
      id: 'imports',
      label: 'Imports',
      icon: FileCode,
      title: 'Dependency Management',
      desc: (
        <div className="space-y-4">
          <p>
            You can use definitions from other .proto files using the <code>import</code> statement. However, this is where many developers encounter the "Include Path Nightmare."
          </p>
          <div className="p-4 bg-[var(--text-error)]/5 border border-[var(--text-error)]/10 rounded text-sm space-y-3">
            <p className="leading-relaxed">
              The standard <code>protoc</code> compiler requires you to manually specify every include directory via <code>-I</code> (or <code>--proto_path</code>) flags. The compiler resolves files based on the current working directory combined with these flags.
            </p>
            <p className="leading-relaxed text-[var(--text-error)]">
              If your import paths are inconsistent across your project (e.g., one file uses <code>import "proto/user.proto"</code> and another uses <code>import "user.proto"</code> depending on how <code>protoc</code> was invoked), the compiler will treat them as entirely different types. This commonly leads to baffling "Duplicate Symbol" errors or "Type not found" failures when compiling.
            </p>
          </div>
          <p>
            <ExternalLinkText href="https://buf.build/">Buf</ExternalLinkText> eliminates this by using a <code>buf.yaml</code> to define your deterministic module root. It handles imports gracefully, allows for remote dependencies (like NPM/Cargo), and ensures paths are always consistent across your entire team regardless of where the build command is run.
          </p>
        </div>
      ),
      example: 'edition = "2023";\n\n// Import another file\nimport "google/protobuf/timestamp.proto";\nimport "myproject/common.proto";\n\nmessage Event {\n  google.protobuf.Timestamp time = 1;\n  myproject.Status status = 2;\n}'
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
          <div className="p-3 bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded text-[var(--warning-text)] text-sm">
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
            Protobuf is strictly designed for forward and backward compatibility. However, there are strict rules about what you <strong>CANNOT</strong> change.
          </p>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-[var(--text-error)]/5 border border-[var(--text-error)]/20 rounded text-xs space-y-3">
              <p className="font-bold text-[var(--text-error)]">Wire-Breaking (NEVER DO THIS):</p>
              <ul className="list-disc pl-4 space-y-1 text-[var(--text-color)]">
                <li>Changing a <strong>Field Number</strong> (e.g., moving <code>id</code> from 1 to 2).</li>
                <li>Reusing a <strong>Field Number</strong> for a new field without reserving it first, leading to data corruption for old clients.</li>
                <li>Changing a field type to an incompatible wire type (e.g., <code>string</code> to <code>int32</code>).</li>
                <li>Changing the type of a field in a way that changes its binary representation (e.g., <code>int32</code> to <code>fixed32</code>).</li>
              </ul>
            </div>
            <div className="p-4 bg-[var(--cyber-neon-green)]/5 border border-[var(--cyber-neon-green)]/20 rounded text-xs space-y-3">
              <p className="font-bold text-[var(--cyber-neon-green)]">Safe Operations:</p>
              <ul className="list-disc pl-4 space-y-1 text-[var(--text-color)]">
                <li>Adding new fields with <strong>new numbers</strong>.</li>
                <li>Renaming a field (this may break JSON clients, but is safe on the wire).</li>
                <li>Deleting a field (as long as you use the <code>reserved</code> keyword to prevent future reuse of its number/name).</li>
                <li>Changing between compatible types (e.g., <code>int32</code> to <code>int64</code>).</li>
              </ul>
            </div>
          </div>
          <p>
            As long as you follow these rules, old clients can read new messages (ignoring unknown fields), and new clients can read old messages (using default values for missing fields).
          </p>
          <div className="p-3 bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/20 rounded text-xs space-y-2">
            <p className="font-bold text-[var(--cyber-neon-blue)]">Automated Enforcement</p>
            <p className="text-[var(--text-color)]">
              Tools like <ExternalLinkText href="https://buf.build/docs/breaking/"><code>buf breaking</code></ExternalLinkText> automate these checks by comparing your local changes against a previous version (e.g., your main branch) and failing if any wire-breaking changes are detected.
            </p>
          </div>
        </div>
      ),
      example: '// Check for breaking changes against main branch\n$ buf breaking --against .git#branch=main\n\n// Example failure output:\n// user.proto:10:3: Field "1" changed type\n//   from "string" to "int32".\n// user.proto:12:3: Previously present\n//   field "3" deleted.'
    },
    {
      id: 'linting',
      label: 'Linting',
      icon: SearchCheck,
      title: 'Enforcing Standards',
      desc: (
        <div className="space-y-4">
          <p>
            Linting ensures your schemas are consistent, readable, and follow industry best practices. This is vital in large organizations where hundreds of developers might be defining messages.
          </p>
          <p>
            Tools like <ExternalLinkText href="https://buf.build/">Buf</ExternalLinkText> and <ExternalLinkText href="https://github.com/yoheimuta/protolint">protolint</ExternalLinkText> enforce rules such as:
          </p>
          <ul className="list-disc pl-4 space-y-2 text-sm text-[var(--text-color)]">
            <li><strong>Naming:</strong> Fields should be <code>snake_case</code>, messages should be <code>PascalCase</code>.</li>
            <li><strong>Structure:</strong> Enforce the use of <code>package</code> statements and directory matching.</li>
            <li><strong>Documentation:</strong> Require comments on all public messages and fields.</li>
            <li><strong>Best Practices:</strong> Avoid using <code>required</code> (in proto2) or deeply nested messages.</li>
          </ul>
        </div>
      ),
      example: '// Run linter\n$ buf lint\n\n// Output:\n// user.proto:5:1: Field name "userID" should be\n//   lower_snake_case, such as "user_id".\n// user.proto:8:1: Message "user" should be\n//   PascalCase, such as "User".'
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
    <Section id="advanced" className="py-24 px-4 sm:px-8 bg-[var(--section-bg-dark)] border-t border-[var(--border-light)]">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Layers} subtitle="03_ADVANCED">Advanced Protobuf</SectionTitle>

        <div className="flex flex-col-reverse lg:flex-row gap-12 min-h-[400px]">
          {/* Content Area */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-cyber font-bold text-[var(--text-color)] uppercase">{current.title}</h3>
                <div className="text-[var(--text-dim)] leading-relaxed text-sm">{current.desc}</div>
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
                  ? 'bg-[var(--cyber-neon-pink)] border-[var(--cyber-neon-pink)] text-black shadow-[0_0_15px_rgba(255,0,255,0.3)]'
                  : 'bg-[var(--overlay-bg)] border-[var(--border-light)] text-[var(--text-dim)] hover:border-white/20 hover:text-[var(--text-color)]'
                  }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-black' : 'text-[var(--text-dim)] group-hover:text-[var(--text-dim)]'}`} />
                <span className="font-cyber font-bold text-sm tracking-widest uppercase">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export const DescriptorsAndReflection = () => (
  <Section id="reflection" className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)] border-t border-[var(--border-light)]">
    <div className="max-w-7xl mx-auto space-y-16">
      <div>
        <SectionTitle icon={Code2} subtitle="03a_REFLECTION">Descriptors & Reflection</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6 text-[var(--text-color)]">
            <h3 className="text-xl font-cyber font-bold text-[var(--text-color)] uppercase">Schemas Describing Schemas</h3>
            <p className="text-sm leading-relaxed">
              When you run the Protobuf compiler (`protoc`), it doesn't just generate code. It can also output a binary representation of your schema called a <strong>FileDescriptorSet</strong>.
            </p>
            <p className="text-sm leading-relaxed">
              Fascinatingly, this `FileDescriptorSet` is itself a Protobuf message! Google defines a schema (<ExternalLinkText href="https://github.com/protocolbuffers/protobuf/blob/main/src/google/protobuf/descriptor.proto"><code>descriptor.proto</code></ExternalLinkText>) that describes how to represent `.proto` files. This means you can use Protobuf tools to read and analyze Protobuf schemas dynamically at runtime.
            </p>
            <div className="p-4 bg-[var(--cyber-neon-blue)]/5 border border-[var(--cyber-neon-blue)]/10 rounded text-sm text-[var(--text-dim)] space-y-3">
              <p><strong>Why is this useful?</strong></p>
              <ul className="space-y-2">
                <li className="flex gap-2"><div className="w-1 h-1 bg-[var(--cyber-neon-blue)] mt-1.5 shrink-0"></div> <strong>Dynamic Decoding:</strong> Tools like this web explorer use descriptors to decode arbitrary binary data without generating static code.</li>
                <li className="flex gap-2"><div className="w-1 h-1 bg-[var(--cyber-neon-blue)] mt-1.5 shrink-0"></div> <strong>Validation:</strong> Complex rule engines (like protovalidate) use descriptors to apply constraints dynamically.</li>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-16 border-t border-[var(--border-light)]">
        <CyberPanel title="SERVER_REFLECTION">
          <div className="p-4 space-y-4 overflow-x-auto">
            <SyntaxHighlighter language="proto" code={`// gRPC Server Reflection Protocol\npackage grpc.reflection.v1alpha;\n\nservice ServerReflection {\n  // The reflection service is queried by clients to\n  // discover the API surface of the server dynamically.\n  rpc ServerReflectionInfo(stream ServerReflectionRequest)\n      returns (stream ServerReflectionResponse);\n}`} />
            <div className="mt-4 text-xs font-mono text-[var(--text-dim)]">
              Client: "What services do you have?"<br />
              Server: "I have User Service and Auth Service"<br />
              Client: "Send me the descriptors for User Service"<br />
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
            By combining the standardized RPC mechanism of gRPC with Protobuf Descriptors, servers can implement <strong>Server Reflection</strong>. This is a standardized service that allows clients to ask the server for its own schema.
          </p>
          <div className="space-y-4 text-sm">
            <h4 className="font-cyber font-bold text-[var(--cyber-neon-blue)] uppercase text-xs tracking-widest">The Ecosystem it Enables</h4>
            <ul className="list-disc pl-4 space-y-2">
              <li><strong>CLI Tools:</strong> Tools like <ExternalLinkText href="https://github.com/fullstorydev/grpcurl"><code>grpcurl</code></ExternalLinkText> can interact with your server just like <code>curl</code> does for REST, without needing you to share `.proto` files beforehand.</li>
              <li><strong>GUI Clients:</strong> Postman, Insomnia, and Buf Studio can dynamically generate UI forms for testing your APIs by reading the reflected descriptors.</li>
            </ul>
          </div>
          <div className="p-3 bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded text-[var(--warning-text)] text-sm">
            <strong>Security Warning:</strong> Enabling Server Reflection on a public-facing API exposes your entire internal data model and service structure to the internet. It is highly recommended to <em>only enable reflection in development environments or internal private networks.</em>
          </div>
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
        className="relative w-full max-w-5xl bg-[var(--panel-bg)] border border-[var(--cyber-neon-blue)]/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.1)] flex flex-col max-h-[90vh]"
      >
        <div className="p-4 border-b border-[var(--border-light)] flex items-center justify-between bg-[var(--overlay-bg)]">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-[var(--cyber-neon-blue)]" />
            <h2 className="font-cyber font-bold text-[var(--text-color)] uppercase tracking-wider">Edit_Protobuf_Schema</h2>
            {isValidating && (
              <div className="flex items-center gap-2 ml-4">
                <div className="w-2 h-2 bg-[var(--cyber-neon-blue)] rounded-full animate-pulse" />
                <span className="text-xs font-mono text-[var(--cyber-neon-blue)]/80 uppercase tracking-widest">Validating...</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--border-light)] rounded-lg transition-colors group">
            <X className="w-5 h-5 text-[var(--text-dim)] group-hover:text-[var(--text-color)]" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-4">
          <SchemaEditor value={localValue} onChange={setLocalValue} errors={localErrors} />
          {localErrors.length > 0 && (
            <div className="mt-4 space-y-2 overflow-y-auto max-h-32">
              {localErrors.map((err, i) => (
                <div key={i} className="p-3 bg-[var(--text-error)]/10 border border-[var(--text-error)]/30 rounded text-[var(--text-error)] text-xs font-mono">
                  [LINE {err.line}] {err.message}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-[var(--overlay-bg)] border-t border-[var(--border-light)] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-[var(--text-dim)]">
            <ExternalLinkText href="https://protovalidate.com/schemas/standard-rules/">View Standard Rules Documentation</ExternalLinkText>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <button
              onClick={onClose}
              className="w-full md:w-auto px-6 py-2 border border-[var(--border-light)] text-[var(--text-dim)] font-cyber font-bold hover:bg-[var(--overlay-bg)] hover:text-[var(--text-color)] transition-all text-xs rounded-md"
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
              className="w-full md:w-auto px-6 sm:px-10 py-2 bg-[var(--cyber-neon-blue)] border border-[var(--cyber-neon-blue)] text-black font-cyber font-bold hover:bg-[var(--cyber-neon-blue)]/90 transition-all text-xs shadow-[0_0_20px_rgba(0,243,255,0.4)] disabled:opacity-30 disabled:cursor-not-allowed rounded-md"
            >
              APPLY_CHANGES
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const ValidationLab = ({ messageSchema, fds, protoSource, setProtoSource }: {
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
    <Section id="validation" className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)] border-t border-[var(--border-light)]">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={ShieldCheck} subtitle="03c_PROTOVALIDATE">Data Validation</SectionTitle>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-xl font-cyber font-bold text-[var(--text-color)] uppercase">The Source of Truth</h3>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              Protobuf goes beyond simple types. With <ExternalLinkText href="https://protovalidate.com/"><strong>protovalidate</strong></ExternalLinkText>, you can embed complex business rules directly into your schema using <ExternalLinkText href="https://cel.dev/"><strong>CEL</strong></ExternalLinkText>.
            </p>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              Define constraints like <code>min_len</code>, <code>email</code>, or custom rules to ensure your data adheres to the contract across all services.
            </p>

            <CyberPanel
              title="SCHEMA_EDITOR (.proto)"
              headerExtra={
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 text-xs font-cyber font-bold text-[var(--cyber-neon-blue)] hover:text-[var(--cyber-neon-blue)]/80 transition-colors uppercase"
                >
                  <Settings className="w-3 h-3" />
                  OPEN_EDITOR
                </button>
              }
            >
              <div className="h-64 overflow-hidden relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10 backdrop-blur-none group-hover:backdrop-blur-[2px]">
                  <span className="px-5 py-2.5 bg-[var(--cyber-neon-blue)] border border-[var(--cyber-neon-blue)] text-black font-cyber font-bold text-xs shadow-[0_0_20px_rgba(0,243,255,0.4)] rounded-md">EDIT_SCHEMA</span>
                </div>
                <div className="p-4 opacity-80 grayscale group-hover:opacity-20 transition-all duration-300">
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
            <h3 className="text-xl font-cyber font-bold text-[var(--text-color)] uppercase">Interactive Playground</h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(VALIDATION_EXAMPLES) as Array<keyof typeof VALIDATION_EXAMPLES>).map((key) => (
                    <button
                      key={key}
                      onClick={() => handleExampleChange(key)}
                      className={`px-3 py-1 text-xs font-cyber font-bold border transition-all rounded-md ${activeExample === key
                        ? 'bg-[var(--cyber-neon-blue)] border-[var(--cyber-neon-blue)] text-black shadow-[0_0_10px_rgba(0,243,255,0.3)]'
                        : 'bg-[var(--overlay-bg)] border-[var(--border-light)] text-[var(--text-dim)] hover:border-white/30 hover:text-[var(--text-color)]'
                        }`}
                    >
                      {key}
                    </button>
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
                  className="px-3 py-1.5 text-xs font-cyber font-bold border border-[var(--cyber-neon-pink)] bg-[var(--cyber-neon-pink)] text-black hover:bg-[var(--cyber-neon-pink)]/90 transition-all flex items-center gap-1 disabled:opacity-30 rounded-md shadow-[0_0_15px_rgba(255,0,255,0.4)]"
                >
                  <Zap className="w-3.5 h-3.5" />
                  GENERATE_DATA
                </button>              </div>
              <CyberPanel title="TEST_DATA (JSON)">
                <div className="relative h-64">
                  {validationResults.error && validationResults.error !== "NO_SCHEMA" && (
                    <div className="absolute top-0 left-0 right-0 p-2 bg-[var(--text-error)]/10 border-b border-[var(--text-error)]/30 text-[var(--text-error)] text-xs font-mono z-30 break-words line-clamp-2" title={validationResults.error}>
                      {validationResults.error}
                    </div>
                  )}
                  <JsonEditor value={jsonInput} onChange={setJsonInput} className="h-full rounded-none border-none bg-transparent" />
                </div>
              </CyberPanel>
            </div>

            <CyberPanel title="VALIDATION_OUTPUT">
              <div className="h-48 overflow-y-auto space-y-4 pr-2 p-2">
                {validationResults.error ? (
                  <div className="p-4 bg-[var(--text-error)]/10 border border-[var(--text-error)]/30 text-[var(--text-error)] text-xs font-mono">SCHEMA_MISMATCH: {validationResults.error}</div>
                ) : (validationResults.results?.violations?.length ?? 0) === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--cyber-neon-green)]">
                    <CheckCircle2 className="w-12 h-12" />
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-sm uppercase tracking-widest">Validation Passed</span>
                      <span className="text-xs text-[var(--text-dim)] mt-1 uppercase">Contract terms satisfied</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {validationResults.results?.violations?.map((v: Violation, i: number) => (
                      <div key={i} className="p-3 bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded flex gap-3">
                        <AlertTriangle className="w-4 h-4 text-[var(--cyber-neon-yellow)] shrink-0" />
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-mono text-[var(--cyber-neon-yellow)] uppercase">{v.field.toString()}</span>
                          <p className="text-sm text-[var(--text-color)]">{v.message}</p>
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
          <div className="md:col-span-2 p-4 bg-[var(--cyber-neon-yellow)]/5 border border-[var(--cyber-neon-yellow)]/10 rounded text-sm text-[var(--text-dim)]">
            <p><strong>Pro Tip:</strong> By putting validation in the schema, you ensure that every service enforcing the contract (Go, Java, TS) applies the same rules consistently. This is easier to implement in languages with robust CEL support.</p>
          </div>
          <div className="p-4 bg-[var(--cyber-neon-cyan)]/5 border border-[var(--cyber-neon-cyan)]/20 rounded-lg text-sm flex flex-col justify-center hover:bg-[var(--cyber-neon-cyan)]/10 transition-colors group/dive">
            <span className="text-xs font-cyber font-bold text-[var(--cyber-neon-cyan)] uppercase mb-2 tracking-widest">Dive Deeper</span>
            <ExternalLinkText href="https://protovalidate.com/playground/">Official protovalidate Playground</ExternalLinkText>
          </div>
        </div>
      </div>
    </Section>
  );
};

const Advanced = ({ messageSchema, fds, protoSource, setProtoSource }: {
  messageSchema: DescMessage | null,
  fds: Uint8Array | null,
  protoSource: string,
  setProtoSource: (s: string) => void
}) => (
  <>
    <AdvancedProtobuf />
    <DescriptorsAndReflection />
    <DeepDiveSection />
    <ValidationLab messageSchema={messageSchema} fds={fds} protoSource={protoSource} setProtoSource={setProtoSource} />
  </>
);

export default Advanced;
