import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Bookmark, Heart, Trash2 } from "lucide-react";
import { slugify, getAnimeTitle } from "@/lib/utils";
import { useAuth } from "@/context/auth-provider";
import { toast } from "sonner";

const WatchlistCard = ({ item, onRemove }) => {
  const navigate = useNavigate();
  const { user, watchlist, removeWatchlist, addWatchlist, language } = useAuth();

  const animeId = item?.id || item?.animeId || item?._id;
  const title = getAnimeTitle(item, language);

  const poster =
    item?.animeImage ||
    item?.poster ||
    item?.coverImage?.extraLarge ||
    item?.coverImage?.large ||
    item?.bannerImage;
  const bgColor = item?.coverImage?.color || "var(--card)";
  const format = (item?.format || item?.type || "TV").replace("_", " ");
  const episodeCount = item?.episodes || item?.totalEpisodes || item?.currentEpisode;
  const isMovie = format === "MOVIE";

  // Genres text
  const genresList = Array.isArray(item?.genres)
    ? item.genres.slice(0, 2).join(" · ")
    : item?.genre
    ? item.genre
    : "";

  const isFavOnly = item?.isFavoriteOnly;

  const handleCardClick = (e) => {
    if (e.target.closest("button") || e.target.closest("a")) return;
    navigate(`/${slugify(title)}/${animeId}`);
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    navigate(`/watch/${animeId}/1`);
  };

  const handleRemove = async (e) => {
    e.stopPropagation();

    // Call onRemove callback if provided
    if (onRemove) {
      onRemove(item);
    } else if (user && removeWatchlist && item._id) {
      try {
        await removeWatchlist(item._id);
      } catch (err) {
        console.error("Failed to remove item:", err);
      }
    } else {
      try {
        const list = JSON.parse(localStorage.getItem("otakustreams:watchlist") || "[]");
        const updated = list.filter((i) => (i.id || i.animeId) !== animeId);
        localStorage.setItem("otakustreams:watchlist", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to update localStorage:", err);
      }
    }

    // Toast notification with Undo capability
    toast("Removed from watchlist", {
      description: `${title} was removed from your shelf.`,
      action: {
        label: "Undo",
        onClick: async () => {
          if (user && addWatchlist) {
            await addWatchlist(animeId.toString(), title, poster, "plan_to_watch");
          } else {
            const list = JSON.parse(localStorage.getItem("otakustreams:watchlist") || "[]");
            list.unshift({ id: animeId, animeId, title, poster, ...item });
            localStorage.setItem("otakustreams:watchlist", JSON.stringify(list));
            window.location.reload();
          }
        },
      },
    });
  };

  return (
    <article
      onClick={handleCardClick}
      className="snap-start shrink-0 w-[42vw] min-w-[136px] max-w-[160px] sm:w-[176px] lg:w-[184px] xl:w-[192px] cursor-pointer group flex flex-col focus-within:ring-2 focus-within:ring-primary rounded-2xl"
    >
      {/* 2:3 Ratio Poster Box */}
      <div
        style={{ backgroundColor: bgColor }}
        className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-card/40 border border-border/60 hover:border-primary/50 shadow-soft hover:shadow-glow transition-all duration-300 group-hover:-translate-y-1"
      >
        {/* Artwork */}
        <img
          src={poster}
          alt={`${title} poster art`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.045]"
        />

        {/* Bottom Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

        {/* Top-Left Persistent Saved Marker */}
        <div className="absolute top-2.5 left-2.5 z-10 w-9 h-9 rounded-full bg-background/80 backdrop-blur-md border border-primary/50 flex items-center justify-center text-primary shadow-sm">
          {isFavOnly ? (
            <Heart className="w-4 h-4 fill-current text-destructive" />
          ) : (
            <Bookmark className="w-4 h-4 fill-current text-primary" />
          )}
        </div>

        {/* Top-Right Quick Remove Button */}
        <button
          type="button"
          onClick={handleRemove}
          aria-label={`Remove ${title} from watchlist`}
          className="absolute top-2.5 right-2.5 z-10 w-9 h-9 rounded-full bg-surface/90 backdrop-blur-md border border-border/80 flex items-center justify-center text-foreground hover:text-white hover:bg-destructive hover:border-destructive transition-all duration-200 cursor-pointer shadow-soft opacity-0 group-hover:opacity-100 focus-within:opacity-100 media-hover-none:opacity-100"
        >
          <Trash2 className="w-4 h-4 text-rose-500 hover:text-white transition-colors" />
        </button>

        {/* Centre Play Action FAB */}
        <button
          type="button"
          onClick={handlePlay}
          aria-label={`Watch ${title}`}
          className="absolute inset-0 m-auto z-10 w-12 h-12 rounded-full brand-gradient text-white flex items-center justify-center shadow-glow opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 media-hover-none:opacity-100"
        >
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </button>

        {/* Bottom Metadata Badges inside poster */}
        <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 pointer-events-none">
          <span className="px-2.5 py-0.5 rounded-full bg-surface/90 backdrop-blur-md border border-border/80 text-[11px] font-semibold text-foreground font-sans shadow-xs">
            {format}
          </span>
          {episodeCount && !isMovie && (
            <span className="px-2.5 py-0.5 rounded-full bg-surface/90 backdrop-blur-md border border-border/80 text-[11px] font-semibold text-foreground font-sans shadow-xs">
              {episodeCount} ep
            </span>
          )}
        </div>
      </div>

      {/* Title & Secondary Metadata below poster */}
      <div className="mt-2.5 space-y-0.5">
        <h3 className="font-display font-semibold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {title}
        </h3>
        {genresList && (
          <p className="text-xs text-muted-foreground truncate font-sans">
            {genresList}
          </p>
        )}
      </div>
    </article>
  );
};

export default WatchlistCard;
