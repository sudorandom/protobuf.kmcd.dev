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
import ecosystemData from "../data/ecosystem-stars.json";

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
  languages: string[];
}

// --- Formatting helper ---
const formatStars = (stars: number) => {
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1)}k`;
  }
  return stars.toString();
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
  const [sortBy, setSortBy] = useState<"stars" | "name">(() => {
    const val = getQueryParam("sort", "stars");
    return ["stars", "name"].includes(val) ? (val as any) : "stars";
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "active" | "all" | "inactive"
  >(() => {
    const val = getQueryParam("status", "active");
    return ["active", "all", "inactive"].includes(val)
      ? (val as any)
      : "active";
  });

  // Sync state to URL query parameters
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (searchTerm) params.set("search", searchTerm);
    if (selectedLanguage !== "all") params.set("lang", selectedLanguage);
    if (sortBy !== "stars") params.set("sort", sortBy);
    if (sortDirection !== "desc") params.set("direction", sortDirection);
    if (statusFilter !== "active") params.set("status", statusFilter);
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
      const el = document.getElementById("ecosystem");
      if (el) {
        const offset = el.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top: offset, behavior: "smooth" });
      }
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
      const el = document.getElementById("ecosystem");
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

  const handleSetSortBy = (sort: "stars" | "name") => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleSetSortDirection = (dir: "desc" | "asc") => {
    setSortDirection(dir);
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
      (statusFilter !== "active" ? 1 : 0)
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
        if (sortBy === "stars") {
          comparison = a.stars - b.stars;
        } else if (sortBy === "name") {
          comparison = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
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

  const toggleSortDirection = () => {
    handleSetSortDirection(sortDirection === "desc" ? "asc" : "desc");
  };

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

          {/* Mobile Filter Controls (Visible on mobile/tablet, hidden on desktop) */}
          <div className="lg:hidden mb-6 space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]/50" />
                <input
                  type="text"
                  placeholder="Search ecosystem..."
                  value={searchTerm}
                  onChange={(e) => handleSetSearch(e.target.value)}
                  className="w-full pl-10 pr-20 py-2.5 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl text-xs text-[var(--text-color)] font-mono placeholder:text-[var(--text-dim)]/40 focus:outline-none focus:border-[var(--cyber-neon-blue)] focus:ring-1 focus:ring-[var(--cyber-neon-blue)] transition-colors shadow-inner"
                />
                {searchTerm && (
                  <button
                    onClick={() => handleSetSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-[var(--text-dim)] hover:text-white bg-[var(--overlay-bg)] px-2 py-0.5 rounded border border-[var(--border-light)] hover:border-[var(--cyber-neon-blue)] transition-all"
                  >
                    CLEAR
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-cyber font-bold uppercase tracking-wider border rounded-xl transition-all ${
                  showMobileFilters || activeFiltersCount > 0
                    ? "bg-[var(--cyber-neon-blue)]/10 text-[var(--cyber-neon-blue)] border-[var(--cyber-neon-blue)] shadow-[0_0_10px_rgba(0,243,255,0.15)]"
                    : "bg-[var(--overlay-bg)] text-[var(--text-dim)] border-[var(--border-light)] hover:border-[var(--cyber-neon-blue)]/50"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 flex items-center justify-center bg-[var(--cyber-neon-pink)] text-white text-[9px] font-bold rounded-full ml-1">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Collapsible Panel */}
            {showMobileFilters && (
              <div className="p-5 bg-[var(--panel-bg)] border border-[var(--border-light)] rounded-2xl shadow-xl backdrop-blur-md relative space-y-5">
                {/* Categories */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono text-[var(--text-dim)]/50 uppercase tracking-widest font-bold">
                    Categories
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        id: "all",
                        label: "All",
                        icon: Box,
                        count: categoryCounts.all,
                      },
                      {
                        id: "tools",
                        label: "Tools",
                        icon: Wrench,
                        count: categoryCounts.tools,
                      },
                      {
                        id: "plugins",
                        label: "Plugins",
                        icon: Puzzle,
                        count: categoryCounts.plugins,
                      },
                      {
                        id: "libraries",
                        label: "Libraries",
                        icon: Library,
                        count: categoryCounts.libraries,
                      },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = selectedCategory === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleSetCategory(tab.id as any)}
                          className={`flex items-center justify-between px-3 py-2 text-[10px] font-cyber font-bold uppercase border rounded-lg transition-all ${
                            isActive
                              ? "bg-[var(--cyber-neon-blue)]/10 text-[var(--cyber-neon-blue)] border-[var(--cyber-neon-blue)]/40 shadow-[0_0_10px_rgba(0,243,255,0.05)]"
                              : "bg-transparent text-[var(--text-dim)] border-[var(--border-light)]"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5" />
                            {tab.label}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1 rounded bg-[var(--overlay-bg)] border border-[var(--border-light)] ${
                              isActive
                                ? "text-[var(--text-color)]"
                                : "text-[var(--text-dim)]/50"
                            }`}
                          >
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Language Select */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono text-[var(--text-dim)]/50 uppercase tracking-widest font-bold">
                    Language
                  </h4>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-[var(--text-dim)]">
                      <LanguageIcon
                        lang={selectedLanguage}
                        size={14}
                        className=""
                      />
                    </div>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => handleSetLanguage(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg text-xs font-cyber font-bold uppercase tracking-wider text-[var(--text-color)] appearance-none cursor-pointer"
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

                {/* Sorting */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono text-[var(--text-dim)]/50 uppercase tracking-widest font-bold">
                    Sort Projects
                  </h4>
                  <div className="flex gap-2">
                    <div className="flex-1 flex border border-[var(--border-light)] rounded-lg overflow-hidden bg-[var(--overlay-bg)]">
                      <button
                        onClick={() => {
                          handleSetSortBy("stars");
                          handleSetSortDirection("desc");
                        }}
                        className={`flex-1 py-2 text-[10px] font-cyber font-bold uppercase transition-all ${
                          sortBy === "stars"
                            ? "bg-[var(--cyber-neon-blue)]/20 text-[var(--cyber-neon-blue)]"
                            : "text-[var(--text-dim)] hover:text-white"
                        }`}
                      >
                        Stars
                      </button>
                      <button
                        onClick={() => {
                          handleSetSortBy("name");
                          handleSetSortDirection("asc");
                        }}
                        className={`flex-1 py-2 text-[10px] font-cyber font-bold uppercase transition-all border-l border-[var(--border-light)] ${
                          sortBy === "name"
                            ? "bg-[var(--cyber-neon-blue)]/20 text-[var(--cyber-neon-blue)]"
                            : "text-[var(--text-dim)] hover:text-white"
                        }`}
                      >
                        A-Z
                      </button>
                    </div>
                    <button
                      onClick={toggleSortDirection}
                      className="px-3 border border-[var(--border-light)] rounded-lg text-[var(--text-dim)] hover:text-white bg-[var(--overlay-bg)] flex items-center justify-center"
                    >
                      <ArrowUpDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${sortDirection === "asc" ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono text-[var(--text-dim)]/50 uppercase tracking-widest font-bold">
                    Status
                  </h4>
                  <div className="flex border border-[var(--border-light)] rounded-lg overflow-hidden bg-[var(--overlay-bg)]">
                    {[
                      { id: "active", label: "Active Only" },
                      { id: "all", label: "Show All" },
                      { id: "inactive", label: "Inactive Only" },
                    ].map((opt) => {
                      const isActive = statusFilter === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setStatusFilter(opt.id as any);
                            setCurrentPage(1);
                          }}
                          className={`flex-1 py-2 text-[10px] font-cyber font-bold uppercase transition-all ${
                            isActive
                              ? "bg-[var(--cyber-neon-blue)]/20 text-[var(--cyber-neon-blue)]"
                              : "text-[var(--text-dim)] hover:text-white"
                          } ${opt.id !== "active" ? "border-l border-[var(--border-light)]" : ""}`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 text-[9px] font-mono text-[var(--text-dim)]/30 uppercase tracking-wider text-center">
                  GitHub Stars Synced:{" "}
                  {formatFetchedAt(ecosystemData.fetchedAt)}
                </div>
                <div className="absolute top-[-1px] left-[-1px] w-4 h-4 border-t-2 border-l-2 border-[var(--cyber-neon-blue)] rounded-tl-2xl m-0" />
                <div className="absolute bottom-[-1px] right-[-1px] w-4 h-4 border-b-2 border-r-2 border-[var(--cyber-neon-pink)] rounded-br-2xl m-0" />
              </div>
            )}
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Desktop Sidebar (visible on lg:block) */}
            <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-[88px] space-y-6">
              <div className="p-6 bg-[var(--panel-bg)] border border-[var(--border-light)] rounded-2xl shadow-xl backdrop-blur-md relative space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-mono text-[var(--text-dim)]/60 uppercase tracking-widest font-bold">
                    Search Registry
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]/50" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => handleSetSearch(e.target.value)}
                      className="w-full pl-10 pr-16 py-2.5 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl text-xs text-[var(--text-color)] font-mono placeholder:text-[var(--text-dim)]/40 focus:outline-none focus:border-[var(--cyber-neon-blue)] focus:ring-1 focus:ring-[var(--cyber-neon-blue)] transition-colors shadow-inner"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => handleSetSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-[var(--text-dim)] hover:text-white bg-[var(--overlay-bg)] px-2 py-0.5 rounded border border-[var(--border-light)] hover:border-[var(--cyber-neon-blue)] transition-all"
                      >
                        CLEAR
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-2.5">
                  <h3 className="text-[10px] font-mono text-[var(--text-dim)]/60 uppercase tracking-widest font-bold">
                    Categories
                  </h3>
                  <div className="flex flex-col gap-2">
                    {[
                      {
                        id: "all",
                        label: "All Projects",
                        icon: Box,
                        activeClass:
                          "bg-[var(--cyber-neon-blue)]/10 text-[var(--cyber-neon-blue)] border-[var(--cyber-neon-blue)]/40 shadow-[0_0_10px_rgba(0,243,255,0.05)]",
                        hoverClass: "hover:border-[var(--cyber-neon-blue)]/30",
                        count: categoryCounts.all,
                      },
                      {
                        id: "tools",
                        label: "Tools",
                        icon: Wrench,
                        activeClass:
                          "bg-[var(--cyber-neon-blue)]/10 text-[var(--cyber-neon-blue)] border-[var(--cyber-neon-blue)]/40 shadow-[0_0_10px_rgba(0,243,255,0.05)]",
                        hoverClass: "hover:border-[var(--cyber-neon-blue)]/30",
                        count: categoryCounts.tools,
                      },
                      {
                        id: "plugins",
                        label: "Plugins",
                        icon: Puzzle,
                        activeClass:
                          "bg-[var(--cyber-neon-pink)]/10 text-[var(--cyber-neon-pink)] border-[var(--cyber-neon-pink)]/40 shadow-[0_0_10px_rgba(255,102,255,0.05)]",
                        hoverClass: "hover:border-[var(--cyber-neon-pink)]/30",
                        count: categoryCounts.plugins,
                      },
                      {
                        id: "libraries",
                        label: "Libraries",
                        icon: Library,
                        activeClass:
                          "bg-[var(--cyber-neon-green)]/10 text-[var(--cyber-neon-green)] border-[var(--cyber-neon-green)]/40 shadow-[0_0_10px_rgba(0,255,159,0.05)]",
                        hoverClass: "hover:border-[var(--cyber-neon-green)]/30",
                        count: categoryCounts.libraries,
                      },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = selectedCategory === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleSetCategory(tab.id as any)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-cyber font-bold uppercase tracking-wider border transition-all rounded-lg ${
                            isActive
                              ? tab.activeClass
                              : "bg-transparent text-[var(--text-dim)] border-[var(--border-light)] " +
                                tab.hoverClass
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5" />
                            {tab.label}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--overlay-bg)] border border-[var(--border-light)] ${
                              isActive
                                ? "text-[var(--text-color)]"
                                : "text-[var(--text-dim)]/50"
                            }`}
                          >
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Language selection */}
                <div className="space-y-2.5">
                  <h3 className="text-[10px] font-mono text-[var(--text-dim)]/60 uppercase tracking-widest font-bold">
                    Language
                  </h3>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-[var(--text-dim)]">
                      <LanguageIcon
                        lang={selectedLanguage}
                        size={14}
                        className=""
                      />
                    </div>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => handleSetLanguage(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg text-xs font-cyber font-bold uppercase tracking-wider text-[var(--text-color)] focus:outline-none focus:border-[var(--cyber-neon-blue)] focus:ring-1 focus:ring-[var(--cyber-neon-blue)] transition-colors appearance-none cursor-pointer"
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

                {/* Sort selector */}
                <div className="space-y-2.5">
                  <h3 className="text-[10px] font-mono text-[var(--text-dim)]/60 uppercase tracking-widest font-bold">
                    Sort Projects
                  </h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex border border-[var(--border-light)] rounded-lg overflow-hidden bg-[var(--overlay-bg)]">
                      <button
                        onClick={() => {
                          handleSetSortBy("stars");
                          handleSetSortDirection("desc");
                        }}
                        className={`flex-1 py-2 text-xs font-cyber font-bold uppercase transition-all ${
                          sortBy === "stars"
                            ? "bg-[var(--cyber-neon-blue)]/20 text-[var(--cyber-neon-blue)] font-bold"
                            : "text-[var(--text-dim)] hover:text-white"
                        }`}
                      >
                        Stars
                      </button>
                      <button
                        onClick={() => {
                          handleSetSortBy("name");
                          handleSetSortDirection("asc");
                        }}
                        className={`flex-1 py-2 text-xs font-cyber font-bold uppercase transition-all border-l border-[var(--border-light)] ${
                          sortBy === "name"
                            ? "bg-[var(--cyber-neon-blue)]/20 text-[var(--cyber-neon-blue)] font-bold"
                            : "text-[var(--text-dim)] hover:text-white"
                        }`}
                      >
                        A-Z
                      </button>
                    </div>

                    <button
                      onClick={toggleSortDirection}
                      className="w-full flex items-center justify-center gap-2 py-2 border border-[var(--border-light)] rounded-lg text-xs font-cyber font-bold uppercase tracking-wider text-[var(--text-dim)] hover:text-white bg-[var(--overlay-bg)] hover:border-[var(--cyber-neon-blue)] transition-all"
                    >
                      <ArrowUpDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${sortDirection === "asc" ? "rotate-180" : ""}`}
                      />
                      <span>
                        {sortDirection === "desc" ? "Descending" : "Ascending"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2.5">
                  <h3 className="text-[10px] font-mono text-[var(--text-dim)]/60 uppercase tracking-widest font-bold">
                    Status Filter
                  </h3>
                  <div className="flex border border-[var(--border-light)] rounded-lg overflow-hidden bg-[var(--overlay-bg)]">
                    {[
                      { id: "active", label: "Active" },
                      { id: "all", label: "All" },
                      { id: "inactive", label: "Inactive" },
                    ].map((opt) => {
                      const isActive = statusFilter === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setStatusFilter(opt.id as any);
                            setCurrentPage(1);
                          }}
                          className={`flex-1 py-2 text-xs font-cyber font-bold uppercase tracking-wider transition-all ${
                            isActive
                              ? "bg-[var(--cyber-neon-blue)]/20 text-[var(--cyber-neon-blue)] font-bold"
                              : "text-[var(--text-dim)] hover:text-white"
                          } ${opt.id !== "active" ? "border-l border-[var(--border-light)]" : ""}`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Last synced timestamp */}
                <div className="pt-4 border-t border-[var(--border-light)]/50 text-[9px] font-mono text-[var(--text-dim)]/30 uppercase tracking-wider text-center">
                  GitHub Stars Synced:
                  <br />
                  <span className="text-[var(--text-dim)]/50 font-bold">
                    {formatFetchedAt(ecosystemData.fetchedAt)}
                  </span>
                </div>
                <div className="absolute top-[-1px] left-[-1px] w-4 h-4 border-t-2 border-l-2 border-[var(--cyber-neon-blue)] rounded-tl-2xl m-0" />
                <div className="absolute bottom-[-1px] right-[-1px] w-4 h-4 border-b-2 border-r-2 border-[var(--cyber-neon-pink)] rounded-br-2xl m-0" />
              </div>
            </div>

            {/* Right Main Area: Filter pills, Project count, Cards grid, Pagination */}
            <div className="lg:col-span-3 space-y-6">
              {/* Active Filters Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[var(--panel-bg)]/40 border border-[var(--border-light)]/60 rounded-xl backdrop-blur-sm">
                <span className="text-xs font-mono text-[var(--text-dim)]/70 uppercase">
                  Found{" "}
                  <span className="text-[var(--text-color)] font-bold font-cyber">
                    {filteredAndSortedProjects.length}
                  </span>{" "}
                  project{filteredAndSortedProjects.length !== 1 ? "s" : ""}
                  {searchTerm ||
                  selectedCategory !== "all" ||
                  selectedLanguage !== "all" ||
                  statusFilter !== "active"
                    ? " matching filters"
                    : ""}
                </span>

                {(searchTerm ||
                  selectedCategory !== "all" ||
                  selectedLanguage !== "all" ||
                  statusFilter !== "active") && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono text-[var(--text-dim)]/40 uppercase tracking-wider">
                      Active Filters:
                    </span>
                    {selectedCategory !== "all" && (
                      <button
                        onClick={() => handleSetCategory("all")}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-cyber font-bold uppercase tracking-wider text-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/5 border border-[var(--cyber-neon-blue)]/20 rounded-md hover:bg-[var(--cyber-neon-blue)]/10 hover:border-[var(--cyber-neon-blue)]/40 transition-all"
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
                        className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-cyber font-bold uppercase tracking-wider text-[var(--cyber-neon-pink)] bg-[var(--cyber-neon-pink)]/5 border border-[var(--cyber-neon-pink)]/20 rounded-md hover:bg-[var(--cyber-neon-pink)]/10 hover:border-[var(--cyber-neon-pink)]/40 transition-all"
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
                        className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-cyber font-bold uppercase tracking-wider text-[var(--cyber-neon-green)] bg-[var(--cyber-neon-green)]/5 border border-[var(--cyber-neon-green)]/20 rounded-md hover:bg-[var(--cyber-neon-green)]/10 hover:border-[var(--cyber-neon-green)]/40 transition-all"
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
                    {statusFilter !== "active" && (
                      <button
                        onClick={() => setStatusFilter("active")}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-cyber font-bold uppercase tracking-wider text-[var(--cyber-neon-pink)] bg-[var(--cyber-neon-pink)]/5 border border-[var(--cyber-neon-pink)]/20 rounded-md hover:bg-[var(--cyber-neon-pink)]/10 hover:border-[var(--cyber-neon-pink)]/40 transition-all"
                      >
                        Status:{" "}
                        {statusFilter === "all" ? "All" : "Inactive Only"}
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
                        setStatusFilter("active");
                      }}
                      className="text-[9px] font-mono text-[var(--text-dim)]/60 hover:text-white uppercase underline hover:no-underline transition-all"
                    >
                      Reset All
                    </button>
                  </div>
                )}
              </div>

              {/* Top Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-4 border-b border-[var(--border-light)]/20">
                  <span className="text-xs font-mono text-[var(--text-dim)]/50 uppercase tracking-wider">
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
                          : "bg-transparent text-[var(--text-color)] border-[var(--border-light)] hover:border-[var(--cyber-neon-blue)] hover:text-white"
                      }`}
                    >
                      Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pNum) => {
                        const isPageActive = activePage === pNum;
                        return (
                          <button
                            key={pNum}
                            onClick={() => handlePageChange(pNum, false)}
                            className={`w-8 h-8 flex items-center justify-center text-xs font-cyber font-bold rounded-md transition-all border ${
                              isPageActive
                                ? "bg-[var(--cyber-neon-blue)] text-[var(--neon-contrast-text)] border-[var(--cyber-neon-blue)] shadow-[0_0_10px_rgba(0,243,255,0.2)]"
                                : "bg-transparent text-[var(--text-dim)] border-[var(--border-light)] hover:border-[var(--cyber-neon-blue)] hover:text-white"
                            }`}
                          >
                            {pNum}
                          </button>
                        );
                      },
                    )}

                    <button
                      disabled={activePage === totalPages}
                      onClick={() => handlePageChange(activePage + 1, false)}
                      className={`px-3 py-1.5 text-xs font-cyber font-bold uppercase border rounded-md transition-all ${
                        activePage === totalPages
                          ? "opacity-30 cursor-not-allowed border-[var(--border-light)] text-[var(--text-dim)]"
                          : "bg-transparent text-[var(--text-color)] border-[var(--border-light)] hover:border-[var(--cyber-neon-blue)] hover:text-white"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedProjects.map((project) => {
                  const categories = Array.isArray(project.category)
                    ? project.category
                    : [project.category];
                  const primaryCategory = categories[0] || "libraries";
                  const primaryBadge = getCategoryBadgeStyles(primaryCategory);
                  const githubUrls = Array.isArray(project.github)
                    ? project.github
                    : [project.github];
                  const primaryGithubUrl = githubUrls[0] || "";
                  const projectLink = project.url || primaryGithubUrl;

                  return (
                    <div
                      key={project.name}
                      className="p-6 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-xl hover:border-[var(--hover-color)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between min-h-[260px] relative overflow-hidden"
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
                              <span
                                title={getInactiveDuration(project.pushedAt)}
                                className="flex items-center gap-1 px-2 py-0.5 bg-white/5 text-[var(--text-dim)] opacity-50 border border-[var(--border-light)] rounded-md text-[10px] font-cyber font-bold uppercase tracking-wider cursor-help"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Inactive
                              </span>
                            )}
                          </div>

                          <a
                            href={primaryGithubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--warning-bg)] hover:bg-[var(--warning-border)] border border-[var(--warning-border)] hover:border-[var(--warning-text)] rounded-md text-xs font-mono text-[var(--warning-text)] transition-all shadow-inner group/stars"
                          >
                            <Star className="w-3.5 h-3.5 fill-current opacity-70 group-hover/stars:opacity-100 transition-all" />
                            <span className="font-bold">
                              {formatStars(project.stars)}
                            </span>
                          </a>
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
                        <p className="text-[10px] font-mono text-[var(--text-dim)]/40 uppercase tracking-widest mb-2">
                          BY{" "}
                          <a
                            href={`https://github.com/${project.owner}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--cyber-neon-pink)] hover:underline transition-colors"
                          >
                            {project.owner}
                          </a>
                        </p>

                        {/* Languages */}
                        {Array.isArray(project.languages) &&
                          project.languages.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {project.languages.map((lang) => (
                                <button
                                  key={lang}
                                  onClick={() => handleLanguageClick(lang)}
                                  className="inline-flex items-center px-2 py-0.5 bg-[var(--overlay-bg)]/50 text-[var(--text-dim)] hover:text-white border border-[var(--border-light)]/50 hover:border-[var(--cyber-neon-blue)]/50 rounded text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-all"
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
                              className="text-[10px] font-cyber font-bold uppercase tracking-wider text-[var(--text-color)] hover:text-[var(--cyber-neon-pink)] transition-colors flex items-center gap-1 group/git"
                            >
                              <GithubIcon className="w-3 h-3 opacity-70 group-hover/git:scale-110 transition-transform" />
                              {displayName}
                            </a>
                          );
                        })}
                        {project.url && !githubUrls.includes(project.url) && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-cyber font-bold uppercase tracking-wider text-[var(--text-color)] hover:text-[var(--cyber-neon-blue)] transition-colors flex items-center gap-1 group/ext"
                          >
                            <ExternalLink className="w-3 h-3 opacity-70 group-hover/ext:scale-110 transition-transform" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredAndSortedProjects.length === 0 && (
                  <div className="col-span-full py-16 text-center border border-dashed border-[var(--border-light)] rounded-xl bg-[var(--overlay-bg)]/5">
                    <Search className="w-12 h-12 text-[var(--text-dim)]/20 mx-auto mb-4" />
                    <p className="text-base font-cyber text-[var(--text-color)] uppercase tracking-widest mb-1">
                      No matches found
                    </p>
                    <p className="text-xs text-[var(--text-dim)]/50 font-mono">
                      Try adjusting your filters or search keywords.
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-[var(--border-light)]/30">
                  <span className="text-xs font-mono text-[var(--text-dim)]/50 uppercase tracking-wider">
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
                          : "bg-transparent text-[var(--text-color)] border-[var(--border-light)] hover:border-[var(--cyber-neon-blue)] hover:text-white"
                      }`}
                    >
                      Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pNum) => {
                        const isPageActive = activePage === pNum;
                        return (
                          <button
                            key={pNum}
                            onClick={() => handlePageChange(pNum)}
                            className={`w-8 h-8 flex items-center justify-center text-xs font-cyber font-bold rounded-md transition-all border ${
                              isPageActive
                                ? "bg-[var(--cyber-neon-blue)] text-[var(--neon-contrast-text)] border-[var(--cyber-neon-blue)] shadow-[0_0_10px_rgba(0,243,255,0.2)]"
                                : "bg-transparent text-[var(--text-dim)] border-[var(--border-light)] hover:border-[var(--cyber-neon-blue)] hover:text-white"
                            }`}
                          >
                            {pNum}
                          </button>
                        );
                      },
                    )}

                    <button
                      disabled={activePage === totalPages}
                      onClick={() => handlePageChange(activePage + 1)}
                      className={`px-3 py-1.5 text-xs font-cyber font-bold uppercase border rounded-md transition-all ${
                        activePage === totalPages
                          ? "opacity-30 cursor-not-allowed border-[var(--border-light)] text-[var(--text-dim)]"
                          : "bg-transparent text-[var(--text-color)] border-[var(--border-light)] hover:border-[var(--cyber-neon-blue)] hover:text-white"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};

export default Ecosystem;
