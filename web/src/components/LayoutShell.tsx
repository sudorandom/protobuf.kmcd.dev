import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  { id: "community", label: "COMMUNITY", path: "/community/" },
  { id: "conclusion", label: "CONCLUSION", path: "/conclusion/" },
];

const SECTION_LABELS: Record<string, string> = {
  hero: "Welcome",
  intro: "Introduction",
  basics: "Basics",
  advanced: "Advanced",
  efficiency: "Efficiency",
  binary: "Binary",
  community: "Community",
  conclusion: "Conclusion",
  ecosystem: "Ecosystem",
};

interface LayoutShellProps {
  currentPath: string;
  children: React.ReactNode;
}

export const LayoutShell: React.FC<LayoutShellProps> = ({
  currentPath,
  children,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const normalizedPathname =
    currentPath === "/"
      ? "/"
      : currentPath.endsWith("/")
        ? currentPath
        : `${currentPath}/`;

  const currentNavIndex = NAV_ITEMS.findIndex(
    (item) =>
      item.path === normalizedPathname ||
      (normalizedPathname === "/" && item.path === "/"),
  );
  let activeSection = NAV_ITEMS[currentNavIndex]?.id || "hero";
  if (normalizedPathname === "/ecosystem/") {
    activeSection = "ecosystem";
  }

  const prevNav = currentNavIndex > 0 ? NAV_ITEMS[currentNavIndex - 1] : null;
  const nextNav =
    currentNavIndex >= 0 && currentNavIndex < NAV_ITEMS.length - 1
      ? NAV_ITEMS[currentNavIndex + 1]
      : null;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLight = document.documentElement.classList.contains("light");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(isLight ? "light" : "dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    const root = document.documentElement;
    if (nextTheme === "light") {
      root.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      root.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  };

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
            <a href="/" className="hover:opacity-80 transition-opacity">
              <span className="text-xl font-mono font-bold tracking-tight text-[var(--text-color)] block">
                protobuf
                <span className="text-[var(--cyber-neon-blue)]">.kmcd.dev</span>
              </span>
            </a>
            <p className="text-sm font-mono text-[var(--cyber-neon-blue)] tracking-widest -mt-1 uppercase opacity-90 block max-w-[150px] truncate lg:max-w-none">
              <span className="lg:hidden">
                {SECTION_LABELS[activeSection] || "Welcome"}
              </span>
              <span className="hidden lg:inline">Protobuf Visualized</span>
            </p>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center pointer-events-none">
          <div className="flex items-center gap-8 pointer-events-auto min-w-[480px] justify-center">
            {prevNav ? (
              <a
                href={prevNav.path}
                className="p-1 text-[var(--text-dim)] hover:text-[var(--cyber-neon-blue)] hover:bg-[var(--cyber-neon-blue)]/10 rounded transition-colors"
                title={`Previous: ${prevNav.label}`}
                aria-label={`Go to previous section: ${prevNav.label}`}
              >
                <ChevronLeft className="w-6 h-6" aria-hidden="true" />
              </a>
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
                            <a
                              key={item.id}
                              href={item.path}
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
                            </a>
                          );
                        })}
                        <div className="border-t border-[var(--border-light)]/40 my-1" />
                        <a
                          href="/ecosystem/"
                          onClick={() => setIsNavDropdownOpen(false)}
                          aria-current={
                            activeSection === "ecosystem" ? "page" : undefined
                          }
                          className={`flex items-center gap-3 px-4 py-2 text-xs font-mono transition-colors ${
                            activeSection === "ecosystem"
                              ? "text-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/10"
                              : "text-[var(--text-dim)] hover:text-[var(--text-color)] hover:bg-[var(--border-light)]"
                          }`}
                        >
                          <span className="opacity-50" aria-hidden="true">
                            ★
                          </span>
                          <span className="font-cyber font-bold tracking-wider">
                            ECOSYSTEM
                          </span>
                        </a>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            {nextNav ? (
              <a
                href={nextNav.path}
                className="p-1 text-[var(--text-dim)] hover:text-[var(--cyber-neon-blue)] hover:bg-[var(--cyber-neon-blue)]/10 rounded transition-colors"
                title={`Next: ${nextNav.label}`}
                aria-label={`Go to next section: ${nextNav.label}`}
              >
                <ChevronRight className="w-6 h-6" aria-hidden="true" />
              </a>
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
                  {NAV_ITEMS.map((item, i) => {
                    const isActive =
                      normalizedPathname === item.path ||
                      (normalizedPathname === "/" && item.path === "/");
                    return (
                      <div key={item.id} className="flex flex-col">
                        <div
                          className={`group flex items-center justify-between py-3 border-b hover:border-[var(--cyber-neon-blue)]/30 transition-colors ${
                            isActive
                              ? "border-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/5"
                              : "border-[var(--border-light)]"
                          }`}
                        >
                          <a
                            href={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex flex-col flex-1 px-2"
                            aria-current={isActive ? "page" : undefined}
                          >
                            <span
                              className={`text-sm font-mono mb-0.5 ${
                                isActive
                                  ? "text-[var(--cyber-neon-blue)]"
                                  : "text-[var(--cyber-neon-blue)]/80"
                              }`}
                              aria-hidden="true"
                            >
                              0{i + 1}
                            </span>
                            <span
                              className={`font-cyber font-bold text-sm tracking-wider group-hover:text-[var(--cyber-neon-blue)] transition-colors uppercase ${
                                isActive
                                  ? "text-[var(--cyber-neon-blue)]"
                                  : "text-[var(--text-color)]"
                              }`}
                            >
                              {item.label}
                            </span>
                          </a>
                          <div
                            className="flex items-center gap-2 pr-2"
                            aria-hidden="true"
                          >
                            <ChevronRight
                              className={`w-4 h-4 transition-all -translate-x-2 group-hover:translate-x-0 ${
                                isActive
                                  ? "text-[var(--cyber-neon-blue)] translate-x-0"
                                  : "text-[var(--text-color)]/0 group-hover:text-[var(--cyber-neon-blue)]"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Divider and Ecosystem Link */}
                  <div className="border-t border-[var(--border-light)]/50 my-4 pt-4">
                    <div
                      className={`group flex items-center justify-between py-3 border-b hover:border-[var(--cyber-neon-blue)]/30 transition-colors ${
                        activeSection === "ecosystem"
                          ? "border-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/5"
                          : "border-[var(--border-light)]"
                      }`}
                    >
                      <a
                        href="/ecosystem/"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex flex-col flex-1 px-2"
                        aria-current={
                          activeSection === "ecosystem" ? "page" : undefined
                        }
                      >
                        <span
                          className={`text-sm font-mono mb-0.5 ${
                            activeSection === "ecosystem"
                              ? "text-[var(--cyber-neon-blue)]"
                              : "text-[var(--cyber-neon-blue)]/80"
                          }`}
                          aria-hidden="true"
                        >
                          EXPLORER
                        </span>
                        <span
                          className={`font-cyber font-bold text-sm tracking-wider group-hover:text-[var(--cyber-neon-blue)] transition-colors uppercase ${
                            activeSection === "ecosystem"
                              ? "text-[var(--cyber-neon-blue)]"
                              : "text-[var(--text-color)]"
                          }`}
                        >
                          ECOSYSTEM
                        </span>
                      </a>
                      <div
                        className="flex items-center gap-2 pr-2"
                        aria-hidden="true"
                      >
                        <ChevronRight
                          className={`w-4 h-4 transition-all -translate-x-2 group-hover:translate-x-0 ${
                            activeSection === "ecosystem"
                              ? "text-[var(--cyber-neon-blue)] translate-x-0"
                              : "text-[var(--text-color)]/0 group-hover:text-[var(--cyber-neon-blue)]"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
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
        className="min-h-[calc(100vh-64px)] flex flex-col pt-[64px]"
      >
        {children}
        {activeSection !== "hero" && activeSection !== "ecosystem" && (
          <div className="mt-auto max-w-7xl mx-auto px-4 sm:px-8 py-12 flex justify-between items-center border-t border-[var(--border-light)] w-full">
            {prevNav ? (
              <a
                href={prevNav.path}
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
              </a>
            ) : (
              <div />
            )}

            {nextNav ? (
              <a
                href={nextNav.path}
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
              </a>
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
};

export default LayoutShell;
