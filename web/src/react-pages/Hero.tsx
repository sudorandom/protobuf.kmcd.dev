import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronsRight } from "lucide-react";
import { Section } from "../components/shared/Common";

export const Hero = () => {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Section
      id="hero"
      className="min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-8 pt-[64px] relative overflow-hidden"
    >
      <div className={`scanline ${isAtTop ? "active" : ""}`} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl z-10 text-center w-full flex flex-col items-center flex-1 justify-center pb-16 sm:pb-24"
      >
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-cyber font-black mb-6 tracking-tight leading-none">
          PROTOBUF
          <br />
          <span className="cyber-text-gradient tracking-normal">
            VISUALIZED
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-[var(--text-dim)] max-w-2xl mx-auto mb-12 leading-relaxed">
          Language-neutral, platform-neutral, extensible mechanism for
          serializing structured data. The backbone of modern high-performance
          systems.
        </p>
      </motion.div>

      <motion.div
        className="absolute bottom-24 sm:bottom-32 left-0 right-0 flex justify-center z-20 px-4"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <a
          href="/intro/"
          className="relative flex items-center justify-center group text-[var(--cyber-neon-blue)] hover:text-[var(--cyber-neon-blue)]/80 transition-colors w-max before:content-[''] before:absolute before:-inset-12 before:cursor-pointer"
        >
          <span className="relative z-10 font-cyber font-bold tracking-widest sm:tracking-[0.2em] text-lg sm:text-xl uppercase whitespace-nowrap">
            Get Started
          </span>
          <ChevronsRight className="absolute left-full ml-3 w-6 h-6 sm:w-8 sm:h-8 group-hover:translate-x-2 transition-transform" />
        </a>
      </motion.div>
    </Section>
  );
};

export default Hero;
