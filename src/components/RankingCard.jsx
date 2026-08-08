import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Heart } from "lucide-react";
import { slugify, getAnimeTitle } from "@/lib/utils";
import { useAuth } from "@/context/auth-provider";
import { toast } from "sonner";
import WatchlistDropdown from "@/components/WatchlistDropdown";

const RankingCard = ({ item, rank }) => {
  const navigate = useNavigate();
  const { user, watchlist, addWatchlist, removeWatchlist, language } = useAuth();

  const animeId = item?.id || item?._id;
  const animeTitle = getAnimeTitle(item, language);

  const poster = item?.poster || item?.coverImage?.large || item?.coverImage?.extraLarge || item?.bannerImage;
  const bgColor = item?.coverImage?.color || "var(--card)";
  const score = item?.averageScore ? `${item.averageScore}%` : item?.rating || null;
  const format = (item?.format || item?.type || "TV").replace("_", " ");
  const isAiring = item?.status === "RELEASING" || item?.status === "AIRING";

  // Format Genres Subline (first 3 joined by ' · ')
  const genresSubline = Array.isArray(item?.genres) && item.genres.length > 0
    ? item.genres.slice(0, 3).join(" · ")
    : format;

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

  const handleRowClick = (e) => {
    if (e.target.closest("button") || e.target.closest("a")) return;
    navigate(`/${slugify(animeTitle)}/${animeId}`);
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
    <li
      onClick={handleRowClick}
      className="relative group rounded-2xl border border-border/70 hover:border-primary hover:border-[1.5px] bg-card/50 hover:bg-card p-3 flex items-center gap-3 sm:gap-4 transition-all duration-200 active:scale-[0.995] cursor-pointer w-full min-w-0"
    >
      {/* ① Rank Numeral (Outlined Outfit Display with currentColor stroke) */}
      <div
        aria-hidden="true"
        style={{
          WebkitTextStroke: "1.5px currentColor",
          WebkitTextFillColor: "transparent",
        }}
        className="font-display font-black text-3xl sm:text-4xl lg:text-5xl w-9 sm:w-14 text-center shrink-0 select-none text-primary/80 dark:text-primary/90"
      >
        {rank}
      </div>

      {/* ② Poster (2:3 Aspect, 56px / 64px) */}
      <div
        style={{ backgroundColor: bgColor }}
        className="w-14 h-20 sm:w-16 sm:h-24 rounded-xl overflow-hidden shrink-0 relative bg-muted"
      >
        <img
          src={poster}
          alt={`${animeTitle} poster art`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
      </div>

      {/* ③ Text Block & Badges */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Title (Single-line truncate) */}
        <h4 className="font-display font-semibold text-sm sm:text-base text-foreground truncate leading-snug">
          {animeTitle}
        </h4>

        {/* Subline (Genres or format fallback) */}
        <p className="text-xs text-muted-foreground font-sans truncate">
          {genresSubline}
        </p>

        {/* ④ Badge Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {/* Score Badge */}
          {score && (
            <span className="px-2 py-0.5 rounded-full bg-background/70 text-emerald-500 dark:text-emerald-400 border border-border/50 text-[11px] font-semibold flex items-center gap-1">
              <span className="text-[12px]">★</span> {score}
            </span>
          )}

          {/* Format Badge */}
          <span className="px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/50 text-[11px] font-medium">
            {format}
          </span>

          {/* Airing Status Badge */}
          {isAiring && (
            <span className="px-2 py-0.5 rounded-full bg-destructive/90 text-white text-[11px] font-semibold">
              Airing
            </span>
          )}
        </div>
      </div>

      {/* ⑤ Action Buttons (Hidden below sm) */}
      <div className="hidden sm:flex items-center gap-2 shrink-0 z-20">
        {/* Bookmark Action Button */}
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
            className={`w-9 h-9 min-w-[36px] min-h-[36px] rounded-full border flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
              animatingWatchlist ? "scale-115" : "scale-100"
            } ${
              inWatchlist
                ? "bg-background/90 border-primary text-primary"
                : "bg-background/70 border-white/15 text-muted-foreground hover:text-foreground hover:bg-background hover:border-border"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${inWatchlist ? "fill-current text-primary" : ""}`} />
          </button>
        </WatchlistDropdown>

        {/* Favorite Action Button */}
        <button
          type="button"
          onClick={toggleFavourite}
          aria-pressed={isFavourite}
          aria-label={isFavourite ? `Remove ${animeTitle} from favorites` : `Add ${animeTitle} to favorites`}
          className={`w-9 h-9 min-w-[36px] min-h-[36px] rounded-full border flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
            animatingFav ? "scale-115" : "scale-100"
          } ${
            isFavourite
              ? "bg-background/90 border-destructive text-destructive"
              : "bg-background/70 border-white/15 text-muted-foreground hover:text-foreground hover:bg-background hover:border-border"
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavourite ? "fill-current text-destructive" : ""}`} />
        </button>
      </div>
    </li>
  );
};

export default RankingCard;
