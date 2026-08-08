import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Heart } from "lucide-react";
import { slugify, getAnimeTitle } from "@/lib/utils";
import { useAuth } from "@/context/auth-provider";
import { toast } from "sonner";
import WatchlistDropdown from "@/components/WatchlistDropdown";

const BentoCard = ({ item, isHero = false, isWide = false }) => {
  const navigate = useNavigate();
  const { user, watchlist, addWatchlist, removeWatchlist, language } = useAuth();

  const animeId = item?.id || item?._id;
  const animeTitle = getAnimeTitle(item, language);

  // Artwork selection priority
  const artwork = isHero
    ? item?.bannerImage || item?.banner || item?.coverImage?.extraLarge || item?.poster
    : item?.coverImage?.extraLarge || item?.poster || item?.bannerImage;

  const bgColor = item?.coverImage?.color || "var(--card)";
  const score = item?.averageScore ? `${item.averageScore}%` : item?.rating || null;
  const format = (item?.format || item?.type || "TV").replace("_", " ");
  const genres = Array.isArray(item?.genres) ? item.genres.slice(0, 4).join(" · ") : null;

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

  const handleTileClick = (e) => {
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
          await addWatchlist(animeId.toString(), animeTitle, artwork, "plan_to_watch");
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
          updated = [...list, { id: animeId, animeId, title: animeTitle, poster: artwork }];
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

  // Grid span classes
  const spanClass = isHero
    ? "col-span-2 row-span-2"
    : isWide
    ? "col-span-2 row-span-1"
    : "col-span-1 row-span-1";

  return (
    <article
      onClick={handleTileClick}
      className={`relative group rounded-3xl overflow-hidden cursor-pointer border border-white/10 hover:border-primary/50 transition-all duration-300 shadow-soft hover:shadow-lift flex flex-col justify-end p-4 sm:p-5 ${spanClass}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Background Artwork */}
      {artwork ? (
        <img
          src={artwork}
          alt={`${animeTitle} cover art`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-elevated flex items-center justify-center text-xs font-semibold text-muted-foreground tracking-widest">
          NO ART
        </div>
      )}

      {/* Inset Scrim Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none z-10" />

      {/* Information Column (Bottom-Anchored) */}
      <div className="relative z-20 space-y-1.5 pointer-events-none">
        {/* Badge Row */}
        <div className="flex flex-wrap items-center gap-1.5">
          {score && (
            <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-emerald-400 font-bold text-[11px] border border-white/20 shadow-soft flex items-center gap-1">
              <span className="text-[11px]">★</span> {score}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-semibold text-[11px] border border-white/20 shadow-soft">
            {format}
          </span>
        </div>

        {/* Title (H3) */}
        <h3
          className={`font-display font-bold text-white leading-snug line-clamp-2 ${
            isHero ? "text-xl sm:text-2xl" : "text-sm sm:text-base"
          }`}
        >
          {animeTitle}
        </h3>

        {/* Genre line (Hero tile only) */}
        {isHero && genres && (
          <p className="text-xs text-white/70 font-sans line-clamp-1 max-w-md">
            {genres}
          </p>
        )}

        {/* Action Row (Bookmark & Heart) */}
        <div className="flex items-center gap-2 pt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 media-hover-none:opacity-100 pointer-events-auto z-30">
          <WatchlistDropdown
            animeId={animeId}
            animeTitle={animeTitle}
            animeImage={artwork}
            align="start"
            side="top"
          >
            <button
              type="button"
              aria-pressed={inWatchlist}
              aria-label={`Watchlist options for ${animeTitle}`}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
                animatingWatchlist ? "scale-115" : "scale-100"
              } ${
                inWatchlist
                  ? "bg-background/90 border-primary text-primary"
                  : "bg-background/70 border-white/15 text-white/80 hover:text-white hover:bg-background"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${inWatchlist ? "fill-current text-primary" : ""}`} />
            </button>
          </WatchlistDropdown>

          <button
            type="button"
            onClick={toggleFavourite}
            aria-pressed={isFavourite}
            aria-label={isFavourite ? `Remove ${animeTitle} from favorites` : `Add ${animeTitle} to favorites`}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
              animatingFav ? "scale-115" : "scale-100"
            } ${
              isFavourite
                ? "bg-background/90 border-destructive text-destructive"
                : "bg-background/70 border-white/15 text-white/80 hover:text-white hover:bg-background"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavourite ? "fill-current text-destructive" : ""}`} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default BentoCard;
