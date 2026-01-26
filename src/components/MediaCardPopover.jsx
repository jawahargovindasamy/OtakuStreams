import React from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner"
import {
    Check,
    ClosedCaption,
    Mic,
    Play,
    Plus,
    Star,
} from "lucide-react";
import { Button } from "./ui/button";

const MediaCardPopover = ({
    item,
    open,
    onOpenChange,
    timerRef,
    handleMouseLeave,
    handlePlay,
    playlist,
    playlist1,
    setPlaylist1,
    children,
    isPlaying,
    sideOffset = -50
}) => {
    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>

            <PopoverContent
                align="start"
                sideOffset={sideOffset}
                className="w-75 rounded-2xl border border-[#2d3748]/30 bg-[#0f172a]/95 dark:bg-[#0f172a]/95 p-4 text-white shadow-2xl backdrop-blur-md"
                onMouseEnter={() => clearTimeout(timerRef.current)}
                onMouseLeave={handleMouseLeave}
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <h3 className="font-bold leading-tight text-white">{item?.info.name}</h3>

                <div className="mt-2 flex items-center gap-1 text-sm text-gray-300">
                    <div className="flex items-center gap-1 mr-2">
                        <Star className="h-4 w-4 text-[#ffc107] fill-[#ffc107]" />
                        <span>
                            {item?.moreInfo.malscore === "?"
                                ? "N/A"
                                : item?.moreInfo.malscore}
                        </span>
                    </div>

                    <span className="rounded bg-[#ffbade] px-2 py-0.5 text-xs font-semibold text-black">
                        {item?.info.stats.quality}
                    </span>

                    <span className="flex items-center gap-1 rounded bg-[#b0e3af] px-2 py-0.5 text-xs font-semibold text-black">
                        <ClosedCaption className="h-4 w-4" />
                        {item?.info.stats.episodes.sub}
                    </span>

                    {item?.info.stats.episodes.dub && (
                        <span className="flex items-center gap-1 rounded bg-[#b9e7ff] px-2 py-0.5 text-xs font-semibold text-black">
                            <Mic className="h-4 w-4" />
                            {item?.info.stats.episodes.dub}
                        </span>
                    )}

                    <span className="rounded bg-[#ffbade] px-2 py-0.5 text-xs font-semibold text-black">
                        {item?.info.stats.type}
                    </span>
                </div>

                <p className="mt-3 line-clamp-3 text-sm text-gray-200">
                    {item?.info.description}
                </p>

                <div className="mt-3 space-y-1 text-xs text-gray-300">
                    <p>
                        <span className="opacity-60">Japanese:</span>{" "}
                        {item?.moreInfo.japanese}
                    </p>
                    <p>
                        <span className="opacity-60">Synonyms:</span>{" "}
                        {item?.moreInfo.synonyms}
                    </p>
                    <p>
                        <span className="opacity-60">Aired:</span> {item?.moreInfo.aired}
                    </p>
                    <p>
                        <span className="opacity-60">Status:</span>{" "}
                        {item?.moreInfo.status}
                    </p>
                    <p>
                        <span className="opacity-60">Genres:</span>{" "}
                        {item?.moreInfo.genres.join(", ")}
                    </p>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2">
                    <Button
                        disabled={isPlaying}
                        onClick={() => handlePlay(item?.info.id)}
                        className="flex w-[85%] items-center justify-center gap-2 rounded-full bg-[#ffbade] px-4 py-2 font-semibold text-black hover:bg-[#f89abf] transition-colors cursor-pointer"
                    >
                        {isPlaying ? (
                            <>
                                <Spinner data-icon="inline-start" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4 fill-black" />
                                Watch now
                            </>
                        )}
                    </Button>

                    <Popover modal={false}>
                        <PopoverTrigger asChild>
                            <div className="cursor-pointer rounded-full bg-white p-1.5 text-black hover:bg-gray-100 transition-colors">
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
                            className="w-40 border border-[#2d3748] bg-white dark:bg-[#1e293b] dark:text-white p-2 shadow-2xl"
                        >
                            {playlist.map((i) => (
                                <Button
                                    key={i}
                                    className="flex w-full items-center justify-between bg-transparent text-black dark:text-white hover:bg-[#ffbade]/20 dark:hover:bg-[#ffbade]/20 transition-colors"
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

export default MediaCardPopover;