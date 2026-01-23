import React, { useCallback, useRef, useState, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Check,
  ClosedCaption,
  Mic,
  Play,
  Plus,
  Star,
} from "lucide-react";
import { Button } from "./ui/button";
import { useData } from "@/context/data-provider";
import { useNavigate } from "react-router-dom";

const MediaCard = () => {
  const { fetchepisodeinfo } = useData();
  const navigate = useNavigate();

  const timerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [playlist1, setPlaylist1] = useState(null);

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

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => setOpen(true), 250);
  };

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(false), 150);
  };

  const handlePlay = useCallback(
    async (id) => {
      const data = await fetchepisodeinfo(id);
      navigate(`/watch/${data.data.episodes[0].episodeId}`);
    },
    [fetchepisodeinfo, navigate]
  );

  const item = {
    info: {
      id: "jujutsu-kaisen-the-culling-game-part-1-20401",
      name: "Jujutsu Kaisen: The Culling Game Part 1",
      poster:
        "https://cdn.noitatnemucod.net/thumbnail/300x400/100/a1c21d8b67b4a99bc693f26bf8fcd2e5.jpg",
      description:
        "The third season of Jujutsu Kaisen.\n\nAfter the Shibuya Incident, a deadly jujutsu battle known as the Culling Game erupts across Japan.",
      stats: {
        quality: "HD",
        episodes: { sub: 4, dub: 2 },
        type: "TV",
      },
    },
    moreInfo: {
      japanese: "呪術廻戦 「死滅回游 前編」",
      synonyms: "Jujutsu Kaisen 3rd Season",
      aired: "Jan 9, 2026 to ?",
      status: "Currently Airing",
      malscore: "?",
      genres: ["Action", "Drama", "School", "Shounen", "Supernatural"],
    },
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <img
          src={item.info.poster}
          alt={item.info.name}
          className="h-60 cursor-pointer rounded-lg"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={-20}
        className="w-75 rounded-2xl border-none bg-[#3b3b4f]/95 p-4 text-white shadow-2xl backdrop-blur"
        onMouseEnter={() => clearTimeout(timerRef.current)}
        onMouseLeave={handleMouseLeave}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <h3 className="font-bold leading-tight">{item.info.name}</h3>

        <div className="mt-2 flex items-center gap-1 text-sm text-gray-300">
          <div className="flex items-center gap-1 mr-2">
            <Star className="h-4 w-4 text-[#ffc107]" />
            <span>
              {item.moreInfo.malscore === "?"
                ? "N/A"
                : item.moreInfo.malscore}
            </span>
          </div>

          <span className="rounded bg-[#ffbade] px-2 py-0.5 text-xs font-semibold text-black">
            {item.info.stats.quality}
          </span>

          <span className="flex items-center gap-1 rounded bg-[#b0e3af] px-2 py-0.5 text-xs font-semibold text-black">
            <ClosedCaption className="h-4 w-4" />
            {item.info.stats.episodes.sub}
          </span>

          <span className="flex items-center gap-1 rounded bg-[#b9e7ff] px-2 py-0.5 text-xs font-semibold text-black">
            <Mic className="h-4 w-4" />
            {item.info.stats.episodes.dub}
          </span>

          <span className="rounded bg-[#ffbade] px-2 py-0.5 text-xs font-semibold text-black">
            {item.info.stats.type}
          </span>
        </div>

        <p className="mt-3 line-clamp-3 text-sm text-gray-200">
          {item.info.description}
        </p>

        <div className="mt-3 space-y-1 text-xs text-gray-300">
          <p>
            <span className="opacity-60">Japanese:</span>{" "}
            {item.moreInfo.japanese}
          </p>
          <p>
            <span className="opacity-60">Synonyms:</span>{" "}
            {item.moreInfo.synonyms}
          </p>
          <p>
            <span className="opacity-60">Aired:</span> {item.moreInfo.aired}
          </p>
          <p>
            <span className="opacity-60">Status:</span>{" "}
            {item.moreInfo.status}
          </p>
          <p>
            <span className="opacity-60">Genres:</span>{" "}
            {item.moreInfo.genres.join(", ")}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          <Button
            onClick={() => handlePlay(item.info.id)}
            className="flex w-[85%] items-center justify-center gap-2 rounded-full bg-[#ffbade] px-4 py-2 font-semibold text-black hover:bg-[#f89abf]"
          >
            <Play className="h-4 w-4" />
            Watch now
          </Button>

          <Popover modal={false}>
            <PopoverTrigger asChild>
              <div className="cursor-pointer rounded-full bg-white p-1.5 text-black">
                {playlist1 === null ? (
                  <Plus className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </div>
            </PopoverTrigger>

            <PopoverContent
              side="left"
              align="start"
              className="w-40 border border-black bg-white p-2 text-black shadow-2xl"
            >
              {playlist.map((i) => (
                <Button
                  key={i}
                  className="flex w-full items-center justify-between bg-transparent text-black hover:bg-amber-200"
                  onClick={() => setPlaylist1(i)}
                >
                  {i}
                  {playlist1 === i && <Check className="h-4 w-4" />}
                </Button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MediaCard;
