import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Bookmark, Heart } from "lucide-react";
import { slugify, getAnimeTitle } from "@/lib/utils";
import { useAuth } from "@/context/auth-provider";
import { toast } from "sonner";
import WatchlistDropdown from "@/components/WatchlistDropdown";

const PosterCard = ({ item, anime, className = "" }) => {
  const cardData = anime || item || {};
  const navigate = useNavigate();
  const { user, watchlist, addWatchlist, removeWatchlist, language } = useAuth();

  const animeId = cardData?.id || cardData?._id || cardData?.idMal;
  const animeTitle = getAnimeTitle(cardData, language);

  const poster = cardData?.poster || cardData?.coverImage?.extraLarge || cardData?.coverImage?.large || cardData?.bannerImage;
  const bgColor = cardData?.coverImage?.color || "var(--card)";
  const score = cardData?.averageScore ? `${cardData.averageScore}%` : cardData?.rating || null;
  const format = (cardData?.format || cardData?.type || "TV").replace("_", " ");
  
  // Meta string: Format · duration min OR Format · Episodes ep / Status
  const duration = cardData?.duration;
  const epRaw = cardData?.episodes || cardData?.totalEpisodes || cardData?.currentEpisode || cardData?.stats?.episodes;
  const episodeCount =
    typeof epRaw === "object"
      ? epRaw?.sub || epRaw?.dub || epRaw?.eps || null
      : epRaw;

  let metaText = format;
  if (format === "MOVIE") {
    metaText = duration ? `${duration} min` : "Movie";
  } else if (episodeCount) {
    metaText = `${format} · ${episodeCount} ep`;
  } else if (duration) {
    metaText = `${format} · ${duration} min`;
  } else if (cardData?.status) {
    metaText = `${format} · ${String(cardData.status).replace(/_/g, " ")}`;
  } else {
    metaText = `${format} · Airing`;
  }

  // Watchlist & Favourite state
  const [localWatchlist, setLocalWatchlist] = useState(() => {
    try {
      const list = JSON.parse(localStorage.getItem("otakustreams:watchlist") || "[]");
      return list.some((i) => (i.id || i.animeId) === animeId);
    } catch {
      return false;
    }
  });

  const inWatchlist = user
    ? watchlist?.some((w) => w.animeId === animeId.toString() || w.animeId === animeId)
    : localWatchlist;

  const [isFavourite, setIsFavourite] = useState(() => {
    try {
      const list = JSON.parse(localStorage.getItem("otakustreams:favourites") || "[]");
      return list.some((i) => i.id === animeId);
    } catch {
      return false;
    }
  });

  const [animatingWatchlist, setAnimatingWatchlist] = useState(false);
  const [animatingFav, setAnimatingFav] = useState(false);

  const handleCardClick = (e) => {
    if (e.target.closest("button") || e.target.closest("a")) return;
    navigate(`/${slugify(animeTitle)}/${animeId}`);
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    navigate(`/watch/${animeId}/1`);
  };

  const toggleWatchlist = async (e) => {
    e.stopPropagation();
    setAnimatingWatchlist(true);
    setTimeout(() => setAnimatingWatchlist(false), 260);

    if (user && addWatchlist) {
      try {
        if (inWatchlist) {
          const itemToRemove = watchlist.find((w) => w.animeId === animeId.toString() || w.animeId === animeId);
          if (itemToRemove) await removeWatchlist(itemToRemove._id);
          toast.success(`Removed ${animeTitle} from watchlist`);
        } else {
          await addWatchlist(animeId.toString(), animeTitle, poster, "plan_to_watch");
          toast.success(`Added ${animeTitle} to watchlist`);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        const list = JSON.parse(localStorage.getItem("otakustreams:watchlist") || "[]");
        let updated;
        if (localWatchlist) {
          updated = list.filter((i) => (i.id || i.animeId) !== animeId);
          toast.success(`Removed ${animeTitle} from watchlist`);
        } else {
          updated = [...list, { id: animeId, animeId, title: animeTitle, poster }];
          toast.success(`Added ${animeTitle} to watchlist`);
        }
        localStorage.setItem("otakustreams:watchlist", JSON.stringify(updated));
        setLocalWatchlist(!localWatchlist);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleFavourite = (e) => {
    e.stopPropagation();
    setAnimatingFav(true);
    setTimeout(() => setAnimatingFav(false), 260);

    try {
      const list = JSON.parse(localStorage.getItem("otakustreams:favourites") || "[]");
      let updated;
      if (isFavourite) {
        updated = list.filter((i) => i.id !== animeId);
        toast.success(`Removed ${animeTitle} from favourites`);
      } else {
        updated = [...list, { id: animeId, title: animeTitle }];
        toast.success(`Added ${animeTitle} to favourites`);
      }
      localStorage.setItem("otakustreams:favourites", JSON.stringify(updated));
      setIsFavourite(!isFavourite);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className={className || "snap-start shrink-0 w-[46vw] sm:w-[13rem] lg:w-[14rem] cursor-pointer group flex flex-col focus-within:ring-2 focus-within:ring-primary rounded-2xl"}
    >
      {/* 2:3 Ratio Image Box */}
      <div
        style={{ backgroundColor: bgColor }}
        className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-card/40 border border-border/60 hover:border-primary/40 shadow-soft hover:shadow-glow transition-all duration-300 group-hover:-translate-y-1"
      >
        {/* Poster Image */}
        <img
          src={poster}
          alt={`${animeTitle} poster art`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

        {/* Top-Left Score Badge */}
        {score && (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-emerald-400 text-[11px] font-semibold flex items-center gap-1 border border-white/10">
            <span className="text-[11px]">★</span> {score}
          </div>
        )}

        {/* Bottom-Left Meta Line inside image */}
        <div className="absolute bottom-2.5 left-2.5 z-10 text-[11px] font-medium text-white/80 truncate max-w-[70%] font-sans">
          {metaText}
        </div>

        {/* Bottom-Right Play FAB (Hover/Touch) */}
        <button
          type="button"
          onClick={handlePlay}
          aria-label={`Watch ${animeTitle}`}
          className="absolute bottom-2.5 right-2.5 z-10 w-8 h-8 rounded-full brand-gradient text-white flex items-center justify-center shadow-glow opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 media-hover-none:opacity-100"
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </button>
      </div>

      {/* Outside Title (Below image container) */}
      <h4 className="font-display font-semibold text-sm text-foreground line-clamp-2 leading-snug mt-2.5 group-hover:text-primary transition-colors">
        {animeTitle}
      </h4>

      {/* Outside Action Buttons (Below title) */}
      <div className="flex items-center gap-1.5 pt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 media-hover-none:opacity-100">
        <WatchlistDropdown
          animeId={animeId}
          animeTitle={animeTitle}
          animeImage={poster}
          align="start"
          side="top"
        >
          <button
            type="button"
            aria-pressed={inWatchlist}
            aria-label={`Watchlist options for ${animeTitle}`}
            className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
              animatingWatchlist ? "scale-115" : "scale-100"
            } ${
              inWatchlist
                ? "bg-primary text-white border-primary"
                : "bg-background/80 border-border text-muted-foreground hover:text-foreground hover:bg-background"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${inWatchlist ? "fill-current" : ""}`} />
          </button>
        </WatchlistDropdown>

        <button
          type="button"
          onClick={toggleFavourite}
          aria-pressed={isFavourite}
          aria-label={isFavourite ? `Remove ${animeTitle} from favorites` : `Add ${animeTitle} to favorites`}
          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
            animatingFav ? "scale-115" : "scale-100"
          } ${
            isFavourite
              ? "bg-destructive text-white border-destructive"
              : "bg-background/80 border-border text-muted-foreground hover:text-foreground hover:bg-background"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavourite ? "fill-current" : ""}`} />
        </button>
      </div>
    </article>
  );
};

export default PosterCard;
