import React, { useState, useMemo, useEffect, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation, Link } from "react-router-dom";
import { CyberSpinner } from "./components/CyberSpinner";
import {
  Cpu,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  AlignLeft,
  X,
  Sun,
  Moon,
  Fingerprint,
  Code2,
  Database,
} from "lucide-react";

import { type FileRegistry } from "@bufbuild/protobuf";
import { INITIAL_PROTO } from "./utils/initial-proto";

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
  { id: "intro", label: "INTRO", path: "/intro/" },
  { id: "basics", label: "BASICS", path: "/basics/" },
  { id: "advanced", label: "ADVANCED", path: "/advanced/" },
  { id: "efficiency", label: "EFFICIENCY", path: "/efficiency/" },
  { id: "binary", label: "BINARY", path: "/binary/" },
  { id: "ecosystem", label: "ECOSYSTEM", path: "/ecosystem/" },
  { id: "conclusion", label: "CONCLUSION", path: "/conclusion/" },
];

const SECTION_LABELS: Record<string, string> = {
  hero: "Welcome",
  intro: "Introduction",
  basics: "Basics",
  advanced: "Advanced",
  efficiency: "Efficiency",
  binary: "Binary",
  ecosystem: "The Ecosystem",
  conclusion: "Conclusion",
  // Sub-sections
  schema: "Basics",
  "generating-code": "Basics",
  messages: "Messages",
  fields: "Fields",
  numbers: "Field Numbers",
  enums: "Enums",
  packages: "Packages",
  nested: "Composition",
  repeated: "Collections",
  maps: "Maps",
  oneof: "Oneof",
  types: "Type Reference",
  "advanced-concepts": "Advanced",
  reflection: "Reflection",
  descriptors: "Descriptors",
  lab: "Protoscope Lab",
  "custom-options": "Custom Options",
  protovalidate: "Protovalidate",
  lifecycle: "Evolution",
  "varint-explainer": "Varints",
  "binary-tag": "Tag System",
  "wire-types": "Wire Types",
  "endian-shifting": "Binary 101",
  matrix: "Matrix Explorer",
  protoscope: "Protoscope Lab",
  industry: "Adoption",
  toolbox: "Toolbox",
  networking: "Networking",
  community: "Community",
  alternatives: "Alternatives",
  nextsteps: "Next Steps",
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
  const normalizedPathname =
    location.pathname === "/"
      ? "/"
      : location.pathname.endsWith("/")
        ? location.pathname
        : `${location.pathname}/`;
  const isActive =
    normalizedPathname === item.path ||
    (normalizedPathname === "/" && item.path === "/");

  return (
    <div className="flex flex-col">
      <div
        className={`group flex items-center justify-between py-3 border-b hover:border-[var(--cyber-neon-blue)]/30 transition-colors ${isActive ? "border-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/5" : "border-[var(--border-light)]"}`}
      >
        <Link
          to={item.path}
          onClick={onNavigate}
          className="flex flex-col flex-1 px-2"
          aria-current={isActive ? "page" : undefined}
        >
          <span
            className={`text-sm font-mono mb-0.5 ${isActive ? "text-[var(--cyber-neon-blue)]" : "text-[var(--cyber-neon-blue)]/80"}`}
            aria-hidden="true"
          >
            0{index + 1}
          </span>
          <span
            className={`font-cyber font-bold text-sm tracking-wider group-hover:text-[var(--cyber-neon-blue)] transition-colors uppercase ${isActive ? "text-[var(--cyber-neon-blue)]" : "text-[var(--text-color)]"}`}
          >
            {item.label}
          </span>
        </Link>
        <div className="flex items-center gap-2 pr-2" aria-hidden="true">
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
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [protoSource, setProtoSource] = useState(INITIAL_PROTO);
  const [explorerProto, setExplorerProto] = useState(INITIAL_PROTO);
  const [protoscopeProto, setProtoscopeProto] = useState(INITIAL_PROTO);
  const [registry, setRegistry] = useState<FileRegistry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const normalizedPathname =
    location.pathname === "/"
      ? "/"
      : location.pathname.endsWith("/")
        ? location.pathname
        : `${location.pathname}/`;

  const currentNavIndex = NAV_ITEMS.findIndex(
    (item) =>
      item.path === normalizedPathname ||
      (normalizedPathname === "/" && item.path === "/"),
  );
  const activeSection = NAV_ITEMS[currentNavIndex]?.id || "hero";
  const [currentVisibleSection, setCurrentVisibleSection] =
    useState(activeSection);

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
    // This is a valid use case for a cascading render. On navigation, we need
    // to synchronously update the visible section to prevent a flash of stale
    // content from the previous page before the scroll observer has a chance to run.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentVisibleSection(activeSection);
    if (window.location.hash) {
      history.replaceState(null, "", normalizedPathname);
    }
  }, [normalizedPathname, activeSection]);

  useEffect(() => {
    const visibleSections = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.add(entry.target.id);
          } else {
            visibleSections.delete(entry.target.id);
          }
        });

        if (visibleSections.size > 0) {
          const sorted = Array.from(visibleSections).sort((a, b) => {
            const elA = document.getElementById(a);
            const elB = document.getElementById(b);
            if (!elA || !elB) return 0;
            return elA.offsetTop - elB.offsetTop;
          });
          const newVisibleSection = sorted[0];
          setCurrentVisibleSection(newVisibleSection);

          const currentPath =
            window.location.pathname === "/"
              ? "/"
              : window.location.pathname.endsWith("/")
                ? window.location.pathname
                : `${window.location.pathname}/`;

          if (window.scrollY < 100) {
            history.replaceState(null, "", currentPath);
          } else if (currentPath === "/" && newVisibleSection === "hero") {
            history.replaceState(null, "", currentPath);
          } else {
            history.replaceState(
              null,
              "",
              `${currentPath}#${newVisibleSection}`,
            );
          }
        }
      },
      {
        threshold: 0,
        rootMargin: "-20% 0px -40% 0px",
      },
    );

    const scanAndObserve = () => {
      const sections = document.querySelectorAll("section[id]");
      sections.forEach((section) => {
        if (section) observer.observe(section);
      });
    };

    scanAndObserve();

    const mutationObserver = new MutationObserver(() => {
      scanAndObserve();
    });

    const mainElement = document.getElementById("main-content");
    if (mainElement) {
      mutationObserver.observe(mainElement, { childList: true, subtree: true });
    }

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setIsNavDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    if (location.pathname === "/") return;

    let active = true;
    const timer = setTimeout(async () => {
      try {
        const { createDynamicRegistry } =
          await import("./utils/dynamic-registry");
        const result = await createDynamicRegistry(protoSource);
        if (active) {
          if (result.kind === "success") {
            setRegistry(result.registry);
            setError(null);
          } else {
            setRegistry(null);
            setError(null);
          }
        }
      } catch (e: unknown) {
        if (active) {
          const message = e instanceof Error ? e.message : String(e);
          setRegistry(null);
          setError(message);
        }
      }
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [protoSource, location.pathname]);

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
          <div
            className="w-10 h-10 bg-[var(--cyber-neon-blue)]/10 rounded border border-[var(--cyber-neon-blue)]/30 flex items-center justify-center"
            aria-hidden="true"
          >
            <Cpu className="w-6 h-6 text-[var(--cyber-neon-blue)]" />
          </div>
          <div>
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <span className="text-xl font-mono font-bold tracking-tight text-[var(--text-color)] block">
                protobuf
                <span className="text-[var(--cyber-neon-blue)]">.kmcd.dev</span>
              </span>
            </Link>
            <p className="text-sm font-mono text-[var(--cyber-neon-blue)] tracking-widest -mt-1 uppercase opacity-90 block max-w-[150px] truncate lg:max-w-none">
              <span className="lg:hidden">
                {SECTION_LABELS[currentVisibleSection] ||
                  SECTION_LABELS[activeSection] ||
                  "Welcome"}
              </span>
              <span className="hidden lg:inline">Protobuf Visualized</span>
            </p>
          </div>
        </div>
        {error && (
          <div
            className="ml-8 px-3 py-1 bg-[var(--text-error)]/10 border border-[var(--text-error)]/30 rounded text-[var(--text-error)] text-sm font-mono animate-pulse uppercase"
            role="alert"
          >
            SCHEMA_ERROR: {error}
          </div>
        )}

        <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center pointer-events-none">
          <div className="flex items-center gap-8 pointer-events-auto min-w-[480px] justify-center">
            {prevNav ? (
              <Link
                to={prevNav.path}
                className="p-1 text-[var(--text-dim)] hover:text-[var(--cyber-neon-blue)] hover:bg-[var(--cyber-neon-blue)]/10 rounded transition-colors"
                title={`Previous: ${prevNav.label}`}
                aria-label={`Go to previous section: ${prevNav.label}`}
              >
                <ChevronLeft className="w-6 h-6" aria-hidden="true" />
              </Link>
            ) : (
              <div className="w-8 h-8" />
            )}
            <div className="relative">
              <button
                onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
                aria-expanded={isNavDropdownOpen}
                aria-controls="nav-dropdown"
                aria-label={`${SECTION_LABELS[activeSection] || "Welcome"} - Toggle navigation menu`}
                className={`flex items-center justify-center gap-2 text-sm font-mono font-bold uppercase tracking-widest bg-[var(--overlay-bg)] px-4 py-1.5 rounded border transition-all min-w-[200px] text-center ${
                  isNavDropdownOpen
                    ? "border-[var(--cyber-neon-blue)] text-[var(--cyber-neon-blue)] shadow-[0_0_10px_rgba(0,243,255,0.1)]"
                    : "border-[var(--border-light)] text-[var(--text-color)] hover:border-[var(--cyber-neon-blue)]/50"
                }`}
              >
                {SECTION_LABELS[activeSection] || "Welcome"}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isNavDropdownOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence>
                {isNavDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[105] cursor-default"
                      onClick={() => setIsNavDropdownOpen(false)}
                      aria-hidden="true"
                    />
                    <motion.div
                      id="nav-dropdown"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[var(--panel-bg)] border border-[var(--border-light)] rounded shadow-2xl overflow-hidden z-[110] backdrop-blur-2xl"
                    >
                      <div className="py-1 bg-[var(--panel-bg)]/95">
                        {NAV_ITEMS.map((item, i) => {
                          const isActive = activeSection === item.id;
                          return (
                            <Link
                              key={item.id}
                              to={item.path}
                              onClick={() => setIsNavDropdownOpen(false)}
                              aria-current={isActive ? "page" : undefined}
                              className={`flex items-center gap-3 px-4 py-2 text-xs font-mono transition-colors ${
                                isActive
                                  ? "text-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/10"
                                  : "text-[var(--text-dim)] hover:text-[var(--text-color)] hover:bg-[var(--border-light)]"
                              }`}
                            >
                              <span className="opacity-50" aria-hidden="true">
                                0{i + 1}
                              </span>
                              <span className="font-bold tracking-wider">
                                {item.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            {nextNav ? (
              <Link
                to={nextNav.path}
                className="p-1 text-[var(--text-dim)] hover:text-[var(--cyber-neon-blue)] hover:bg-[var(--cyber-neon-blue)]/10 rounded transition-colors"
                title={`Next: ${nextNav.label}`}
                aria-label={`Go to next section: ${nextNav.label}`}
              >
                <ChevronRight className="w-6 h-6" aria-hidden="true" />
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
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? (
              <Sun
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                aria-hidden="true"
              />
            ) : (
              <Moon
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                aria-hidden="true"
              />
            )}
          </button>

          <button
            onClick={() => setIsMenuOpen(true)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            className="p-2 text-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/5 hover:bg-[var(--cyber-neon-blue)]/15 rounded-md border border-[var(--cyber-neon-blue)]/30 transition-all group shadow-[0_0_10px_rgba(0,243,255,0.05)]"
            aria-label="Open navigation menu"
          >
            <AlignLeft
              className="w-6 h-6 group-hover:scale-110 transition-transform"
              aria-hidden="true"
            />
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
              aria-hidden="true"
            />

            <motion.div
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation Menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm z-[120] bg-[var(--panel-bg)] border-l border-[var(--border-light)] shadow-2xl flex flex-col"
            >
              <div className="h-[64px] flex items-center justify-between px-4 sm:px-8 border-b border-[var(--border-light)]">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 bg-[var(--cyber-neon-blue)]/10 rounded border border-[var(--cyber-neon-blue)]/30 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <Cpu className="w-3.5 h-3.5 text-[var(--cyber-neon-blue)]" />
                  </div>
                  <span className="font-cyber font-bold text-[var(--cyber-neon-blue)] text-sm tracking-[0.2em] uppercase">
                    Navigation
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-[var(--text-dim)] hover:text-[var(--text-color)] transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" aria-hidden="true" />
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
                    aria-label="Visit KMCD.DEV"
                  >
                    <Fingerprint className="w-4 h-4" aria-hidden="true" />
                  </a>
                  <a
                    href="https://github.com/sudorandom/protobuf.kmcd.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[var(--overlay-bg)] rounded hover:bg-[var(--border-light)] transition-colors text-[var(--text-dim)] hover:text-[var(--cyber-neon-pink)]"
                    title="GitHub Repository"
                    aria-label="Visit GitHub Repository"
                  >
                    <Code2 className="w-4 h-4" aria-hidden="true" />
                  </a>
                  <a
                    href="https://protobuf.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[var(--overlay-bg)] rounded hover:bg-[var(--border-light)] transition-colors text-[var(--text-dim)] hover:text-[var(--cyber-neon-green)]"
                    title="Protobuf Docs"
                    aria-label="Visit Protobuf Documentation"
                  >
                    <Database className="w-4 h-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main
        id="main-content"
        className="min-h-[calc(100vh-64px)] flex flex-col"
      >
        <Suspense fallback={<CyberSpinner />}>
          <Routes>
            <Route path="/" element={<Hero isAtTop={isAtTop} />} />
            <Route
              path="/intro/"
              element={<Introduction messageSchema={messageSchema} />}
            />
            <Route path="/basics/" element={<Basics />} />
            <Route path="/advanced/" element={<Advanced />} />
            <Route
              path="/efficiency/"
              element={
                <Efficiency
                  protoSource={protoSource}
                  setProtoSource={setProtoSource}
                />
              }
            />{" "}
            <Route
              path="/binary/"
              element={
                <Binary
                  explorerProto={explorerProto}
                  setExplorerProto={setExplorerProto}
                  protoscopeProto={protoscopeProto}
                  setProtoscopeProto={setProtoscopeProto}
                />
              }
            />{" "}
            <Route path="/ecosystem/" element={<Ecosystem />} />
            <Route path="/conclusion/" element={<Conclusion />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {location.pathname !== "/" && (
            <div className="mt-auto max-w-7xl mx-auto px-4 sm:px-8 py-12 flex justify-between items-center border-t border-[var(--border-light)] w-full">
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
        </Suspense>
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
