import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Bookmark, Heart } from "lucide-react";
import { slugify, getAnimeTitle } from "@/lib/utils";
import { useAuth } from "@/context/auth-provider";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import WatchlistDropdown from "@/components/WatchlistDropdown";

const TrendingSection = ({ animes = [], isLoading = false }) => {
  const navigate = useNavigate();
  const { user, watchlist, addWatchlist, removeWatchlist, language } = useAuth();

  if (isLoading) return <TrendingSkeleton />;
  if (!animes || animes.length === 0) return null;

  // Take top 10 titles (1 lead + 9 mosaic tiles)
  const leadAnime = animes[0];
  const mosaicAnimes = animes.slice(1, 10);

  const getTitle = (item) => getAnimeTitle(item, language);

  const getBannerImage = (item) => {
    if (!item) return "";
    return item.bannerImage || item.poster || item.coverImage?.extraLarge || "";
  };

  const getTileImage = (item) => {
    if (!item) return "";
    return item.coverImage?.extraLarge || item.coverImage?.large || item.poster || item.bannerImage || "";
  };

  const getScore = (item) => {
    if (!item) return null;
    if (item.averageScore) return `${item.averageScore}%`;
    if (item.rating) return item.rating;
    return null;
  };

  const getFormat = (item) => {
    if (!item) return "TV";
    return (item.format || item.type || "TV").replace("_", " ");
  };

  const getYear = (item) => {
    return item?.seasonYear || item?.year || (item?.status ? item.status.replace("_", " ") : "2026");
  };

  const getStudio = (item) => {
    if (item?.studios?.nodes?.[0]?.name) return item.studios.nodes[0].name;
    if (item?.studios?.edges?.[0]?.node?.name) return item.studios.edges[0].node.name;
    return null;
  };

  return (
    <section id="trending" aria-labelledby="trending-title" className="w-full space-y-6">
      {/* Section Header */}
      <div className="space-y-1">
        <div className="text-[11px] font-semibold text-[#0891b2] dark:text-[#22d3ee] uppercase tracking-[0.18em] font-sans">
          Right now
        </div>
        <h2
          id="trending-title"
          className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-foreground tracking-tight"
        >
          Trending now
        </h2>
        <p className="text-sm text-muted-foreground font-sans">
          What the community is watching this hour.
        </p>
      </div>

      {/* Editorial Grid (1 Lead + 9 Mosaic Tiles for Top 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 w-full items-stretch">
        
        {/* Lead Card (#1 Trending - Spans 6 cols on desktop) */}
        {leadAnime && (
          <div className="lg:col-span-6 w-full min-w-0">
            <LeadCard
              item={leadAnime}
              getTitle={getTitle}
              getBannerImage={getBannerImage}
              getScore={getScore}
              getFormat={getFormat}
              getYear={getYear}
              getStudio={getStudio}
              navigate={navigate}
              user={user}
              watchlist={watchlist}
              addWatchlist={addWatchlist}
              removeWatchlist={removeWatchlist}
            />
          </div>
        )}

        {/* Mosaic Tiles (#2–#10) — 9 Cards Grid (Spans 6 cols on desktop) */}
        <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 w-full min-w-0 h-full">
          {mosaicAnimes.map((item, idx) => (
            <MosaicTile
              key={item.id || item._id || idx}
              item={item}
              rank={idx + 2}
              isFullWidthMobile={idx === mosaicAnimes.length - 1}
              getTitle={getTitle}
              getTileImage={getTileImage}
              getScore={getScore}
              getFormat={getFormat}
              getYear={getYear}
              navigate={navigate}
              user={user}
              watchlist={watchlist}
              addWatchlist={addWatchlist}
              removeWatchlist={removeWatchlist}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

const LeadCard = ({
  item,
  getTitle,
  getBannerImage,
  getScore,
  getFormat,
  getYear,
  getStudio,
  navigate,
  user,
  watchlist,
  addWatchlist,
  removeWatchlist,
}) => {
  const animeId = item.id || item._id;
  const title = getTitle(item);
  const bannerImg = getBannerImage(item);
  const bgColor = item.coverImage?.color || "#1e293b";
  const score = getScore(item);
  const format = getFormat(item);
  const year = getYear(item);
  const studio = getStudio(item);
  const metaText = studio ? `${studio} · ${year}` : year;
  const cleanDescription = item.description ? item.description.replace(/<[^>]*>?/gm, "") : "";

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
    navigate(`/${slugify(title)}/${animeId}`);
  };

  const handleWatchNow = (e) => {
    e.stopPropagation();
    navigate(`/watch/${animeId}/1`);
  };

  const toggleWatchlist = async (e) => {
    e.stopPropagation();
    setAnimatingWatchlist(true);
    setTimeout(() => setAnimatingWatchlist(false), 200);

    if (user && addWatchlist) {
      try {
        if (inWatchlist) {
          const itemToRemove = watchlist.find((w) => w.animeId === animeId.toString() || w.animeId === animeId);
          if (itemToRemove) await removeWatchlist(itemToRemove._id);
          toast.success(`Removed ${title} from watchlist`);
        } else {
          await addWatchlist(animeId.toString(), title, item.poster || item.coverImage?.extraLarge, "plan_to_watch");
          toast.success(`Added ${title} to watchlist`);
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
          toast.success(`Removed ${title} from watchlist`);
        } else {
          updated = [...list, { id: animeId, animeId, title, poster: item.poster || item.coverImage?.extraLarge }];
          toast.success(`Added ${title} to watchlist`);
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
    setTimeout(() => setAnimatingFav(false), 200);

    try {
      const list = JSON.parse(localStorage.getItem("otakustreams:favourites") || "[]");
      let updated;
      if (isFavourite) {
        updated = list.filter((i) => i.id !== animeId);
        toast.success(`Removed ${title} from favourites`);
      } else {
        updated = [...list, { id: animeId, title }];
        toast.success(`Added ${title} to favourites`);
      }
      localStorage.setItem("otakustreams:favourites", JSON.stringify(updated));
      setIsFavourite(!isFavourite);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      style={{ backgroundColor: bgColor }}
      className="relative group overflow-hidden rounded-3xl border border-border/60 hover:border-primary/40 bg-card/40 shadow-soft hover:shadow-glow transition-all duration-300 active:scale-[0.995] cursor-pointer h-full min-h-[22rem] lg:min-h-[30rem] w-full min-w-0 flex flex-col justify-end p-5 sm:p-7"
    >
      {/* Cover Art */}
      <img
        src={bannerImg}
        alt=""
        loading="lazy"
        fetchPriority="low"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />

      {/* Scrim Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none transition-all duration-300 group-hover:from-black/95 group-hover:via-black/50" />

      {/* Content Column */}
      <div className="relative z-10 flex flex-col gap-3 pointer-events-none">
        
        {/* Badge Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* #1 Trending Badge */}
          <span className="px-2.5 py-0.5 rounded-full bg-[#0891b2]/20 dark:bg-[#22d3ee]/20 text-[#0891b2] dark:text-[#22d3ee] border border-[#0891b2]/30 dark:border-[#22d3ee]/30 text-[11px] font-sans font-semibold uppercase tracking-[0.04em]">
            #1 Trending
          </span>

          {/* Score Badge */}
          {score && (
            <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[#fbbf24] text-[11px] font-semibold flex items-center gap-1">
              <span className="text-[12px]">★</span> {score}
            </span>
          )}

          {/* Format Badge */}
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-white/80 text-[11px] font-medium">
            {format}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-[36px] text-white leading-[1.05] tracking-tight line-clamp-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
          {title}
        </h3>

        {/* Synopsis (Strictly clamped to 2-3 lines max) */}
        {cleanDescription && (
          <p className="hidden min-[380px]:line-clamp-2 sm:line-clamp-3 text-sm text-white/75 font-sans leading-[1.45] max-w-[36rem] overflow-hidden text-ellipsis">
            {cleanDescription}
          </p>
        )}

        {/* Meta Line */}
        <p className="text-xs text-white/60 font-sans font-normal">
          {metaText}
        </p>

        {/* Action Row */}
        <div className="flex items-center gap-2 pt-1 z-20 pointer-events-auto">
          {/* Watch Now CTA */}
          <button
            type="button"
            onClick={handleWatchNow}
            className="h-9 px-4 rounded-full brand-gradient text-white font-sans font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-glow hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Watch now</span>
          </button>

          {/* Watchlist Dropdown */}
          <WatchlistDropdown
            animeId={animeId}
            animeTitle={title}
            animeImage={bannerImg || item.poster}
            align="start"
            side="top"
          >
            <button
              type="button"
              aria-pressed={inWatchlist}
              aria-label={`Watchlist options for ${title}`}
              className={`w-9 h-9 min-w-[36px] min-h-[36px] rounded-full border flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
                animatingWatchlist ? "scale-115" : "scale-100"
              } ${
                inWatchlist
                  ? "bg-background/90 border-primary text-primary"
                  : "bg-background/70 border-white/15 text-foreground hover:bg-background hover:border-white/30"
              }`}
            >
              {inWatchlist ? (
                <Bookmark className="w-4 h-4 fill-current text-primary" />
              ) : (
                <Bookmark className="w-4 h-4 text-foreground" />
              )}
            </button>
          </WatchlistDropdown>

          {/* Favorite Heart Icon Toggle */}
          <button
            type="button"
            onClick={toggleFavourite}
            aria-pressed={isFavourite}
            aria-label={`Favorite ${title}`}
            className={`w-9 h-9 min-w-[36px] min-h-[36px] rounded-full border flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
              animatingFav ? "scale-115" : "scale-100"
            } ${
              isFavourite
                ? "bg-background/90 border-destructive text-destructive"
                : "bg-background/70 border-white/15 text-foreground hover:bg-background hover:border-white/30"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavourite ? "fill-current text-destructive" : "text-foreground"}`} />
          </button>
        </div>

      </div>
    </div>
  );
};

const MosaicTile = ({
  item,
  rank,
  isFullWidthMobile = false,
  getTitle,
  getTileImage,
  getScore,
  getFormat,
  getYear,
  navigate,
  user,
  watchlist,
  addWatchlist,
  removeWatchlist,
}) => {
  const animeId = item.id || item._id;
  const title = getTitle(item);
  const tileImg = getTileImage(item);
  const bgColor = item.coverImage?.color || "#1e293b";
  const score = getScore(item);
  const format = getFormat(item);
  const year = getYear(item);

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

  const toggleWatchlist = async (e) => {
    e.stopPropagation();
    setAnimatingWatchlist(true);
    setTimeout(() => setAnimatingWatchlist(false), 200);

    if (user && addWatchlist) {
      try {
        if (inWatchlist) {
          const itemToRemove = watchlist.find((w) => w.animeId === animeId.toString() || w.animeId === animeId);
          if (itemToRemove) await removeWatchlist(itemToRemove._id);
          toast.success(`Removed ${title} from watchlist`);
        } else {
          await addWatchlist(animeId.toString(), title, item.poster || item.coverImage?.extraLarge, "plan_to_watch");
          toast.success(`Added ${title} to watchlist`);
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
          toast.success(`Removed ${title} from watchlist`);
        } else {
          updated = [...list, { id: animeId, animeId, title, poster: item.poster || item.coverImage?.extraLarge }];
          toast.success(`Added ${title} to watchlist`);
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
    setTimeout(() => setAnimatingFav(false), 200);

    try {
      const list = JSON.parse(localStorage.getItem("otakustreams:favourites") || "[]");
      let updated;
      if (isFavourite) {
        updated = list.filter((i) => i.id !== animeId);
        toast.success(`Removed ${title} from favourites`);
      } else {
        updated = [...list, { id: animeId, title }];
        toast.success(`Added ${title} to favourites`);
      }
      localStorage.setItem("otakustreams:favourites", JSON.stringify(updated));
      setIsFavourite(!isFavourite);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      onClick={() => navigate(`/${slugify(title)}/${animeId}`)}
      style={{ backgroundColor: bgColor }}
      className={`relative group overflow-hidden rounded-3xl border border-border/60 hover:border-primary/40 bg-card/40 shadow-soft hover:shadow-lift transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer w-full min-w-0 h-full min-h-[11rem] flex flex-col justify-end p-4 focus-within:ring-2 focus-within:ring-primary ${
        isFullWidthMobile ? "col-span-2 sm:col-span-1" : ""
      }`}
    >
      {/* Cover Image */}
      <img
        src={tileImg}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />

      {/* Scrim Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />

      {/* Bottom Content Container */}
      <div className="relative z-10 space-y-1.5">
        
        {/* Badge Row (Directly above title): Rank Pill (#2...#10) + Score Badge + Format Badge */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Rank Pill */}
          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold font-sans">
            #{rank}
          </span>

          {/* Score Badge */}
          {score && (
            <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[#fbbf24] text-[10px] sm:text-[11px] font-semibold flex items-center gap-0.5">
              <span className="text-[11px]">★</span> {score}
            </span>
          )}

          {/* Format Badge */}
          <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-white/80 text-[10px] sm:text-[11px] font-medium">
            {format}
          </span>
        </div>

        {/* Title */}
        <h4 className="font-display font-bold text-white text-xs sm:text-sm leading-[1.2] line-clamp-2">
          {title}
        </h4>

        {/* Sub-line */}
        <p className="text-[11px] text-white/60 font-sans">
          {format} · {year}
        </p>

        {/* Hover/Focus-within Action Buttons */}
        <div className="flex items-center gap-1.5 pt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 media-hover-none:opacity-100">
          <button
            type="button"
            onClick={toggleWatchlist}
            aria-pressed={inWatchlist}
            aria-label={`Bookmark ${title}`}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
              animatingWatchlist ? "scale-115" : "scale-100"
            } ${
              inWatchlist
                ? "bg-background/90 border-primary text-primary"
                : "bg-background/70 border-white/15 text-foreground hover:bg-background hover:border-white/30"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${inWatchlist ? "fill-current text-primary" : "text-foreground"}`} />
          </button>
          <button
            type="button"
            onClick={toggleFavourite}
            aria-pressed={isFavourite}
            aria-label={`Favorite ${title}`}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
              animatingFav ? "scale-115" : "scale-100"
            } ${
              isFavourite
                ? "bg-background/90 border-destructive text-destructive"
                : "bg-background/70 border-white/15 text-foreground hover:bg-background hover:border-white/30"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavourite ? "fill-current text-destructive" : "text-foreground"}`} />
          </button>
        </div>

      </div>
    </div>
  );
};

const TrendingSkeleton = () => {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">
        <Skeleton className="lg:col-span-6 rounded-3xl min-h-[22rem] lg:min-h-[30rem] w-full" />
        <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton
              key={i}
              className={`rounded-3xl min-h-[11rem] w-full ${
                i === 8 ? "col-span-2 sm:col-span-1" : ""
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingSection;
