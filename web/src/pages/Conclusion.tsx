import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Section } from "../components/shared/Common";

export const NextSteps = () => (
  <Section
    id="nextsteps"
    className="py-24 px-4 sm:px-8 bg-[var(--section-bg-dark)] border-t border-[var(--border-light)]"
  >
    <div className="max-w-4xl mx-auto text-center space-y-12">
      <div className="space-y-4">
        <h3 className="text-3xl md:text-5xl font-cyber font-black text-[var(--text-color)] uppercase tracking-tighter">
          Ready to Build?
        </h3>
        <p className="text-[var(--text-dim)] text-lg">
          Protobuf is a deep ecosystem. Here is where to go next.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <a
          href="https://protobuf.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl hover:border-[var(--cyber-neon-blue)] transition-all group"
        >
          <h4 className="font-cyber font-bold text-[var(--cyber-neon-blue)] uppercase mb-2">
            Official Docs
          </h4>
          <p className="text-sm text-[var(--text-dim)]">
            The definitive source for language syntax, well-known types, and
            standard practices.
          </p>
        </a>
        <a
          href="https://buf.build/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl hover:border-[var(--cyber-neon-pink)] transition-all group"
        >
          <h4 className="font-cyber font-bold text-[var(--cyber-neon-pink)] uppercase mb-2">
            Buf.build
          </h4>
          <p className="text-sm text-[var(--text-dim)]">
            Modern tooling for Protobuf. Linting, breaking change detection, and
            dependency management.
          </p>
        </a>
        <a
          href="https://connectrpc.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl hover:border-[var(--cyber-neon-green)] transition-all group"
        >
          <h4 className="font-cyber font-bold text-[var(--cyber-neon-green)] uppercase mb-2">
            ConnectRPC
          </h4>
          <p className="text-sm text-[var(--text-dim)]">
            A better way to build gRPC-compatible APIs that work natively in the
            browser and mobile.
          </p>
        </a>
        <a
          href="https://github.com/protocolbuffers/protobuf"
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl hover:border-[var(--cyber-neon-yellow)] transition-all group"
        >
          <h4 className="font-cyber font-bold text-[var(--cyber-neon-yellow)] uppercase mb-2">
            GitHub Repo
          </h4>
          <p className="text-sm text-[var(--text-dim)]">
            Dive into the source code of the compilers and runtimes for every
            major language.
          </p>
        </a>
      </div>
    </div>
  </Section>
);

export const Conclusion = () => (
  <>
    <Section
      id="conclusion"
      className="min-h-[100dvh] flex flex-col items-center justify-center p-8 bg-[var(--section-bg-dark)] relative overflow-hidden"
    >
      <div className="scanline active" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="max-w-3xl text-center space-y-12"
      >
        <div className="space-y-4">
          <h2 className="text-4xl md:text-6xl font-cyber font-black text-[var(--text-color)] uppercase italic tracking-tighter">
            Congratulations!
          </h2>
          <p className="text-[var(--text-dim)] text-xl leading-relaxed">
            From writing your first schema to decoding raw binary and wiring up
            custom plugins, you are ready to start building with{" "}
            <span className="text-[var(--cyber-neon-blue)] font-cyber font-bold tracking-wider">
              Protobuf
            </span>
            .
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

        <p className="text-sm font-mono text-[var(--text-dim)] uppercase tracking-widest pt-8">
          See a mistake? Missing an important detail?
          <br />
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
    <NextSteps />
  </>
);

export default Conclusion;
