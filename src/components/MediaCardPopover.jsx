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

/* -------------------- Skeleton Components -------------------- */
const MediaCardPopoverSkeleton = () => {
    return (
        <div className="space-y-3 animate-pulse">
            {/* Title */}
            <div className="h-5 w-3/4 rounded bg-muted" />

            {/* Meta badges */}
            <div className="flex flex-wrap gap-1.5">
                <div className="h-5 w-10 rounded bg-muted/70" />
                <div className="h-5 w-8 rounded bg-muted/70" />
                <div className="h-5 w-10 rounded bg-muted/70" />
                <div className="h-5 w-8 rounded bg-muted/70" />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-5/6 rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
            </div>

            {/* Info rows */}
            <div className="space-y-1.5 pt-1">
                <div className="h-3 w-1/2 rounded bg-muted/70" />
                <div className="h-3 w-2/3 rounded bg-muted/70" />
                <div className="h-3 w-1/3 rounded bg-muted/70" />
                <div className="h-3 w-1/3 rounded bg-muted/70" />
                <div className="h-3 w-3/4 rounded bg-muted/70" />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
                <div className="h-9 w-[85%] rounded-full bg-muted" />
                <div className="h-8 w-8 rounded-full bg-muted/70" />
            </div>
        </div>
    );
};

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
    sideOffset = -20
}) => {
    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>

            <PopoverContent
                align="start"
                side="right"
                sideOffset={sideOffset}
                alignOffset={-20}
                className="w-72 sm:w-80 rounded-xl sm:rounded-2xl border border-border/50 
                           bg-popover/95 dark:bg-popover/95 
                           p-3 sm:p-4 text-popover-foreground 
                           shadow-2xl shadow-black/20 backdrop-blur-xl
                           animate-in fade-in-0 zoom-in-95 duration-200"
                onMouseEnter={() => clearTimeout(timerRef.current)}
                onMouseLeave={handleMouseLeave}
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                {!item ? (
                    <MediaCardPopoverSkeleton />
                ) : (
                    <div className="space-y-3">
                        <h3 className="font-bold leading-tight text-base sm:text-lg text-foreground line-clamp-2">
                            {item?.info.name}
                        </h3>

                        {/* Meta Info Row */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1 mr-1.5">
                                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                <span className="font-medium text-foreground">
                                    {item?.moreInfo.malscore === "?" ? "N/A" : item?.moreInfo.malscore}
                                </span>
                            </div>

                            {item?.info.stats.quality && (
                                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary ring-1 ring-primary/20">
                                    {item?.info.stats.quality}
                                </span>
                            )}

                            {item?.info.stats.episodes?.sub > 0 && (
                                <span className="flex items-center gap-0.5 rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                                    <ClosedCaption className="h-3 w-3" />
                                    {item?.info.stats.episodes.sub}
                                </span>
                            )}

                            {item?.info.stats.episodes?.dub > 0 && (
                                <span className="flex items-center gap-0.5 rounded bg-blue-500/10 px-1.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">
                                    <Mic className="h-3 w-3" />
                                    {item?.info.stats.episodes.dub}
                                </span>
                            )}

                            <span className="rounded bg-secondary px-1.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                                {item?.info.stats.type}
                            </span>
                        </div>

                        <p className="line-clamp-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {item?.info.description}
                        </p>

                        {/* Anime Details */}
                        <div className="space-y-1 text-xs text-muted-foreground/90">
                            <p className="flex gap-1.5">
                                <span className="text-muted-foreground/60 min-w-18">Japanese:</span>
                                <span className="line-clamp-1">{item?.moreInfo.japanese}</span>
                            </p>
                            <p className="flex gap-1.5">
                                <span className="text-muted-foreground/60 min-w-18">Synonyms:</span>
                                <span className="line-clamp-1">{item?.moreInfo.synonyms}</span>
                            </p>
                            <p className="flex gap-1.5">
                                <span className="text-muted-foreground/60 min-w-18">Aired:</span>
                                <span>{item?.moreInfo.aired}</span>
                            </p>
                            <p className="flex gap-1.5">
                                <span className="text-muted-foreground/60 min-w-18">Status:</span>
                                <span className={item?.moreInfo.status === "Completed" ? "text-emerald-600 dark:text-emerald-400" : "text-primary"}>
                                    {item?.moreInfo.status}
                                </span>
                            </p>
                            <p className="flex gap-1.5">
                                <span className="text-muted-foreground/60 min-w-18">Genres:</span>
                                <span className="line-clamp-1">{item?.moreInfo.genres?.join(", ")}</span>
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex items-center gap-2">
                            <Button
                                disabled={isPlaying}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePlay(item?.info.id);
                                }}
                                className="flex-1 items-center justify-center gap-2 rounded-full 
                                           bg-primary hover:bg-primary/90 text-primary-foreground 
                                           font-semibold transition-all duration-200 
                                           hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02]
                                           active:scale-95 h-9 sm:h-10 text-sm"
                            >
                                {isPlaying ? (
                                    <>
                                        <Spinner className="h-4 w-4" />
                                        <span>Loading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-4 w-4 fill-current" />
                                        <span>Watch Now</span>
                                    </>
                                )}
                            </Button>

                            <Popover modal={false}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full h-9 w-9 border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {playlist1 === null ? (
                                            <Plus className="h-4 w-4" />
                                        ) : (
                                            <Check className="h-4 w-4 text-emerald-500" />
                                        )}
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent
                                    side="top"
                                    align="end"
                                    className="w-40 p-1 border-border bg-popover shadow-xl"
                                >
                                    <div className="space-y-0.5">
                                        {playlist.map((i) => (
                                            <Button
                                                key={i}
                                                variant="ghost"
                                                size="sm"
                                                className={`w-full justify-between text-xs font-medium transition-colors
                                                    ${playlist1 === i
                                                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                                                        : "hover:bg-accent"
                                                    }`}
                                                onClick={() => setPlaylist1(i)}
                                            >
                                                {i}
                                                {playlist1 === i && <Check className="h-3.5 w-3.5" />}
                                            </Button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};

export default MediaCardPopover;