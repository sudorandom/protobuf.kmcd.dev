import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Section } from "../components/shared/Common";

export const Hero = ({ isAtTop }: { isAtTop: boolean }) => (
  <Section
    id="hero"
    className="h-screen flex flex-col items-center justify-center p-4 sm:p-8 pt-[64px] relative overflow-hidden"
  >
    <div className={`scanline ${isAtTop ? "active" : ""}`} />
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl z-10 text-center w-full flex flex-col items-center flex-1 justify-center"
    >
      <h1 className="text-4xl sm:text-6xl md:text-8xl font-cyber font-black mb-6 tracking-tighter leading-none">
        PROTOBUF
        <br />
        <span className="cyber-text-gradient">VISUALIZED</span>
      </h1>

      <p className="text-[var(--text-dim)] text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
        Language-neutral, platform-neutral, extensible mechanism for serializing
        structured data. The backbone of modern high-performance systems.
      </p>
    </motion.div>

    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
      <Link
        to="/intro"
        className="flex flex-col items-center gap-2 group text-[var(--cyber-neon-blue)] hover:text-[var(--cyber-neon-blue)]/80 transition-colors"
      >
        <span className="font-cyber font-bold tracking-[0.2em] text-xl uppercase">
          Get Started
        </span>
        <ChevronRight className="w-8 h-8 rotate-90 group-hover:translate-y-2 transition-transform" />
      </Link>
    </div>
  </Section>
);

export default Hero;
