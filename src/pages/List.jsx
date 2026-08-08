import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon,
  Play,
  Star,
  ChevronDown,
  Check,
  RotateCcw,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
  Heart,
  Clock,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PosterCard from "@/components/PosterCard";

import { useData } from "@/context/data-provider";
import { useAuth } from "@/context/auth-provider";
import { slugify } from "@/lib/utils";

// Nine Catalogue Routes Metadata & Washes
const CATALOGUE_ROUTES = {
  "most-popular": {
    sliceKey: "most-popular",
    route: "/most-popular",
    eyebrow: "CATALOGUE",
    h1: "Most popular",
    from: "#f59e0b",
    to: "#f43f5e",
    desc: "Anime ranked by all-time popularity and audience acclaim.",
    hasFormatFilter: true,
    hasStatusFilter: true,
    hasYearFilter: true,
    hasRankColumn: true,
    defaultSort: "popularity",
  },
  "top-airing": {
    sliceKey: "top-airing",
    route: "/top-airing",
    eyebrow: "THIS SEASON",
    h1: "Top airing",
    from: "#22c55e",
    to: "#22d3ee",
    desc: "Currently broadcasting, ranked by score. New episodes weekly.",
    hasFormatFilter: true,
    hasStatusFilter: false, // route-locked to RELEASING
    hasYearFilter: false, // current season implied
    hasRankColumn: true,
    defaultSort: "score",
  },
  "most-favorite": {
    sliceKey: "most-favorite",
    route: "/most-favorite",
    eyebrow: "RANKED",
    h1: "Most favourite",
    from: "#f43f5e",
    to: "#f97316",
    desc: "The titles people keep closest — ranked by how many have favourited them.",
    hasFormatFilter: true,
    hasStatusFilter: true,
    hasYearFilter: true,
    hasRankColumn: true,
    defaultSort: "favourites",
  },
  completed: {
    sliceKey: "completed",
    route: "/completed",
    eyebrow: "FINISHED",
    h1: "Completed series",
    from: "#14b8a6",
    to: "#6366f1",
    desc: "Finished runs. Start tonight, no waiting for next week.",
    hasFormatFilter: true,
    hasStatusFilter: false, // route-locked to FINISHED
    hasYearFilter: true,
    hasRankColumn: false,
    defaultSort: "popularity",
  },
  tv: {
    sliceKey: "tv",
    route: "/tv",
    eyebrow: "FORMAT",
    h1: "TV series",
    from: "#6366f1",
    to: "#22d3ee",
    desc: "Full-length televised series — multi-episode sagas and seasonal broadcasts.",
    hasFormatFilter: false,
    hasStatusFilter: true,
    hasYearFilter: true,
    hasRankColumn: false,
    defaultSort: "popularity",
  },
  movie: {
    sliceKey: "movie",
    route: "/movie",
    eyebrow: "FORMAT",
    h1: "Anime movies",
    from: "#8b5cf6",
    to: "#ec4899",
    desc: "Feature-length stories — one sitting, full arc.",
    hasFormatFilter: false,
    hasStatusFilter: true,
    hasYearFilter: true,
    hasRankColumn: false,
    defaultSort: "popularity",
  },
  ova: {
    sliceKey: "ova",
    route: "/ova",
    eyebrow: "FORMAT",
    h1: "OVA",
    from: "#22c55e",
    to: "#14b8a6",
    desc: "Direct-to-video side stories, epilogues and one-offs.",
    hasFormatFilter: false,
    hasStatusFilter: true,
    hasYearFilter: true,
    hasRankColumn: false,
    defaultSort: "popularity",
  },
  ona: {
    sliceKey: "ona",
    route: "/ona",
    eyebrow: "FORMAT",
    h1: "ONA",
    from: "#0ea5e9",
    to: "#6366f1",
    desc: "Original net animations — web releases and streaming exclusives.",
    hasFormatFilter: false,
    hasStatusFilter: true,
    hasYearFilter: true,
    hasRankColumn: false,
    defaultSort: "popularity",
  },
  special: {
    sliceKey: "special",
    route: "/special",
    eyebrow: "FORMAT",
    h1: "Specials",
    from: "#eab308",
    to: "#f97316",
    desc: "Bonus episodes, shorts, side stories and special broadcasts.",
    hasFormatFilter: false,
    hasStatusFilter: true,
    hasYearFilter: true,
    hasRankColumn: false,
    defaultSort: "popularity",
  },
};

const RAIL_CHIPS = [
  { sliceKey: "most-popular", label: "Most popular", route: "/most-popular" },
  { sliceKey: "top-airing", label: "Top airing", route: "/top-airing" },
  { sliceKey: "most-favorite", label: "Most favourite", route: "/most-favorite" },
  { sliceKey: "completed", label: "Completed", route: "/completed" },
  { sliceKey: "tv", label: "TV series", route: "/tv" },
  { sliceKey: "movie", label: "Anime movies", route: "/movie" },
  { sliceKey: "ova", label: "OVA", route: "/ova" },
  { sliceKey: "ona", label: "ONA", route: "/ona" },
  { sliceKey: "special", label: "Specials", route: "/special" },
];

const SORT_OPTIONS = [
  { id: "popularity", label: "Popularity" },
  { id: "trending", label: "Trending" },
  { id: "score", label: "Highest Score" },
  { id: "favourites", label: "Most Favourited" },
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

const formatCountdown = (timeUntilAiring, episode) => {
  if (!timeUntilAiring) return null;
  const days = Math.floor(timeUntilAiring / 86400);
  const hours = Math.floor((timeUntilAiring % 86400) / 3600);
  const mins = Math.floor((timeUntilAiring % 3600) / 60);

  let timeStr = "";
  if (days > 0) {
    timeStr = `${days}d ${hours}h`;
  } else if (hours > 0) {
    timeStr = `${hours}h ${mins}m`;
  } else {
    timeStr = `${mins}m`;
  }
  return episode ? `Ep ${episode} · ${timeStr}` : timeStr;
};

const formatFavourites = (favs) => {
  if (!favs) return null;
  return new Intl.NumberFormat("en", { notation: "compact" }).format(favs);
};

const List = ({ anime: categoryProp }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { fetchcategories } = useData();
  const { continueWatching } = useAuth();

  // Active Catalogue Route Info
  const currentCategoryKey = (categoryProp || "most-popular").toLowerCase();
  const catInfo = CATALOGUE_ROUTES[currentCategoryKey] || CATALOGUE_ROUTES["most-popular"];

  useEffect(() => {
    document.title = catInfo?.h1 ? `${catInfo.h1} Anime — OtakuStreams` : "Anime List — OtakuStreams";
  }, [catInfo]);

  // Active URL Params with Fallbacks
  const sort = searchParams.get("sort") || catInfo.defaultSort;
  const format = searchParams.get("format") || "all";
  const status = searchParams.get("status") || "all";
  const year = searchParams.get("year") || "all";
  const view = searchParams.get("view") || "grid";

  // Internal Page State (kept out of URL search params)
  const [page, setPage] = useState(1);

  // States
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [animeList, setAnimeList] = useState([]);
  const [activePopover, setActivePopover] = useState(null); // 'sort' | 'format' | 'status' | 'year' | null
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // Draft filters for Mobile Bottom Sheet
  const [draftFilters, setDraftFilters] = useState({ sort, format, status, year });

  const activeChipRef = useRef(null);
  const railContainerRef = useRef(null);

  // Helper to update search params while stripping defaults
  const updateParams = useCallback(
    (newParams) => {
      setPage(1);
      const updated = new URLSearchParams(searchParams);

      Object.entries(newParams).forEach(([key, val]) => {
        if (
          !val ||
          val === "all" ||
          (key === "sort" && val === catInfo.defaultSort) ||
          (key === "view" && val === "grid") ||
          key === "page"
        ) {
          updated.delete(key);
        } else {
          updated.set(key, val);
        }
      });

      setSearchParams(updated, { replace: false });
    },
    [searchParams, setSearchParams, catInfo.defaultSort]
  );

  // Reset page to 1 when category route or filters change
  useEffect(() => {
    setPage(1);
  }, [currentCategoryKey, sort, format, status, year]);

  // Fetch Catalogue Data
  useEffect(() => {
    let isMounted = true;

    const loadCatalogueData = async () => {
      if (page === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await fetchcategories(currentCategoryKey, page, {
          sort,
          format: catInfo.hasFormatFilter && format !== "all" ? format : null,
          status: catInfo.hasStatusFilter && status !== "all" ? status : null,
          year: catInfo.hasYearFilter && year !== "all" ? year : null,
        });

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
          throw new Error("Failed to load catalogue");
        }
      } catch (err) {
        console.error("Catalogue fetch error:", err);
        if (isMounted) setError(err.message || "We couldn't load this catalogue right now.");
      } finally {
        if (isMounted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    loadCatalogueData();

    return () => {
      isMounted = false;
    };
  }, [currentCategoryKey, page, sort, format, status, year, fetchcategories, catInfo]);

  // Auto-scroll active rail chip into view
  useEffect(() => {
    if (activeChipRef.current) {
      activeChipRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentCategoryKey]);

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

  // Count active non-default filters for mobile badge
  const activeFilterCount = [
    catInfo.hasFormatFilter && format !== "all" ? 1 : 0,
    catInfo.hasStatusFilter && status !== "all" ? 1 : 0,
    catInfo.hasYearFilter && year !== "all" ? 1 : 0,
    sort !== catInfo.defaultSort ? 1 : 0,
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary relative">
      {/* 1. Skip Link */}
      <a
        href="#catalogue-collection"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-xl focus:shadow-lg focus:font-semibold text-sm transition-all"
      >
        Skip to content
      </a>

      {/* 2. Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 w-full pt-[68px] pb-16 lg:pb-24">
        {/* 3. Hero Section with Fixed Catalogue Wash & Scrim */}
        <section className="relative w-full overflow-hidden border-b border-border/60 py-10 sm:py-14 lg:py-16">
          {/* Atmospheric Wash (25% opacity per spec) */}
          <div
            className="absolute inset-0 opacity-25 transition-all duration-700 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 30%, ${catInfo.from} 0%, ${catInfo.to} 50%, transparent 80%)`,
            }}
          />
          {/* Aurora Bloom Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background/60 to-background pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />

          {/* Hero Content Container */}
          <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 space-y-3 sm:space-y-4 text-left">
            {/* Eyebrow */}
            <div className="text-xs font-semibold text-primary uppercase tracking-[0.18em] font-sans">
              {catInfo.eyebrow}
            </div>

            {/* Title (Outfit H1) */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-foreground leading-none">
              {catInfo.h1}
            </h1>

            {/* Catalogue Identity Blurb */}
            <p className="text-sm sm:text-base font-normal text-subtle max-w-xl font-sans leading-relaxed">
              {catInfo.desc}
            </p>

            {/* Stat Line */}
            {!loading && animeList.length > 0 && (
              <div className="text-xs sm:text-sm font-normal text-muted-foreground font-sans tabular-nums pt-1">
                <span>{animeList.length} anime showing</span>
              </div>
            )}
          </div>
        </section>

        {/* 4. Catalogue Rail Navigation (All 9 Routes) */}
        <section className="w-full border-b border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <nav
              aria-label="Catalogue"
              ref={railContainerRef}
              className="flex items-center gap-2 py-3 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {RAIL_CHIPS.map((chip) => {
                const isActive = chip.sliceKey === currentCategoryKey;
                return (
                  <Link
                    key={chip.sliceKey}
                    ref={isActive ? activeChipRef : null}
                    to={chip.route}
                    aria-current={isActive ? "page" : undefined}
                    className={`shrink-0 snap-start px-4 h-11 rounded-full text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer min-w-[44px] ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm font-bold ring-2 ring-primary/40"
                        : "bg-surface/60 border border-border text-subtle hover:bg-elevated hover:text-foreground"
                    }`}
                  >
                    {isActive && <Check className="w-3.5 h-3.5" />}
                    <span>{chip.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </section>

        {/* 5. Sticky Discovery Controls Bar */}
        <section className="sticky top-[68px] z-30 w-full border-b border-border bg-background/80 backdrop-blur-xl py-3 transition-colors">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
            {/* Desktop Controls (≥1024px) */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Sort Popover (Visually Separated) */}
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={activePopover === "sort"}
                  onClick={() => setActivePopover((prev) => (prev === "sort" ? null : "sort"))}
                  className={`h-11 px-4 rounded-full border text-sm font-medium flex items-center gap-2 transition-all cursor-pointer ${
                    sort !== catInfo.defaultSort
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

              {/* Separator rule */}
              <div className="h-6 w-px bg-border/60" />

              {/* Format Dropdown (Rendered when route allows) */}
              {catInfo.hasFormatFilter && (
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
              )}

              {/* Status Dropdown (Rendered when route allows) */}
              {catInfo.hasStatusFilter && (
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
              )}

              {/* Year Dropdown (Rendered when route allows) */}
              {catInfo.hasYearFilter && (
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
              )}

              {/* Clear All Filters Button */}
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => updateParams({ sort: catInfo.defaultSort, format: "all", status: "all", year: "all" })}
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

        {/* 6. Collection Grid / List */}
        <section id="catalogue-collection" className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 pt-6 min-h-[420px]">
          {/* Skeleton Load State */}
          {loading && (
            <div
              className={`w-full ${
                view === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                  : "space-y-3"
              }`}
            >
              {Array.from({ length: 18 }).map((_, i) => (
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
          {!loading && error && (
            <div className="flex flex-col items-center justify-center min-h-[420px] text-center p-8 bg-surface/30 rounded-2xl border border-border">
              <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
              <h2 className="text-2xl font-bold font-display text-foreground mb-2">
                We couldn't load this catalogue right now.
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

          {/* Empty Filtered State */}
          {!loading && !error && animeList.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[420px] text-center p-8 bg-surface/30 rounded-2xl border border-border">
              <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold font-display text-foreground mb-2">
                {currentCategoryKey === "top-airing" ? "Nothing is airing under these settings." : "No titles match these filters."}
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mb-6 font-sans">
                {currentCategoryKey === "top-airing"
                  ? "Try exploring completed series or adjusting format criteria."
                  : "Try loosening your status or year criteria to see more titles."}
              </p>
              <button
                type="button"
                onClick={() => updateParams({ sort: catInfo.defaultSort, format: "all", status: "all", year: "all" })}
                className="px-5 h-11 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* GRID VIEW */}
          {!loading && !error && animeList.length > 0 && view === "grid" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full">
              {animeList.map((anime, index) => {
                const rankNum = index + 1;
                const nextAir = anime.nextAiringEpisode;
                const countdownText = nextAir ? formatCountdown(nextAir.timeUntilAiring, nextAir.episode) : null;
                const favCount = anime.favourites ? formatFavourites(anime.favourites) : null;

                return (
                  <div key={anime.id} className="relative group">
                    <PosterCard
                      item={anime}
                      className="w-full cursor-pointer group flex flex-col focus-within:ring-2 focus-within:ring-primary rounded-2xl"
                    />

                    {/* Airing Countdown / Status Overlay for /top-airing */}
                    {currentCategoryKey === "top-airing" && (
                      <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-sm text-emerald-400 text-[10px] font-semibold flex items-center gap-1 border border-white/10 tabular-nums">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{countdownText || "Airing"}</span>
                      </div>
                    )}

                    {/* Favourites Overlay for /most-favorite */}
                    {currentCategoryKey === "most-favorite" && favCount && (
                      <div className="absolute bottom-10 right-2 z-20 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-sm text-rose-400 text-[10px] font-semibold flex items-center gap-1 border border-white/10 tabular-nums">
                        <Heart className="w-3 h-3 fill-rose-400" />
                        <span>{favCount}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* LIST VIEW */}
          {!loading && !error && animeList.length > 0 && view === "list" && (
            <div className="w-full rounded-2xl border border-border bg-surface/40 divide-y divide-border overflow-hidden text-left font-sans">
              {animeList.map((anime, index) => {
                const title = anime.name || anime.title?.english || anime.jname || "Anime";
                const altTitle = anime.jname && anime.jname !== title ? anime.jname : null;
                const slug = slugify(title);
                const cwInfo = getContinueWatchingInfo(anime.id);
                const rankNumber = index + 1;
                const nextAir = anime.nextAiringEpisode;
                const countdownText = nextAir ? formatCountdown(nextAir.timeUntilAiring, nextAir.episode) : null;
                const favCount = anime.favourites ? formatFavourites(anime.favourites) : null;

                return (
                  <Link
                    key={anime.id}
                    to={`/${slug}/${anime.id}`}
                    aria-label={catInfo.hasRankColumn ? `Rank ${rankNumber}, ${title}` : title}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-elevated/60 transition-colors group cursor-pointer"
                  >
                    {/* Rank Numeral Column for Ranked Screens */}
                    {catInfo.hasRankColumn && (
                      <div className="w-8 shrink-0 text-center font-display text-lg sm:text-xl font-black text-muted-foreground tabular-nums group-hover:text-primary transition-colors">
                        #{rankNumber}
                      </div>
                    )}

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
                        {favCount && (
                          <span className="text-rose-400 font-semibold flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-rose-400" />
                            {favCount}
                          </span>
                        )}
                        {cwInfo && (
                          <span className="text-primary font-semibold">
                            · Continue Ep {cwInfo.ep}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Next Episode Countdown Column for /top-airing */}
                    {currentCategoryKey === "top-airing" && countdownText && (
                      <div className="hidden sm:flex shrink-0 items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border text-xs font-semibold text-emerald-400 tabular-nums">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{countdownText}</span>
                      </div>
                    )}

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
          {!loading && !error && data?.hasNextPage && (
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
          {!loading && !error && !data?.hasNextPage && animeList.length > 0 && (
            <div className="pt-8 pb-4 text-center text-xs text-muted-foreground font-sans">
              You've reached the end of the collection.
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

            {/* Format Group (Shown when route allows) */}
            {catInfo.hasFormatFilter && (
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
            )}

            {/* Status Group (Shown when route allows) */}
            {catInfo.hasStatusFilter && (
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
            )}

            {/* Year Group (Shown when route allows) */}
            {catInfo.hasYearFilter && (
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
            )}

            {/* Sheet Footer Controls */}
            <div className="pt-4 border-t border-border flex items-center gap-3 sticky bottom-0 bg-surface">
              <button
                type="button"
                onClick={() => setDraftFilters({ sort: catInfo.defaultSort, format: "all", status: "all", year: "all" })}
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

export default List;