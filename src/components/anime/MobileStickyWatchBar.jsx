import React from "react";
import { Play } from "lucide-react";

const MobileStickyWatchBar = ({ anime, onWatchClick, show, progress }) => {
  if (!show) return null;

  const title =
    typeof anime?.title === "object"
      ? anime.title.english || anime.title.romaji || anime.title.native
      : anime?.name || anime?.jname || anime?.title || "Anime Title";

  const rawFormat =
    anime?.format ||
    anime?.type ||
    anime?.stats?.type ||
    anime?.info?.stats?.type ||
    "TV";
  const format = String(rawFormat).replace(/_/g, " ").toUpperCase();
  const watchButtonLabel = progress
    ? `Ep ${progress.currentEpisode}`
    : format === "MOVIE"
    ? "Watch Movie"
    : "Watch Ep 1";

  return (
    <div className="lg:hidden fixed bottom-[68px] left-3 right-3 z-40 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-card/90 backdrop-blur-md border border-border/80 rounded-xl p-3 flex items-center justify-between gap-3 shadow-lg">
        {/* Left: Title & Subtitle */}
        <div className="min-w-0 text-left">
          <h4 className="text-sm font-bold text-foreground truncate font-display">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground truncate font-sans">
            Ready to watch
          </p>
        </div>

        {/* Right: Watch Action Button */}
        <button
          type="button"
          onClick={onWatchClick}
          className="min-h-10 px-5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-glow flex items-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-95"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{watchButtonLabel}</span>
        </button>
      </div>
    </div>
  );
};

export default MobileStickyWatchBar;
