import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Search,
  Star,
  ExternalLink,
  Wrench,
  Puzzle,
  Library,
  ArrowUpDown,
  AlertTriangle,
  Code2,
  Filter,
} from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LanguageIcon = ({
  lang,
  size = 12,
  className = "mr-1",
}: {
  lang: string;
  size?: number;
  className?: string;
}) => {
  const norm = lang.toLowerCase().trim();
  const iconClassMap: Record<string, string> = {
    go: "devicon-go-plain",
    rust: "devicon-rust-plain",
    python: "devicon-python-plain",
    typescript: "devicon-typescript-plain",
    javascript: "devicon-javascript-plain",
    java: "devicon-java-plain",
    "c++": "devicon-cplusplus-plain",
    c: "devicon-c-plain",
    "c#": "devicon-csharp-plain",
    swift: "devicon-swift-plain",
    kotlin: "devicon-kotlin-plain",
    elixir: "devicon-elixir-plain",
    dart: "devicon-dart-plain",
    php: "devicon-php-plain",
    ruby: "devicon-ruby-plain",
    scala: "devicon-scala-plain",
    julia: "devicon-julia-plain",
    "objective-c": "devicon-objectivec-plain",
  };

  const iconClass = iconClassMap[norm];
  if (!iconClass) {
    return (
      <Code2 className={className} style={{ width: size, height: size }} />
    );
  }

  return (
    <i
      className={`${iconClass} ${className}`}
      style={{
        fontSize: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
      }}
    />
  );
};
import { Section, SectionTitle } from "../components/shared/Common";
import ecosystemData from "../data/ecosystem.json";

// --- Types ---
interface Project {
  category: string | string[];
  name: string;
  owner: string;
  repo: string;
  desc: string;
  url: string;
  github: string | string[];
  stars: number;
  pushedAt: string;
  inactive: boolean;
  archived?: boolean;
  languages: string[];
  starsWeekly?: number;
  starsMonthly?: number;
}

// --- Formatting helper ---
const formatStars = (stars: number) => {
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1)}k`;
  }
  return stars.toString();
};

const getPageNumbers = (current: number, total: number) => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  pages.push(1);

  if (current <= 3) {
    pages.push(2, 3, 4);
    pages.push("...");
    pages.push(total);
  } else if (current >= total - 2) {
    pages.push("...");
    pages.push(total - 3, total - 2, total - 1);
    pages.push(total);
  } else {
    pages.push("...");
    pages.push(current - 1, current, current + 1);
    pages.push("...");
    pages.push(total);
  }

  return pages;
};

// --- Main Ecosystem Page Component ---
const PAGE_SIZE = 12;

const Ecosystem = () => {
  const getQueryParam = (key: string, defaultValue: string) => {
    if (typeof window === "undefined") return defaultValue;
    const params = new URLSearchParams(window.location.search);
    return params.get(key) || defaultValue;
  };

  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "tools" | "plugins" | "libraries"
  >(() => {
    const val = getQueryParam("category", "all");
    return ["all", "tools", "plugins", "libraries"].includes(val)
      ? (val as any)
      : "all";
  });

  const [searchTerm, setSearchTerm] = useState(() =>
    getQueryParam("search", ""),
  );
  const [sortBy, setSortBy] = useState<
    "stars" | "name" | "updated" | "default"
  >(() => {
    const val = getQueryParam("sort", "default");
    return ["stars", "name", "updated", "default"].includes(val)
      ? (val as any)
      : "default";
  });
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">(() => {
    const val = getQueryParam("direction", "desc");
    return ["desc", "asc"].includes(val) ? (val as any) : "desc";
  });
  const [currentPage, setCurrentPage] = useState(() => {
    const val = getQueryParam("page", "1");
    const parsed = parseInt(val, 10);
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  });
  const [selectedLanguage, setSelectedLanguage] = useState(() =>
    getQueryParam("lang", "all"),
  );
  // Modal visibility states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  // Active mobile tooltip state
  const [activeMobileTooltip, setActiveMobileTooltip] = useState<{
    id: string;
    type: "star" | "inactive";
  } | null>(null);

  // Draft filter states
  const [draftSearchTerm, setDraftSearchTerm] = useState("");
  const [draftCategory, setDraftCategory] = useState<
    "all" | "tools" | "plugins" | "libraries"
  >("all");
  const [draftLanguage, setDraftLanguage] = useState("all");
  const [draftStatus, setDraftStatus] = useState<"active" | "all" | "inactive">(
    "all",
  );

  // Draft sort states
  const [draftSortBy, setDraftSortBy] = useState<
    "stars" | "name" | "updated" | "default"
  >("default");
  const [draftSortDirection, setDraftSortDirection] = useState<"desc" | "asc">(
    "desc",
  );

  const [statusFilter, setStatusFilter] = useState<
    "active" | "all" | "inactive"
  >(() => {
    const val = getQueryParam("status", "all");
    return ["active", "all", "inactive"].includes(val) ? (val as any) : "all";
  });

  const openFilterModal = () => {
    setDraftSearchTerm(searchTerm);
    setDraftCategory(selectedCategory);
    setDraftLanguage(selectedLanguage);
    setDraftStatus(statusFilter);
    setShowFilterModal(true);
  };

  const applyFilters = () => {
    setSearchTerm(draftSearchTerm);
    setSelectedCategory(draftCategory);
    setSelectedLanguage(draftLanguage);
    setStatusFilter(draftStatus);
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const openSortModal = () => {
    setDraftSortBy(sortBy);
    setDraftSortDirection(sortDirection);
    setShowSortModal(true);
  };

  const applySort = () => {
    setSortBy(draftSortBy);
    setSortDirection(draftSortDirection);
    setCurrentPage(1);
    setShowSortModal(false);
  };

  // Handle escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowFilterModal(false);
        setShowSortModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile tooltips when clicking outside
  useEffect(() => {
    const handleDocumentClick = () => {
      setActiveMobileTooltip(null);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("click", handleDocumentClick);
      return () => window.removeEventListener("click", handleDocumentClick);
    }
  }, []);

  // Remove pre-hydration filter hiding class once client-side React mounts
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("has-url-filters");
    }
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowFilterModal(false);
      setShowSortModal(false);
    }
  };

  // Sync state to URL query parameters
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (searchTerm) params.set("search", searchTerm);
    if (selectedLanguage !== "all") params.set("lang", selectedLanguage);
    if (sortBy !== "default") params.set("sort", sortBy);
    if (sortDirection !== "desc") params.set("direction", sortDirection);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (currentPage > 1) params.set("page", currentPage.toString());

    const newSearch = params.toString();
    const newUrl = newSearch ? `?${newSearch}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [
    selectedCategory,
    searchTerm,
    selectedLanguage,
    sortBy,
    sortDirection,
    statusFilter,
    currentPage,
  ]);

  const handlePageChange = (page: number, shouldScroll = true) => {
    setCurrentPage(page);
    if (shouldScroll && typeof window !== "undefined") {
      // Use setTimeout to wait for React to finish committing the DOM update and layout calculation
      setTimeout(() => {
        const el = document.getElementById("ecosystem-results");
        if (el) {
          const offset = el.getBoundingClientRect().top + window.scrollY - 88;
          window.scrollTo({ top: offset, behavior: "smooth" });
        }
      }, 50);
    }
  };

  const handleSetCategory = (
    cat: "all" | "tools" | "plugins" | "libraries",
  ) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSetLanguage = (lang: string) => {
    setSelectedLanguage(lang);
    setCurrentPage(1);
  };

  const handleLanguageClick = (lang: string) => {
    handleSetLanguage(lang);
    if (typeof window !== "undefined") {
      const el = document.getElementById("ecosystem-results");
      if (el) {
        const offset = el.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top: offset, behavior: "smooth" });
      }
    }
  };

  const handleSetSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const formatFetchedAt = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const hh = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");
      const ss = String(date.getSeconds()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    } catch {
      return isoString || "";
    }
  };

  const getInactiveDuration = (pushedAt?: string) => {
    if (!pushedAt) return "No updates in a long time";
    try {
      const pushedDate = new Date(pushedAt);
      if (
        isNaN(pushedDate.getTime()) ||
        pushedDate.getTime() === 0 ||
        pushedDate.getFullYear() <= 1970
      ) {
        return "Last updated date unknown";
      }
      const now = new Date();
      const diffMs = now.getTime() - pushedDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 30) {
        return "Last updated recently";
      }

      const diffMonths = Math.floor(diffDays / 30.43);
      if (diffMonths < 12) {
        return `Last updated ${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
      }

      const diffYears = (diffDays / 365.25).toFixed(1);
      const formattedYears = diffYears.endsWith(".0")
        ? Math.floor(diffDays / 365.25).toString()
        : diffYears;
      return `Last updated ${formattedYears} years ago`;
    } catch {
      return "No updates in a long time";
    }
  };

  const projects = useMemo(
    () => (ecosystemData.projects || []) as Project[],
    [],
  );

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: 0, tools: 0, plugins: 0, libraries: 0 };
    projects.forEach((p) => {
      const matchesLanguage =
        selectedLanguage === "all" ||
        (Array.isArray(p.languages) && p.languages.includes(selectedLanguage));
      const githubUrls = Array.isArray(p.github) ? p.github : [p.github];
      const matchesGithubSearch = githubUrls.some((url) => {
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
        return (
          match &&
          `${match[1]}/${match[2]}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      });
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matchesGithubSearch;
      const matchesInactive =
        statusFilter === "all" ||
        (statusFilter === "active" && !p.inactive) ||
        (statusFilter === "inactive" && p.inactive);

      if (matchesLanguage && matchesSearch && matchesInactive) {
        counts.all++;
        const cats = Array.isArray(p.category) ? p.category : [p.category];
        cats.forEach((c) => {
          if (c === "tools" || c === "plugins" || c === "libraries") {
            counts[c as keyof typeof counts]++;
          }
        });
      }
    });
    return counts;
  }, [projects, selectedLanguage, searchTerm, statusFilter]);

  // Compute active filters count
  const activeFiltersCount = useMemo(() => {
    return (
      (selectedCategory !== "all" ? 1 : 0) +
      (selectedLanguage !== "all" ? 1 : 0) +
      (searchTerm ? 1 : 0) +
      (statusFilter !== "all" ? 1 : 0)
    );
  }, [selectedCategory, selectedLanguage, searchTerm, statusFilter]);

  // Extract all unique languages from ecosystem data
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    projects.forEach((p) => {
      if (Array.isArray(p.languages)) {
        p.languages.forEach((l) => langs.add(l));
      }
    });
    return Array.from(langs).sort();
  }, [projects]);

  // Filter and Sort Projects
  const filteredAndSortedProjects = useMemo(() => {
    return projects
      .filter((project) => {
        const matchesCategory =
          selectedCategory === "all" ||
          (Array.isArray(project.category)
            ? project.category.includes(selectedCategory)
            : project.category === selectedCategory);
        const matchesLanguage =
          selectedLanguage === "all" ||
          (Array.isArray(project.languages) &&
            project.languages.includes(selectedLanguage));
        const githubUrls = Array.isArray(project.github)
          ? project.github
          : [project.github];
        const matchesGithubSearch = githubUrls.some((url) => {
          const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
          return (
            match &&
            `${match[1]}/${match[2]}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          );
        });
        const matchesSearch =
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
          matchesGithubSearch;
        const matchesInactive =
          statusFilter === "all" ||
          (statusFilter === "active" && !project.inactive) ||
          (statusFilter === "inactive" && project.inactive);
        return (
          matchesCategory && matchesLanguage && matchesSearch && matchesInactive
        );
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === "default") {
          const relA = (a as any).relevance || 0;
          const relB = (b as any).relevance || 0;
          if (relA !== relB) {
            comparison = relA - relB;
          } else {
            const monthlyA = a.starsMonthly || 0;
            const monthlyB = b.starsMonthly || 0;
            if (monthlyA !== monthlyB) {
              comparison = monthlyA - monthlyB;
            } else if (a.stars !== b.stars) {
              comparison = a.stars - b.stars;
            } else {
              comparison = b.name
                .toLowerCase()
                .localeCompare(a.name.toLowerCase());
            }
          }
        } else if (sortBy === "stars") {
          const monthlyA = a.starsMonthly || 0;
          const monthlyB = b.starsMonthly || 0;
          if (monthlyA !== monthlyB) {
            comparison = monthlyA - monthlyB;
          } else if (a.stars !== b.stars) {
            comparison = a.stars - b.stars;
          } else {
            comparison = b.name
              .toLowerCase()
              .localeCompare(a.name.toLowerCase());
          }
        } else if (sortBy === "name") {
          comparison = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        } else if (sortBy === "updated") {
          const dateA = new Date(a.pushedAt || 0).getTime();
          const dateB = new Date(b.pushedAt || 0).getTime();
          comparison = dateA - dateB;
        }

        return sortDirection === "desc" ? -comparison : comparison;
      });
  }, [
    searchTerm,
    selectedCategory,
    selectedLanguage,
    sortBy,
    sortDirection,
    statusFilter,
    projects,
  ]);

  const getCategoryBadgeStyles = (category: string) => {
    switch (category) {
      case "tools":
        return {
          bg: "bg-[var(--cyber-neon-blue)]/10 text-[var(--cyber-neon-blue)] border-[var(--cyber-neon-blue)]/30",
          icon: Wrench,
          color: "var(--cyber-neon-blue)",
        };
      case "plugins":
        return {
          bg: "bg-[var(--cyber-neon-pink)]/10 text-[var(--cyber-neon-pink)] border-[var(--cyber-neon-pink)]/30",
          icon: Puzzle,
          color: "var(--cyber-neon-pink)",
        };
      case "libraries":
        return {
          bg: "bg-[var(--cyber-neon-green)]/10 text-[var(--cyber-neon-green)] border-[var(--cyber-neon-green)]/30",
          icon: Library,
          color: "var(--cyber-neon-green)",
        };
      default:
        return {
          bg: "bg-white/10 text-white border-white/20",
          icon: Box,
          color: "white",
        };
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedProjects.length / PAGE_SIZE);
  const activePage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (activePage - 1) * PAGE_SIZE;
  const paginatedProjects = filteredAndSortedProjects.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .has-url-filters #ecosystem-results-container {
              opacity: 0;
            }
          `,
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined' && window.location.search) {
              document.documentElement.classList.add('has-url-filters');
            }
          `,
        }}
      />
      {/* Ecosystem Hero & Interactive Registry */}
      <Section
        id="ecosystem"
        className="py-16 px-4 sm:px-8 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <SectionTitle icon={Code2} subtitle="06_ECOSYSTEM" asH1={true}>
            Protobuf Ecosystem
          </SectionTitle>

          <p className="text-[var(--text-dim)] leading-relaxed mb-12">
            The Protocol Buffers ecosystem stretches far beyond Google's
            official compiler. Below is an interactive explorer showcasing the
            most popular tools, plugins, and serialization libraries used by
            developers to compile, lint, format, validate, and transport
            Protobuf messages.{" "}
            <span className="block mt-4 text-xs font-mono">
              Missing a tool or library?{" "}
              <a
                href="https://github.com/sudorandom/protobuf.kmcd.dev/issues/new?template=add-project.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--cyber-neon-blue)] hover:text-[var(--cyber-neon-pink)] underline transition-colors font-bold font-cyber uppercase tracking-wider"
              >
                Submit a project
              </a>{" "}
              to help grow the registry.
            </span>
          </p>

          {/* Results Container (hidden pre-hydration if query parameters are present) */}
          <div
            id="ecosystem-results-container"
            className="transition-opacity duration-200"
          >
            {/* Active Filters Summary & Controls */}
            <div
              id="ecosystem-results"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[var(--panel-bg)]/40 border border-[var(--border-light)]/60 rounded-xl backdrop-blur-sm relative mb-6"
            >
              <div className="space-y-2">
                <span className="text-xs font-mono text-[var(--text-dim)]/90 uppercase block">
                  Found{" "}
                  <span className="text-[var(--text-color)] font-bold font-cyber">
                    {filteredAndSortedProjects.length}
                  </span>{" "}
                  project{filteredAndSortedProjects.length !== 1 ? "s" : ""}
                  {searchTerm ||
                  selectedCategory !== "all" ||
                  selectedLanguage !== "all" ||
                  statusFilter !== "all"
                    ? " matching filters"
                    : ""}
                </span>

                {(searchTerm ||
                  selectedCategory !== "all" ||
                  selectedLanguage !== "all" ||
                  statusFilter !== "all") && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-sans font-semibold text-[var(--text-color)] uppercase tracking-wider">
                      Active Filters:
                    </span>
                    {selectedCategory !== "all" && (
                      <button
                        onClick={() => handleSetCategory("all")}
                        className="flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-cyber font-bold uppercase tracking-wider text-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/5 border border-[var(--cyber-neon-blue)]/20 rounded hover:bg-[var(--cyber-neon-blue)]/10 transition-all"
                      >
                        Category: {selectedCategory}
                        <span className="text-[11px] font-mono leading-none">
                          &times;
                        </span>
                      </button>
                    )}
                    {selectedLanguage !== "all" && (
                      <button
                        onClick={() => handleSetLanguage("all")}
                        className="flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-cyber font-bold uppercase tracking-wider text-[var(--cyber-neon-pink)] bg-[var(--cyber-neon-pink)]/5 border border-[var(--cyber-neon-pink)]/20 rounded hover:bg-[var(--cyber-neon-pink)]/10 transition-all"
                      >
                        Language: {selectedLanguage}
                        <span className="text-[11px] font-mono leading-none">
                          &times;
                        </span>
                      </button>
                    )}
                    {searchTerm && (
                      <button
                        onClick={() => handleSetSearch("")}
                        className="flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-cyber font-bold uppercase tracking-wider text-[var(--cyber-neon-green)] bg-[var(--cyber-neon-green)]/5 border border-[var(--cyber-neon-green)]/20 rounded hover:bg-[var(--cyber-neon-green)]/10 transition-all"
                      >
                        Search: "
                        {searchTerm.length > 12
                          ? searchTerm.substring(0, 10) + "..."
                          : searchTerm}
                        "
                        <span className="text-[11px] font-mono leading-none">
                          &times;
                        </span>
                      </button>
                    )}
                    {statusFilter !== "all" && (
                      <button
                        onClick={() => setStatusFilter("all")}
                        className="flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-cyber font-bold uppercase tracking-wider text-[var(--cyber-neon-pink)] bg-[var(--cyber-neon-pink)]/5 border border-[var(--cyber-neon-pink)]/20 rounded hover:bg-[var(--cyber-neon-pink)]/10 transition-all"
                      >
                        Status:{" "}
                        {statusFilter === "active"
                          ? "Active Only"
                          : "Inactive Only"}
                        <span className="text-[11px] font-mono leading-none">
                          &times;
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleSetCategory("all");
                        handleSetLanguage("all");
                        handleSetSearch("");
                        setStatusFilter("all");
                      }}
                      className="text-[9px] font-mono text-[var(--text-dim)]/80 hover:text-[var(--text-color)] uppercase underline hover:no-underline transition-all"
                    >
                      Reset All
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center">
                {/* Filter Button */}
                <button
                  onClick={openFilterModal}
                  className={`flex items-center gap-2 px-3.5 py-2 text-[10px] font-cyber font-bold uppercase tracking-wider border rounded-lg transition-all ${
                    activeFiltersCount > 0
                      ? "bg-[var(--cyber-neon-blue)]/10 text-[var(--cyber-neon-blue)] border-[var(--cyber-neon-blue)]/40 shadow-[0_0_10px_rgba(0,243,255,0.05)]"
                      : "bg-[var(--overlay-bg)] text-[var(--text-dim)] border-[var(--border-light)] hover:border-[var(--cyber-neon-blue)] hover:text-[var(--text-color)]"
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter</span>
                  {activeFiltersCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[8.5px] font-mono rounded bg-[var(--cyber-neon-blue)] text-black font-extrabold animate-pulse">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Sort Button */}
                <button
                  onClick={openSortModal}
                  className={`flex items-center gap-2 px-3.5 py-2 text-[10px] font-cyber font-bold uppercase tracking-wider border rounded-lg transition-all ${
                    sortBy !== "default" || sortDirection !== "desc"
                      ? "bg-[var(--cyber-neon-pink)]/10 text-[var(--cyber-neon-pink)] border-[var(--cyber-neon-pink)]/40 shadow-[0_0_10px_rgba(255,102,255,0.05)]"
                      : "bg-[var(--overlay-bg)] text-[var(--text-dim)] border-[var(--border-light)] hover:border-[var(--cyber-neon-pink)] hover:text-[var(--text-color)]"
                  }`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Sort</span>
                  {sortBy !== "default" && (
                    <span className="text-[8.5px] font-mono text-[var(--cyber-neon-pink)] lowercase">
                      ({sortBy})
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Top Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 mb-6 border-b border-[var(--border-light)]/20">
                <span className="text-xs font-mono text-[var(--text-dim)]/80 uppercase tracking-wider">
                  Showing {startIndex + 1}–
                  {Math.min(
                    startIndex + PAGE_SIZE,
                    filteredAndSortedProjects.length,
                  )}{" "}
                  of {filteredAndSortedProjects.length} projects
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={activePage === 1}
                    onClick={() => handlePageChange(activePage - 1, false)}
                    className={`px-3 py-1.5 text-xs font-cyber font-bold uppercase border rounded-md transition-all ${
                      activePage === 1
                        ? "opacity-30 cursor-not-allowed border-[var(--border-light)] text-[var(--text-dim)]"
                        : "bg-transparent text-[var(--text-color)] border-[var(--border-light)] hover:border-[var(--cyber-neon-blue)] hover:text-[var(--text-color)]"
                    }`}
                  >
                    Prev
                  </button>

                  {getPageNumbers(activePage, totalPages).map((pItem, idx) => {
                    if (pItem === "...") {
                      return (
                        <span
                          key={`ellipsis-top-${idx}`}
                          className="w-8 h-8 flex items-center justify-center text-xs font-mono text-[var(--text-dim)]/60"
                        >
                          ...
                        </span>
                      );
                    }

                    const pNum = pItem as number;
                    const isPageActive = activePage === pNum;
                    return (
                      <button
                        key={pNum}
                        onClick={() => handlePageChange(pNum, false)}
                        className={`w-8 h-8 flex items-center justify-center text-xs font-cyber font-bold rounded-md transition-all border ${
                          isPageActive
                            ? "bg-[var(--cyber-neon-blue)] text-[var(--neon-contrast-text)] border-[var(--cyber-neon-blue)] shadow-[0_0_10px_rgba(0,243,255,0.2)]"
                            : "bg-transparent text-[var(--text-dim)] border-[var(--border-light)] hover:border-[var(--cyber-neon-blue)] hover:text-[var(--text-color)]"
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={activePage === totalPages}
                    onClick={() => handlePageChange(activePage + 1, false)}
                    className={`px-3 py-1.5 text-xs font-cyber font-bold uppercase border rounded-md transition-all ${
                      activePage === totalPages
                        ? "opacity-30 cursor-not-allowed border-[var(--border-light)] text-[var(--text-dim)]"
                        : "bg-transparent text-[var(--text-color)] border-[var(--border-light)] hover:border-[var(--cyber-neon-blue)] hover:text-[var(--text-color)]"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Cards Grid */}
            <div
              id="ecosystem-results-grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {paginatedProjects.map((project) => {
                const categories = Array.isArray(project.category)
                  ? project.category
                  : [project.category];
                const primaryCategory = categories[0] || "libraries";
                const primaryBadge = getCategoryBadgeStyles(primaryCategory);
                const githubUrls = (
                  Array.isArray(project.github)
                    ? project.github
                    : project.github
                      ? [project.github]
                      : []
                ).filter(Boolean);
                const primaryGithubUrl = githubUrls[0] || "";
                const projectLink = project.url || primaryGithubUrl;
                const projectKey = `${project.owner}-${project.name}`;

                return (
                  <div
                    key={`${project.owner}-${project.name}`}
                    className={`p-6 bg-[var(--card-bg)] border rounded-xl hover:border-[var(--hover-color)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between min-h-[260px] relative overflow-hidden ${
                      project.inactive
                        ? "border-slate-500/40 opacity-80 hover:opacity-100"
                        : "border-[var(--border-light)]"
                    }`}
                    style={
                      {
                        "--hover-color": `color-mix(in srgb, ${primaryBadge.color}, transparent 60%)`,
                      } as React.CSSProperties
                    }
                  >
                    <div>
                      {/* Top Row: Category badge & Stars */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex flex-wrap items-center gap-2 max-w-[70%]">
                          {categories.map((cat) => {
                            const badge = getCategoryBadgeStyles(cat);
                            const BadgeIcon = badge.icon;
                            return (
                              <span
                                key={cat}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-cyber font-bold uppercase border ${badge.bg}`}
                              >
                                <BadgeIcon className="w-3 h-3" />
                                {cat}
                              </span>
                            );
                          })}
                          {project.inactive && (
                            <div className="relative group/inactive-tooltip">
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMobileTooltip((prev) =>
                                    prev?.id === projectKey &&
                                    prev.type === "inactive"
                                      ? null
                                      : { id: projectKey, type: "inactive" },
                                  );
                                }}
                                className="flex items-center gap-1 px-2 py-0.5 bg-[var(--error-bg)] text-[var(--error-text)] border border-[var(--error-border)] rounded-md text-[10px] font-cyber font-bold uppercase tracking-wider cursor-help shadow-sm shadow-red-500/10"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Inactive
                              </span>

                              {/* Custom Tooltip */}
                              <div
                                className={`absolute left-0 top-full mt-2 z-30 w-48 p-3 bg-slate-950/95 border border-[var(--border-light)] rounded-md shadow-2xl backdrop-blur-md transition-all duration-200 origin-top-left flex flex-col gap-1.5 text-[11px] font-mono text-[var(--text-dim)] ${
                                  activeMobileTooltip?.id === projectKey &&
                                  activeMobileTooltip.type === "inactive"
                                    ? "opacity-100 scale-100 pointer-events-auto"
                                    : "opacity-0 scale-95 pointer-events-none group-hover/inactive-tooltip:opacity-100 group-hover/inactive-tooltip:scale-100 group-hover/inactive-tooltip:pointer-events-auto"
                                }`}
                              >
                                <div className="flex justify-between border-b border-[var(--border-light)]/40 pb-1.5 mb-1 text-[var(--error-text)] font-bold">
                                  <span>
                                    {project.archived
                                      ? "Archived Project"
                                      : "Activity Status"}
                                  </span>
                                  <AlertTriangle className="w-3.5 h-3.5 text-[var(--error-text)]" />
                                </div>
                                <div className="text-[10px] text-[var(--text-dim)] normal-case leading-relaxed">
                                  {project.archived
                                    ? "This project has been archived by the owner on GitHub and is no longer maintained."
                                    : "This project is marked inactive because it has not had any updates on GitHub in over a year."}
                                </div>
                                <div className="flex justify-between border-t border-[var(--border-light)]/20 pt-1.5 mt-1">
                                  <span>Last Push:</span>
                                  <span className="text-[var(--text-color)] font-bold">
                                    {project.pushedAt
                                      ? project.pushedAt.split("T")[0]
                                      : "Unknown"}
                                  </span>
                                </div>
                                <div className="text-[10px] text-right font-semibold text-[var(--error-text)] uppercase tracking-wider mt-0.5">
                                  {project.archived
                                    ? "Archived"
                                    : getInactiveDuration(project.pushedAt)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="relative group/star-tooltip">
                          {primaryGithubUrl ? (
                            <a
                              href={primaryGithubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  typeof window !== "undefined" &&
                                  window.innerWidth < 768
                                ) {
                                  e.preventDefault();
                                  setActiveMobileTooltip((prev) =>
                                    prev?.id === projectKey &&
                                    prev.type === "star"
                                      ? null
                                      : { id: projectKey, type: "star" },
                                  );
                                }
                              }}
                              className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--warning-bg)] hover:bg-[var(--warning-border)] border border-[var(--warning-border)] hover:border-[var(--warning-text)] rounded-md text-xs font-mono text-[var(--warning-text)] transition-all shadow-inner group/stars cursor-help"
                            >
                              <Star className="w-3.5 h-3.5 fill-current opacity-70 group-hover/stars:opacity-100 transition-all" />
                              <span className="font-bold">
                                {formatStars(project.stars)}
                              </span>
                            </a>
                          ) : (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMobileTooltip((prev) =>
                                  prev?.id === projectKey &&
                                  prev.type === "star"
                                    ? null
                                    : { id: projectKey, type: "star" },
                                );
                              }}
                              className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--warning-bg)]/60 border border-[var(--warning-border)]/50 rounded-md text-xs font-mono text-[var(--warning-text)]/70 shadow-inner select-none cursor-help"
                            >
                              <Star className="w-3.5 h-3.5 fill-current opacity-40" />
                              <span className="font-bold">?</span>
                            </div>
                          )}

                          {/* Custom Tooltip */}
                          {primaryGithubUrl ? (
                            <div
                              className={`absolute right-0 top-full mt-2 z-30 w-44 p-3 bg-slate-950/95 border border-[var(--border-light)] rounded-md shadow-2xl backdrop-blur-md transition-all duration-200 origin-top-right flex flex-col gap-1.5 text-[11px] font-mono text-[var(--text-dim)] ${
                                activeMobileTooltip?.id === projectKey &&
                                activeMobileTooltip.type === "star"
                                  ? "opacity-100 scale-100 pointer-events-auto"
                                  : "opacity-0 scale-95 pointer-events-none group-hover/star-tooltip:opacity-100 group-hover/star-tooltip:scale-100 group-hover/star-tooltip:pointer-events-auto"
                              }`}
                            >
                              <div className="flex justify-between border-b border-[var(--border-light)]/40 pb-1.5 mb-1 text-[var(--text-color)] font-bold">
                                <span>Popularity</span>
                                <Star className="w-3.5 h-3.5 fill-[var(--warning-text)] text-[var(--warning-text)]" />
                              </div>
                              <div className="flex justify-between">
                                <span>Total:</span>
                                <span className="text-[var(--text-color)] font-bold">
                                  {project.stars.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Past Week:</span>
                                <span className="text-emerald-400 font-bold">
                                  +{project.starsWeekly || 0}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Past Month:</span>
                                <span className="text-emerald-400 font-bold">
                                  +{project.starsMonthly || 0}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`absolute right-0 top-full mt-2 z-30 w-40 p-2 bg-slate-950/95 border border-[var(--border-light)] rounded-md shadow-2xl backdrop-blur-md transition-all duration-200 origin-top-right flex text-[10px] font-mono text-[var(--text-dim)] text-center ${
                                activeMobileTooltip?.id === projectKey &&
                                activeMobileTooltip.type === "star"
                                  ? "opacity-100 scale-100 pointer-events-auto"
                                  : "opacity-0 scale-95 pointer-events-none group-hover/star-tooltip:opacity-100 group-hover/star-tooltip:scale-100 group-hover/star-tooltip:pointer-events-auto"
                              }`}
                            >
                              No GitHub repository linked
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Title & Owner */}
                      <h3 className="text-lg font-sans font-bold tracking-wide mb-1 flex items-center gap-2">
                        <a
                          href={projectLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[var(--cyber-neon-blue)] transition-colors"
                        >
                          {project.name}
                        </a>
                      </h3>
                      {project.owner && (
                        <p className="text-xs font-sans text-[var(--text-dim)] uppercase tracking-wider mb-2">
                          BY{" "}
                          <a
                            href={`https://github.com/${project.owner}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--cyber-neon-pink)] hover:underline transition-colors font-semibold"
                          >
                            {project.owner}
                          </a>
                        </p>
                      )}

                      {/* Languages */}
                      {Array.isArray(project.languages) &&
                        project.languages.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {project.languages.map((lang) => (
                              <button
                                key={lang}
                                onClick={() => handleLanguageClick(lang)}
                                className="inline-flex items-center px-2 py-0.5 bg-[var(--overlay-bg)]/50 text-[var(--text-dim)] hover:text-[var(--cyber-neon-blue)] hover:bg-[var(--cyber-neon-blue)]/10 border border-[var(--border-light)]/50 hover:border-[var(--cyber-neon-blue)]/40 rounded text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-all"
                              >
                                <LanguageIcon
                                  lang={lang}
                                  size={10}
                                  className="mr-1"
                                />
                                {lang}
                              </button>
                            ))}
                          </div>
                        )}

                      {/* Description */}
                      <p className="text-sm text-[var(--text-dim)] leading-relaxed mb-6">
                        {project.desc}
                      </p>
                    </div>

                    {/* Bottom Row: Links */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-4 border-t border-[var(--border-light)]/40 mt-auto">
                      {githubUrls.map((url) => {
                        const match = url.match(
                          /github\.com\/([^/]+)\/([^/]+)/,
                        );
                        const displayName = match
                          ? `${match[1]}/${match[2]}`
                          : "Repository";
                        return (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-sans text-[var(--text-dim)] hover:text-[var(--cyber-neon-pink)] transition-colors flex items-center gap-1.5 group/git"
                          >
                            <GithubIcon className="w-3.5 h-3.5 opacity-70 group-hover/git:scale-110 transition-transform" />
                            <span className="font-medium">{displayName}</span>
                          </a>
                        );
                      })}
                      {project.url && !githubUrls.includes(project.url) && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-sans text-[var(--text-dim)] hover:text-[var(--cyber-neon-blue)] transition-colors flex items-center gap-1.5 group/ext"
                        >
                          <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover/ext:scale-110 transition-transform" />
                          <span className="font-medium">Website</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredAndSortedProjects.length === 0 && (
                <div className="col-span-full py-16 text-center border border-dashed border-[var(--border-light)] rounded-xl bg-[var(--overlay-bg)]/5">
                  <Search className="w-12 h-12 text-[var(--text-dim)]/40 mx-auto mb-4" />
                  <p className="text-base font-cyber text-[var(--text-color)] uppercase tracking-widest mb-1">
                    No matches found
                  </p>
                  <p className="text-xs text-[var(--text-dim)]/80 font-mono">
                    Try adjusting your filters or search keywords.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-[var(--border-light)]/30">
                <span className="text-xs font-mono text-[var(--text-dim)]/80 uppercase tracking-wider">
                  Showing {startIndex + 1}–
                  {Math.min(
                    startIndex + PAGE_SIZE,
                    filteredAndSortedProjects.length,
                  )}{" "}
                  of {filteredAndSortedProjects.length} projects
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={activePage === 1}
                    onClick={() => handlePageChange(activePage - 1)}
                    className={`px-3 py-1.5 text-xs font-cyber font-bold uppercase border rounded-md transition-all ${
                      activePage === 1
                        ? "opacity-30 cursor-not-allowed border-[var(--border-light)] text-[var(--text-dim)]"
                        : "bg-transparent text-[var(--text-color)] border-[var(--border-light)] hover:border-[var(--cyber-neon-blue)] hover:text-[var(--text-color)]"
                    }`}
                  >
                    Prev
                  </button>

                  {getPageNumbers(activePage, totalPages).map((pItem, idx) => {
                    if (pItem === "...") {
                      return (
                        <span
                          key={`ellipsis-bottom-${idx}`}
                          className="w-8 h-8 flex items-center justify-center text-xs font-mono text-[var(--text-dim)]/60"
                        >
                          ...
                        </span>
                      );
                    }

                    const pNum = pItem as number;
                    const isPageActive = activePage === pNum;
                    return (
                      <button
                        key={pNum}
                        onClick={() => handlePageChange(pNum)}
                        className={`w-8 h-8 flex items-center justify-center text-xs font-cyber font-bold rounded-md transition-all border ${
                          isPageActive
                            ? "bg-[var(--cyber-neon-blue)] text-[var(--neon-contrast-text)] border-[var(--cyber-neon-blue)] shadow-[0_0_10px_rgba(0,243,255,0.2)]"
                            : "bg-transparent text-[var(--text-dim)] border-[var(--border-light)] hover:border-[var(--cyber-neon-blue)] hover:text-[var(--text-color)]"
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={activePage === totalPages}
                    onClick={() => handlePageChange(activePage + 1)}
                    className={`px-3 py-1.5 text-xs font-cyber font-bold uppercase border rounded-md transition-all ${
                      activePage === totalPages
                        ? "opacity-30 cursor-not-allowed border-[var(--border-light)] text-[var(--text-dim)]"
                        : "bg-transparent text-[var(--text-color)] border-[var(--border-light)] hover:border-[var(--cyber-neon-blue)] hover:text-[var(--text-color)]"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* GitHub stars synced footer */}
            <div className="mt-12 text-center text-xs font-mono text-[var(--text-dim)]/85 uppercase tracking-wider">
              GitHub stars synced: {formatFetchedAt(ecosystemData.fetchedAt)}
            </div>
          </div>
        </div>
      </Section>

      {/* Filter Modal */}
      {showFilterModal && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all"
        >
          <div className="relative w-full max-w-lg p-6 bg-[var(--panel-bg)]/95 border border-[var(--border-light)] rounded-2xl shadow-2xl space-y-6 flex flex-col backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)]/40">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[var(--cyber-neon-blue)]" />
                <h3 className="text-sm font-cyber font-bold uppercase tracking-wider text-[var(--cyber-neon-blue)]">
                  Filter Registry
                </h3>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-[10px] font-mono text-[var(--text-dim)] hover:text-[var(--text-color)] uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--border-light)]/40 hover:border-[var(--cyber-neon-blue)]/50 transition-colors"
              >
                Close
              </button>
            </div>

            {/* Content */}
            <div className="space-y-5 flex-1 overflow-y-auto max-h-[60vh] pr-1">
              {/* Search Keywords */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest font-bold block">
                  Search Keywords
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]/70" />
                  <input
                    type="text"
                    placeholder="Search name, description, tags..."
                    value={draftSearchTerm}
                    onChange={(e) => setDraftSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-16 py-2.5 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl text-xs text-[var(--text-color)] font-mono placeholder:text-[var(--text-dim)]/50 focus:outline-none focus:border-[var(--cyber-neon-blue)] focus:ring-1 focus:ring-[var(--cyber-neon-blue)] transition-colors shadow-inner"
                  />
                  {draftSearchTerm && (
                    <button
                      onClick={() => setDraftSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-[var(--text-dim)] hover:text-[var(--text-color)] bg-[var(--overlay-bg)] px-2 py-0.5 rounded border border-[var(--border-light)] hover:border-[var(--cyber-neon-blue)] transition-all"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest font-bold block">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      id: "all",
                      label: `All (${categoryCounts.all})`,
                      icon: Box,
                    },
                    {
                      id: "tools",
                      label: `Tools (${categoryCounts.tools})`,
                      icon: Wrench,
                    },
                    {
                      id: "plugins",
                      label: `Plugins (${categoryCounts.plugins})`,
                      icon: Puzzle,
                    },
                    {
                      id: "libraries",
                      label: `Libraries (${categoryCounts.libraries})`,
                      icon: Library,
                    },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = draftCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setDraftCategory(cat.id as any)}
                        className={`flex flex-col items-center justify-center gap-1.5 py-3 text-[10px] font-cyber font-bold uppercase tracking-wider border rounded-xl transition-all ${
                          isSelected
                            ? "bg-[var(--cyber-neon-blue)]/10 text-[var(--cyber-neon-blue)] border-[var(--cyber-neon-blue)] shadow-[0_0_10px_rgba(0,243,255,0.05)]"
                            : "bg-[var(--overlay-bg)] text-[var(--text-dim)] border-[var(--border-light)] hover:border-[var(--cyber-neon-blue)]/40 hover:text-[var(--text-color)]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest font-bold block">
                  Programming Language
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-[var(--text-dim)]">
                    <LanguageIcon lang={draftLanguage} size={14} className="" />
                  </div>
                  <select
                    value={draftLanguage}
                    onChange={(e) => setDraftLanguage(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg text-xs font-cyber font-bold uppercase tracking-wider text-[var(--text-color)] focus:outline-none focus:border-[var(--cyber-neon-blue)] focus:ring-1 focus:ring-[var(--cyber-neon-blue)] transition-colors appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238892b0' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                      backgroundPosition: "right 0.75rem center",
                      backgroundSize: "1em 1em",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <option
                      value="all"
                      className="bg-[var(--panel-bg)] text-[var(--text-color)]"
                    >
                      All Languages
                    </option>
                    {availableLanguages.map((lang) => (
                      <option
                        key={lang}
                        value={lang}
                        className="bg-[var(--panel-bg)] text-[var(--text-color)]"
                      >
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest font-bold block">
                  Project Status
                </label>
                <div className="flex p-1 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg gap-1">
                  {[
                    { id: "active", label: "Active Only" },
                    { id: "all", label: "All Projects" },
                    { id: "inactive", label: "Inactive Only" },
                  ].map((opt) => {
                    const isSelected = draftStatus === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDraftStatus(opt.id as any)}
                        className={`flex-1 py-1.5 text-[10px] font-cyber font-bold uppercase tracking-wider rounded-md transition-all ${
                          isSelected
                            ? "bg-[var(--cyber-neon-blue)]/20 text-[var(--cyber-neon-blue)]"
                            : "text-[var(--text-dim)] hover:text-[var(--text-color)]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-light)]/40 mt-auto">
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="px-5 py-2.5 text-xs font-cyber font-bold uppercase tracking-wider border border-[var(--border-light)] rounded-xl text-[var(--text-dim)] hover:text-[var(--text-color)] bg-transparent hover:border-[var(--text-dim)] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="px-6 py-2.5 text-xs font-cyber font-bold uppercase tracking-wider rounded-xl bg-[var(--cyber-neon-blue)] text-black font-extrabold hover:shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:bg-[var(--cyber-neon-blue)]/90 transition-all"
              >
                Apply
              </button>
            </div>

            {/* Corner accents */}
            <div className="absolute top-[-1px] left-[-1px] w-4 h-4 border-t-2 border-l-2 border-[var(--cyber-neon-blue)] rounded-tl-2xl pointer-events-none" />
            <div className="absolute bottom-[-1px] right-[-1px] w-4 h-4 border-b-2 border-r-2 border-[var(--cyber-neon-pink)] rounded-br-2xl pointer-events-none" />
          </div>
        </div>
      )}

      {/* Sort Modal */}
      {showSortModal && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all"
        >
          <div className="relative w-full max-w-md p-6 bg-[var(--panel-bg)]/95 border border-[var(--border-light)] rounded-2xl shadow-2xl space-y-6 flex flex-col backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)]/40">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-[var(--cyber-neon-pink)]" />
                <h3 className="text-sm font-cyber font-bold uppercase tracking-wider text-[var(--cyber-neon-pink)]">
                  Sort Options
                </h3>
              </div>
              <button
                onClick={() => setShowSortModal(false)}
                className="text-[10px] font-mono text-[var(--text-dim)] hover:text-[var(--text-color)] uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--border-light)]/40 hover:border-[var(--cyber-neon-pink)]/50 transition-colors"
              >
                Close
              </button>
            </div>

            {/* Content */}
            <div className="space-y-5">
              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest font-bold block">
                  Sort Criteria
                </label>
                <select
                  value={draftSortBy}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setDraftSortBy(val);
                    setDraftSortDirection(val === "name" ? "asc" : "desc");
                  }}
                  className="w-full px-3.5 py-2.5 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg text-xs font-cyber font-bold uppercase tracking-wider text-[var(--text-color)] focus:outline-none focus:border-[var(--cyber-neon-pink)] focus:ring-1 focus:ring-[var(--cyber-neon-pink)] transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238892b0' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                    backgroundPosition: "right 0.75rem center",
                    backgroundSize: "1em 1em",
                    backgroundRepeat: "no-repeat",
                    color: "var(--text-color)",
                  }}
                >
                  <option
                    value="default"
                    className="bg-[var(--panel-bg)] text-[var(--text-color)]"
                  >
                    Relevance
                  </option>
                  <option
                    value="stars"
                    className="bg-[var(--panel-bg)] text-[var(--text-color)]"
                  >
                    Popularity
                  </option>
                  <option
                    value="updated"
                    className="bg-[var(--panel-bg)] text-[var(--text-color)]"
                  >
                    Updated
                  </option>
                  <option
                    value="name"
                    className="bg-[var(--panel-bg)] text-[var(--text-color)]"
                  >
                    Name (A-Z)
                  </option>
                </select>
              </div>

              {/* Direction */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest font-bold block">
                  Direction
                </label>
                <div className="flex p-1 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg gap-1">
                  {[
                    { id: "desc", label: "Descending" },
                    { id: "asc", label: "Ascending" },
                  ].map((opt) => {
                    const isSelected = draftSortDirection === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDraftSortDirection(opt.id as any)}
                        className={`flex-1 py-1.5 text-xs font-cyber font-bold uppercase tracking-wider rounded-md transition-all ${
                          isSelected
                            ? "bg-[var(--cyber-neon-pink)]/20 text-[var(--cyber-neon-pink)]"
                            : "text-[var(--text-dim)] hover:text-[var(--text-color)]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-light)]/40 mt-auto">
              <button
                type="button"
                onClick={() => setShowSortModal(false)}
                className="px-5 py-2.5 text-xs font-cyber font-bold uppercase tracking-wider border border-[var(--border-light)] rounded-xl text-[var(--text-dim)] hover:text-[var(--text-color)] bg-transparent hover:border-[var(--text-dim)] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applySort}
                className="px-6 py-2.5 text-xs font-cyber font-bold uppercase tracking-wider rounded-xl bg-[var(--cyber-neon-pink)] text-black font-extrabold hover:shadow-[0_0_15px_rgba(255,102,255,0.4)] hover:bg-[var(--cyber-neon-pink)]/90 transition-all"
              >
                Apply
              </button>
            </div>

            {/* Corner accents */}
            <div className="absolute top-[-1px] left-[-1px] w-4 h-4 border-t-2 border-l-2 border-[var(--cyber-neon-pink)] rounded-tl-2xl pointer-events-none" />
            <div className="absolute bottom-[-1px] right-[-1px] w-4 h-4 border-b-2 border-r-2 border-[var(--cyber-neon-blue)] rounded-br-2xl pointer-events-none" />
          </div>
        </div>
      )}
    </>
  );
};

export default Ecosystem;
