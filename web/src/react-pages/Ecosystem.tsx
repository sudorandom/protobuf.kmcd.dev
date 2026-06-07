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
  switch (norm) {
    case "go":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          fill="currentColor"
        >
          <path d="M14.2 12.1c-.8.8-1.9 1.3-3.2 1.3-2.6 0-4.6-2-4.6-4.6v-.6C6.4 5.6 8.4 3.6 11 3.6c1.3 0 2.4.5 3.2 1.3l2.5-2.5C15.1.8 13.2 0 11 0 5 0 .5 4.5.5 10.5v.6c0 6 4.5 10.5 10.5 10.5 2.2 0 4.1-.8 5.7-2.4l-2.5-2.5z" />
          <path d="M23.5 10.5h-8v3h8v-3z" />
        </svg>
      );
    case "rust":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 1v2M12 21v2M1 12h2M21 12h2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1.4 22.6l1.4-1.4M22.6 1.4l-1.4 1.4" />
          <text
            x="12"
            y="16"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            fill="currentColor"
            stroke="none"
          >
            R
          </text>
        </svg>
      );
    case "python":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          fill="currentColor"
        >
          <path d="M11.9 0C5.3 0 5.8 2.9 5.8 2.9v2.2h6.2V6H3.3S0 6.3 0 12.5c0 6.1 2.9 5.9 2.9 5.9h1.7v-2.4c0-3 2.5-5.6 5.6-5.6h6v-2.2c0-2.3-2.1-8.2-4.3-8.2zm4.4 5.6v2.4c0 3-2.5 5.6-5.6 5.6h-6v2.2c0 2.3 2.1 8.2 4.3 8.2 6.6 0 6.1-2.9 6.1-2.9v-2.2H8.9v-.9h8.7s3.3-.3 3.3-6.5c.1-6.1-2.8-5.9-2.8-5.9h-1.8z" />
        </svg>
      );
    case "typescript":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          fill="currentColor"
        >
          <rect width="24" height="24" rx="3" />
          <path
            fill="#fff"
            d="M8.2 17.5c-.7 0-1.3-.2-1.8-.7-.5-.4-.7-.9-.7-1.6h2.2c0 .3.1.6.3.8.2.1.4.2.7.2.3 0 .6-.1.7-.3.2-.2.2-.4.2-.7v-8h2.3v8c0 1.2-.3 2.1-.9 2.6-.6.5-1.5.7-2.6.7zm7.5 0c-1.1 0-2-.3-2.5-.9-.6-.6-.8-1.5-.8-2.6v-2h2.2v2c0 .5.1.8.3 1 .2.2.5.3.9.3.3 0 .6-.1.8-.3.2-.2.3-.5.3-1 0-.4-.1-.7-.3-.9-.2-.2-.6-.4-1.2-.6-.9-.3-1.6-.7-2-1.1s-.6-1-.6-1.8c0-.9.3-1.7.9-2.2s1.5-.8 2.6-.8 1.9.3 2.4.9c.5.6.8 1.4.8 2.4h-2.2c0-.5-.1-.8-.3-1-.2-.2-.5-.3-.8-.3-.3 0-.6.1-.7.3-.2.2-.2.4-.2.7 0 .3.1.6.4.8.3.2.8.4 1.5.6.9.3 1.6.7 2 1.2s.6 1.1.6 1.9c0 1-.3 1.8-.9 2.3-.6.5-1.5.8-2.7.8z"
          />
        </svg>
      );
    case "javascript":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          fill="currentColor"
        >
          <rect width="24" height="24" rx="3" />
          <path
            fill="#000"
            d="M12.2 18c-.8 0-1.5-.3-2-.8-.5-.5-.8-1.2-.8-2.1h2c0 .4.1.7.2.9.2.2.5.3.9.3.3 0 .6-.1.8-.3.2-.2.3-.5.3-.9 0-.3-.1-.6-.3-.8-.2-.2-.6-.4-1.2-.6-.9-.3-1.6-.7-2-1.1s-.6-1-.6-1.8c0-.9.3-1.7.9-2.2s1.5-.8 2.6-.8c1.1 0 1.9.3 2.4.9.5.6.8 1.4.8 2.4h-2c0-.5-.1-.8-.3-1-.2-.2-.5-.3-.8-.3-.3 0-.6.1-.7.3-.2.2-.2.4-.2.7 0 .3.1.6.4.8.3.2.8.4 1.5.6.9.3 1.6.7 2 1.2s.6 1.1.6 1.9c0 1-.3 1.8-.9 2.3-.6.5-1.5.8-2.7.8zm-6.5 0c-.7 0-1.3-.2-1.8-.7-.5-.4-.7-.9-.7-1.6h2c0 .3.1.6.3.8.2.1.4.2.7.2.3 0 .6-.1.7-.3.2-.2.2-.4.2-.7V9.7h2v5.7c0 1.2-.3 2.1-.9 2.6-.6.5-1.5.7-2.6.7z"
          />
        </svg>
      );
    case "java":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
          <line x1="6" y1="2" x2="6" y2="4" />
          <line x1="10" y1="2" x2="10" y2="4" />
          <line x1="14" y1="2" x2="14" y2="4" />
        </svg>
      );
    case "c++":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 10h4M20 8v4M12 10h4M14 8v4" />
          <path d="M10 6.5A5.5 5.5 0 1 0 10 17.5" />
        </svg>
      );
    case "c":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 6.5A5.5 5.5 0 1 0 15 17.5" />
        </svg>
      );
    case "c#":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 6.5A5.5 5.5 0 1 0 9 17.5" />
          <path d="M14 8h8M14 12h8M16 6v8M20 6v8" />
        </svg>
      );
    case "swift":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          fill="currentColor"
        >
          <path
            d="M22.5 13.5c-4.5 4.5-10.5 4.5-13.5 1.5-1.5-1.5-1.5-3.5 0-5 1.5-1.5 3.5-1.5 5 0 3 3 3 9 1.5 13.5z"
            opacity="0.3"
          />
          <path d="M2.5 19.5c6-6 12-6 16.5-1.5.8.8.8 2 0 2.8s-2 .8-2.8 0c-3-3-7.5-3-11.5 0-.8.8-2 .8-2.8 0s-.8-2.1.6-1.3z" />
          <path d="M9.5 4.5C14.5 1 19 3 21.5 5.5s4 7 1.5 11c-1.5-3.5-4.5-6.5-8-8-3.5-1.5-6.5-.5-5.5-4z" />
        </svg>
      );
    case "kotlin":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          fill="currentColor"
        >
          <path d="M24 24H0V0h24L12 12Z" />
        </svg>
      );
    case "elixir":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          fill="currentColor"
        >
          <path d="M12 24c-5.5 0-10-4.5-10-10C2 7.7 7.7 2 12 0c4.3 2 10 7.7 10 14 0 5.5-4.5 10-10 10zm0-22c-3.1 1.7-8 6.4-8 12 0 4.4 3.6 8 8 8s8-3.6 8-8c0-5.6-4.9-10.3-8-12z" />
          <path
            d="M12 19c-2.8 0-5-2.2-5-5 0-2 .8-3.9 2.2-5.2.4-.4 1-.4 1.4 0s.4 1 0 1.4C9.7 11.1 9 12.5 9 14c0 1.7 1.3 3 3 3s3-1.3 3-3c0-.6-.4-1-1-1s-1 .4-1 1c0 2.2-2.2 4-5 4z"
            opacity="0.5"
          />
        </svg>
      );
    case "dart":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          fill="currentColor"
        >
          <path d="M22.2 7.8L12 0 1.8 7.8l5.4 14.4L12 24l4.8-1.8z" />
        </svg>
      );
    case "php":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <ellipse cx="12" cy="12" rx="11" ry="6" />
          <text
            x="12"
            y="15"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
            fill="currentColor"
            stroke="none"
          >
            PHP
          </text>
        </svg>
      );
    case "ruby":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3h12l4 6-10 12L2 9Z" />
          <path d="M11 3 8 9l4 12 4-12-3-6" />
          <path d="M2 9h20" />
        </svg>
      );
    case "scala":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          fill="currentColor"
        >
          <path d="M4 2h16v3H4zm2 5h14v3H6zm2 5h14v3H8zm2 5h14v3H10zm2 5h14v3H12z" />
        </svg>
      );
    case "julia":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          fill="currentColor"
        >
          <circle cx="12" cy="6" r="4" />
          <circle cx="6" cy="16" r="4" />
          <circle cx="18" cy="16" r="4" />
        </svg>
      );
    case "objective-c":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 17.5A5.5 5.5 0 1 0 12 6.5" />
          <path d="M12 6.5c1-2 2.5-3 4-3s2 1.5 2 3c0 3.5-3.5 5.5-6 5.5" />
        </svg>
      );
    case "agnostic":
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
  }
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
  github: string;
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (typeof window !== "undefined") {
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

  const projects = (ecosystemData.projects || []) as Project[];

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: 0, tools: 0, plugins: 0, libraries: 0 };
    projects.forEach((p) => {
      const matchesLanguage =
        selectedLanguage === "all" ||
        (Array.isArray(p.languages) && p.languages.includes(selectedLanguage));
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${p.owner}/${p.repo}`.toLowerCase().includes(searchTerm.toLowerCase());
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
        const matchesSearch =
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${project.owner}/${project.repo}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
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
                      <LanguageIcon lang={selectedLanguage} size={14} className="" />
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
                      <LanguageIcon lang={selectedLanguage} size={14} className="" />
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
              {/* Horizontal Language Filter Bar with Icons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none sm:scrollbar-thin">
                {["all", ...availableLanguages].map((lang) => {
                  const isActive = (lang === "all" && selectedLanguage === "all") || selectedLanguage === lang;
                  const displayName = lang === "all" ? "All" : lang;
                  return (
                    <button
                      key={lang}
                      onClick={() => handleSetLanguage(lang)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-cyber font-bold uppercase border rounded-full whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? "bg-[var(--cyber-neon-blue)]/10 text-[var(--cyber-neon-blue)] border-[var(--cyber-neon-blue)]/50 shadow-[0_0_8px_rgba(0,243,255,0.1)]"
                          : "bg-[var(--overlay-bg)] text-[var(--text-dim)] border-[var(--border-light)] hover:border-[var(--cyber-neon-blue)]/30 hover:text-white"
                      }`}
                    >
                      <LanguageIcon lang={lang} size={10} className="" />
                      <span>{displayName}</span>
                    </button>
                  );
                })}
              </div>
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

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedProjects.map((project) => {
                  const categories = Array.isArray(project.category)
                    ? project.category
                    : [project.category];
                  const primaryCategory = categories[0] || "libraries";
                  const primaryBadge = getCategoryBadgeStyles(primaryCategory);
                  const projectLink =
                    project.url && project.url !== project.github
                      ? project.url
                      : project.github;

                  return (
                    <div
                      key={`${project.owner}/${project.repo}`}
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
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--overlay-bg)] hover:bg-[var(--border-light)] border border-[var(--border-light)] hover:border-[var(--cyber-neon-yellow)] rounded-md text-xs font-mono text-[var(--cyber-neon-yellow)] transition-all shadow-inner group/stars"
                          >
                            <Star className="w-3.5 h-3.5 fill-current opacity-40 group-hover/stars:opacity-100 transition-all" />
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
                                  <LanguageIcon lang={lang} size={10} className="mr-1" />
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
                      <div className="flex items-center gap-4 pt-4 border-t border-[var(--border-light)]/40 mt-auto">
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-cyber font-bold uppercase tracking-wider text-[var(--text-color)] hover:text-[var(--cyber-neon-pink)] transition-colors flex items-center gap-1 group/git"
                        >
                          <GithubIcon className="w-3.5 h-3.5 opacity-70 group-hover/git:scale-110 transition-transform" />
                          Repository
                        </a>
                        {project.url && project.url !== project.github && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-cyber font-bold uppercase tracking-wider text-[var(--text-color)] hover:text-[var(--cyber-neon-blue)] transition-colors flex items-center gap-1 group/ext"
                          >
                            <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover/ext:scale-110 transition-transform" />
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
