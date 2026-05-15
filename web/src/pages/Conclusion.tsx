import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, BookOpen } from "lucide-react";
import {
  Section,
  SectionTitle,
  ExternalLinkText,
} from "../components/shared/Common";

const References = () => (
  <Section
    id="references"
    className="py-24 px-4 sm:px-8 border-t border-[var(--border-light)] relative overflow-hidden"
    style={{
      background:
        "linear-gradient(to bottom, transparent, var(--bg-color) 400px)",
    }}
  >
    <div className="max-w-7xl mx-auto text-[var(--text-color)] relative z-10">
      <SectionTitle icon={BookOpen}>References & Specs</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h4 className="text-[var(--cyber-neon-blue)] font-cyber text-sm tracking-widest uppercase">
            Core Specifications
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <ExternalLinkText href="https://protobuf.dev/programming-guides/encoding/">
                Protobuf Encoding Specification
              </ExternalLinkText>
            </li>
            <li>
              <ExternalLinkText href="https://protobuf.dev/programming-guides/proto3/">
                Proto3 Language Guide
              </ExternalLinkText>
            </li>
            <li>
              <ExternalLinkText href="https://protobuf.dev/programming-guides/proto3/#json">
                ProtoJSON Mapping Standard
              </ExternalLinkText>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-[var(--cyber-neon-pink)] font-cyber text-sm tracking-widest uppercase">
            Tooling & Ecosystem
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <ExternalLinkText href="https://buf.build/">
                Buf Schema Registry (BSR)
              </ExternalLinkText>
            </li>
            <li>
              <ExternalLinkText href="https://github.com/bufbuild/protovalidate">
                Protovalidate GitHub
              </ExternalLinkText>
            </li>
            <li>
              <ExternalLinkText href="https://connectrpc.com/">
                Connect Protocol
              </ExternalLinkText>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-[var(--cyber-neon-green)] font-cyber text-sm tracking-widest uppercase">
            Standards & Protocols
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <ExternalLinkText href="https://grpc.io/">
                gRPC Remote Procedure Calls
              </ExternalLinkText>
            </li>
            <li>
              <ExternalLinkText href="https://en.wikipedia.org/wiki/IEEE_754">
                IEEE 754 Floating Point
              </ExternalLinkText>
            </li>
            <li>
              <ExternalLinkText href="https://en.wikipedia.org/wiki/UTF-8">
                UTF-8 Character Encoding
              </ExternalLinkText>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </Section>
);

export const Conclusion = () => (
  <>
    <Section
      id="conclusion"
      className="min-h-[100dvh] flex flex-col items-center justify-center p-8 bg-[var(--section-bg-dark)]"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="max-w-2xl text-center space-y-12"
      >
        <div className="space-y-4">
          <h2 className="text-4xl md:text-6xl font-cyber font-black text-[var(--text-color)] uppercase italic tracking-tighter">
            Transmission Complete.
          </h2>
          <p className="text-[var(--text-dim)] text-xl leading-relaxed">
            You've dissected the raw binary stream, mastered the data contracts,
            and unlocked the true power of a schema-first architecture.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            to="/"
            className="px-8 py-3 border border-[var(--cyber-neon-blue)] text-[var(--cyber-neon-blue)] font-cyber font-bold uppercase hover:bg-[var(--cyber-neon-blue)]/10 transition-all flex items-center gap-2 rounded-md"
          >
            <ChevronLeft className="w-5 h-5" />
            Return to Start
          </Link>
          <a
            href="https://github.com/sudorandom/protobuf.kmcd.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-[var(--cyber-neon-blue)] text-[var(--bg-color)] font-cyber font-bold uppercase hover:bg-[var(--cyber-neon-blue)]/90 transition-all rounded-md shadow-[0_0_20px_rgba(0,243,255,0.4)]"
          >
            View on GitHub
          </a>
        </div>

        <p className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest pt-8">
          See a mistake?{" "}
          Missing an important detail?{" "}
          <a
            href="https://github.com/sudorandom/protobuf.kmcd.dev/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--cyber-neon-pink)] hover:underline font-bold"
          >
            Create an issue
          </a>{" "}
          or make a{" "}
          <a
            href="https://github.com/sudorandom/protobuf.kmcd.dev/pulls"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--cyber-neon-green)] hover:underline font-bold"
          >
            PR on GitHub
          </a>
          !
        </p>
      </motion.div>
    </Section>
    <References />
  </>
);

export default Conclusion;
