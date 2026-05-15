import {
  GitBranch,
  Layers,
  SearchCheck,
  Zap,
  Code2,
  Box,
  Braces
} from 'lucide-react';
import {
  Section,
  SectionTitle,
  CyberPanel,
  ExternalLinkText
} from '../components/shared/Common';

export const VersionTimeline = () => {
  const versions = [
    {
      year: '2001',
      version: 'INTERNAL',
      title: 'Google Internal Launch',
      desc: 'Protobuf was born inside Google to solve the overhead of XML. It quickly became the standard for all internal communication.',
      icon: GitBranch,
      color: 'var(--text-dim)',
      href: 'https://protobuf.dev/overview/#history'
    },
    {
      year: '2008',
      version: 'PROTO2',
      title: 'Public Open Source',
      desc: 'First public release. Introduced the complex "required" fields and a powerful extension system.',
      icon: Layers,
      color: 'var(--cyber-neon-blue)',
      href: 'https://opensource.googleblog.com/2008/07/protocol-buffers-googles-data.html'
    },
    {
      year: '2016',
      version: 'PROTO3',
      title: 'Modern Standardization',
      desc: 'Simplified the language. Removed "required" fields, standardized JSON mapping, and enabled better cross-platform support.',
      icon: Zap,
      color: 'var(--cyber-neon-pink)',
      href: 'https://github.com/protocolbuffers/protobuf/releases/tag/v3.0.0'
    },
    {
      year: '2023',
      version: 'EDITIONS',
      title: 'The Future of Proto',
      desc: 'The biggest architectural shift in years. Moves away from "versions" to a flexible system of "features".',
      icon: Code2,
      color: 'var(--cyber-neon-green)',
      href: 'https://protobuf.dev/news/2023-06-29/'
    }
  ];

  return (
    <Section id="ecosystem" className="py-24 px-4 sm:px-8 bg-[var(--section-bg-dark)] border-t border-[var(--border-light)]">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={GitBranch} subtitle="06_HISTORY">Major Versions</SectionTitle>

        <div className="mb-16 space-y-4">
          <p className="text-[var(--text-dim)] leading-relaxed">
            Protocol Buffers has evolved over two decades, transitioning from a performance-critical internal tool at Google to the foundational layer for modern distributed systems worldwide.
          </p>
          <p className="text-[var(--text-dim)] leading-relaxed">
            While the core philosophy of schema-first binary serialization has remained constant, the language has adapted to meet the needs of a diverse engineering landscape.
          </p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--cyber-neon-blue)] via-[var(--cyber-neon-pink)] to-[var(--cyber-neon-green)] opacity-30" />

          <div className="space-y-12">
            {versions.map((v, i) => (
              <div key={v.version} className={`relative flex items-center gap-8 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Content */}
                <div className="flex-1 ml-12 md:ml-0 md:px-12">
                  <div className={`p-6 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl hover:border-[${v.color}]/50 transition-all group`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${v.color}20`, color: v.color }}>{v.version}</span>
                      <span className="text-xs font-mono text-[var(--text-dim)]">{v.year}</span>
                    </div>
                    <h4 className="text-lg font-cyber font-bold text-[var(--text-color)] uppercase mb-2 group-hover:text-[var(--text-color)] transition-colors">{v.title}</h4>
                    <p className="text-sm text-[var(--text-dim)] leading-relaxed mb-4">{v.desc}</p>
                    <ExternalLinkText href={v.href}>View Details</ExternalLinkText>
                  </div>
                </div>

                {/* Dot */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-10 h-10 bg-[var(--panel-bg)] border-2 rounded-full flex items-center justify-center z-10" style={{ borderColor: v.color }}>
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

export const AlternativesLandscape = () => (
  <Section id="alternatives" className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)]/20 border-t border-[var(--border-light)]">
    <div className="max-w-7xl mx-auto">
      <SectionTitle icon={SearchCheck} subtitle="06a_COMPETITION">The Alternatives</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <CyberPanel title="TEXT_BASED">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Braces className="w-5 h-5 text-[var(--cyber-neon-blue)]" />
              <h4 className="font-cyber font-bold text-[var(--text-color)] uppercase text-sm">JSON / XML</h4>
            </div>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed">Ubiquitous, human-readable, and easy to debug. However, they lack strict schemas (by default), are significantly slower to parse, and produce much larger payloads.</p>
            <div className="text-xs font-mono text-[var(--cyber-neon-blue)] uppercase">Best For: Public APIs, Web Apps</div>
          </div>
        </CyberPanel>

        <CyberPanel title="SCHEMA_LESS_BINARY">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Box className="w-5 h-5 text-[var(--cyber-neon-pink)]" />
              <h4 className="font-cyber font-bold text-[var(--text-color)] uppercase text-sm">MessagePack / CBOR</h4>
            </div>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed">Binary formats that don't require a schema. Think "Binary JSON". They are smaller and faster than JSON, but lack the type safety and code generation benefits of Protobuf.</p>
            <div className="text-xs font-mono text-[var(--cyber-neon-pink)] uppercase">Best For: Internal Caching, No-Schema Ops</div>
          </div>
        </CyberPanel>

        <CyberPanel title="HIGH_PERFORMANCE_SCHEMA">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-[var(--cyber-neon-green)]" />
              <h4 className="font-cyber font-bold text-[var(--text-color)] uppercase text-sm">FlatBuffers / Avro</h4>
            </div>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed">FlatBuffers allows "zero-copy" access, meaning you can read data without parsing it at all. Avro is widely used in Big Data (Hadoop/Kafka) for its robust schema evolution.</p>
            <div className="text-xs font-mono text-[var(--cyber-neon-green)] uppercase">Best For: Games, Real-time Stream Processing</div>
          </div>
        </CyberPanel>
      </div>
    </div>
  </Section>
);

export const EcosystemNextSteps = () => (
  <Section id="nextsteps" className="py-24 px-4 sm:px-8 bg-[var(--section-bg-dark)] border-t border-[var(--border-light)]">
    <div className="max-w-4xl mx-auto text-center space-y-12">
      <div className="space-y-4">
        <h3 className="text-3xl md:text-5xl font-cyber font-black text-[var(--text-color)] uppercase tracking-tighter">Ready to Build?</h3>
        <p className="text-[var(--text-dim)] text-lg">Protobuf is a deep ecosystem. Here is where to go next.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <a href="https://protobuf.dev/" target="_blank" rel="noopener noreferrer" className="p-6 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl hover:border-[var(--cyber-neon-blue)] transition-all group">
          <h4 className="font-cyber font-bold text-[var(--cyber-neon-blue)] uppercase mb-2">Official Docs</h4>
          <p className="text-sm text-[var(--text-dim)]">The definitive source for language syntax, well-known types, and standard practices.</p>
        </a>
        <a href="https://buf.build/" target="_blank" rel="noopener noreferrer" className="p-6 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl hover:border-[var(--cyber-neon-pink)] transition-all group">
          <h4 className="font-cyber font-bold text-[var(--cyber-neon-pink)] uppercase mb-2">Buf.build</h4>
          <p className="text-sm text-[var(--text-dim)]">Modern tooling for Protobuf. Linting, breaking change detection, and dependency management.</p>
        </a>
        <a href="https://connectrpc.com/" target="_blank" rel="noopener noreferrer" className="p-6 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl hover:border-[var(--cyber-neon-green)] transition-all group">
          <h4 className="font-cyber font-bold text-[var(--cyber-neon-green)] uppercase mb-2">ConnectRPC</h4>
          <p className="text-sm text-[var(--text-dim)]">A better way to build gRPC-compatible APIs that work natively in the browser and mobile.</p>
        </a>
        <a href="https://github.com/protocolbuffers/protobuf" target="_blank" rel="noopener noreferrer" className="p-6 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl hover:border-[var(--cyber-neon-yellow)] transition-all group">
          <h4 className="font-cyber font-bold text-[var(--cyber-neon-yellow)] uppercase mb-2">GitHub Repo</h4>
          <p className="text-sm text-[var(--text-dim)]">Dive into the source code of the compilers and runtimes for every major language.</p>
        </a>
      </div>
    </div>
  </Section>
);

const Ecosystem = () => (
  <>
    <VersionTimeline />
    <AlternativesLandscape />
    <EcosystemNextSteps />
  </>
);

export default Ecosystem;
