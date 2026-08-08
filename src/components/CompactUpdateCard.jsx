import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { slugify } from "@/lib/utils";

const CompactUpdateCard = ({ anime }) => {
  const navigate = useNavigate();

  const title =
    typeof anime?.title === "object"
      ? anime.title.english || anime.title.romaji || anime.title.native
      : anime?.name || anime?.jname || anime?.title || "Anime Title";

  const animeId = anime?.id || anime?.idMal || anime?._id;
  const poster =
    anime?.coverImage?.large ||
    anime?.coverImage?.extraLarge ||
    anime?.poster ||
    anime?.bannerImage;
  const bgColor = anime?.coverImage?.color || "var(--card)";
  const format = (anime?.format || anime?.type || "TV").replace("_", " ");

  // Helper to extract numeric episode from number, string, or object ({ sub: N, dub: M })
  const extractEpisodeNum = (val) => {
    if (val === null || val === undefined) return null;
    if (typeof val === "number" || typeof val === "string") return val;
    if (typeof val === "object") {
      return val.sub || val.dub || val.current || val.latest || null;
    }
    return null;
  };

  // Episode Copy Calculation
  const epFromNext = anime?.nextAiringEpisode?.episode && anime.nextAiringEpisode.episode > 1
    ? anime.nextAiringEpisode.episode - 1
    : null;
  const epFromSingle = extractEpisodeNum(anime?.episode);
  const epFromPlural = extractEpisodeNum(anime?.episodes);

  const epNum = epFromNext || epFromSingle || epFromPlural;
  const updateCopy = epNum ? `Episode ${epNum} · ${format}` : `Now available · ${format}`;

  // Freshness calculation (within 24 hours / 86400 seconds)
  const nowSec = Math.floor(Date.now() / 1000);
  const updatedAtSec = anime?.updatedAt || 0;
  const isFresh = updatedAtSec > 0 && nowSec - updatedAtSec < 86400;

  const handleClick = () => {
    navigate(`/${slugify(title)}/${animeId}`);
  };

  return (
    <li className="list-none w-full">
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Open ${title}, ${updateCopy}`}
        className="grid grid-cols-[44px_minmax(0,1fr)_auto] gap-3 items-center p-2 sm:p-2.5 min-h-[68px] sm:min-h-[72px] rounded-xl border border-transparent hover:border-primary/25 hover:bg-muted/40 transition-colors duration-200 cursor-pointer group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary w-full"
      >
        {/* Col 1: Poster Thumbnail (Static Artwork, 44px 2:3) */}
        <div
          style={{ backgroundColor: bgColor }}
          className="w-11 aspect-[2/3] rounded-lg overflow-hidden shrink-0 relative bg-muted shadow-sm"
        >
          <img
            src={poster}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Col 2: Title & Episode Info */}
        <div className="min-w-0 space-y-0.5">
          <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors font-display">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground truncate font-sans">
            {updateCopy}
          </p>
        </div>

        {/* Col 3: Freshness Badge & Trailing Affordance */}
        <div className="flex items-center gap-2 shrink-0">
          {isFresh && (
            <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[10px] font-bold uppercase tracking-wider">
              NEW
            </span>
          )}

          {/* Desktop Hover Watch Label + Trailing Chevron */}
          <div className="flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
            <span className="hidden group-hover:inline-block text-xs font-semibold text-primary transition-all">
              Watch
            </span>
            <ChevronRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
          </div>
        </div>
      </button>
    </li>
  );
};

export default CompactUpdateCard;
