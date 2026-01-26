import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { ClosedCaption, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/data-provider";
import MediaCardPopover from "@/components/MediaCardPopover";
import { useAuth } from "@/context/auth-provider";

const VerticalListItem = ({ anime }) => {

  // console.log(anime);
  
  const {language} = useAuth();
  const { fetchanimeinfo, fetchepisodeinfo } = useData();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const [playlist1, setPlaylist1] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
      const data = await fetchanimeinfo(anime.id);
      if (mounted) setItem(data);
    };

    loadInfo();
    return () => (mounted = false);
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
        className="flex items-center gap-3 cursor-pointer rounded-lg p-1 hover:bg-white/5 transition w-full"
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

            <span className="rounded bg-[#ffbade] px-2 py-0.5 font-semibold text-black">
              {anime.type}
            </span>
          </div>
        </div>
      </div>
    </MediaCardPopover >
  );
};

const VerticalList = ({ anime = [], list = 5 }) => {
  return (
    <div className="flex flex-col gap-3 w-1/4">
      {anime.slice(0, list).map((item) => (
        <VerticalListItem key={item.id} anime={item} />
      ))}
    </div>
  );
};

export default VerticalList;
