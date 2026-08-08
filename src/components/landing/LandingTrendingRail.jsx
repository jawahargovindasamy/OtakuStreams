import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { slugify, getAnimeTitle } from "@/lib/utils";
import { useAuth } from "@/context/auth-provider";

const RECENT_VIEWED_KEY = "otakustreams:recently_viewed";

const LandingTrendingRail = ({ items = [] }) => {
  const navigate = useNavigate();
  const { language } = useAuth();
  const railRef = useRef(null);

  const scroll = (direction) => {
    if (!railRef.current) return;
    const distance = Math.min(railRef.current.clientWidth * 0.8, 720);
    railRef.current.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth"
    });
  };

  const handleCardClick = (anime) => {
    if (!anime) return;
    const animeId = anime.id;
    const title = getAnimeTitle(anime, language);
    const poster = anime.coverImage?.extraLarge || anime.coverImage?.large;

    try {
      const viewed = JSON.parse(localStorage.getItem(RECENT_VIEWED_KEY) || "[]");
      const filtered = viewed.filter((i) => String(i.id) !== String(animeId));
      const updated = [{ id: animeId, title, poster }, ...filtered].slice(0, 30);
      localStorage.setItem(RECENT_VIEWED_KEY, JSON.stringify(updated));
    } catch {}

    navigate(`/${slugify(title)}/${animeId}`);
  };

  if (!items || items.length === 0) return null;

  const displayList = items.slice(0, 12);

  return (
    <section className="w-full border-b border-border/70 bg-background py-16 sm:py-20 text-foreground font-sans">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 space-y-6 sm:space-y-8">
        
        {/* Header Row */}
        <div className="flex items-end justify-between">
          <div className="space-y-1 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-[0.18em]">
              <Flame className="h-4 w-4 text-amber-400 fill-amber-400/20 animate-pulse" />
              <span>Live pulse</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground">
              Trending now
            </h2>
          </div>

          {/* Prev/Next Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="w-11 h-11 rounded-full border border-border/80 bg-surface/80 hover:bg-elevated hover:border-primary/50 text-foreground flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-soft"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="w-11 h-11 rounded-full border border-border/80 bg-surface/80 hover:bg-elevated hover:border-primary/50 text-foreground flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-soft"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Snap Rail */}
        <div
          ref={railRef}
          className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 pt-1 w-full"
        >
          {displayList.map((anime, index) => {
            const rankStr = (index + 1).toString().padStart(2, "0");
            const title = getAnimeTitle(anime, language);
            const poster = anime.coverImage?.large || anime.coverImage?.extraLarge;
            const format = anime.format || "TV";
            const score = anime.averageScore ? `${anime.averageScore}%` : null;

            return (
              <article
                key={anime.id || index}
                onClick={() => handleCardClick(anime)}
                className="snap-start shrink-0 w-[260px] sm:w-[320px] rounded-2xl bg-surface/70 border border-border/70 p-3 flex items-center gap-3.5 cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow text-left"
              >
                {/* Two-digit Rank Number */}
                <span className="font-display font-black text-4xl sm:text-5xl text-muted-foreground/20 group-hover:text-primary/40 transition-colors w-12 shrink-0 text-center select-none">
                  {rankStr}
                </span>

                {/* 56px 2:3 Ratio Poster Box */}
                <div className="w-[56px] aspect-[2/3] rounded-xl overflow-hidden bg-card border border-border/60 shrink-0 relative">
                  <img
                    src={poster}
                    alt={title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Info Text */}
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="font-display font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <span className="px-1.5 py-0.5 rounded bg-card border border-border/60 text-[10px] font-bold text-foreground/80">
                      {format}
                    </span>
                    {score && (
                      <span className="flex items-center gap-1 text-success font-bold">
                        <Star className="h-3 w-3 fill-current" />
                        {score}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default LandingTrendingRail;
