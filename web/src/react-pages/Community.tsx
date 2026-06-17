import {
  GitBranch,
  Layers,
  SearchCheck,
  Zap,
  Code2,
  Box,
  Braces,
  ArrowRight,
} from "lucide-react";
import {
  Section,
  SectionTitle,
  CyberPanel,
  ExternalLinkText,
} from "../components/shared/Common";

export const VersionTimeline = () => {
  const versions = [
    {
      year: "2001",
      version: "INTERNAL",
      title: "Google Internal Launch",
      desc: "Protobuf was born inside Google to solve the overhead of XML. It quickly became the standard for all internal communication.",
      icon: GitBranch,
      color: "var(--text-dim)",
      href: "https://protobuf.dev/overview/#history",
    },
    {
      year: "2008",
      version: "PROTO2",
      title: "Public Open Source",
      desc: 'First public release. Introduced the complex "required" fields and a powerful extension system.',
      icon: Layers,
      color: "var(--cyber-neon-blue)",
      href: "https://opensource.googleblog.com/2008/07/protocol-buffers-googles-data.html",
    },
    {
      year: "2016",
      version: "PROTO3",
      title: "Modern Standardization",
      desc: 'Simplified the language. Removed "required" fields, standardized JSON mapping, and enabled better cross-platform support.',
      icon: Zap,
      color: "var(--cyber-neon-pink)",
      href: "https://github.com/protocolbuffers/protobuf/releases/tag/v3.0.0",
    },
    {
      year: "2023",
      version: "EDITIONS",
      title: "The Future of Proto",
      desc: 'The biggest architectural shift in years. Moves away from "versions" to a flexible system of "features".',
      icon: Code2,
      color: "var(--cyber-neon-green)",
      href: "https://protobuf.dev/news/2023-06-29/",
    },
  ];

  return (
    <Section
      id="ecosystem"
      className="py-24 px-4 sm:px-8 bg-[var(--section-bg-dark)] border-t border-[var(--border-light)]"
    >
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={GitBranch} subtitle="06_HISTORY" asH1={true}>
          Major Versions
        </SectionTitle>

        <div className="mb-16 space-y-4">
          <p className="text-[var(--text-dim)] leading-relaxed">
            Protocol Buffers has evolved over two decades, transitioning from a
            performance-critical internal tool at Google to the foundational
            layer for modern distributed systems worldwide.
          </p>
          <p className="text-[var(--text-dim)] leading-relaxed">
            While the core philosophy has remained constant, the language has
            evolved to support more platforms and complex engineering needs.
          </p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--cyber-neon-blue)] via-[var(--cyber-neon-pink)] to-[var(--cyber-neon-green)] opacity-30" />

          <div className="space-y-12">
            {versions.map((v, i) => (
              <div
                key={v.version}
                className={`relative flex items-center gap-8 md:gap-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                {/* Content */}
                <div className="flex-1 ml-12 md:ml-0 md:px-12">
                  <div
                    className="p-6 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl transition-all group hover:border-(--hover-color)"
                    style={
                      {
                        "--hover-color": `color-mix(in srgb, ${v.color}, transparent 50%)`,
                      } as React.CSSProperties
                    }
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="font-mono text-sm font-bold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${v.color}, transparent 80%)`,
                          color: v.color,
                        }}
                      >
                        {v.version}
                      </span>
                      <span className="text-sm font-mono text-[var(--text-dim)]">
                        {v.year}
                      </span>
                    </div>
                    <h2 className="text-lg font-cyber font-bold text-[var(--text-color)] uppercase mb-2 group-hover:text-[var(--text-color)] transition-colors">
                      {v.title}
                    </h2>
                    <p className="text-sm text-[var(--text-dim)] leading-relaxed mb-4">
                      {v.desc}
                    </p>
                    <ExternalLinkText href={v.href}>
                      View Details
                    </ExternalLinkText>
                  </div>
                </div>

                {/* Dot */}
                <div
                  className="absolute left-4 md:left-1/2 -translate-x-1/2 w-10 h-10 bg-[var(--panel-bg)] border-2 rounded-full flex items-center justify-center z-10"
                  style={{ borderColor: v.color }}
                >
                  <v.icon className="w-5 h-5" style={{ color: v.color }} />
                </div>

                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export const PoweringTheIndustry = () => {
  const projects = [
    {
      name: "Google",
      desc: "Google's API design guidance is built around resource-oriented APIs with Protobuf service definitions and HTTP/JSON transcoding.",
      url: "https://cloud.google.com/apis/docs/http",
    },
    {
      name: "Kubernetes",
      desc: "Kubernetes documents Protobuf as an alternate API encoding for built-in resources, alongside JSON.",
      url: "https://kubernetes.io/docs/reference/using-api/api-concepts/#protobuf-encoding",
    },
    {
      name: "Envoy Proxy",
      desc: "Envoy's xDS APIs and configuration resources are published as versioned Protobuf API references.",
      url: "https://www.envoyproxy.io/docs/envoy/latest/api/api",
    },
    {
      name: "Docker / Swarm",
      desc: "SwarmKit keeps its control-plane API definitions in Protobuf schemas in the project source.",
      url: "https://github.com/moby/swarmkit/tree/master/api",
    },
    {
      name: "Vitess",
      desc: "Vitess publishes Protobuf definitions for its query, tablet, topology, and automation APIs.",
      url: "https://github.com/vitessio/vitess/tree/main/proto",
    },
    {
      name: "Etcd",
      desc: "Etcd exposes a gRPC API with a gRPC-gateway that maps HTTP/JSON onto the same API surface.",
      url: "https://etcd.io/docs/v3.5/dev-guide/api_grpc_gateway/",
    },
    {
      name: "TiDB",
      desc: "The TiDB/TiKV ecosystem maintains shared Protobuf definitions for distributed storage APIs in kvproto.",
      url: "https://github.com/pingcap/kvproto",
    },
    {
      name: "OpenTelemetry",
      desc: "OpenTelemetry defines its cross-language telemetry data protocol in shared Protobuf schemas.",
      url: "https://github.com/open-telemetry/opentelemetry-proto",
    },
    {
      name: "Temporal",
      desc: "Temporal publishes the API definitions for its workflow platform as Protobuf schemas.",
      url: "https://github.com/temporalio/api",
    },
  ];

  return (
    <Section
      id="industry"
      className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)]/10 border-t border-[var(--border-light)]"
    >
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Box} subtitle="06b_ADOPTION">
          Powering the Industry
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p.name}
              className="p-6 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl hover:border-[var(--cyber-neon-blue)]/50 transition-all group"
            >
              <h2 className="font-cyber font-bold text-[var(--cyber-neon-blue)] uppercase mb-2 tracking-wider text-base">
                {p.name}
              </h2>
              <p className="text-sm text-[var(--text-dim)] leading-relaxed mb-4">
                {p.desc}
              </p>
              <ExternalLinkText href={p.url}>View Project</ExternalLinkText>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export const Toolbox = () => {
  interface ToolLink {
    label: string;
    url: string;
  }

  interface Tool {
    name: string;
    desc: string;
    url?: string;
    links?: ToolLink[];
  }

  const tools: Tool[] = [
    {
      name: "Buf CLI",
      desc: "The modern standard for Protobuf management. Includes a linter, formatter, breaking change detector, editor LSP support, and a high-performance code generator.",
      url: "https://buf.build/docs/introduction",
    },
    {
      name: "protolint",
      desc: "A highly configurable linter for Protocol Buffer files to ensure style consistency and best practices.",
      url: "https://github.com/yoheimuta/protolint",
    },
    {
      name: "Google API Linter",
      desc: "Check your API design against Google's API Improvement Proposals (AIPs) to ensure industry-standard naming and patterns.",
      url: "https://github.com/googleapis/api-linter",
    },
    {
      name: "protovalidate",
      desc: "Runtime validation for Protobuf messages using rules defined directly in your .proto files.",
      url: "https://github.com/bufbuild/protovalidate",
    },
    {
      name: "Plumber",
      desc: "CLI tool for inspecting and routing messages in Kafka, RabbitMQ, and SQS with native on-the-fly Protobuf decoding.",
      url: "https://github.com/streamdal/plumber",
    },
  ];

  const plugins = [
    {
      name: "protoc-gen-doc",
      desc: "Generates beautiful documentation (HTML, Markdown, PDF) from your .proto files.",
      url: "https://github.com/pseudomuto/protoc-gen-doc",
    },
    {
      name: "protoc-gen-connect-openapi",
      desc: "Generates high-quality OpenAPI 3.x definitions from your Protobuf services, with excellent support for ConnectRPC and gRPC-Gateway.",
      url: "https://github.com/sudorandom/protoc-gen-connect-openapi",
    },
    {
      name: "protoc-gen-jsonschema",
      desc: "Generates JSON Schema definitions from your Protobuf messages, so you can use them with JSON-based validation tools.",
      url: "https://github.com/bufbuild/protoschema-plugins",
    },
    {
      name: "protoc-gen-grpc-gateway",
      desc: "Automatically generates a reverse proxy server that translates RESTful JSON APIs into gRPC, allowing you to support both protocols easily.",
      url: "https://github.com/grpc-ecosystem/grpc-gateway",
    },
  ];

  return (
    <Section
      id="toolbox"
      className="py-24 px-4 sm:px-8 bg-[var(--section-bg-dark)] border-t border-[var(--border-light)]"
    >
      <div className="max-w-7xl mx-auto space-y-16">
        <div>
          <SectionTitle icon={Zap} subtitle="06c_TOOLING">
            The Toolbox
          </SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((t) => (
              <CyberPanel key={t.name} title={t.name}>
                <div className="p-4 space-y-4">
                  <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                    {t.desc}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {t.links ? (
                      t.links.map((l) => (
                        <ExternalLinkText key={l.label} href={l.url}>
                          {l.label}
                        </ExternalLinkText>
                      ))
                    ) : (
                      <ExternalLinkText href={t.url!}>
                        Learn More
                      </ExternalLinkText>
                    )}
                  </div>
                </div>
              </CyberPanel>
            ))}
          </div>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-widest flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[var(--cyber-neon-pink)]" />
              Popular Plugins
            </h3>
            <a
              href="https://buf.build/plugins/protobuf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-cyber font-bold text-[var(--cyber-neon-pink)] hover:text-[var(--cyber-neon-pink)]/80 transition-colors uppercase flex items-center gap-1 group"
            >
              Browse BSR Registry
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plugins.map((p) => (
              <div
                key={p.name}
                className="p-4 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg hover:border-[var(--cyber-neon-pink)]/50 transition-all"
              >
                <h4 className="font-mono text-sm font-bold text-[var(--cyber-neon-pink)] mb-2">
                  {p.name}
                </h4>
                <p className="text-sm text-[var(--text-dim)] leading-relaxed mb-4">
                  {p.desc}
                </p>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-[var(--text-color)] hover:underline uppercase tracking-widest"
                >
                  Source
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Ecosystem CTA */}
        <div className="mt-12 p-6 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--cyber-neon-blue)]" />
          <div>
            <h4 className="font-cyber font-bold text-[var(--text-color)] text-base uppercase tracking-wider mb-1">
              Looking for more tools, plugins, or libraries?
            </h4>
            <p className="text-sm text-[var(--text-dim)] max-w-2xl leading-relaxed">
              Explore our comprehensive, paginated registry containing over 80+
              third-party tools, remote plugins, and serialization libraries
              with real-time GitHub star counts, categories, sorting, and search
              filtering.
            </p>
          </div>
          <a
            href="/ecosystem/"
            className="shrink-0 flex items-center gap-2 px-6 py-3 text-xs font-cyber font-bold uppercase tracking-wider bg-[var(--cyber-neon-blue)] text-[var(--neon-contrast-text)] hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all rounded-lg scale-[1.02]"
          >
            Explore Ecosystem Directory
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </Section>
  );
};

export const NetworkImplementations = () => {
  const frameworks = [
    {
      name: "gRPC",
      desc: "The industry standard for high-performance RPC. Originally developed by Google, it uses HTTP/2 and supports advanced features like bidirectional streaming and server reflection.",
      url: "https://grpc.io/",
    },
    {
      name: "ConnectRPC",
      desc: "A modern, multi-protocol alternative to gRPC that works natively in browsers. It supports gRPC, gRPC-Web, and its own simple HTTP-based protocol.",
      url: "https://connectrpc.com/",
    },
    {
      name: "Twirp",
      desc: "A simple and minimalist RPC framework by Twitch. It focuses on reliability and simplicity, using Protobuf over HTTP/1.1 without the complexity of gRPC.",
      url: "https://twitchtv.github.io/twirp/",
    },
    {
      name: "dRPC",
      desc: "A lightweight Go replacement for gRPC by Storj. Designed to be leaner and faster, it reduces memory overhead while remaining compatible with existing Protobuf definitions.",
      url: "https://github.com/storj/drpc",
    },
    {
      name: "Apache brpc",
      desc: "An industrial-grade C++ RPC framework by Baidu. It is heavily optimized for extreme concurrency and low latency, often used in massive service deployments.",
      url: "https://brpc.apache.org/",
    },
    {
      name: "Apache Dubbo",
      desc: "A popular microservices framework from Alibaba. Its 'Triple' protocol natively adopts HTTP/2 and Protobuf for modern, gRPC-compatible serialization.",
      url: "https://dubbo.apache.org/",
    },
  ];

  return (
    <Section
      id="networking"
      className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)]/10 border-t border-[var(--border-light)]"
    >
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Layers} subtitle="06f_NETWORKING">
          Network Implementations
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {frameworks.map((f) => (
            <CyberPanel key={f.name} title={f.name}>
              <div className="p-4 space-y-4">
                <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                  {f.desc}
                </p>
                <ExternalLinkText href={f.url}>Visit Site</ExternalLinkText>
              </div>
            </CyberPanel>
          ))}
        </div>
      </div>
    </Section>
  );
};

export const CommunityResources = () => (
  <Section
    id="community"
    className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)]/20 border-t border-[var(--border-light)]"
  >
    <div className="max-w-7xl mx-auto">
      <SectionTitle icon={GitBranch} subtitle="06d_COMMUNITY">
        Community
      </SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h3 className="font-cyber font-bold text-[var(--cyber-neon-green)] uppercase text-sm tracking-widest">
            Official Resources
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <ExternalLinkText href="https://protobuf.dev/news/">
                Official Blog
              </ExternalLinkText>
            </li>
            <li>
              <ExternalLinkText href="https://github.com/protocolbuffers/protobuf/blob/main/docs/third_party.md">
                Third-Party Implementations
              </ExternalLinkText>
            </li>
            <li>
              <ExternalLinkText href="https://buf.build/plugins/protobuf">
                BSR Remote Plugins
              </ExternalLinkText>
            </li>
            <li>
              <ExternalLinkText href="https://github.com/protocolbuffers/protobuf/releases">
                GitHub Releases
              </ExternalLinkText>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="font-cyber font-bold text-[var(--cyber-neon-blue)] uppercase text-sm tracking-widest">
            Specifications
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <ExternalLinkText href="https://protobuf.dev/programming-guides/encoding/">
                Encoding Specification
              </ExternalLinkText>
            </li>
            <li>
              <ExternalLinkText href="https://protobuf.dev/programming-guides/proto3/">
                Proto3 Language Guide
              </ExternalLinkText>
            </li>
            <li>
              <ExternalLinkText href="https://protobuf.dev/programming-guides/proto3/#json">
                ProtoJSON Standard
              </ExternalLinkText>
            </li>
            <li>
              <ExternalLinkText href="https://en.wikipedia.org/wiki/IEEE_754">
                IEEE 754 (Float)
              </ExternalLinkText>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="font-cyber font-bold text-[var(--cyber-neon-pink)] uppercase text-sm tracking-widest">
            Support & Forums
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <ExternalLinkText href="https://groups.google.com/g/protobuf">
                Google Group (Official)
              </ExternalLinkText>
            </li>
            <li>
              <ExternalLinkText href="https://github.com/grpc-ecosystem/awesome-grpc">
                Awesome gRPC
              </ExternalLinkText>
            </li>
            <li>
              <ExternalLinkText href="https://stackoverflow.com/questions/tagged/protobuf">
                Stack Overflow
              </ExternalLinkText>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </Section>
);

export const AlternativesLandscape = () => (
  <Section
    id="alternatives"
    className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)]/20 border-t border-[var(--border-light)]"
  >
    <div className="max-w-7xl mx-auto">
      <SectionTitle icon={SearchCheck} subtitle="06a_COMPETITION">
        The Alternatives
      </SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <CyberPanel title="TEXT_BASED">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Braces className="w-5 h-5 text-[var(--cyber-neon-blue)]" />
              <h3 className="font-cyber font-bold text-[var(--text-color)] uppercase text-sm">
                JSON / XML
              </h3>
            </div>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              Ubiquitous, human-readable, and easy to debug. However, they lack
              strict schemas (by default), are significantly slower to parse,
              and produce much larger payloads.
            </p>
            <div className="text-sm font-mono text-[var(--cyber-neon-blue)] uppercase">
              Best For: Public APIs, Web Apps
            </div>
          </div>
        </CyberPanel>

        <CyberPanel title="SCHEMA_LESS_BINARY">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Box className="w-5 h-5 text-[var(--cyber-neon-pink)]" />
              <h3 className="font-cyber font-bold text-[var(--text-color)] uppercase text-sm">
                MessagePack / CBOR
              </h3>
            </div>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              Binary formats that don't require a schema. Think "Binary JSON".
              They are smaller and faster than JSON, but lack the type safety
              and code generation benefits of Protobuf.
            </p>
            <div className="text-sm font-mono text-[var(--cyber-neon-pink)] uppercase">
              Best For: Internal Caching, No-Schema Ops
            </div>
          </div>
        </CyberPanel>

        <CyberPanel title="HIGH_PERFORMANCE_SCHEMA">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-[var(--cyber-neon-green)]" />
              <h3 className="font-cyber font-bold text-[var(--text-color)] uppercase text-sm">
                FlatBuffers / Avro
              </h3>
            </div>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              FlatBuffers allows "zero-copy" access, meaning you can read data
              without parsing it at all. Avro is widely used in Big Data
              (Hadoop/Kafka) for its flexible schema evolution.
            </p>
            <div className="text-sm font-mono text-[var(--cyber-neon-green)] uppercase">
              Best For: Games, Real-time Stream Processing
            </div>
          </div>
        </CyberPanel>
      </div>
    </div>
  </Section>
);

const Community = () => (
  <>
    <VersionTimeline />
    <PoweringTheIndustry />
    <Toolbox />
    <NetworkImplementations />
    <CommunityResources />
    <AlternativesLandscape />
  </>
);

export default Community;
