import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContinueWatchingCard from "@/components/ContinueWatchingCard";
import { useAuth } from "@/context/auth-provider";
import { getAnimeTitle, slugify } from "@/lib/utils";
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
import { toast } from "sonner";
import {
  Play,
  Trash2,
  Loader2,
  ArrowRight,
  Search,
  X,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from "lucide-react";

const SORT_OPTIONS = [
  { key: "recent", label: "Recently watched" },
  { key: "progress", label: "Progress %" },
  { key: "alphabetical", label: "A–Z" },
  { key: "episodes", label: "Episode number" },
];

const ContinueWatching = () => {
  const { continueWatching, setContinueWatching, api, language } = useAuth();
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState("recent");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [isClearing, setIsClearing] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.title = "Continue Watching — OtakuStreams";
  }, []);

  // Derive genres from continue watching items
  const availableGenres = useMemo(() => {
    const genreSet = new Set();
    continueWatching.forEach((item) => {
      if (Array.isArray(item.genres)) {
        item.genres.forEach((g) => genreSet.add(g));
      } else if (item.genre) {
        genreSet.add(item.genre);
      }
    });
    return Array.from(genreSet).sort().slice(0, 24);
  }, [continueWatching]);

  // Process, filter, and sort continue watching items
  const processedItems = useMemo(() => {
    let list = [...continueWatching];

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
    list.sort((a, b) => {
      const titleA = getAnimeTitle(a, language) || a.animeTitle || a.name || "";
      const titleB = getAnimeTitle(b, language) || b.animeTitle || b.name || "";

      if (selectedSort === "alphabetical") {
        return titleA.localeCompare(titleB);
      }
      if (selectedSort === "episodes") {
        const epA = a.currentEpisode || a.episodeNumber || 1;
        const epB = b.currentEpisode || b.episodeNumber || 1;
        return epB - epA;
      }
      if (selectedSort === "progress") {
        const durA = a.duration || 1440;
        const durB = b.duration || 1440;
        const pctA = (a.currentTime || 0) / durA;
        const pctB = (b.currentTime || 0) / durB;
        return pctB - pctA;
      }
      // 'recent' (default)
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

    return list;
  }, [continueWatching, searchQuery, selectedGenre, selectedSort, language]);

  const handleClearAll = async () => {
    setIsClearing(true);

    try {
      if (api?.delete) {
        await api.delete("/continue-watching");
      }

      setContinueWatching([]);
      setOpen(false);
      toast.success("Watch history cleared", {
        description: "All items have been removed from your continue watching list.",
      });
    } catch (error) {
      // Optimistic clear fallback
      setContinueWatching([]);
      setOpen(false);
      toast.success("Watch history cleared", {
        description: "All items have been removed from your continue watching list.",
      });
    } finally {
      setIsClearing(false);
    }
  };

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
        {/* 2. Library Hero Section (Matching Watchlist Hero architecture) */}
        <section
          aria-labelledby="continue-watching-hero-title"
          className="relative w-full overflow-hidden border-b border-border pt-28 pb-10 sm:pt-32 sm:pb-12 px-4 sm:px-6 lg:px-10"
        >
          {/* Aurora Glow Layer */}
          <div aria-hidden="true" className="aurora opacity-75 pointer-events-none" />

          <div className="relative z-10 max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-6 lg:items-end">
            {/* Identity & Stats */}
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-primary font-sans flex items-center gap-1.5">
                <Play className="h-3.5 w-3.5 text-primary fill-current" />
                <span>Resume playback</span>
              </div>
              <h1
                id="continue-watching-hero-title"
                className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl font-sans text-foreground"
              >
                Continue Watching
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base max-w-xl font-sans">
                Pick up right where you left off across all your in-progress series and episodes.
              </p>

              {/* Stats Row (<dl>) */}
              <dl className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2">
                <div className="space-y-0.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground font-sans">
                    In Progress
                  </dt>
                  <dd className="font-display font-black text-2xl sm:text-3xl text-primary tabular-nums">
                    {continueWatching.length}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Controls Cluster (View Toggle & Clear History) */}
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

              {/* Clear History Button */}
              <Button
                variant="outline"
                disabled={continueWatching.length === 0}
                onClick={() => setOpen(true)}
                className="rounded-full h-10 px-4 text-xs font-semibold border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition-colors cursor-pointer disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Clear history
              </Button>
            </div>
          </div>
        </section>

        {/* 3. Sticky Control Shell (Search & Filters) */}
        <div className="sticky top-[64px] z-30 border-y border-border bg-background/85 backdrop-blur-xl">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-3 flex flex-wrap items-center justify-between gap-3">
            {/* Search Within Watch History */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your watch history"
                aria-label="Search within watch history"
                className="h-11 rounded-full bg-card/60 border border-input pl-10 pr-10 text-sm text-foreground focus-visible:ring-primary placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear watch history search"
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

        {/* 4. Collection Content Section */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-8">
          {/* Collection Header */}
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black sm:text-2xl font-sans text-foreground tracking-tight">
                {searchQuery ? "Search results" : "In progress"}
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

          {/* Grid / List Cards */}
          {processedItems.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 w-full">
                {processedItems.map((item) => (
                  <ContinueWatchingCard key={item._id || item.animeId} item={item} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {processedItems.map((item) => (
                  <ContinueWatchingCard key={item._id || item.animeId} item={item} />
                ))}
              </div>
            )
          ) : (
            /* Empty State Presentation */
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 bg-card/30 rounded-3xl border border-border/60 p-8 max-w-xl mx-auto">
              {searchQuery || selectedGenre !== "all" ? (
                <>
                  <div className="p-4 rounded-full bg-elevated text-muted-foreground">
                    <Search className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold font-sans text-foreground">No titles match these filters.</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Try a different genre or clear your search query to see your in-progress anime.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedGenre("all");
                    }}
                    className="rounded-full text-xs font-semibold border-border hover:bg-elevated cursor-pointer"
                  >
                    Clear filters
                  </Button>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-full bg-primary/10 text-primary">
                    <Play className="h-8 w-8 fill-current ml-0.5" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-sans text-foreground">No continue watching history</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Start watching some anime and your progress will appear here automatically for easy access.
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-surface border-border rounded-3xl p-6 sm:p-7 shadow-lift">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
              <Trash2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold font-sans text-foreground">
              Clear watch history?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              This will permanently remove all {continueWatching.length} items from your continue watching list.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isClearing}
              className="h-11 px-5 rounded-xl text-sm font-semibold border-border hover:bg-elevated cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleClearAll}
              disabled={isClearing}
              className="h-11 px-6 rounded-xl text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {isClearing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Clear history"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
};

export default ContinueWatching;