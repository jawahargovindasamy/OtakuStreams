import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Search, Play, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/auth-provider";
import { getAnimeTitle } from "@/lib/utils";

const LandingHero = ({ spotlightAnime, onOpenSearch }) => {
  const { user, watchlist, language } = useAuth();
  const [hasHistory, setHasHistory] = useState(false);

  // Check if watch history or watchlist exists locally
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem("otakustreams:watch_history") || "[]");
      const localWatchlist = JSON.parse(localStorage.getItem("otakustreams:watchlist") || "[]");
      if ((Array.isArray(history) && history.length > 0) || (Array.isArray(localWatchlist) && localWatchlist.length > 0) || (watchlist && watchlist.length > 0) || user) {
        setHasHistory(true);
      }
    } catch {
      setHasHistory(false);
    }
  }, [user, watchlist]);

  // Image source resolution
  const bannerArt = spotlightAnime?.bannerImage || spotlightAnime?.coverImage?.extraLarge || spotlightAnime?.coverImage?.large;
  const animeTitle = getAnimeTitle(spotlightAnime, language);

  return (
    <section className="relative w-full h-[min(880px,92dvh)] flex items-center overflow-hidden bg-background">
      {/* Artwork Background */}
      {bannerArt && (
        <div className="absolute inset-0 w-full h-full">
          <img
            src={bannerArt}
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-[62%_center] sm:object-center opacity-85 transition-opacity duration-700"
          />
        </div>
      )}

      {/* TRIPLE OVERLAY CONTRAST STACK */}
      {/* 1. Left Horizontal Dark Field */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 sm:via-background/75 to-transparent w-full sm:w-3/4 lg:w-2/3 pointer-events-none" />

      {/* 2. Bottom Fade connecting art to canvas */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />

      {/* 3. Top Dark Fade protecting header */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-background/90 via-background/40 to-transparent pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 pt-20">
        <div className="max-w-3xl space-y-6 sm:space-y-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Eyebrow & Spotlight Badge */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sparkle Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/70 backdrop-blur-md border border-border/80 text-accent text-xs font-bold uppercase tracking-[0.18em]">
              <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
              <span>A new way into anime</span>
            </div>

            {/* Spotlight Label Badge */}
            {animeTitle && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/60 backdrop-blur-md border border-border/60 text-muted-foreground text-xs font-medium truncate max-w-[280px] sm:max-w-md">
                <span className="w-2 h-2 rounded-full bg-success animate-ping shrink-0" />
                <span className="truncate">Now spotlighting · <strong className="text-foreground">{animeTitle}</strong></span>
              </div>
            )}
          </div>

          {/* H1 Headline */}
          <h1 className="font-display font-black text-4xl sm:text-7xl lg:text-8xl xl:text-9xl tracking-tight leading-[0.94] text-foreground drop-shadow-md">
            Otaku<span className="text-primary">Streams</span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg lg:text-xl text-subtle font-sans max-w-2xl leading-relaxed">
            Every world, character, and story you love, brought together in one cinematic stream. Discover what's trending and start watching instantly.
          </p>

          {/* Search & Watch CTA Row */}
          <div className="max-w-2xl space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
            {/* Hero Glass Search Bar */}
            <div
              onClick={onOpenSearch}
              className="flex-1 h-14 rounded-2xl bg-surface/80 hover:bg-elevated backdrop-blur-xl border border-border/80 hover:border-primary/50 shadow-lift px-4 flex items-center justify-between cursor-pointer transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Search className="h-5 w-5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm sm:text-base text-muted-foreground group-hover:text-foreground/90 truncate font-sans">
                  Search anime, characters, genres...
                </span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card border border-border/80 text-[11px] font-mono font-bold text-muted-foreground">
                ⌘K
              </kbd>
            </div>

            {/* Start / Resume Watching CTA */}
            <Link
              to="/home"
              className="h-14 px-7 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-base shadow-glow flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-105 shrink-0"
            >
              <Play className="h-5 w-5 fill-current" />
              <span>{hasHistory ? "Resume watching" : "Start watching"}</span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LandingHero;
