import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAnimeTitle } from "@/lib/utils";
import { useAuth } from "@/context/auth-provider";

const ContinueWatchingCard = ({ item }) => {
  const navigate = useNavigate();
  const { api, setContinueWatching, language } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const animeId = item?.animeId || item?.id || item?._id;
  const animeTitle = getAnimeTitle(item, language);
  const poster = item?.animeImage || item?.poster || item?.coverImage?.extraLarge || item?.bannerImage;
  const episodeNumber = item?.currentEpisode || item?.episodeNumber || 1;

  // Calculate progress percentage and remaining time
  const duration = item?.duration || 1440; // Default 24 mins in sec
  const currentTime = item?.currentTime || 420; // Default watched
  const progressPercent = item?.duration
    ? Math.min(100, Math.max(5, Math.round((currentTime / duration) * 100)))
    : 35;
  const minutesLeft = item?.duration && item?.currentTime
    ? Math.max(1, Math.round((duration - currentTime) / 60))
    : 23;

  const handleContinue = () => {
    navigate(`/watch/${animeId}/${episodeNumber}`, {
      state: {
        server: item?.server,
        dub: item?.dub,
      },
    });
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      if (api?.delete) {
        await api.delete(`/continue-watching/${animeId}`);
      }
      setContinueWatching((prev) =>
        prev.filter((watchItem) => (watchItem._id || watchItem.animeId) !== (item._id || item.animeId))
      );
      toast.success(`Removed ${animeTitle} from continue watching`);
    } catch (error) {
      // Optimistic remove fallback
      setContinueWatching((prev) =>
        prev.filter((watchItem) => (watchItem._id || watchItem.animeId) !== (item._id || item.animeId))
      );
      toast.success(`Removed ${animeTitle} from continue watching`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      onClick={handleContinue}
      className="relative group overflow-hidden rounded-2xl aspect-video border border-border/60 hover:border-primary/50 bg-surface shadow-soft hover:shadow-lift transition-all duration-300 hover:scale-[1.02] cursor-pointer"
    >
      {/* 16:9 Thumbnail Image */}
      <img
        src={poster}
        alt={animeTitle}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />

      {/* Dark Scrim Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

      {/* Trash / Bin Remove Button (Top-Right Glass Button) */}
      <button
        type="button"
        onClick={handleRemove}
        disabled={isDeleting}
        aria-label="Remove from continue watching"
        className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md hover:scale-110"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : (
          <Trash2 className="w-4 h-4 text-white" />
        )}
      </button>

      {/* Hover Center Round Play Button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 pointer-events-none">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full brand-gradient text-white flex items-center justify-center shadow-glow scale-90 group-hover:scale-100 transition-transform">
          <Play className="w-6 h-6 fill-current ml-0.5" />
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10 space-y-1">
        {/* Progress Bar (3px accent line) */}
        <div
          className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-2"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            className="h-full brand-gradient transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-white text-sm sm:text-base leading-tight truncate">
          {animeTitle}
        </h3>

        {/* Episode Info & Remaining Time */}
        <p className="text-xs text-white/80 font-sans">
          Episode {episodeNumber} · {minutesLeft} min left
        </p>
      </div>
    </div>
  );
};

export default ContinueWatchingCard;