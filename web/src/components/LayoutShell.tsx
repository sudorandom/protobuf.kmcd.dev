import React, { useState, useEffect, useLayoutEffect } from "react";
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
  Search,
  Command,
} from "lucide-react";

interface NavItemDef {
  id: string;
  label: string;
  path: string;
  description: string;
}

const NAV_ITEMS: NavItemDef[] = [
  {
    id: "hero",
    label: "Home",
    path: "/",
    description: "Start from the main protobuf workbench.",
  },
  {
    id: "intro",
    label: "Introduction",
    path: "/intro/",
    description: "Understand messages, schemas, and generated code.",
  },
  {
    id: "basics",
    label: "Basics",
    path: "/basics/",
    description: "Generate code and write practical schemas.",
  },
  {
    id: "advanced",
    label: "Advanced",
    path: "/advanced/",
    description: "Evolve messages without breaking deployed systems.",
  },
  {
    id: "tooling",
    label: "Tooling",
    path: "/tooling/",
    description: "Use descriptors, plugins, options, and validation.",
  },
  {
    id: "efficiency",
    label: "Efficiency",
    path: "/efficiency/",
    description: "Compare protobuf size and shape against JSON.",
  },
  {
    id: "binary",
    label: "Binary",
    path: "/binary/",
    description: "Decode wire-format bytes one field at a time.",
  },
  {
    id: "community",
    label: "Community",
    path: "/community/",
    description: "Explore protobuf adoption, history, and community resources.",
  },
  {
    id: "conclusion",
    label: "Conclusion",
    path: "/conclusion/",
    description: "Wrap up the protobuf concepts and next steps.",
  },
];

const SECTION_LABELS: Record<string, string> = {
  hero: "Home",
  intro: "Introduction",
  basics: "Basics",
  practice: "Practice",
  advanced: "Advanced",
  tooling: "Tooling",
  efficiency: "Efficiency",
  binary: "Binary",
  community: "Community",
  ecosystem: "Ecosystem",
  conclusion: "Conclusion",
};

const RESOURCE_ITEMS: NavItemDef[] = [
  {
    id: "ecosystem",
    label: "Ecosystem",
    path: "/ecosystem/",
    description: "Find implementations, libraries, and protobuf projects.",
  },
];

const STANDALONE_ITEMS: NavItemDef[] = [
  {
    id: "practice",
    label: "Practice",
    path: "/practice/",
    description:
      "Learn by fixing broken schemas in an interactive browser-based evaluation loop.",
  },
];

const ALL_PAGE_ITEMS = [...NAV_ITEMS, ...RESOURCE_ITEMS, ...STANDALONE_ITEMS];
const navItem = (id: string) =>
  ALL_PAGE_ITEMS.find((item) => item.id === id) as NavItemDef;
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const RELATED_LINKS: Record<string, NavItemDef[]> = {
  intro: [navItem("basics"), navItem("binary"), navItem("efficiency")],
  basics: [navItem("intro"), navItem("advanced"), navItem("tooling")],
  binary: [navItem("basics"), navItem("tooling"), navItem("efficiency")],
  advanced: [navItem("basics"), navItem("tooling"), navItem("efficiency")],
  tooling: [navItem("advanced"), navItem("ecosystem"), navItem("binary")],
  efficiency: [navItem("basics"), navItem("binary"), navItem("advanced")],
  ecosystem: [navItem("tooling"), navItem("binary"), navItem("efficiency")],
  community: [navItem("ecosystem"), navItem("tooling"), navItem("intro")],
  conclusion: [navItem("community"), navItem("ecosystem"), navItem("intro")],
  practice: [navItem("basics"), navItem("advanced"), navItem("binary")],
};

interface PageSectionLink {
  id: string;
  label: string;
}

const SideNavigationGroup = ({
  title,
  items,
  activeSection,
  pageSections,
  activePageSectionId,
  onNavigate,
}: {
  title: string;
  items: NavItemDef[];
  activeSection: string;
  pageSections: PageSectionLink[];
  activePageSectionId: string | null;
  onNavigate?: () => void;
}) => (
  <div>
    <div className="mb-3 px-2 text-xs font-mono uppercase tracking-[0.2em] text-[var(--text-dim)]">
      {title}
    </div>
    <div className="space-y-1">
      {items.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <div key={item.id}>
            <a
              href={item.path}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`block rounded-md px-2 py-2 font-cyber text-xs font-bold uppercase tracking-wider transition-colors ${
                isActive
                  ? "bg-[var(--cyber-neon-blue)]/10 text-[var(--cyber-neon-blue)]"
                  : "text-[var(--text-dim)] hover:bg-[var(--overlay-bg)] hover:text-[var(--text-color)]"
              }`}
            >
              {item.label}
            </a>
            {isActive && pageSections.length > 1 && (
              <div className="mt-1 space-y-1 border-l border-[var(--border-light)] ml-3 pl-2 pr-1">
                {pageSections.map((section) => {
                  const isCurrentSection = activePageSectionId === section.id;
                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      onClick={onNavigate}
                      aria-current={isCurrentSection ? "location" : undefined}
                      className={`block rounded px-2 py-1.5 text-sm leading-snug transition-colors ${
                        isCurrentSection
                          ? "bg-[var(--cyber-neon-blue)]/10 text-[var(--text-color)]"
                          : "text-[var(--text-dim)] hover:bg-[var(--overlay-bg)] hover:text-[var(--text-color)]"
                      }`}
                    >
                      {section.label}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

interface PagefindData {
  url: string;
  title: string;
  excerpt: string;
  sub_results?: PagefindSubResult[];
  meta?: Record<string, string>;
}

interface PagefindSubResult {
  title: string;
  url: string;
  excerpt: string;
}

interface PagefindResult {
  id: string;
  data: () => Promise<PagefindData>;
}

interface PagefindSearch {
  results: PagefindResult[];
}

interface PagefindModule {
  search: (query: string) => Promise<PagefindSearch>;
  options: (options: { highlightParam: string }) => Promise<void>;
}

interface SearchResultItem {
  url: string;
  title: string;
  excerpt: string;
  category?: string;
}

interface PagefindHighlightModule {
  default: new (options: {
    highlightParam: string;
    addStyles: boolean;
    markOptions: {
      className: string;
      exclude: string[];
    };
  }) => unknown;
}

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
};

const scrollFirstSearchHighlightIntoView = () => {
  window.setTimeout(() => {
    const firstHighlight = document.querySelector(".search-highlight");
    if (!firstHighlight) return;

    firstHighlight.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }, 250);
};

const SearchModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [query, setQuery] = useState("");
  const [pagefind, setPagefind] = useState<PagefindModule | null>(null);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const resultRefs = React.useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen || pagefind || loadError) return;

    let isMounted = true;
    const pagefindUrl = "/pagefind/pagefind.js";
    import(/* @vite-ignore */ pagefindUrl)
      .then(async (module: PagefindModule) => {
        await module.options({ highlightParam: "highlight" });
        if (isMounted) setPagefind(module);
      })
      .catch(() => {
        if (isMounted) setLoadError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, loadError, pagefind]);

  useEffect(() => {
    if (!isOpen) return;

    const trimmedQuery = query.trim();
    if (!pagefind || trimmedQuery.length < 2) {
      return;
    }

    let isCurrent = true;

    const timeoutId = window.setTimeout(() => {
      setIsLoading(true);
      pagefind
        .search(trimmedQuery)
        .then(async (search) => {
          const pageEntries = await Promise.all(
            search.results.slice(0, 8).map((result) => result.data()),
          );
          const entries = pageEntries.flatMap((entry) => {
            const subResults = entry.sub_results?.slice(0, 2) || [];
            if (subResults.length === 0) {
              return [
                {
                  url: entry.url,
                  title: entry.title,
                  excerpt: entry.excerpt,
                  category: entry.meta?.category,
                },
              ];
            }

            return subResults.map((subResult) => ({
              url: subResult.url,
              title: subResult.title || entry.title,
              excerpt: subResult.excerpt || entry.excerpt,
              category: entry.meta?.category,
            }));
          });
          if (isCurrent) {
            setResults(entries);
            setActiveResultIndex(entries.length > 0 ? 0 : -1);
          }
        })
        .catch(() => {
          if (isCurrent) {
            setResults([]);
            setActiveResultIndex(-1);
          }
        })
        .finally(() => {
          if (isCurrent) setIsLoading(false);
        });
    }, 120);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, pagefind, query]);

  useIsomorphicLayoutEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveResultIndex((current) =>
          current < results.length - 1 ? current + 1 : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveResultIndex((current) =>
          current > 0 ? current - 1 : results.length - 1,
        );
      } else if (e.key === "Enter" && activeResultIndex >= 0) {
        e.preventDefault();
        window.location.href = results[activeResultIndex].url;
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeResultIndex, isOpen, onClose, results]);

  useEffect(() => {
    if (!isOpen || activeResultIndex < 0) return;
    resultRefs.current[activeResultIndex]?.scrollIntoView({
      block: "nearest",
    });
  }, [activeResultIndex, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[130]"
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search protobuf.com"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="fixed left-1/2 top-24 z-[140] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 overflow-hidden rounded-lg border border-[var(--border-light)] bg-[var(--panel-bg)] shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-[var(--border-light)] px-4 py-3">
              <Search
                className="h-5 w-5 text-[var(--cyber-neon-blue)]"
                aria-hidden="true"
              />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search wire types, field numbers, descriptors..."
                className="min-w-0 flex-1 bg-transparent text-base text-[var(--text-color)] outline-none placeholder:text-[var(--text-dim)]"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls="search-results"
                aria-activedescendant={
                  activeResultIndex >= 0
                    ? `search-result-${activeResultIndex}`
                    : undefined
                }
              />
              <button
                onClick={onClose}
                className="rounded p-1 text-[var(--text-dim)] transition-colors hover:bg-[var(--border-light)] hover:text-[var(--text-color)]"
                aria-label="Close search"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
              {loadError ? (
                <div className="px-3 py-8 text-center text-sm text-[var(--text-dim)]">
                  Search index is not available in this environment.
                </div>
              ) : query.trim().length < 2 ? (
                <div className="px-3 py-8 text-center text-sm text-[var(--text-dim)]">
                  Type at least two characters to search the site.
                </div>
              ) : isLoading ? (
                <div className="px-3 py-8 text-center text-sm text-[var(--text-dim)]">
                  Searching...
                </div>
              ) : results.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-[var(--text-dim)]">
                  No matches found.
                </div>
              ) : (
                <div id="search-results" role="listbox" className="space-y-1">
                  {results.map((result, index) => {
                    const isActive = activeResultIndex === index;
                    return (
                      <a
                        key={`${result.url}-${result.title}`}
                        id={`search-result-${index}`}
                        ref={(el) => {
                          resultRefs.current[index] = el;
                        }}
                        href={result.url}
                        onClick={onClose}
                        onMouseEnter={() => setActiveResultIndex(index)}
                        role="option"
                        aria-selected={isActive}
                        className={`block rounded-md border px-3 py-3 transition-colors ${
                          isActive
                            ? "border-[var(--cyber-neon-blue)]/50 bg-[var(--cyber-neon-blue)]/15"
                            : "border-transparent hover:border-[var(--cyber-neon-blue)]/30 hover:bg-[var(--cyber-neon-blue)]/10"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-cyber text-sm font-bold uppercase tracking-wider text-[var(--text-color)]">
                            {result.title}
                          </span>
                          {result.category && (
                            <span className="shrink-0 font-mono text-xs uppercase tracking-wider text-[var(--cyber-neon-blue)]">
                              {result.category}
                            </span>
                          )}
                        </div>
                        <p
                          className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--text-dim)]"
                          dangerouslySetInnerHTML={{ __html: result.excerpt }}
                        />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface LayoutShellProps {
  currentPath: string;
  children: React.ReactNode;
}

export const LayoutShell: React.FC<LayoutShellProps> = ({
  currentPath,
  children,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [pageSections, setPageSections] = useState<PageSectionLink[]>([]);
  const [activePageSectionId, setActivePageSectionId] = useState<string | null>(
    null,
  );

  const normalizedPathname =
    currentPath === "/"
      ? "/"
      : currentPath.endsWith("/")
        ? currentPath
        : `${currentPath}/`;

  const currentPageIndex = ALL_PAGE_ITEMS.findIndex(
    (item) =>
      item.path === normalizedPathname ||
      (normalizedPathname === "/" && item.path === "/") ||
      (item.path === "/ecosystem/" &&
        normalizedPathname.startsWith("/ecosystem/")),
  );
  const currentNavIndex = NAV_ITEMS.findIndex(
    (item) =>
      item.path === normalizedPathname ||
      (normalizedPathname === "/" && item.path === "/"),
  );
  const activeSection = ALL_PAGE_ITEMS[currentPageIndex]?.id || "hero";
  const visibleNavItems =
    activeSection === "conclusion"
      ? NAV_ITEMS
      : NAV_ITEMS.filter((item) => item.id !== "conclusion");
  const relatedLinks = RELATED_LINKS[activeSection] || [];
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("highlight")) return;

    const highlightUrl = "/pagefind/pagefind-highlight.js";
    import(/* @vite-ignore */ highlightUrl)
      .then((module: PagefindHighlightModule) => {
        new module.default({
          highlightParam: "highlight",
          addStyles: false,
          markOptions: {
            className: "search-highlight",
            exclude: ["[data-pagefind-ignore]", "[data-pagefind-ignore] *"],
          },
        });
        scrollFirstSearchHighlightIntoView();
      })
      .catch(() => {
        // Search highlighting is only available after Pagefind assets are built.
      });
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;

    let sectionElements: HTMLElement[] = [];

    const updateActiveSection = () => {
      const marker = window.scrollY + 160;
      let activeId = sectionElements[0]?.id || null;

      for (const section of sectionElements) {
        if (section.offsetTop <= marker) {
          activeId = section.id;
        } else {
          break;
        }
      }

      const pageBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 8;
      if (pageBottom) {
        activeId = sectionElements[sectionElements.length - 1]?.id || activeId;
      }

      setActivePageSectionId(activeId);
    };

    const refreshSections = () => {
      sectionElements = Array.from(
        document.querySelectorAll<HTMLElement>("main section[id]"),
      );
      const nextSections = sectionElements.map((section) => {
        const heading = section.querySelector("h1, h2, h3");
        const label = heading?.textContent?.trim() || section.id;
        return { id: section.id, label };
      });

      setPageSections((currentSections) => {
        const unchanged =
          currentSections.length === nextSections.length &&
          currentSections.every(
            (section, index) =>
              section.id === nextSections[index]?.id &&
              section.label === nextSections[index]?.label,
          );

        if (unchanged) {
          return currentSections;
        }

        return nextSections;
      });

      updateActiveSection();
    };

    refreshSections();

    const main = document.querySelector("main");
    const observer = new MutationObserver(refreshSections);
    if (main) {
      observer.observe(main, { childList: true, subtree: true });
    }

    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", refreshSections);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", refreshSections);
    };
  }, [normalizedPathname]);

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
        setIsMobileMenuOpen(false);
        setIsNavDropdownOpen(false);
        setIsSearchOpen(false);
      }
      if (
        !isTypingTarget(e.target) &&
        (e.key === "/" ||
          ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"))
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
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
          <div className="flex items-center gap-8 pointer-events-auto min-w-[420px] justify-center">
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
                className={`flex items-center justify-center gap-2 text-sm font-mono font-bold uppercase tracking-widest bg-[var(--overlay-bg)] px-4 py-1.5 rounded border transition-all min-w-[220px] text-center ${
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
                      className="absolute top-full left-1/2 mt-2 w-[240px] -translate-x-1/2 bg-[var(--panel-bg)] border border-[var(--border-light)] rounded shadow-2xl overflow-hidden z-[110] backdrop-blur-2xl"
                    >
                      <div className="py-1 bg-[var(--panel-bg)]/95">
                        {visibleNavItems.map((item) => {
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
                              <ChevronRight
                                className={`h-4 w-4 ${isActive ? "opacity-100" : "opacity-40"}`}
                                aria-hidden="true"
                              />
                              <span className="min-w-0 font-bold tracking-wider">
                                {item.label}
                              </span>
                            </a>
                          );
                        })}
                        <div className="border-t border-[var(--border-light)]/40 my-1" />
                        {RESOURCE_ITEMS.map((item) => {
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
                              <ChevronRight
                                className={`h-4 w-4 ${isActive ? "opacity-100" : "opacity-40"}`}
                                aria-hidden="true"
                              />
                              <span className="min-w-0 font-bold tracking-wider">
                                {item.label}
                              </span>
                            </a>
                          );
                        })}
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
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/5 hover:bg-[var(--cyber-neon-blue)]/15 rounded-md border border-[var(--cyber-neon-blue)]/30 transition-all shadow-[0_0_10px_rgba(0,243,255,0.05)]"
            aria-label="Search site"
          >
            <Search className="w-5 h-5" aria-hidden="true" />
            <span className="hidden xl:inline font-mono text-xs uppercase tracking-wider">
              Search
            </span>
            <span
              className="hidden xl:flex items-center gap-1 rounded border border-[var(--border-light)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-dim)]"
              aria-hidden="true"
            >
              <Command className="h-3 w-3" />K
            </span>
          </button>

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
        </div>
      </header>

      {!isMenuOpen && (
        <button
          onClick={() => setIsMenuOpen(true)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          className="fixed top-20 left-4 sm:left-8 z-[80] hidden p-2 text-[var(--cyber-neon-blue)] bg-[var(--bg-color)]/90 backdrop-blur-md hover:bg-[var(--cyber-neon-blue)]/10 rounded-md border border-[var(--cyber-neon-blue)]/30 transition-all group shadow-[0_0_15px_rgba(0,243,255,0.1)] md:block"
          aria-label="Open navigation menu"
        >
          <AlignLeft
            className="w-6 h-6 group-hover:scale-110 transition-transform"
            aria-hidden="true"
          />
        </button>
      )}

      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          className="fixed top-20 left-4 sm:left-8 z-[80] p-2 text-[var(--cyber-neon-blue)] bg-[var(--bg-color)]/90 backdrop-blur-md hover:bg-[var(--cyber-neon-blue)]/10 rounded-md border border-[var(--cyber-neon-blue)]/30 transition-all group shadow-[0_0_15px_rgba(0,243,255,0.1)] md:hidden"
          aria-label="Open navigation menu"
        >
          <AlignLeft
            className="w-6 h-6 group-hover:scale-110 transition-transform"
            aria-hidden="true"
          />
        </button>
      )}

      <div className="flex min-h-[calc(100vh-64px)] pt-[64px] relative w-full">
        {isMenuOpen && (
          <aside
            className="hidden md:flex w-64 shrink-0 flex-col border-r border-[var(--border-light)] bg-[var(--bg-color)]/90 px-4 py-6 z-[90] backdrop-blur-md"
            aria-label="Page navigation"
          >
            <div className="flex justify-between items-center mb-6 border-b border-[var(--border-light)] pb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 bg-[var(--cyber-neon-blue)]/10 rounded border border-[var(--cyber-neon-blue)]/30 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <AlignLeft className="w-3.5 h-3.5 text-[var(--cyber-neon-blue)]" />
                </div>
                <span className="font-cyber font-bold text-xs uppercase tracking-[0.2em] text-[var(--cyber-neon-blue)]">
                  Navigation
                </span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 text-[var(--text-dim)] hover:text-[var(--text-color)] hover:bg-[var(--overlay-bg)] rounded transition-colors"
                aria-label="Collapse navigation menu"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex min-h-0 flex-1 flex-col gap-6">
              <SideNavigationGroup
                title="Pages"
                items={visibleNavItems}
                activeSection={activeSection}
                pageSections={pageSections}
                activePageSectionId={activePageSectionId}
              />

              <SideNavigationGroup
                title="Resources"
                items={RESOURCE_ITEMS}
                activeSection={activeSection}
                pageSections={pageSections}
                activePageSectionId={activePageSectionId}
              />
            </nav>
          </aside>
        )}

        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] md:hidden"
                aria-hidden="true"
              />

              <motion.div
                id="mobile-menu"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation Menu"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed top-0 left-0 bottom-0 w-full max-w-sm z-[120] bg-[var(--bg-color)]/95 border-r border-[var(--border-light)] shadow-2xl flex flex-col backdrop-blur-md md:hidden"
              >
                <div className="h-[64px] flex items-center justify-between px-4 sm:px-8 border-b border-[var(--border-light)]">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 bg-[var(--cyber-neon-blue)]/10 rounded border border-[var(--cyber-neon-blue)]/30 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <AlignLeft className="w-3.5 h-3.5 text-[var(--cyber-neon-blue)]" />
                    </div>
                    <span className="font-cyber font-bold text-[var(--cyber-neon-blue)] text-sm tracking-[0.2em] uppercase">
                      Navigation
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-[var(--text-dim)] hover:text-[var(--text-color)] transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" aria-hidden="true" />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 sm:px-8 custom-scrollbar">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSearchOpen(true);
                    }}
                    className="mb-5 flex w-full items-center justify-between rounded-md border border-[var(--cyber-neon-blue)]/30 bg-[var(--cyber-neon-blue)]/5 px-4 py-3 text-left text-[var(--cyber-neon-blue)] transition-colors hover:bg-[var(--cyber-neon-blue)]/15"
                  >
                    <span className="flex items-center gap-3">
                      <Search className="h-5 w-5" aria-hidden="true" />
                      <span className="font-cyber text-sm font-bold uppercase tracking-wider">
                        Search
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <div className="flex flex-col gap-6">
                    <SideNavigationGroup
                      title="Pages"
                      items={visibleNavItems}
                      activeSection={activeSection}
                      pageSections={pageSections}
                      activePageSectionId={activePageSectionId}
                      onNavigate={() => setIsMobileMenuOpen(false)}
                    />

                    <SideNavigationGroup
                      title="Resources"
                      items={RESOURCE_ITEMS}
                      activeSection={activeSection}
                      pageSections={pageSections}
                      activePageSectionId={activePageSectionId}
                      onNavigate={() => setIsMobileMenuOpen(false)}
                    />
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
          className="flex-1 min-w-0 flex flex-col pt-0"
          data-pagefind-body
          data-pagefind-meta={`category:${SECTION_LABELS[activeSection] || "Protobuf"}`}
        >
          {children}
          {activeSection !== "hero" && (prevNav || nextNav) && (
            <div className="mt-auto w-full border-t border-[var(--border-light)]">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-10 sm:px-8">
                {prevNav ? (
                  <a
                    href={prevNav.path}
                    className="flex min-w-0 flex-col items-start gap-1 group transition-all"
                  >
                    <span className="text-sm font-mono text-[var(--text-dim)] uppercase tracking-[0.2em]">
                      Previous
                    </span>
                    <div className="flex min-w-0 items-center gap-2 text-[var(--text-color)] group-hover:text-[var(--cyber-neon-blue)]">
                      <ChevronLeft
                        className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-x-1"
                        aria-hidden="true"
                      />
                      <span className="truncate font-cyber text-sm font-bold uppercase tracking-wider">
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
                    className="flex min-w-0 flex-col items-end gap-1 group transition-all text-right"
                  >
                    <span className="text-sm font-mono text-[var(--text-dim)] uppercase tracking-[0.2em]">
                      Next
                    </span>
                    <div className="flex min-w-0 items-center gap-2 text-[var(--text-color)] group-hover:text-[var(--cyber-neon-blue)]">
                      <span className="truncate font-cyber text-sm font-bold uppercase tracking-wider">
                        {nextNav.label}
                      </span>
                      <ChevronRight
                        className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </div>
                  </a>
                ) : (
                  <div />
                )}
              </div>
            </div>
          )}
          {relatedLinks.length > 0 && (
            <div className="w-full border-t border-[var(--border-light)]">
              <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
                <div className="mb-5 text-sm font-mono uppercase tracking-[0.2em] text-[var(--text-dim)]">
                  Related
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {relatedLinks.map((item) => (
                    <a
                      key={`${activeSection}-${item.id}`}
                      href={item.path}
                      className="group rounded-md border border-[var(--border-light)] bg-[var(--overlay-bg)] p-4 transition-colors hover:border-[var(--cyber-neon-blue)]/40 hover:bg-[var(--cyber-neon-blue)]/10"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-cyber text-sm font-bold uppercase tracking-wider text-[var(--text-color)] group-hover:text-[var(--cyber-neon-blue)]">
                          {item.label}
                        </span>
                        <ChevronRight
                          className="h-4 w-4 text-[var(--cyber-neon-blue)] transition-transform group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--text-dim)]">
                        {item.description}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
          <footer className="border-t border-[var(--border-light)] bg-[var(--bg-color)]">
            <div className="py-12 px-4 sm:px-8 flex flex-col items-center gap-4">
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
            </div>
          </footer>
        </main>
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

export default LayoutShell;
