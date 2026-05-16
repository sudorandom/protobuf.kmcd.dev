import React, { useState, useMemo, useEffect, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation, Link } from "react-router-dom";
import { CyberSpinner } from "./components/CyberSpinner";
import {
  Cpu,
  ChevronRight,
  ChevronLeft,
  AlignLeft,
  X,
  Sun,
  Moon,
  Fingerprint,
  Code2,
  Database,
} from "lucide-react";

import { type FileRegistry } from "@bufbuild/protobuf";
import { createDynamicRegistry } from "./utils/dynamic-registry";
import { INITIAL_PROTO } from "./utils/constants";

// Pages
import Hero from "./pages/Hero";

const PRELOAD_MAP: Record<string, () => Promise<any>> = {
  intro: () => import("./pages/Introduction"),
  basics: () => import("./pages/Basics"),
  advanced: () => import("./pages/Advanced"),
  efficiency: () => import("./pages/Efficiency"),
  binary: () => import("./pages/Binary"),
  ecosystem: () => import("./pages/Ecosystem"),
  conclusion: () => import("./pages/Conclusion"),
};

const Introduction = React.lazy(PRELOAD_MAP.intro);
const Basics = React.lazy(PRELOAD_MAP.basics);
const Advanced = React.lazy(PRELOAD_MAP.advanced);
const Efficiency = React.lazy(PRELOAD_MAP.efficiency);
const Binary = React.lazy(PRELOAD_MAP.binary);
const Ecosystem = React.lazy(PRELOAD_MAP.ecosystem);
const Conclusion = React.lazy(PRELOAD_MAP.conclusion);

interface NavItemDef {
  id: string;
  label: string;
  path: string;
}

const NAV_ITEMS: NavItemDef[] = [
  { id: "hero", label: "HOME", path: "/" },
  { id: "intro", label: "INTRO", path: "/intro" },
  { id: "basics", label: "BASICS", path: "/basics" },
  { id: "advanced", label: "ADVANCED", path: "/advanced" },
  { id: "efficiency", label: "EFFICIENCY", path: "/efficiency" },
  { id: "binary", label: "BINARY", path: "/binary" },
  { id: "ecosystem", label: "ECOSYSTEM", path: "/ecosystem" },
  { id: "conclusion", label: "CONCLUSION", path: "/conclusion" },
];

const SECTION_LABELS: Record<string, string> = {
  hero: "Welcome",
  intro: "Introduction",
  basics: "Protobuf Basics",
  advanced: "Advanced Protobuf",
  efficiency: "Efficiency",
  binary: "Binary",
  ecosystem: "The Ecosystem",
  conclusion: "Conclusion",
};

const NavItem = ({
  item,
  index,
  onNavigate,
}: {
  item: NavItemDef;
  index: number;
  onNavigate: () => void;
}) => {
  const location = useLocation();
  const isActive =
    location.pathname === item.path ||
    (location.pathname === "/" && item.path === "/");

  return (
    <div className="flex flex-col">
      <div
        className={`group flex items-center justify-between py-3 border-b hover:border-[var(--cyber-neon-blue)]/30 transition-colors ${isActive ? "border-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/5" : "border-[var(--border-light)]"}`}
      >
        <Link
          to={item.path}
          onClick={onNavigate}
          className="flex flex-col flex-1 px-2"
        >
          <span
            className={`text-sm font-mono mb-0.5 ${isActive ? "text-[var(--cyber-neon-blue)]" : "text-[var(--cyber-neon-blue)]/80"}`}
          >
            0{index + 1}
          </span>
          <span
            className={`font-cyber font-bold text-sm tracking-wider group-hover:text-[var(--cyber-neon-blue)] transition-colors uppercase ${isActive ? "text-[var(--cyber-neon-blue)]" : "text-[var(--text-color)]"}`}
          >
            {item.label}
          </span>
        </Link>
        <div className="flex items-center gap-2 pr-2">
          <ChevronRight
            className={`w-4 h-4 transition-all -translate-x-2 group-hover:translate-x-0 ${isActive ? "text-[var(--cyber-neon-blue)] translate-x-0" : "text-[var(--text-color)]/0 group-hover:text-[var(--cyber-neon-blue)]"}`}
          />
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [protoSource, setProtoSource] = useState(INITIAL_PROTO);
  const [registry, setRegistry] = useState<FileRegistry | null>(null);
  const [fds, setFds] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const currentNavIndex = NAV_ITEMS.findIndex(
    (item) =>
      item.path === location.pathname ||
      (location.pathname === "/" && item.path === "/"),
  );
  const activeSection = NAV_ITEMS[currentNavIndex]?.id || "hero";
  const prevNav = currentNavIndex > 0 ? NAV_ITEMS[currentNavIndex - 1] : null;
  const nextNav =
    currentNavIndex >= 0 && currentNavIndex < NAV_ITEMS.length - 1
      ? NAV_ITEMS[currentNavIndex + 1]
      : null;

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
      return window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const pageName = SECTION_LABELS[activeSection] || "Welcome";
    document.title = `${pageName} | Protobuf Visualized`;
  }, [location.pathname, activeSection]);

  useEffect(() => {
    const preloadPages = async () => {
      try {
        if (nextNav && PRELOAD_MAP[nextNav.id]) {
          await PRELOAD_MAP[nextNav.id]();
        }
      } catch (e) {
        console.error("Failed to preload next page:", e);
      }
      try {
        if (prevNav && PRELOAD_MAP[prevNav.id]) {
          await PRELOAD_MAP[prevNav.id]();
        }
      } catch (e) {
        console.error("Failed to preload previous page:", e);
      }
    };
    preloadPages();
  }, [nextNav, prevNav]);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const result = await createDynamicRegistry(protoSource);
        if (active) {
          if (result.kind === "success") {
            setRegistry(result.registry);
            setFds(result.fileDescriptorSet);
            setError(null);
          } else {
            setRegistry(null);
            setFds(null);
            setError(null);
          }
        }
      } catch (e: unknown) {
        if (active) {
          const message = e instanceof Error ? e.message : String(e);
          setRegistry(null);
          setFds(null);
          setError(message);
        }
      }
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [protoSource]);

  const messageSchema = useMemo(() => {
    if (!registry) return null;
    // Prefer the default User message, but fallback to the first message found in the user's proto
    return (
      registry.getMessage("demo.v1.User") ||
      registry.getFile("input.proto")?.messages[0] ||
      null
    );
  }, [registry]);

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <header className="h-[64px] border-b border-[var(--border-light)] bg-[var(--bg-color)]/90 backdrop-blur-md fixed top-0 left-0 w-full z-[100] px-4 sm:px-8 flex items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--cyber-neon-blue)]/10 rounded border border-[var(--cyber-neon-blue)]/30 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-[var(--cyber-neon-blue)]" />
          </div>
          <div>
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-xl font-mono font-bold tracking-tight text-[var(--text-color)]">
                protobuf
                <span className="text-[var(--cyber-neon-blue)]">.kmcd.dev</span>
              </h1>
            </Link>
            <a
              href={`#${activeSection}`}
              className="text-sm font-mono text-[var(--cyber-neon-blue)] tracking-widest -mt-1 uppercase opacity-90 hover:opacity-100 transition-opacity block max-w-[150px] truncate lg:max-w-none"
            >
              <span className="lg:hidden">
                {SECTION_LABELS[activeSection] || "Welcome"}
              </span>
              <span className="hidden lg:inline">Protobuf Visualized</span>
            </a>
          </div>
        </div>
        {error && (
          <div className="ml-8 px-3 py-1 bg-[var(--text-error)]/10 border border-[var(--text-error)]/30 rounded text-[var(--text-error)] text-sm font-mono animate-pulse uppercase">
            SCHEMA_ERROR: {error}
          </div>
        )}

        <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center pointer-events-none">
          <div className="flex items-center gap-8 pointer-events-auto min-w-[400px] justify-center">
            {prevNav ? (
              <Link
                to={prevNav.path}
                className="p-1 text-[var(--text-dim)] hover:text-[var(--cyber-neon-blue)] hover:bg-[var(--cyber-neon-blue)]/10 rounded transition-colors"
                title={`Previous: ${prevNav.label}`}
              >
                <ChevronLeft className="w-6 h-6" />
              </Link>
            ) : (
              <div className="w-8 h-8" />
            )}
            <div className="text-sm font-mono font-bold text-[var(--text-color)] uppercase tracking-widest bg-[var(--overlay-bg)] px-4 py-1.5 rounded border border-[var(--border-light)] backdrop-blur-sm min-w-[200px] text-center">
              {SECTION_LABELS[activeSection] || "Welcome"}
            </div>
            {nextNav ? (
              <Link
                to={nextNav.path}
                className="p-1 text-[var(--text-dim)] hover:text-[var(--cyber-neon-blue)] hover:bg-[var(--cyber-neon-blue)]/10 rounded transition-colors"
                title={`Next: ${nextNav.label}`}
              >
                <ChevronRight className="w-6 h-6" />
              </Link>
            ) : (
              <div className="w-8 h-8" />
            )}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/5 hover:bg-[var(--cyber-neon-blue)]/15 rounded-md border border-[var(--cyber-neon-blue)]/30 transition-all group shadow-[0_0_10px_rgba(0,243,255,0.05)]"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 group-hover:scale-110 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
          </button>

          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 text-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/5 hover:bg-[var(--cyber-neon-blue)]/15 rounded-md border border-[var(--cyber-neon-blue)]/30 transition-all group shadow-[0_0_10px_rgba(0,243,255,0.05)]"
            aria-label="Open Menu"
          >
            <AlignLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110]"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm z-[120] bg-[var(--panel-bg)] border-l border-[var(--border-light)] shadow-2xl flex flex-col"
            >
              <div className="h-[64px] flex items-center justify-between px-4 sm:px-8 border-b border-[var(--border-light)]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[var(--cyber-neon-blue)]/10 rounded border border-[var(--cyber-neon-blue)]/30 flex items-center justify-center">
                    <Cpu className="w-3.5 h-3.5 text-[var(--cyber-neon-blue)]" />
                  </div>
                  <span className="font-cyber font-bold text-[var(--cyber-neon-blue)] text-sm tracking-[0.2em] uppercase">
                    Navigation
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-[var(--text-dim)] hover:text-[var(--text-color)] transition-colors"
                  aria-label="Close Menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-6 px-4 sm:px-8 custom-scrollbar">
                <div className="flex flex-col gap-1">
                  {NAV_ITEMS.map((item, i) => (
                    <NavItem
                      key={item.id}
                      item={item}
                      index={i}
                      onNavigate={() => setIsMenuOpen(false)}
                    />
                  ))}
                </div>
              </nav>

              <div className="p-8 border-t border-[var(--border-light)] bg-[var(--overlay-bg)]">
                <div className="text-sm font-mono text-[var(--text-dim)] uppercase tracking-widest mb-4">
                  Quick Links
                </div>
                <div className="flex gap-4">
                  <a
                    href="https://kmcd.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[var(--overlay-bg)] rounded hover:bg-[var(--border-light)] transition-colors text-[var(--text-dim)] hover:text-[var(--cyber-neon-blue)]"
                    title="KMCD.DEV"
                  >
                    <Fingerprint className="w-4 h-4" />
                  </a>
                  <a
                    href="https://github.com/sudorandom/protobuf.kmcd.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[var(--overlay-bg)] rounded hover:bg-[var(--border-light)] transition-colors text-[var(--text-dim)] hover:text-[var(--cyber-neon-pink)]"
                    title="GitHub Repository"
                  >
                    <Code2 className="w-4 h-4" />
                  </a>
                  <a
                    href="https://protobuf.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[var(--overlay-bg)] rounded hover:bg-[var(--border-light)] transition-colors text-[var(--text-dim)] hover:text-[var(--cyber-neon-green)]"
                    title="Protobuf Docs"
                  >
                    <Database className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main id="main-content">
        <Suspense fallback={<CyberSpinner />}>
          <Routes>
            <Route path="/" element={<Hero isAtTop={isAtTop} />} />
            <Route
              path="/intro"
              element={<Introduction messageSchema={messageSchema} fds={fds} />}
            />
            <Route path="/basics" element={<Basics />} />
            <Route path="/advanced" element={<Advanced />} />
            <Route
              path="/efficiency"
              element={
                <Efficiency
                  messageSchema={messageSchema}
                  fileDescriptorSet={fds}
                  protoSource={protoSource}
                  setProtoSource={setProtoSource}
                />
              }
            />
            <Route
              path="/binary"
              element={
                <Binary
                  messageSchema={messageSchema}
                  fds={fds}
                  protoSource={protoSource}
                  setProtoSource={setProtoSource}
                />
              }
            />
            <Route path="/ecosystem" element={<Ecosystem />} />
            <Route path="/conclusion" element={<Conclusion />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        {location.pathname !== "/" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 flex justify-between items-center border-t border-[var(--border-light)]">
            {prevNav ? (
              <Link
                to={prevNav.path}
                className="flex flex-col items-start gap-1 group transition-all"
              >
                <span className="text-sm font-mono text-[var(--text-dim)] uppercase tracking-[0.2em]">
                  Previous
                </span>
                <div className="flex items-center gap-2 text-[var(--text-color)] group-hover:text-[var(--cyber-neon-blue)]">
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-cyber font-bold text-sm tracking-wider uppercase">
                    {prevNav.label}
                  </span>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextNav ? (
              <Link
                to={nextNav.path}
                className="flex flex-col items-end gap-1 group transition-all"
              >
                <span className="text-sm font-mono text-[var(--text-dim)] uppercase tracking-[0.2em]">
                  Next
                </span>
                <div className="flex items-center gap-2 text-[var(--text-color)] group-hover:text-[var(--cyber-neon-blue)]">
                  <span className="font-cyber font-bold text-sm tracking-wider uppercase">
                    {nextNav.label}
                  </span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ) : (
              <div />
            )}
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-[var(--border-light)] px-4 sm:px-8 flex flex-col items-center gap-4 bg-[var(--bg-color)]">
        <div className="flex gap-8">
          <a
            href="https://kmcd.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-dim)] hover:text-[var(--cyber-neon-blue)] transition-colors"
            aria-label="KMCD.DEV"
          >
            <Fingerprint className="w-5 h-5" />
          </a>
          <a
            href="https://github.com/sudorandom/protobuf.kmcd.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-dim)] hover:text-[var(--cyber-neon-pink)] transition-colors"
            aria-label="GitHub Repository"
          >
            <Code2 className="w-5 h-5" />
          </a>
          <a
            href="https://protobuf.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-dim)] hover:text-[var(--cyber-neon-green)] transition-colors"
            aria-label="Protobuf Documentation"
          >
            <Database className="w-5 h-5" />
          </a>
        </div>
        <p className="text-sm font-mono text-[var(--text-dim)] uppercase tracking-[0.2em] flex flex-wrap justify-center gap-x-4 gap-y-2">
          <span>
            Created by{" "}
            <a
              href="https://kmcd.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-dim)] hover:text-[var(--cyber-neon-blue)] transition-colors"
              aria-label="KMCD.DEV"
            >
              Kevin McDonald
            </a>
          </span>
          <span className="hidden sm:inline opacity-30">|</span>
          <span>
            Hosted by{" "}
            <a
              href="https://pages.github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-dim)] hover:text-[var(--cyber-neon-blue)] transition-colors"
            >
              GitHub Pages
            </a>
          </span>
        </p>
      </footer>
    </div>
  );
}

export default App;
