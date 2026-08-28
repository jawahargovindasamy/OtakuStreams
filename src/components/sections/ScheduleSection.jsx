import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { slugify } from "@/lib/utils";
import { useData } from "@/context/data-provider";

// Helper: Format timestamp to 12-hour AM/PM time (e.g. 1:30 PM)
const formatLocaleTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
};

// Helper: Format countdown seconds to compact string with 'to air' (e.g. 5d 16h to air)
const formatCountdownPill = (seconds) => {
  if (seconds === undefined || seconds === null) return "";
  if (seconds <= 0) return "Aired";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h to air`;
  }
  if (hours > 0) {
    return `${hours}h ${mins}m to air`;
  }
  return `${Math.max(1, mins)}m to air`;
};

const ScheduleSection = () => {
  const { fetchestimatedschedules } = useData();

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [scheduleDays, setScheduleDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globallySoonestId, setGloballySoonestId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load7DaySchedule = async () => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const startDateStr = `${yyyy}-${mm}-${dd}`;

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      try {
        // 1 Single API Call for the entire 7-day week schedule!
        const res = await fetchestimatedschedules(startDateStr, 7);
        const allItems = res?.scheduledAnimes || [];

        // Build 7 day buckets
        const dayBuckets = Array.from({ length: 7 }).map((_, i) => {
          const dayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, 0, 0, 0, 0);
          const startTs = Math.floor(dayDate.getTime() / 1000);
          const endTs = startTs + 86400;
          return {
            index: i,
            dayName: dayNames[dayDate.getDay()],
            relativeLabel: i === 0 ? "TODAY" : i === 1 ? "TOMORROW" : "\u00A0",
            startTs,
            endTs,
            count: 0,
            items: []
          };
        });

        // Group items into respective day buckets locally
        allItems.forEach((item) => {
          const airTs = item.airingAt || 0;
          const targetBucket = dayBuckets.find(b => airTs >= b.startTs && airTs < b.endTs);
          if (targetBucket) {
            targetBucket.items.push(item);
          }
        });

        dayBuckets.forEach((b) => {
          b.count = b.items.length;
          b.items.sort((a, b) => {
            const timeDiff = (a.airingAt || 0) - (b.airingAt || 0);
            if (timeDiff !== 0) return timeDiff;
            const popA = a.popularity ?? a.rawMedia?.popularity ?? 0;
            const popB = b.popularity ?? b.rawMedia?.popularity ?? 0;
            return popB - popA;
          });
        });

        // Find globally soonest airing ID
        let soonest = null;
        let minTime = Infinity;
        const currentNowSec = Math.floor(Date.now() / 1000);
        allItems.forEach((s) => {
          const t = (s.airingAt || 0) - currentNowSec;
          if (t > 0 && t < minTime) {
            minTime = t;
            soonest = s.airingId || (s.episode ? `${s.id}-${s.episode}` : s.id);
          }
        });

        if (isMounted) {
          setScheduleDays(dayBuckets);
          setGloballySoonestId(soonest);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch 7-day schedule via fetchestimatedschedules:", err);
        if (isMounted) setIsLoading(false);
      }
    };

    load7DaySchedule();

    return () => {
      isMounted = false;
    };
  }, [fetchestimatedschedules]);

  if (isLoading) return <ScheduleSkeleton />;

  const activeDay = scheduleDays[activeDayIndex] || scheduleDays[0] || { items: [] };
  const dayItems = activeDay.items || [];

  const nowSec = Math.floor(Date.now() / 1000);
  const isToday = nowSec >= (activeDay.startTs || 0) && nowSec < (activeDay.endTs || 0);

  let spotlightItem = dayItems[0];
  if (isToday) {
    const nextUpcoming = dayItems.find((item) => (item.airingAt || 0) > nowSec);
    if (nextUpcoming) {
      spotlightItem = nextUpcoming;
    }
  }

  const spotlightKey = spotlightItem?.airingId || (spotlightItem ? `${spotlightItem.id}-${spotlightItem.episode}` : null);
  const timelineItems = dayItems.filter((item) => (item.airingId || `${item.id}-${item.episode}`) !== spotlightKey);

  return (
    <section id="schedule" aria-labelledby="schedule-title" className="w-full space-y-5 sm:space-y-6">
      {/* Section Header */}
      <div className="space-y-1">
        <div className="text-[11px] font-semibold text-primary uppercase tracking-[0.22em] font-sans">
          BROADCAST BOARD
        </div>
        <h2
          id="schedule-title"
          className="text-2xl sm:text-3xl lg:text-[2rem] font-display font-bold text-foreground tracking-tight"
        >
          Airing schedule
        </h2>
        <p className="text-sm text-muted-foreground font-sans max-w-2xl">
          Pick a day and see exactly what drops, in order, with live countdowns.
        </p>
      </div>

      {/* Single Instrument Panel Surface */}
      <div className="w-full rounded-3xl border border-border/70 bg-card/40 overflow-hidden shadow-soft flex flex-col">
        {/* Day Rail (Tabs) */}
        <div
          role="tablist"
          aria-label="Days of the week"
          className="flex gap-2.5 overflow-x-auto p-3 bg-muted/30 border-b border-border/70 no-scrollbar"
        >
          {scheduleDays.map((day, idx) => {
            const isSelected = activeDayIndex === idx;
            return (
              <button
                key={idx}
                role="tab"
                type="button"
                aria-selected={isSelected}
                onClick={() => setActiveDayIndex(idx)}
                className={`min-w-[96px] px-4 py-2.5 rounded-2xl flex flex-col items-start transition-all duration-200 cursor-pointer text-left ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                {/* Relative Eyebrow (TODAY / TOMORROW / &nbsp;) */}
                <span className="text-[10px] font-semibold tracking-[0.18em] uppercase opacity-80 leading-none">
                  {day.relativeLabel}
                </span>

                {/* Day Name */}
                <span className="font-display font-bold text-lg leading-tight my-0.5">
                  {day.dayName}
                </span>

                {/* Airing Count */}
                <span className="text-xs font-sans opacity-80 leading-none">
                  {day.count} airing
                </span>
              </button>
            );
          })}
        </div>

        {/* Panel Body (Spotlight Left + Timeline Right) */}
        {dayItems.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <h3 className="font-display font-bold text-lg text-foreground">
              Nothing scheduled for this day
            </h3>
            <p className="text-sm text-muted-foreground font-sans max-w-md mx-auto">
              Try another day — new episodes are added as broadcasters confirm them.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] w-full items-start">
            {/* Spotlight Card (Left Column) */}
            {spotlightItem && (
              <div className="w-full lg:sticky lg:top-24">
                <SpotlightCard
                  item={spotlightItem}
                  isGloballySoonest={(spotlightItem.airingId || (spotlightItem.episode ? `${spotlightItem.id}-${spotlightItem.episode}` : spotlightItem.id)) === globallySoonestId}
                />
              </div>
            )}

            {/* Timeline List (Right Column - All Scheduled Items) */}
            <div className="w-full border-t lg:border-t-0 lg:border-l border-border/70 max-h-[34rem] overflow-y-auto no-scrollbar">
              <ol className="divide-y divide-border/70 w-full list-none p-0 m-0">
                {timelineItems.map((item, idx) => (
                  <TimelineRow key={item.airingId || `${item.id}-${item.episode || idx}`} item={item} />
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// Spotlight Card Component for Day's Earliest Drop
const SpotlightCard = ({ item, isGloballySoonest }) => {
  const navigate = useNavigate();
  const media = item.media || item.rawMedia || item;
  const animeId = media?.id || media?.idMal || item.id;
  const title =
    media?.title?.english ||
    media?.title?.romaji ||
    media?.title?.native ||
    item.name ||
    item.jname ||
    "Anime Title";

  const banner =
    media?.bannerImage ||
    item.bannerImage ||
    media?.coverImage?.extraLarge ||
    media?.coverImage?.large ||
    item.poster;
  const bgColor = media?.coverImage?.color || item.coverImage?.color || "var(--card)";

  // Airing Time
  const airingAt = item.airingAt || item.airingTimestamp || media?.nextAiringEpisode?.airingAt;
  const airTimeStr = formatLocaleTime(airingAt);

  // Time Until Airing Seconds
  const nowSec = Math.floor(Date.now() / 1000);
  const seconds = airingAt ? airingAt - nowSec : 0;

  const countdownStr = formatCountdownPill(seconds);

  // Status Chip Label based on airing time (Up next if future, Aired if past)
  const statusChipLabel = seconds > 0 ? "Up next" : "Aired";

  // Studio Name
  const studioName =
    media?.studios?.nodes?.[0]?.name ||
    item.studio ||
    "";

  // Episode Number
  const episodeNumber = item.episode || (item.episodes ? item.episodes.sub : "?");

  // Synopsis
  const rawDesc = media?.description || item.description || "";
  const descriptionText = rawDesc ? rawDesc.replace(/<[^>]*>?/gm, "").trim() : "";

  const handleTileClick = () => {
    navigate(`/${slugify(title)}/${animeId}`);
  };

  return (
    <button
      type="button"
      onClick={handleTileClick}
      aria-label={`Open ${title}`}
      className="relative group w-full min-h-[20rem] lg:min-h-[34rem] flex flex-col justify-end p-6 sm:p-8 text-left overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{ backgroundColor: bgColor }}
    >
      {/* Artwork Layer */}
      {banner && (
        <img
          src={banner}
          alt={`${title} banner`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      )}

      {/* Inset Gradient Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/10 pointer-events-none z-10" />

      {/* Information Content (Bottom-Anchored) */}
      <div className="relative z-20 space-y-3.5 max-w-xl pointer-events-none">
        {/* Chip Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Chip (Dynamic Based on Time) */}
          <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-xs font-semibold">
            {statusChipLabel}
          </span>

          {/* Episode Badge */}
          <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-xs font-semibold">
            Ep {episodeNumber}
          </span>

          {/* Air Time Badge */}
          {airTimeStr && (
            <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-xs font-semibold font-mono">
              {airTimeStr}
            </span>
          )}
        </div>

        {/* Title (H3) */}
        <h3 className="font-display font-bold text-2xl sm:text-3xl lg:text-[2rem] text-white leading-snug tracking-tight">
          {title}
        </h3>

        {/* Synopsis */}
        {descriptionText && (
          <p className="text-sm text-white/80 font-sans line-clamp-2 leading-relaxed">
            {descriptionText}
          </p>
        )}

        {/* Bottom Info Pill Row (Countdown & Studio) */}
        <div className="flex items-center gap-3.5 pt-1">
          {countdownStr && (
            <span className="rounded-full bg-white/15 backdrop-blur-md font-mono text-sm text-white/90 px-4 py-2 tracking-wider">
              {countdownStr}
            </span>
          )}
          {studioName && (
            <span className="text-xs sm:text-sm text-white/90 font-medium font-sans">
              {studioName}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// Timeline Row Component for Subsequent Airings
const TimelineRow = ({ item }) => {
  const navigate = useNavigate();
  const media = item.media || item.rawMedia || item;
  const animeId = media?.id || media?.idMal || item.id;
  const title =
    media?.title?.english ||
    media?.title?.romaji ||
    media?.title?.native ||
    item.name ||
    item.jname ||
    "Anime Title";

  const poster =
    media?.coverImage?.large ||
    media?.coverImage?.extraLarge ||
    item.poster ||
    item.coverImage?.large;
  const bgColor = media?.coverImage?.color || item.coverImage?.color || "var(--card)";
  
  const airingAt = item.airingAt || item.airingTimestamp || media?.nextAiringEpisode?.airingAt;
  const airTimeStr = formatLocaleTime(airingAt);

  const nowSec = Math.floor(Date.now() / 1000);
  const seconds = airingAt ? airingAt - nowSec : 0;
  const countdownStr = formatCountdownPill(seconds);

  const format = (media?.format || item.type || "TV").replace("_", " ");
  const studioName = media?.studios?.nodes?.[0]?.name || item.studio || "";
  const episodeNumber = item.episode || (item.episodes ? item.episodes.sub : "?");

  // Meta line: Ep 18 · TV · MADHOUSE
  const metaText = [
    `Ep ${episodeNumber}`,
    format,
    studioName,
  ]
    .filter(Boolean)
    .join(" · ");

  const handleRowClick = () => {
    navigate(`/${slugify(title)}/${animeId}`);
  };

  return (
    <li
      onClick={handleRowClick}
      className="grid grid-cols-[4.5rem_2.75rem_minmax(0,1fr)_auto] gap-3.5 items-center px-4 py-3.5 sm:px-5 hover:bg-white/[0.04] transition-colors duration-200 cursor-pointer group w-full"
    >
      {/* Col 1: Air Time (Mono Tabular Numbers in Primary Accent) */}
      <span className="font-mono text-sm sm:text-base font-semibold text-primary tracking-tight">
        {airTimeStr}
      </span>

      {/* Col 2: Thumbnail */}
      <div
        style={{ backgroundColor: bgColor }}
        className="w-11 h-[3.75rem] rounded-xl overflow-hidden shrink-0 relative bg-muted shadow-sm"
      >
        <img
          src={poster}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Col 3: Text Block (Title & Meta) */}
      <div className="min-w-0 space-y-0.5">
        <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground truncate font-sans">
          {metaText}
        </p>
      </div>

      {/* Col 4: Countdown Pill (Remaining Time to Air) */}
      {countdownStr && (
        <span className="border border-border/70 group-hover:border-primary/50 px-3 py-1 rounded-full font-mono text-xs text-muted-foreground shrink-0 transition-colors">
          {countdownStr}
        </span>
      )}
    </li>
  );
};

const ScheduleSkeleton = () => {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-[26rem] w-full rounded-3xl" />
    </div>
  );
};

export default ScheduleSection;
