import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/auth-provider";
import { getAnimeTitle, slugify } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  LayoutGrid,
  List,
  Search,
  Sparkles,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  CircleSlash,
  Heart,
  Bookmark,
  Trash2,
  X,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";

// Status configuration matching spec
const STATUS_TABS = [
  { key: "all", label: "All", icon: Sparkles },
  { key: "watching", label: "Watching", icon: Play, tone: "text-primary" },
  { key: "on_hold", label: "On-Hold", icon: Pause, tone: "text-amber-400" },
  { key: "plan_to_watch", label: "Plan To Watch", icon: Clock, tone: "text-sky-400" },
  { key: "completed", label: "Completed", icon: CheckCircle2, tone: "text-emerald-400" },
  { key: "dropped", label: "Dropped", icon: CircleSlash, tone: "text-muted-foreground" },
  { key: "favorites", label: "Favorites", icon: Heart, tone: "text-rose-500" },
];

const SORT_OPTIONS = [
  { key: "latest", label: "Recently added" },
  { key: "recent", label: "Recently watched" },
  { key: "alphabetical", label: "A–Z" },
  { key: "episodes", label: "Episode count" },
];

const Watchlist = () => {
  const { watchlist, removeWatchlist, language, continueWatching } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState("latest");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [removedItems, setRemovedItems] = useState(new Set());
  const [showClearModal, setShowClearModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync tab with URL query params
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam && STATUS_TABS.some((t) => t.key === typeParam)) {
      setActiveTab(typeParam);
    } else {
      setActiveTab("all");
    }
  }, [searchParams]);

  // Set document title & metadata
  useEffect(() => {
    document.title = "Your Watchlist — OtakuStreams";
  }, []);

  // Handle Tab change
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === "all") {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ type: tabKey }, { replace: true });
    }
  };

  // Derive all genres present in library
  const availableGenres = useMemo(() => {
    const genreSet = new Set();
    watchlist.forEach((item) => {
      if (Array.isArray(item.genres)) {
        item.genres.forEach((g) => genreSet.add(g));
      } else if (item.genre) {
        genreSet.add(item.genre);
      }
    });
    return Array.from(genreSet).sort().slice(0, 24);
  }, [watchlist]);

  // Map continue watching progress
  const continueWatchingMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(continueWatching)) {
      continueWatching.forEach((cw) => {
        map.set(cw.animeId || cw.id, cw);
      });
    }
    return map;
  }, [continueWatching]);

  // Process & filter watchlist items
  const processedItems = useMemo(() => {
    let list = watchlist.filter((item) => !removedItems.has(item.animeId || item._id || item.id));

    // Filter by Tab / Status
    if (activeTab === "favorites") {
      list = list.filter((item) => favoriteIds.has(item.animeId || item.id) || item.isFavorite || item.status === "favorites");
    } else if (activeTab !== "all") {
      list = list.filter((item) => {
        const itemStatus = (item.status || "").toLowerCase().replace(/[\s-]/g, "_");
        return itemStatus === activeTab;
      });
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const title = (getAnimeTitle(item, language) || item.animeTitle || item.name || "").toLowerCase();
        return title.includes(q);
      });
    }

    // Filter by Genre
    if (selectedGenre !== "all") {
      list = list.filter((item) => {
        const genres = Array.isArray(item.genres) ? item.genres : [item.genre];
        return genres.includes(selectedGenre);
      });
    }

    // Sort items
    list = [...list].sort((a, b) => {
      const titleA = getAnimeTitle(a, language) || a.animeTitle || a.name || "";
      const titleB = getAnimeTitle(b, language) || b.animeTitle || b.name || "";

      if (selectedSort === "alphabetical") {
        return titleA.localeCompare(titleB);
      }
      if (selectedSort === "episodes") {
        const epA = a.episodes || a.totalEpisodes || 0;
        const epB = b.episodes || b.totalEpisodes || 0;
        return epB - epA;
      }
      if (selectedSort === "recent") {
        const cwA = continueWatchingMap.get(a.animeId || a.id);
        const cwB = continueWatchingMap.get(b.animeId || b.id);
        const timeA = cwA?.updatedAt ? new Date(cwA.updatedAt).getTime() : 0;
        const timeB = cwB?.updatedAt ? new Date(cwB.updatedAt).getTime() : 0;
        return timeB - timeA;
      }
      // 'latest' (default)
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return list;
  }, [watchlist, removedItems, activeTab, favoriteIds, searchQuery, selectedGenre, selectedSort, language, continueWatchingMap]);

  // Overall Stats Computation
  const stats = useMemo(() => {
    let watchingCount = 0;
    let completedCount = 0;
    let favoritesCount = 0;

    watchlist.forEach((item) => {
      const status = (item.status || "").toLowerCase().replace(/[\s-]/g, "_");
      if (status === "watching") watchingCount++;
      if (status === "completed") completedCount++;
      if (favoriteIds.has(item.animeId || item.id) || item.isFavorite || status === "favorites") favoritesCount++;
    });

    return {
      total: watchlist.length,
      watching: watchingCount,
      completed: completedCount,
      favorites: favoritesCount,
    };
  }, [watchlist, favoriteIds]);

  // Counts per tab
  const tabCounts = useMemo(() => {
    const counts = { all: watchlist.length, favorites: stats.favorites };
    STATUS_TABS.forEach((t) => {
      if (t.key !== "all" && t.key !== "favorites") {
        counts[t.key] = watchlist.filter((item) => {
          const status = (item.status || "").toLowerCase().replace(/[\s-]/g, "_");
          return status === t.key;
        }).length;
      }
    });
    return counts;
  }, [watchlist, stats.favorites]);

  // Optimistic Item Removal with Toast Undo
  const handleRemoveItem = (item) => {
    const id = item.animeId || item._id || item.id;
    const title = getAnimeTitle(item, language) || item.animeTitle || "Anime";

    setRemovedItems((prev) => new Set([...prev, id]));

    let undoClicked = false;

    toast(`Removed from watchlist`, {
      description: title,
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          undoClicked = true;
          setRemovedItems((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        },
      },
    });

    setTimeout(() => {
      if (!undoClicked && removeWatchlist) {
        removeWatchlist(item._id || id);
      }
    }, 5200);
  };

  // Toggle Favorite Status
  const handleToggleFavorite = (item) => {
    const id = item.animeId || item.id;
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.success("Removed from favorites");
      } else {
        next.add(id);
        toast.success("Added to favorites");
      }
      return next;
    });
  };

  // Clear All Handler
  const handleConfirmClearAll = () => {
    setShowClearModal(false);
    watchlist.forEach((item) => {
      if (removeWatchlist) removeWatchlist(item._id || item.animeId);
    });
    toast.success("Watchlist cleared", {
      description: "Favorites and history are untouched.",
    });
  };

  // Dynamic Collection Header Label
  const activeTabConfig = STATUS_TABS.find((t) => t.key === activeTab);
  const collectionTitle = activeTab === "all" ? "Your collection" : activeTabConfig?.label || "Collection";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* Skip to Content Link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-xl focus:shadow-glow focus:outline-none text-sm font-semibold"
      >
        Skip to content
      </a>

      {/* 1. Shared Navbar */}
      <header className="sticky top-0 z-40 w-full glass border-b border-glass-border">
        <Navbar />
      </header>

      <main id="main" className="flex-1 w-full pb-16 lg:pb-24">
        {/* 2. Library Hero Section */}
        <section
          aria-labelledby="library-hero-title"
          className="relative w-full overflow-hidden border-b border-border pt-28 pb-10 sm:pt-32 sm:pb-12 px-4 sm:px-6 lg:px-10"
        >
          {/* Aurora Glow Layer */}
          <div aria-hidden="true" className="aurora opacity-75 pointer-events-none" />

          <div className="relative z-10 max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-6 lg:items-end">
            {/* Identity & Stats */}
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-primary font-sans flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Saved by you</span>
              </div>
              <h1
                id="library-hero-title"
                className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl font-sans text-foreground"
              >
                Your Watchlist
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base max-w-xl font-sans">
                Everything you saved, started or loved — kept on this device and ready whenever you are.
              </p>

              {/* Stats Row (<dl>) */}
              <dl className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2">
                <div className="space-y-0.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground font-sans">
                    Titles
                  </dt>
                  <dd className="font-display font-black text-2xl sm:text-3xl text-foreground tabular-nums">
                    {stats.total}
                  </dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground font-sans">
                    Watching
                  </dt>
                  <dd className="font-display font-black text-2xl sm:text-3xl text-primary tabular-nums">
                    {stats.watching}
                  </dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground font-sans">
                    Completed
                  </dt>
                  <dd className="font-display font-black text-2xl sm:text-3xl text-emerald-400 tabular-nums">
                    {stats.completed}
                  </dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground font-sans">
                    Favorites
                  </dt>
                  <dd className="font-display font-black text-2xl sm:text-3xl text-rose-500 tabular-nums">
                    {stats.favorites}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Controls Cluster (View Toggle & Clear All) */}
            <div className="flex items-center gap-3 self-start lg:self-end">
              {/* Segmented View Mode Toggle */}
              <div
                role="group"
                aria-label="Collection view"
                className="rounded-full border border-border/80 p-1 bg-card/60 backdrop-blur-md flex items-center gap-1 shadow-soft"
              >
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  aria-pressed={viewMode === "grid"}
                  className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-card"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                  className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-card"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Clear All Button */}
              <Button
                variant="outline"
                disabled={watchlist.length === 0}
                onClick={() => setShowClearModal(true)}
                className="rounded-full h-10 px-4 text-xs font-semibold border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition-colors cursor-pointer disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Clear all
              </Button>
            </div>
          </div>
        </section>

        {/* 3. Sticky Control Shell (Status Tabs + Filter Bar) */}
        <div className="sticky top-[64px] z-30 border-y border-border bg-background/85 backdrop-blur-xl">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
            {/* Status Tabs (role="tablist") */}
            <div
              role="tablist"
              aria-label="Watch status"
              className="no-scrollbar flex items-center gap-2 overflow-x-auto py-2.5 -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {STATUS_TABS.map((tab) => {
                const isSelected = activeTab === tab.key;
                const Icon = tab.icon;
                const count = tabCounts[tab.key] || 0;

                return (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleTabChange(tab.key)}
                    className={`min-h-11 px-4 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-200 shrink-0 cursor-pointer border ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-transparent shadow-glow"
                        : "bg-card/50 border-border/80 text-muted-foreground hover:text-foreground hover:bg-card"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-primary-foreground" : tab.tone || "text-muted-foreground"}`} />
                    <span>{tab.label}</span>
                    <span
                      className={`text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded-full ${
                        isSelected ? "bg-white/20 text-primary-foreground" : "bg-elevated text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Filter Bar (Search, Sort & Genre) */}
            <div className="border-t border-border/60 py-3 flex flex-wrap items-center justify-between gap-3">
              {/* Search Within Library */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your library"
                  aria-label="Search within your library"
                  className="h-11 rounded-full bg-card/60 border border-input pl-10 pr-10 text-sm text-foreground focus-visible:ring-primary placeholder:text-muted-foreground"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear library search"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sort & Genre Dropdowns */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {/* Sort Select */}
                <div className="relative w-1/2 sm:w-44">
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    aria-label="Sort collection"
                    className="w-full h-11 appearance-none rounded-full bg-card/60 border border-input px-4 pr-8 text-sm text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key} className="bg-surface text-foreground">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <SlidersHorizontal className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>

                {/* Genre Select */}
                <div className="relative w-1/2 sm:w-38">
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    aria-label="Filter by genre"
                    className="w-full h-11 appearance-none rounded-full bg-card/60 border border-input px-4 pr-8 text-sm text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all" className="bg-surface text-foreground">
                      All genres
                    </option>
                    {availableGenres.map((g) => (
                      <option key={g} value={g} className="bg-surface text-foreground">
                        {g}
                      </option>
                    ))}
                  </select>
                  <SlidersHorizontal className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Collection Content Section */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-8">
          {/* Collection Header */}
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black sm:text-2xl font-sans text-foreground tracking-tight">
                {collectionTitle}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {processedItems.length} {processedItems.length === 1 ? "title" : "titles"}
                {searchQuery ? ` matching "${searchQuery}"` : ""}
              </p>
            </div>
          </div>

          {/* Accessible Live Region */}
          <div className="sr-only" aria-live="polite">
            {processedItems.length} titles shown
          </div>

          {/* Skeletons Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[2/3] w-full rounded-2xl bg-elevated" />
                  <Skeleton className="h-4 w-3/4 bg-elevated" />
                  <Skeleton className="h-3 w-1/2 bg-elevated" />
                </div>
              ))}
            </div>
          ) : processedItems.length > 0 ? (
            /* Render Grid or List View */
            viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-5">
                {processedItems.map((item) => (
                  <WatchlistCardGrid
                    key={item.animeId || item._id || item.id}
                    item={item}
                    language={language}
                    continueWatchingMap={continueWatchingMap}
                    isFavorite={favoriteIds.has(item.animeId || item.id) || item.isFavorite}
                    onToggleFavorite={() => handleToggleFavorite(item)}
                    onRemove={() => handleRemoveItem(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {processedItems.map((item) => (
                  <WatchlistCardList
                    key={item.animeId || item._id || item.id}
                    item={item}
                    language={language}
                    continueWatchingMap={continueWatchingMap}
                    isFavorite={favoriteIds.has(item.animeId || item.id) || item.isFavorite}
                    onToggleFavorite={() => handleToggleFavorite(item)}
                    onRemove={() => handleRemoveItem(item)}
                  />
                ))}
              </div>
            )
          ) : (
            /* Empty State Presentation */
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 bg-card/30 rounded-3xl border border-border/60 p-8">
              {searchQuery || selectedGenre !== "all" ? (
                <>
                  <div className="p-4 rounded-full bg-elevated text-muted-foreground">
                    <Search className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold font-sans text-foreground">No titles match these filters.</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Try a different genre, clear your search, or switch to the All tab.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedGenre("all");
                      setActiveTab("all");
                    }}
                    className="rounded-full text-xs font-semibold border-border hover:bg-elevated cursor-pointer"
                  >
                    Clear filters
                  </Button>
                </>
              ) : activeTab !== "all" ? (
                <>
                  <div className="p-4 rounded-full bg-elevated text-muted-foreground">
                    <Bookmark className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold font-sans text-foreground">
                    Nothing in {activeTabConfig?.label || "this section"} yet.
                  </h3>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-full bg-primary/10 text-primary">
                    <Bookmark className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-sans text-foreground">Your watchlist is empty.</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Save anything that catches your eye and it will land here — synced to this device instantly.
                  </p>
                  <Link to="/home">
                    <Button className="h-11 px-6 rounded-full text-sm font-semibold brand-gradient text-white shadow-glow hover:opacity-90 transition-opacity cursor-pointer">
                      Browse trending
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Clear All Confirmation Modal */}
      <Dialog open={showClearModal} onOpenChange={setShowClearModal}>
        <DialogContent className="max-w-md bg-surface border-border rounded-3xl p-6 sm:p-7 shadow-lift">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
              <Trash2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold font-sans text-foreground">
              Clear all watchlist items?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              This will remove all items from your watchlist. Favorites and history are untouched.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowClearModal(false)}
              className="h-11 px-5 rounded-xl text-sm font-semibold border-border hover:bg-elevated cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmClearAll}
              className="h-11 px-6 rounded-xl text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              Clear all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
};

// Component: WatchlistCardGrid
const WatchlistCardGrid = ({ item, language, continueWatchingMap, isFavorite, onToggleFavorite, onRemove }) => {
  const navigate = useNavigate();
  const animeId = item?.animeId || item?.id || item?._id;
  const title = getAnimeTitle(item, language) || item?.animeTitle || item?.name || "Anime";
  const poster = item?.animeImage || item?.poster || item?.coverImage?.extraLarge || item?.bannerImage;
  const statusStr = (item?.status || "plan_to_watch").toLowerCase().replace(/[\s-]/g, "_");

  const statusConfig = STATUS_TABS.find((t) => t.key === statusStr) || STATUS_TABS[3];
  const StatusIcon = statusConfig.icon;

  const cw = continueWatchingMap.get(animeId);
  const progressPercent = cw?.duration
    ? Math.min(100, Math.max(5, Math.round((cw.currentTime / cw.duration) * 100)))
    : item?.progress || 0;

  const episodeCount = item?.totalEpisodes || item?.episodes;
  const genre = (Array.isArray(item?.genres) && item.genres.length > 0 && item.genres[0]) || item?.genre;

  const metaParts = [];
  if (episodeCount) metaParts.push(`${episodeCount} eps`);
  if (genre && genre !== "Anime") metaParts.push(genre);
  if (metaParts.length === 0 && item?.type) metaParts.push(item.type);

  const metaLine = metaParts.join(" · ");

  const handlePlay = (e) => {
    e.stopPropagation();
    navigate(`/${slugify(title)}/${animeId}`);
  };

  return (
    <div className="group flex flex-col space-y-2 select-none">
      {/* Poster Box */}
      <div className="aspect-[2/3] w-full rounded-2xl border border-border/80 bg-card/60 relative overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-glow group-hover:border-primary/40">
        <img
          src={poster}
          alt={title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Bottom Scrim Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

        {/* Progress Bar overlay */}
        {progressPercent > 0 && progressPercent < 95 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
            <div
              className="h-full brand-gradient transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Status Pill on Poster */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className="bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10 shadow-xs">
            <StatusIcon className={`h-3 w-3 ${statusConfig.tone || "text-white"}`} />
            <span>{statusConfig.label}</span>
          </span>
        </div>

        {/* Centered Play FAB */}
        <button
          type="button"
          onClick={handlePlay}
          aria-label={`Open ${title}`}
          className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-glow flex items-center justify-center transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 cursor-pointer z-10"
        >
          <Play className="h-5 w-5 fill-current ml-0.5" />
        </button>

        {/* Action Stack (Top-right circular glass buttons) */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 z-10">
          {/* Favorite Toggle */}
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={isFavorite ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
            aria-pressed={isFavorite}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer shadow-md ${
              isFavorite
                ? "bg-rose-500 hover:bg-rose-600 text-white border border-rose-400 shadow-glow"
                : "bg-black/60 hover:bg-black/80 text-white border border-white/25 backdrop-blur-md"
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current text-white" : "text-white"}`} />
          </button>

          {/* Remove Button */}
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${title} from library`}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-destructive/90 text-white border border-white/25 backdrop-blur-md shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
          >
            <Trash2 className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Meta Content Below Poster */}
      <div className="space-y-0.5 pt-0.5">
        <h3
          onClick={handlePlay}
          className="line-clamp-2 text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors cursor-pointer"
        >
          {title}
        </h3>
        {metaLine && (
          <p className="truncate text-xs text-muted-foreground">
            {metaLine}
          </p>
        )}
      </div>
    </div>
  );
};

// Component: WatchlistCardList
const WatchlistCardList = ({ item, language, continueWatchingMap, isFavorite, onToggleFavorite, onRemove }) => {
  const navigate = useNavigate();
  const animeId = item?.animeId || item?.id || item?._id;
  const title = getAnimeTitle(item, language) || item?.animeTitle || item?.name || "Anime";
  const poster = item?.animeImage || item?.poster || item?.coverImage?.extraLarge || item?.bannerImage;
  const statusStr = (item?.status || "plan_to_watch").toLowerCase().replace(/[\s-]/g, "_");

  const statusConfig = STATUS_TABS.find((t) => t.key === statusStr) || STATUS_TABS[3];
  const StatusIcon = statusConfig.icon;

  const cw = continueWatchingMap.get(animeId);
  const progressPercent = cw?.duration
    ? Math.min(100, Math.max(5, Math.round((cw.currentTime / cw.duration) * 100)))
    : item?.progress || 0;

  const validGenres = Array.isArray(item?.genres) && item.genres.length > 0
    ? item.genres.filter((g) => g && g !== "Anime").slice(0, 3).join(" · ")
    : item?.genre && item.genre !== "Anime"
    ? item.genre
    : item?.type || "";

  const handlePlay = () => {
    navigate(`/${slugify(title)}/${animeId}`);
  };

  return (
    <div
      onClick={handlePlay}
      className="group flex items-center gap-4 p-3 rounded-2xl border border-border/80 bg-card/50 hover:bg-card hover:border-primary/40 transition-all duration-200 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="w-14 h-20 aspect-[2/3] rounded-xl overflow-hidden bg-elevated shrink-0 relative">
        <img src={poster} alt={title} loading="lazy" className="w-full h-full object-cover" />
      </div>

      {/* Content Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        {validGenres && (
          <p className="truncate text-xs text-muted-foreground">
            {validGenres}
          </p>
        )}
      </div>

      {/* Progress & Status Pill (Sm+ Screens) */}
      <div className="hidden sm:flex items-center gap-4 shrink-0">
        {progressPercent > 0 && (
          <div className="w-28 space-y-1">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full brand-gradient rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-[11px] text-muted-foreground font-sans tabular-nums">{progressPercent}% watched</span>
          </div>
        )}

        <span className="bg-elevated text-xs font-semibold text-foreground px-3 py-1 rounded-full flex items-center gap-1.5 border border-border/60">
          <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.tone || "text-foreground"}`} />
          <span>{statusConfig.label}</span>
        </span>
      </div>

      {/* Trailing Actions */}
      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
          aria-pressed={isFavorite}
          className={`p-2 rounded-full hover:bg-elevated transition-colors cursor-pointer ${
            isFavorite ? "text-rose-500" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${title} from library`}
          className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Watchlist;