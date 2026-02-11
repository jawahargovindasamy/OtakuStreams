import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { ArrowRight, ClosedCaption, Mic } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

import { useData } from "@/context/data-provider";
import { useAuth } from "@/context/auth-provider";
import MediaCardPopover from "@/components/MediaCardPopover";

/* -------------------- Skeleton Components -------------------- */

const VerticalListSkeletonItem = () => {
  return (
    <div className="flex items-center gap-3 rounded-xl p-3 bg-card border border-transparent animate-pulse">
      {/* Poster */}
      <Skeleton className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg shrink-0" />

      {/* Text */}
      <div className="flex flex-col flex-1 gap-2 min-w-0">
        <Skeleton className="h-4 sm:h-5 w-3/4 rounded" />
        <Skeleton className="h-3 sm:h-4 w-1/2 rounded" />

        <div className="flex flex-wrap gap-1.5 mt-1">
          <Skeleton className="h-5 sm:h-6 w-12 rounded-md" />
          <Skeleton className="h-5 sm:h-6 w-12 rounded-md" />
          <Skeleton className="h-5 sm:h-6 w-10 rounded-md" />
        </div>
      </div>
    </div>
  );
};

const VerticalListSkeleton = ({ count = 5 }) => {
  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      <Skeleton className="h-7 sm:h-8 w-40 sm:w-48 mb-2" />
      {Array.from({ length: count }).map((_, i) => (
        <VerticalListSkeletonItem key={i} />
      ))}
      <Skeleton className="h-4 w-24 mt-2" />
    </div>
  );
};

/* -------------------- List Item -------------------- */

const VerticalListItem = ({ anime }) => {
  const { language } = useAuth();
  const { fetchanimeinfo, fetchepisodeinfo } = useData();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [open, setOpen] = useState(false);
  const [playlist1, setPlaylist1] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const timerRef = useRef(null);

  const playlist = useMemo(
    () => [
      "Watching",
      "On-Hold",
      "Plan to Watch",
      "Completed",
      "Dropped",
      "Remove",
    ],
    []
  );

  useEffect(() => {
    let mounted = true;

    const loadInfo = async () => {
      try {
        const data = await fetchanimeinfo(anime.id, "n");
        if (mounted) setItem(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadInfo();
    return () => {
      mounted = false;
    };
  }, [anime.id, fetchanimeinfo]);

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => setOpen(true), 400);
  };

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(false), 200);
  };

  const handlePlay = useCallback(
    async (id) => {
      setIsPlaying(true);
      try {
        const data = await fetchepisodeinfo(id);
        navigate(`/watch/${data.data.episodes[0].episodeId}`);
      } catch (err) {
        console.error(err);
        setIsPlaying(false);
      }
    },
    [fetchepisodeinfo, navigate]
  );

  return (
    <MediaCardPopover
      item={item}
      open={open}
      onOpenChange={setOpen}
      timerRef={timerRef}
      handleMouseLeave={handleMouseLeave}
      handlePlay={handlePlay}
      playlist={playlist}
      playlist1={playlist1}
      setPlaylist1={setPlaylist1}
      isPlaying={isPlaying}
      sideOffset={10}
    >
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => navigate(`/${anime.id}`)}
        className="group flex items-center gap-3 cursor-pointer rounded-xl p-2.5 sm:p-3 
                   bg-card hover:bg-accent transition-all duration-300 ease-out
                   border border-transparent hover:border-border/50
                   hover:shadow-lg hover:shadow-primary/5 hover:translate-x-1"
      >
        <div className="relative shrink-0">
          <img
            src={anime.poster}
            alt={language === "EN" ? anime.name : anime.jname}
            className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg object-cover shadow-md 
                       group-hover:shadow-xl transition-shadow duration-300"
            loading="lazy"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 
                          transition-opacity duration-300 rounded-lg flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm 
                            flex items-center justify-center text-foreground">
              <svg className="h-4 w-4 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <h3 className="font-semibold sm:font-bold text-sm sm:text-base leading-tight 
                         text-foreground line-clamp-2 group-hover:text-primary 
                         transition-colors duration-200">
            {language === "EN" ? anime.name : anime.jname}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {anime.episodes?.sub > 0 && (
              <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 
                               px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs 
                               font-semibold text-emerald-600 dark:text-emerald-400 
                               ring-1 ring-emerald-500/20">
                <ClosedCaption className="h-3 w-3" />
                {anime.episodes.sub}
              </span>
            )}

            {anime.episodes?.dub > 0 && (
              <span className="flex items-center gap-1 rounded-md bg-blue-500/10 
                               px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs 
                               font-semibold text-blue-600 dark:text-blue-400 
                               ring-1 ring-blue-500/20">
                <Mic className="h-3 w-3" />
                {anime.episodes.dub}
              </span>
            )}

            {anime.type && (
              <span className="rounded-md bg-secondary px-1.5 py-0.5 sm:px-2 sm:py-1 
                               text-[10px] sm:text-xs font-semibold text-secondary-foreground">
                {anime.type}
              </span>
            )}
          </div>
        </div>
      </div>
    </MediaCardPopover>
  );
};

/* -------------------- Vertical List -------------------- */

const VerticalList = ({ anime = null, list = 5, title = null, link }) => {
  if (!anime || anime.length === 0) {
    return <VerticalListSkeleton count={list} />;
  }

  return (
    <div className="w-full">
      {title && (
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            {title}
          </h2>
          {link && (
            <Link
              to={link}
              className="flex items-center gap-1 text-xs sm:text-sm font-medium 
                         text-primary hover:text-primary/80 transition-colors 
                         group/link"
            >
              View All 
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform 
                                     group-hover/link:translate-x-0.5" />
            </Link>
          )}
        </div>
      )}
      
      <div className="flex flex-col gap-2 sm:gap-3">
        {anime.slice(0, list).map((item) => (
          <VerticalListItem key={item.id} anime={item} />
        ))}
      </div>
      
      {link && !title && (
        <Link
          to={link}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium 
                     text-primary hover:text-primary/80 transition-colors mt-4 
                     group/link px-1 py-2 rounded-lg hover:bg-primary/5"
          
        >
          View All 
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform 
                                 group-hover/link:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
};

export default VerticalList;