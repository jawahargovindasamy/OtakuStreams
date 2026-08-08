import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  Search as SearchIcon,
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon,
  Star,
  ChevronDown,
  Check,
  RotateCcw,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
  Flame,
  Building2,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PosterCard from "@/components/PosterCard";

import { useData } from "@/context/data-provider";
import { useAuth } from "@/context/auth-provider";
import { slugify } from "@/lib/utils";

const POPULAR_PRODUCTIONS = [
  { name: "MAPPA", slug: "mappa" },
  { name: "ufotable", slug: "ufotable" },
  { name: "Toei Animation", slug: "toei-animation" },
  { name: "Wit Studio", slug: "wit-studio" },
  { name: "Madhouse", slug: "madhouse" },
  { name: "Bones", slug: "bones" },
  { name: "Kyoto Animation", slug: "kyoto-animation" },
  { name: "A-1 Pictures", slug: "a-1-pictures" },
  { name: "Production I.G", slug: "production-i-g" },
  { name: "Studio Pierrot", slug: "studio-pierrot" },
];

const SORT_OPTIONS = [
  { id: "relevance", label: "Relevance" },
  { id: "popularity", label: "Popularity" },
  { id: "trending", label: "Trending" },
  { id: "score", label: "Highest Score" },
  { id: "newest", label: "Newest Release" },
];

const FORMAT_OPTIONS = [
  { id: "all", label: "All Formats" },
  { id: "tv", label: "TV" },
  { id: "movie", label: "Movie" },
  { id: "ova", label: "OVA" },
  { id: "ona", label: "ONA" },
  { id: "special", label: "Special" },
];

const STATUS_OPTIONS = [
  { id: "all", label: "All Statuses" },
  { id: "airing", label: "Currently Airing" },
  { id: "finished", label: "Finished" },
  { id: "upcoming", label: "Not Yet Released" },
];

const YEAR_OPTIONS = [
  { id: "all", label: "Any Year" },
  { id: "2025", label: "2025" },
  { id: "2024", label: "2024" },
  { id: "2023", label: "2023" },
  { id: "2022", label: "2022" },
  { id: "2021", label: "2021" },
  { id: "2020", label: "2020" },
  { id: "2019", label: "2019" },
  { id: "2018", label: "2018" },
];

const TRENDING_CHIPS = [
  "Solo Leveling",
  "Frieren",
  "Jujutsu Kaisen",
  "Demon Slayer",
  "One Piece",
  "Attack on Titan",
];

const RELATED_RAIL_CHIPS = [
  { label: "Most popular", route: "/most-popular" },
  { label: "Top airing", route: "/top-airing" },
  { label: "Action", route: "/genre/action" },
  { label: "Romance", route: "/genre/romance" },
  { label: "Fantasy", route: "/genre/fantasy" },
  { label: "Comedy", route: "/genre/comedy" },
  { label: "Sci-Fi", route: "/genre/sci-fi" },
  { label: "Drama", route: "/genre/drama" },
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { fetchsearch } = useData();
  const { continueWatching } = useAuth();

  // Active URL Params
  const rawKeyword = searchParams.get("keyword") || "";
  const keyword = rawKeyword.trim();
  const sort = searchParams.get("sort") || "relevance";
  const format = searchParams.get("format") || "all";
  const status = searchParams.get("status") || "all";
  const year = searchParams.get("year") || "all";
  const view = searchParams.get("view") || "grid";

  // Local state for Hero Search Input Field
  const [heroInput, setHeroInput] = useState(rawKeyword);

  // Sync hero input with URL keyword parameter
  useEffect(() => {
    setHeroInput(rawKeyword);
  }, [rawKeyword]);

  useEffect(() => {
    if (keyword) {
      document.title = `Search: "${keyword}" — OtakuStreams`;
    } else {
      document.title = "Search Anime — OtakuStreams";
    }
  }, [keyword]);

  // Internal Page State
  const [page, setPage] = useState(1);

  // Data & UI States
  const [loading, setLoading] = useState(false);
  const [refetching, setRefetching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [animeList, setAnimeList] = useState([]);
  const [activePopover, setActivePopover] = useState(null); // 'sort' | 'format' | 'status' | 'year' | null
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // Draft filters for Mobile Sheet
  const [draftFilters, setDraftFilters] = useState({ sort, format, status, year });

  // Debounced input updates to URL (350ms per spec)
  const heroFormRef = useRef(null);

  const handleHeroInputChange = (e) => {
    const val = e.target.value;
    setHeroInput(val);
  };

  const handleHeroFormSubmit = (e) => {
    e.preventDefault();
    if (!heroInput.trim()) return;
    updateParams({ keyword: heroInput.trim() }, true);
  };

  // Helper to update search params while stripping defaults
  const updateParams = useCallback(
    (newParams, replace = false) => {
      setPage(1);
      const updated = new URLSearchParams(searchParams);

      Object.entries(newParams).forEach(([key, val]) => {
        if (
          !val ||
          val === "all" ||
          (key === "sort" && val === "relevance") ||
          (key === "view" && val === "grid") ||
          key === "page"
        ) {
          updated.delete(key);
        } else {
          updated.set(key, val);
        }
      });

      setSearchParams(updated, { replace });
    },
    [searchParams, setSearchParams]
  );

  // Reset page state on filter change
  useEffect(() => {
    setPage(1);
  }, [keyword, sort, format, status, year]);

  // Fetch Search Data
  useEffect(() => {
    let isMounted = true;

    if (!keyword || keyword.length < 2) {
      setLoading(false);
      setAnimeList([]);
      setData(null);
      return;
    }

    const loadSearchData = async () => {
      if (page === 1) {
        if (animeList.length > 0) {
          setRefetching(true);
        } else {
          setLoading(true);
        }
        setError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await fetchsearch(keyword, page, { sort, format, status, year });

        if (!isMounted) return;

        if (res) {
          setData(res);
          if (page === 1) {
            setAnimeList(res.animes || []);
          } else {
            setAnimeList((prev) => {
              const existingIds = new Set(prev.map((a) => a.id));
              const newItems = (res.animes || []).filter((a) => !existingIds.has(a.id));
              return [...prev, ...newItems];
            });
          }
        } else {
          throw new Error("Failed to fetch search results");
        }
      } catch (err) {
        console.error("Search fetch error:", err);
        if (isMounted) setError(err.message || "We couldn't load search results right now.");
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefetching(false);
          setLoadingMore(false);
        }
      }
    };

    loadSearchData();

    return () => {
      isMounted = false;
    };
  }, [keyword, page, sort, format, status, year, fetchsearch]);

  // Body Scroll Lock for Mobile Sheet
  useEffect(() => {
    if (mobileSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSheetOpen]);

  // Count active non-default filters
  const activeFilterCount = [
    format !== "all" ? 1 : 0,
    status !== "all" ? 1 : 0,
    year !== "all" ? 1 : 0,
    sort !== "relevance" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Helper for passive Continue Watching info
  const getContinueWatchingInfo = (animeId) => {
    if (!continueWatching || !Array.isArray(continueWatching)) return null;
    const match = continueWatching.find((cw) => cw.animeId?.toString() === animeId?.toString());
    if (!match) return null;
    const ep = match.currentEpisode || 1;
    const pct = match.progress ? Math.min(100, Math.max(0, Math.round(match.progress))) : 0;
    return { ep, pct };
  };

  // Format Labels for Active Display
  const activeFormatLabel = FORMAT_OPTIONS.find((f) => f.id === format)?.label || "All Formats";
  const activeStatusLabel = STATUS_OPTIONS.find((s) => s.id === status)?.label || "All Statuses";

  // Dynamic Color Tint derived from result #1 coverImage.color per spec
  const resultColorTint = data?.firstColor || null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary relative">
      {/* 1. Skip Link */}
      <a
        href="#search-collection"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-xl focus:shadow-lg focus:font-semibold text-sm transition-all"
      >
        Skip to search results
      </a>

      {/* 2. Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 w-full pt-[68px] pb-16 lg:pb-24">
        {/* 3. Hero Section with Editable Input & Optional Result-Derived Tint */}
        <section className="relative w-full overflow-hidden border-b border-border/60 py-10 sm:py-14 lg:py-16">
          {/* Result-Derived Color Tint at 12% opacity (Spec Requirement) */}
          {resultColorTint && (
            <div
              className="absolute inset-0 opacity-12 transition-all duration-1000 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 30%, ${resultColorTint} 0%, transparent 75%)`,
              }}
            />
          )}
          {/* Aurora Bloom Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background/70 to-background pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />

          {/* Hero Content Container */}
          <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 space-y-4 text-left">
            {/* Eyebrow */}
            <div className="text-xs font-semibold text-primary uppercase tracking-[0.18em] font-sans">
              SEARCH RESULTS
            </div>

            {/* Title (Outfit H1) */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-foreground leading-none">
              {keyword ? `Results for “${keyword}”` : "Search Anime"}
            </h1>

            {/* Hero Form Input Field (Canonical Search Field) */}
            <form
              role="search"
              ref={heroFormRef}
              onSubmit={handleHeroFormSubmit}
              className="relative max-w-xl w-full pt-1"
            >
              <div className="relative flex items-center">
                <SearchIcon className="absolute left-4 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={heroInput}
                  onChange={handleHeroInputChange}
                  placeholder="Search 20,000+ anime titles, genres, studios..."
                  aria-label="Search anime"
                  className="w-full h-13 pl-12 pr-10 rounded-full bg-surface/80 border border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground text-sm font-sans outline-none transition-all shadow-soft"
                />
                {heroInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setHeroInput("");
                      updateParams({ keyword: "" }, true);
                    }}
                    className="absolute right-4 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-elevated transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Stat Summary Line */}
            {keyword && keyword.length >= 2 && !loading && animeList.length > 0 && (
              <div
                aria-live="polite"
                className="text-xs sm:text-sm font-medium text-muted-foreground font-sans tabular-nums pt-1"
              >
                <span>{animeList.length} titles loaded</span>
              </div>
            )}
          </div>
        </section>

        {/* 4. Related-Search Rail */}
        <section className="w-full border-b border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <nav
              aria-label="Related searches"
              className="flex items-center gap-2 py-3 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
                Explore:
              </span>
              {RELATED_RAIL_CHIPS.map((chip) => (
                <Link
                  key={chip.route}
                  to={chip.route}
                  className="shrink-0 snap-start px-3.5 h-9 rounded-full text-xs font-medium bg-surface/60 border border-border text-subtle hover:bg-elevated hover:text-foreground flex items-center justify-center transition-all cursor-pointer"
                >
                  {chip.label}
                </Link>
              ))}
            </nav>
          </div>
        </section>

        {/* 5. Sticky Discovery Controls Bar */}
        {keyword && keyword.length >= 2 && (
          <section className="sticky top-[68px] z-30 w-full border-b border-border bg-background/80 backdrop-blur-xl py-3 transition-colors">
            {refetching && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/20 overflow-hidden">
                <div className="h-full bg-primary animate-pulse w-full" />
              </div>
            )}

            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
              {/* Desktop Controls (≥1024px) */}
              <div className="hidden lg:flex items-center gap-3">
                {/* Sort Popover */}
                <div className="relative">
                  <button
                    type="button"
                    aria-expanded={activePopover === "sort"}
                    onClick={() => setActivePopover((prev) => (prev === "sort" ? null : "sort"))}
                    className={`h-11 px-4 rounded-full border text-sm font-medium flex items-center gap-2 transition-all cursor-pointer ${
                      sort !== "relevance"
                        ? "bg-primary/15 border-primary/50 text-primary font-semibold"
                        : "bg-surface/50 border-border text-foreground hover:bg-elevated"
                    }`}
                  >
                    <span className="text-xs text-muted-foreground font-normal">Sort:</span>
                    <span>{SORT_OPTIONS.find((s) => s.id === sort)?.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                  </button>

                  {activePopover === "sort" && (
                    <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-surface border border-border shadow-lift p-1.5 z-40 space-y-1 font-sans">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            updateParams({ sort: opt.id });
                            setActivePopover(null);
                          }}
                          className={`w-full h-10 px-3 rounded-xl text-xs font-medium flex items-center justify-between text-left transition-colors cursor-pointer ${
                            sort === opt.id
                              ? "bg-primary/15 text-primary font-semibold"
                              : "text-subtle hover:bg-elevated hover:text-foreground"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {sort === opt.id && <Check className="w-3.5 h-3.5 text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-6 w-px bg-border/60" />

                {/* Format Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    aria-expanded={activePopover === "format"}
                    onClick={() => setActivePopover((prev) => (prev === "format" ? null : "format"))}
                    className={`h-11 px-4 rounded-full border text-sm font-medium flex items-center gap-2 transition-all cursor-pointer ${
                      format !== "all"
                        ? "bg-primary/15 border-primary/50 text-primary font-semibold"
                        : "bg-surface/50 border-border text-foreground hover:bg-elevated"
                    }`}
                  >
                    <span className="text-xs text-muted-foreground font-normal">Format:</span>
                    <span>{activeFormatLabel}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                  </button>

                  {activePopover === "format" && (
                    <div className="absolute left-0 mt-2 w-44 rounded-2xl bg-surface border border-border shadow-lift p-1.5 z-40 space-y-1 font-sans">
                      {FORMAT_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            updateParams({ format: opt.id });
                            setActivePopover(null);
                          }}
                          className={`w-full h-10 px-3 rounded-xl text-xs font-medium flex items-center justify-between text-left transition-colors cursor-pointer ${
                            format === opt.id
                              ? "bg-primary/15 text-primary font-semibold"
                              : "text-subtle hover:bg-elevated hover:text-foreground"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {format === opt.id && <Check className="w-3.5 h-3.5 text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    aria-expanded={activePopover === "status"}
                    onClick={() => setActivePopover((prev) => (prev === "status" ? null : "status"))}
                    className={`h-11 px-4 rounded-full border text-sm font-medium flex items-center gap-2 transition-all cursor-pointer ${
                      status !== "all"
                        ? "bg-primary/15 border-primary/50 text-primary font-semibold"
                        : "bg-surface/50 border-border text-foreground hover:bg-elevated"
                    }`}
                  >
                    <span className="text-xs text-muted-foreground font-normal">Status:</span>
                    <span>{activeStatusLabel}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                  </button>

                  {activePopover === "status" && (
                    <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-surface border border-border shadow-lift p-1.5 z-40 space-y-1 font-sans">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            updateParams({ status: opt.id });
                            setActivePopover(null);
                          }}
                          className={`w-full h-10 px-3 rounded-xl text-xs font-medium flex items-center justify-between text-left transition-colors cursor-pointer ${
                            status === opt.id
                              ? "bg-primary/15 text-primary font-semibold"
                              : "text-subtle hover:bg-elevated hover:text-foreground"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {status === opt.id && <Check className="w-3.5 h-3.5 text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Year Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    aria-expanded={activePopover === "year"}
                    onClick={() => setActivePopover((prev) => (prev === "year" ? null : "year"))}
                    className={`h-11 px-4 rounded-full border text-sm font-medium flex items-center gap-2 transition-all cursor-pointer ${
                      year !== "all"
                        ? "bg-primary/15 border-primary/50 text-primary font-semibold"
                        : "bg-surface/50 border-border text-foreground hover:bg-elevated"
                    }`}
                  >
                    <span className="text-xs text-muted-foreground font-normal">Year:</span>
                    <span>{year === "all" ? "Any Year" : year}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                  </button>

                  {activePopover === "year" && (
                    <div className="absolute left-0 mt-2 w-44 max-h-64 overflow-y-auto rounded-2xl bg-surface border border-border shadow-lift p-1.5 z-40 space-y-1 font-sans no-scrollbar">
                      {YEAR_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            updateParams({ year: opt.id });
                            setActivePopover(null);
                          }}
                          className={`w-full h-10 px-3 rounded-xl text-xs font-medium flex items-center justify-between text-left transition-colors cursor-pointer ${
                            year === opt.id
                              ? "bg-primary/15 text-primary font-semibold"
                              : "text-subtle hover:bg-elevated hover:text-foreground"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {year === opt.id && <Check className="w-3.5 h-3.5 text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clear All Filters Button */}
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => updateParams({ sort: "relevance", format: "all", status: "all", year: "all" })}
                    className="text-xs font-medium text-primary hover:underline px-2 py-1 transition-colors cursor-pointer"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* Mobile Filter Button (<1024px) */}
              <div className="flex lg:hidden items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraftFilters({ sort, format, status, year });
                    setMobileSheetOpen(true);
                  }}
                  className={`h-11 px-4 rounded-full border text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeFilterCount > 0
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-surface/50 border-border text-foreground hover:bg-elevated"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filter & sort</span>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary-foreground text-primary text-xs font-extrabold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* View Toggle (Grid / List) */}
              <div className="flex items-center gap-0.5 bg-surface/50 border border-border p-1 rounded-full">
                <button
                  type="button"
                  aria-pressed={view === "grid"}
                  aria-label="Grid view"
                  onClick={() => updateParams({ view: "grid" })}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    view === "grid"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-pressed={view === "list"}
                  aria-label="List view"
                  onClick={() => updateParams({ view: "list" })}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    view === "list"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 6. Collection Grid / List / Empty States */}
        <section id="search-collection" className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 pt-6 min-h-[420px]">
          {/* EMPTY KEYWORD STATE */}
          {(!keyword || keyword.length < 2) && (
            <div className="py-12 space-y-10 text-left font-sans">
              <div className="space-y-4 max-w-xl">
                <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                  <Flame className="w-5 h-5 text-accent" />
                  Trending Searches
                </h2>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_CHIPS.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setHeroInput(term);
                        updateParams({ keyword: term }, true);
                      }}
                      className="px-4 h-11 rounded-2xl bg-surface border border-border/80 hover:border-primary/50 text-sm font-semibold text-foreground hover:text-primary transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 max-w-4xl">
                <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Browse Popular Genres
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[
                    "Action",
                    "Adventure",
                    "Comedy",
                    "Drama",
                    "Fantasy",
                    "Romance",
                    "Sci-Fi",
                    "Slice of Life",
                  ].map((genre) => (
                    <Link
                      key={genre}
                      to={`/genre/${genre.toLowerCase().replace(/\s+/g, "-")}`}
                      className="p-4 rounded-2xl bg-surface/60 border border-border hover:border-primary/50 hover:bg-elevated transition-all flex flex-col justify-between group cursor-pointer h-24"
                    >
                      <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {genre}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">Explore titles →</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Production Category: Browse Production Studios (10 Top Studios) */}
              <div className="space-y-4 max-w-4xl pt-4">
                <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Browse Production Studios
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {POPULAR_PRODUCTIONS.map((prod) => (
                    <Link
                      key={prod.slug}
                      to={`/producer/${prod.slug}`}
                      className="p-4 rounded-2xl bg-surface/60 border border-border hover:border-primary/50 hover:bg-elevated transition-all flex flex-col justify-between group cursor-pointer h-24"
                    >
                      <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {prod.name}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">View studio →</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Skeleton Load State */}
          {keyword && keyword.length >= 2 && loading && (
            <div
              className={`w-full ${
                view === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                  : "space-y-3"
              }`}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`bg-elevated/40 rounded-2xl animate-pulse ${
                    view === "grid" ? "aspect-[2/3] w-full" : "h-20 w-full"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Error State */}
          {keyword && keyword.length >= 2 && !loading && error && (
            <div className="flex flex-col items-center justify-center min-h-[420px] text-center p-8 bg-surface/30 rounded-2xl border border-border">
              <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
              <h2 className="text-2xl font-bold font-display text-foreground mb-2">
                We couldn't load search results right now.
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mb-6 font-sans">
                {error}
              </p>
              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  setError(null);
                }}
                className="px-5 h-11 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Try again
              </button>
            </div>
          )}

          {/* Zero Results State */}
          {keyword && keyword.length >= 2 && !loading && !error && animeList.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[420px] text-center p-8 bg-surface/30 rounded-2xl border border-border space-y-4">
              <Sparkles className="w-12 h-12 text-muted-foreground" />
              <h2 className="text-2xl font-bold font-display text-foreground">
                No anime matches “{keyword}”
              </h2>
              <p className="text-sm text-muted-foreground max-w-md font-sans">
                Try loosening your filters or searching for alternative spellings.
              </p>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => updateParams({ sort: "relevance", format: "all", status: "all", year: "all" })}
                  className="px-5 h-11 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Clear filters
                </button>
              )}
              <div className="pt-4 space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Or try one of these trending titles:
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {TRENDING_CHIPS.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setHeroInput(term);
                        updateParams({ keyword: term }, true);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-surface border border-border text-xs font-semibold text-subtle hover:text-foreground hover:bg-elevated transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* GRID VIEW */}
          {keyword && keyword.length >= 2 && !loading && !error && animeList.length > 0 && view === "grid" && (
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full transition-opacity duration-200 ${
                refetching ? "opacity-60 pointer-events-none" : "opacity-100"
              }`}
            >
              {animeList.map((anime) => (
                <PosterCard
                  key={anime.id}
                  item={anime}
                  className="w-full cursor-pointer group flex flex-col focus-within:ring-2 focus-within:ring-primary rounded-2xl"
                />
              ))}
            </div>
          )}

          {/* LIST VIEW */}
          {keyword && keyword.length >= 2 && !loading && !error && animeList.length > 0 && view === "list" && (
            <div
              className={`w-full rounded-2xl border border-border bg-surface/40 divide-y divide-border overflow-hidden text-left font-sans transition-opacity duration-200 ${
                refetching ? "opacity-60 pointer-events-none" : "opacity-100"
              }`}
            >
              {animeList.map((anime) => {
                const title = anime.name || anime.title?.english || anime.jname || "Anime";
                const altTitle = anime.jname && anime.jname !== title ? anime.jname : null;
                const slug = slugify(title);
                const cwInfo = getContinueWatchingInfo(anime.id);

                return (
                  <Link
                    key={anime.id}
                    to={`/${slug}/${anime.id}`}
                    aria-label={title}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-elevated/60 transition-colors group cursor-pointer"
                  >
                    {/* 2:3 Thumbnail */}
                    <div className="w-14 sm:w-16 aspect-[2/3] rounded-xl overflow-hidden bg-elevated shrink-0 border border-border relative">
                      <img
                        src={anime.poster}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {cwInfo && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                          <div className="h-full bg-primary" style={{ width: `${cwInfo.pct}%` }} />
                        </div>
                      )}
                    </div>

                    {/* Metadata Details */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {title}
                      </h3>
                      {altTitle && (
                        <p className="text-xs text-muted-foreground truncate">{altTitle}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                        {anime.type && (
                          <span className="px-2 py-0.5 rounded-full bg-surface border border-border font-medium text-foreground text-[10px]">
                            {anime.type}
                          </span>
                        )}
                        {anime.year && <span>{anime.year}</span>}
                        {anime.episodes?.sub && <span>· {anime.episodes.sub} eps</span>}
                        {cwInfo && (
                          <span className="text-primary font-semibold">
                            · Continue Ep {cwInfo.ep}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score Badge */}
                    {anime.rating && (
                      <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface border border-border text-xs font-bold text-amber-400 tabular-nums">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{anime.rating}</span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {keyword && keyword.length >= 2 && !loading && !error && data?.hasNextPage && (
            <div className="pt-8 pb-4 flex justify-center">
              <button
                type="button"
                disabled={loadingMore}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-8 h-12 rounded-full bg-surface border border-border hover:bg-elevated hover:border-primary/40 text-foreground font-semibold text-sm transition-all shadow-soft flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>Loading more...</span>
                  </>
                ) : (
                  <span>Load more anime</span>
                )}
              </button>
            </div>
          )}

          {/* Reached End Indicator */}
          {keyword && keyword.length >= 2 && !loading && !error && !data?.hasNextPage && animeList.length > 0 && (
            <div className="pt-8 pb-4 text-center text-xs text-muted-foreground font-sans">
              That's everything for “{keyword}”.
            </div>
          )}
        </section>
      </main>

      {/* Mobile "Filter & Sort" Bottom Sheet (<1024px) */}
      {mobileSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-overlay/70 backdrop-blur-sm lg:hidden animate-fade-in font-sans">
          {/* Backdrop Touch Dismiss */}
          <div className="flex-1" onClick={() => setMobileSheetOpen(false)} />

          {/* Sheet Container */}
          <div className="w-full bg-surface border-t border-border rounded-t-3xl p-5 space-y-6 max-h-[85dvh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-lift text-left">
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-lg font-bold font-display text-foreground">Filter & sort</h2>
              <button
                type="button"
                onClick={() => setMobileSheetOpen(false)}
                className="w-9 h-9 rounded-full bg-elevated flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sort Group */}
            <div className="space-y-2">
              <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Sort By
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDraftFilters((prev) => ({ ...prev, sort: opt.id }))}
                    className={`h-11 px-3 rounded-xl text-xs font-medium border flex items-center justify-between transition-all ${
                      draftFilters.sort === opt.id
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                        : "bg-surface/50 border-border text-subtle"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {draftFilters.sort === opt.id && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Group */}
            <div className="space-y-2">
              <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Format
              </legend>
              <div className="flex flex-wrap gap-2">
                {FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDraftFilters((prev) => ({ ...prev, format: opt.id }))}
                    className={`h-10 px-4 rounded-full text-xs font-medium border transition-all ${
                      draftFilters.format === opt.id
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                        : "bg-surface/50 border-border text-subtle"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Group */}
            <div className="space-y-2">
              <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Status
              </legend>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDraftFilters((prev) => ({ ...prev, status: opt.id }))}
                    className={`h-10 px-4 rounded-full text-xs font-medium border transition-all ${
                      draftFilters.status === opt.id
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                        : "bg-surface/50 border-border text-subtle"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Group */}
            <div className="space-y-2">
              <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Release Year
              </legend>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto no-scrollbar">
                {YEAR_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDraftFilters((prev) => ({ ...prev, year: opt.id }))}
                    className={`h-10 px-4 rounded-full text-xs font-medium border transition-all ${
                      draftFilters.year === opt.id
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                        : "bg-surface/50 border-border text-subtle"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sheet Footer Controls */}
            <div className="pt-4 border-t border-border flex items-center gap-3 sticky bottom-0 bg-surface">
              <button
                type="button"
                onClick={() => setDraftFilters({ sort: "relevance", format: "all", status: "all", year: "all" })}
                className="h-12 px-4 rounded-full border border-border text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  updateParams({ ...draftFilters });
                  setMobileSheetOpen(false);
                }}
                className="flex-1 h-12 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lift flex items-center justify-center"
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Search;