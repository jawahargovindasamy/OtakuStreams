import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Play, Bookmark, Heart, Share2, Star, Clock, Calendar, Check, Loader2, Building2 } from "lucide-react";
import { useAuth } from "@/context/auth-provider";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";
import WatchlistDropdown from "@/components/WatchlistDropdown";

const CinematicHero = ({ anime, onWatchClick, isPlaying, progress, heroWatchRef }) => {
  const { user, watchlist } = useAuth();

  const animeId = anime?.id || anime?.idMal || anime?._id;
  const title =
    typeof anime?.title === "object"
      ? anime.title.english || anime.title.romaji || anime.title.native
      : anime?.name || anime?.jname || anime?.title || "Anime Title";

  const japaneseTitle = anime?.title?.native || anime?.japanese || "";
  const banner =
    anime?.bannerImage ||
    anime?.banner ||
    anime?.info?.bannerImage ||
    anime?.info?.banner ||
    anime?.moreInfo?.bannerImage ||
    null;

  const poster =
    anime?.coverImage?.extraLarge ||
    anime?.coverImage?.large ||
    anime?.poster ||
    anime?.info?.poster ||
    null;
  const bgColor = anime?.coverImage?.color || "var(--card)";

  const rawScore =
    anime?.averageScore ||
    anime?.malscore ||
    anime?.moreInfo?.malscore ||
    anime?.rating ||
    anime?.info?.stats?.rating ||
    anime?.stats?.rating;

  let score = null;
  if (rawScore && rawScore !== "?" && rawScore !== "N/A") {
    const cleanStr = String(rawScore).replace(/MAL|Score|:|\s/gi, "");
    const num = parseFloat(cleanStr);
    if (!isNaN(num)) {
      if (num <= 10) {
        score = `${num.toFixed(1)}`;
      } else {
        score = `${Math.round(num)}%`;
      }
    } else {
      score = String(rawScore);
    }
  }

  const rawFormat =
    anime?.format ||
    anime?.type ||
    anime?.stats?.type ||
    anime?.info?.stats?.type ||
    "TV";
  const format = String(rawFormat).replace(/_/g, " ").toUpperCase();
  
  // Episode count text: e.g. "12 episodes", "1 episode", "Movie"
  const epCountRaw = anime?.episodes || anime?.totalEpisodes || anime?.stats?.episodes?.sub;
  let epCountText = "";
  if (format === "MOVIE") {
    epCountText = "Movie";
  } else if (epCountRaw) {
    const num = typeof epCountRaw === "object" ? epCountRaw.sub || epCountRaw.dub : epCountRaw;
    epCountText = num === 1 ? "1 episode" : `${num} episodes`;
  } else {
    epCountText = "Episode count TBA";
  }

  // Status badge copy
  const rawStatus = anime?.status || anime?.moreInfo?.status || "FINISHED";
  const statusLabel = rawStatus.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  // Duration formatting helper (e.g. "1h 57m", 117 -> "1h 57m", "1h" -> "1h", 24 -> "24 min")
  const rawDuration = anime?.duration || anime?.stats?.duration || anime?.moreInfo?.duration;
  let durationText = null;
  if (rawDuration) {
    const str = String(rawDuration).trim().toLowerCase();
    const hMatch = str.match(/(\d+)\s*h/);
    const mMatch = str.match(/(\d+)\s*m/);

    let totalMins = 0;
    if (hMatch) {
      const hours = parseInt(hMatch[1], 10);
      const mins = mMatch ? parseInt(mMatch[1], 10) : 0;
      totalMins = hours * 60 + mins;
    } else {
      const digits = str.replace(/\D/g, "");
      if (digits) totalMins = parseInt(digits, 10);
    }

    if (totalMins && !isNaN(totalMins) && totalMins > 0) {
      durationText = `${totalMins} min`;
    }
  }

  const studioName =
    anime?.studios?.nodes?.[0]?.name ||
    anime?.studios?.[0]?.name ||
    (typeof anime?.studios?.[0] === "string" ? anime.studios[0] : null) ||
    (typeof anime?.studios === "string" ? anime.studios.split(",")?.[0] : null) ||
    (typeof anime?.moreInfo?.studios === "string" ? anime.moreInfo.studios.split(",")?.[0] : null);

  // Year Extraction
  let year = anime?.seasonYear || anime?.startDate?.year || anime?.year;
  if (!year && anime?.moreInfo?.premiered) {
    const match = String(anime.moreInfo.premiered).match(/\d{4}/);
    if (match) year = match[0];
  }
  if (!year && anime?.moreInfo?.aired) {
    const match = String(anime.moreInfo.aired).match(/\d{4}/);
    if (match) year = match[0];
  }

  // Genres (Display all genres)
  const genresList = Array.isArray(anime?.genres) && anime.genres.length > 0
    ? anime.genres
    : Array.isArray(anime?.moreInfo?.genres)
    ? anime.moreInfo.genres
    : [];

  // Synopsis Hook (short clamp for hero)
  const rawDesc = anime?.description || anime?.info?.description || "";
  const synopsisHook = rawDesc ? rawDesc.replace(/<[^>]*>?/gm, "").trim() : "";

  // Derived Watchlist & Favorite States (React 19 compliant - 0 cascading re-renders)
  const inWatchlist = useMemo(() => {
    if (!animeId) return false;
    if (user && Array.isArray(watchlist)) {
      return watchlist.some((w) => (w.animeId || w.id) === animeId.toString() || (w.animeId || w.id) === animeId);
    }
    try {
      const localW = JSON.parse(localStorage.getItem("otakustreams:watchlist") || "[]");
      return localW.some((i) => (i.id || i.animeId) === animeId);
    } catch {
      return false;
    }
  }, [animeId, user, watchlist]);

  const [favoriteOverride, setFavoriteOverride] = useState(null);

  const isFavorite = useMemo(() => {
    if (favoriteOverride !== null) return favoriteOverride;
    if (!animeId) return false;
    try {
      const localF = JSON.parse(localStorage.getItem("otakustreams:favourites") || "[]");
      return localF.some((i) => (i.id || i.animeId) === animeId);
    } catch {
      return false;
    }
  }, [animeId, favoriteOverride]);

  const toggleFavorite = () => {
    try {
      const localF = JSON.parse(localStorage.getItem("otakustreams:favourites") || "[]");
      let updated;
      if (isFavorite) {
        updated = localF.filter((i) => (i.id || i.animeId) !== animeId);
        toast.success(`Removed ${title} from favorites`);
      } else {
        updated = [...localF, { id: animeId, animeId, title, poster }];
        toast.success(`Added ${title} to favorites`);
      }
      localStorage.setItem("otakustreams:favourites", JSON.stringify(updated));
      setFavoriteOverride(!isFavorite);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Share link copied to clipboard");
  };

  // Watch Action Copy
  const watchButtonLabel = progress
    ? `Continue Ep ${progress.currentEpisode}`
    : format === "MOVIE"
    ? "Watch movie"
    : "Watch episode 1";

  return (
    <section className="relative w-full min-h-[92svh] flex flex-col justify-end overflow-hidden pt-20 pb-12 sm:pb-16 lg:pb-20">
      {/* Background Banner Artwork with Inset Scrims matching Home Hero */}
      <div className="absolute inset-0 overflow-hidden bg-background">
        {banner ? (
          <img
            src={banner}
            alt=""
            className="h-full w-full object-cover object-center transition-transform duration-1000 scale-100 opacity-75 sm:opacity-90 pointer-events-none"
          />
        ) : poster ? (
          <img
            src={poster}
            alt=""
            className="h-full w-full object-cover object-center transition-transform duration-1000 scale-100 opacity-30 blur-md pointer-events-none"
          />
        ) : null}

        {/* Scrim Overlays - Matching Hero.jsx on Home */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent pointer-events-none z-10" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-20 mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,760px)] gap-6 lg:gap-10 items-end">
          
          {/* Desktop Poster (Hidden on Mobile <1024px to prevent crowding) */}
          <div
            style={{ backgroundColor: bgColor }}
            className="hidden lg:block w-[220px] aspect-[2/3] rounded-2xl overflow-hidden border border-border/70 shadow-soft relative shrink-0"
          >
            <img
              src={poster}
              alt={`${title} poster`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Identity Stack */}
          <div className="space-y-4 text-left">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-semibold uppercase tracking-wider backdrop-blur-md font-sans">
                {statusLabel}
              </span>

              {score && (
                <span className="px-3 py-1 rounded-full bg-surface/80 text-success border border-border/70 text-xs font-semibold font-mono backdrop-blur-md flex items-center gap-1 shadow-xs">
                  <Star className="w-3.5 h-3.5 fill-current text-success" />
                  {score}
                </span>
              )}

              <span className="px-3 py-1 rounded-full bg-surface/80 text-foreground border border-border/70 text-xs font-semibold backdrop-blur-md font-sans shadow-xs">
                {format}
              </span>

              <span className="px-3 py-1 rounded-full bg-surface/80 text-foreground border border-border/70 text-xs font-semibold backdrop-blur-md font-sans shadow-xs">
                {epCountText}
              </span>

              {year && (
                <span className="px-3 py-1 rounded-full bg-surface/80 text-foreground border border-border/70 text-xs font-semibold backdrop-blur-md font-sans shadow-xs">
                  {year}
                </span>
              )}
            </div>

            {/* Title Block */}
            <div className="space-y-1">
              {japaneseTitle && (
                <p className="text-sm sm:text-base text-muted-foreground font-medium font-sans">
                  {japaneseTitle}
                </p>
              )}
              <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-foreground tracking-tight leading-[1.05] max-w-3xl">
                {title}
              </h1>
            </div>

            {/* Synopsis Hook */}
            {synopsisHook && (
              <p className="text-sm sm:text-base text-subtle font-sans line-clamp-3 leading-relaxed max-w-2xl">
                {synopsisHook}
              </p>
            )}

            {/* Chips Row (Genres · Studio · Duration) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {genresList.map((g, idx) => (
                <Link
                  key={idx}
                  to={`/genre/${slugify(g)}`}
                  className="px-3 py-1 rounded-full bg-surface/80 hover:bg-elevated hover:text-primary hover:border-primary/40 backdrop-blur-md border border-border/70 text-foreground text-xs font-medium font-sans shadow-xs transition-all cursor-pointer"
                >
                  {g}
                </Link>
              ))}

              {studioName && (
                <Link
                  to={`/producer/${slugify(studioName.trim())}`}
                  className="px-3 py-1 rounded-full bg-surface/80 hover:bg-elevated hover:border-primary/40 backdrop-blur-md border border-border/70 text-foreground text-xs font-medium font-sans shadow-xs flex items-center gap-1.5 transition-all cursor-pointer group"
                >
                  <Building2 className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="group-hover:text-primary transition-colors">{studioName.trim()}</span>
                </Link>
              )}

              {durationText && (
                <span className="px-3 py-1 rounded-full bg-surface/80 backdrop-blur-md border border-border/70 text-foreground text-xs font-medium font-mono shadow-xs">
                  {durationText}
                </span>
              )}
            </div>

            {/* Action Row: Primary Watch Pill + 48px Glass Icons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {/* Primary Watch Action Pill */}
              <button
                ref={heroWatchRef}
                type="button"
                disabled={isPlaying}
                onClick={onWatchClick}
                className="min-h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-glow flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer hover:brightness-110 active:scale-[0.98] disabled:opacity-75"
              >
                {isPlaying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>{watchButtonLabel}</span>
                  </>
                )}
              </button>

              {/* 48px Glass Watchlist Dropdown Control */}
              <WatchlistDropdown
                animeId={animeId}
                animeTitle={title}
                animeImage={poster}
                align="start"
                side="bottom"
              >
                <button
                  type="button"
                  aria-pressed={inWatchlist}
                  aria-label={`Watchlist options for ${title}`}
                  className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer backdrop-blur-md shadow-soft active:scale-95 ${
                    inWatchlist
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-surface/80 border-border/70 text-foreground hover:bg-elevated"
                  }`}
                >
                  {inWatchlist ? <Check className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
              </WatchlistDropdown>

              {/* 48px Glass Favorite Icon Control */}
              <button
                type="button"
                onClick={toggleFavorite}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer backdrop-blur-md shadow-soft active:scale-95 ${
                  isFavorite
                    ? "bg-destructive text-destructive-foreground border-destructive"
                    : "bg-surface/80 border-border/70 text-foreground hover:bg-elevated"
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              </button>

              {/* 48px Glass Share Icon Control */}
              <button
                type="button"
                onClick={handleShare}
                aria-label={`Share ${title}`}
                className="w-12 h-12 rounded-full bg-surface/80 border border-border/70 text-foreground hover:bg-elevated flex items-center justify-center transition-all duration-200 cursor-pointer backdrop-blur-md shadow-soft active:scale-95"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CinematicHero;
