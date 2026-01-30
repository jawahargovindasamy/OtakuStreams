import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { ArrowRight, ClosedCaption, Mic } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useData } from "@/context/data-provider";
import { useAuth } from "@/context/auth-provider";
import MediaCardPopover from "@/components/MediaCardPopover";

/* -------------------- Skeleton Components -------------------- */

const VerticalListSkeletonItem = () => {
  return (
    <div className="flex items-center gap-3 rounded-lg p-2 w-75 bg-[#0f172a] animate-pulse">
      {/* Poster */}
      <div className="w-14 h-20 rounded bg-slate-700" />

      {/* Text */}
      <div className="flex flex-col flex-1 gap-2">
        <div className="h-4 w-3/4 rounded bg-slate-700" />
        <div className="h-4 w-1/2 rounded bg-slate-700" />

        <div className="flex gap-2 mt-1">
          <div className="h-5 w-12 rounded bg-slate-600" />
          <div className="h-5 w-12 rounded bg-slate-600" />
          <div className="h-5 w-10 rounded bg-slate-600" />
        </div>
      </div>
    </div>
  );
};

const VerticalListSkeleton = ({ count = 5 }) => {
  return (
    <div className="flex flex-col gap-3 w-1/4">
      {Array.from({ length: count }).map((_, i) => (
        <VerticalListSkeletonItem key={i} />
      ))}
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
        const data = await fetchanimeinfo(anime.id);
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
    timerRef.current = setTimeout(() => setOpen(true), 250);
  };

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(false), 150);
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
      sideOffset={-10}
    >
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => navigate(`/${anime.id}`)}
        className="flex items-center gap-3 cursor-pointer rounded-lg p-2 hover:bg-[#16213a] transition w-75 bg-[#0f172a]"
      >
        <img
          src={anime.poster}
          alt={language === "EN" ? anime.name : anime.jname}
          className="w-14 h-20 rounded object-cover"
        />

        <div className="flex flex-col">
          <h3 className="font-bold leading-tight text-white line-clamp-2">
            {language === "EN" ? anime.name : anime.jname}
          </h3>

          <div className="mt-2 flex items-center gap-1 text-xs text-gray-300">
            <span className="flex items-center gap-1 rounded bg-[#b0e3af] px-2 py-0.5 font-semibold text-black">
              <ClosedCaption className="h-3 w-3" />
              {anime.episodes.sub}
            </span>

            {anime.episodes.dub && (
              <span className="flex items-center gap-1 rounded bg-[#b9e7ff] px-2 py-0.5 font-semibold text-black">
                <Mic className="h-3 w-3" />
                {anime.episodes.dub}
              </span>
            )}

            {anime.type &&
              <span className="rounded bg-[#ffbade] px-2 py-0.5 font-semibold text-black">
                {anime.type}
              </span>
            }

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
    <div>
      {title && <h2 className="text-lg font-bold dark:text-white text-gray-900 mb-3">{title}</h2>}
      <div className="flex flex-col gap-3 w-1/4">
        {anime.slice(0, list).map((item) => (
          <VerticalListItem key={item.id} anime={item} />
        ))}
      </div>
      {
        link && (
          <Link
            to={link}
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline mt-3"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        )
      }
    </div>

  );
};

export default VerticalList;
