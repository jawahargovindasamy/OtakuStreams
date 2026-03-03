import { useAuth } from '@/context/auth-provider';
import { useData } from '@/context/data-provider';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import MediaCardPopover from './MediaCardPopover';
import { Check, ClosedCaption, EllipsisVertical, Mic } from 'lucide-react';
import { useMediaQuery } from "../hooks/useMediaQuery";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const MediaCard1 = ({ id, name, jname = "", poster, type = "", sub, dub, rank = null, showRank = false }) => {

    const { fetchanimeinfo, fetchepisodeinfo } = useData();
    const { user, language, continueWatching, watchlistMap, removeWatchlist, updateWatchlist, addWatchlist } = useAuth();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [open, setOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playlist1, setPlaylist1] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [mobilePlaylistOpen, setMobilePlaylistOpen] = useState(false);

    const timerRef = useRef(null);
    const fetchingRef = useRef(false);

    const isDesktop = useMediaQuery("(min-width: 1024px)");

    const playlist = useMemo(
        () => [
            { key: "watching", label: "Watching", },
            { key: "on_hold", label: "On-Hold", },
            { key: "plan_to_watch", label: "Plan to Watch", },
            { key: "dropped", label: "Dropped", },
            { key: "completed", label: "Completed", },
            { key: "remove", label: "Remove", }
        ], []
    );


    useEffect(() => {
        return () => {
            clearTimeout(timerRef.current);
        };
    }, []);


    useEffect(() => {
        if (!user || !id) {
            setPlaylist1(null);
            return;
        }

        const item = watchlistMap.get(id);

        setPlaylist1(item?.status || null);

    }, [user, id, watchlistMap])


    const handlefetch = useCallback(async () => {
        if (item) return item;

        if (fetchingRef.current) {
            return fetchingRef.current;
        }

        fetchingRef.current = (async () => {
            try {
                const data = await fetchanimeinfo(id);
                setItem(data);
                return data;
            } catch (error) {
                console.error("Error fetching anime info:", error);
                return null;
            } finally {
                fetchingRef.current = null;
            }
        })();
        return fetchingRef.current;
    }, [item, id, fetchanimeinfo]);


    const handleNavigate = async () => {
        const data = await handlefetch();
        if (data) {
            navigate(`/${id}`, { state: { animeInfo: data } });
        }
    }

    const handleMouseEnter = () => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(async () => {
            setOpen(true);
            await handlefetch();
        }, 500);
    };

    const handleMouseLeave = () => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setOpen(false), 200);
    };

    const handlePlay = useCallback(
        async (id) => {
            setIsPlaying(true);
            try {
                const animeInfo = await handlefetch();
                const data = await fetchepisodeinfo(id);
                if (data?.data?.episodes?.length > 0) {
                    const progress = continueWatching.find((item) => item.animeId === id);
                    const episodeToPlay = progress ? `/watch/${progress.animeId}?${progress.episodeId}` : `/watch/${data.data.episodes[0].episodeId}`;
                    navigate(episodeToPlay, {
                        state: {
                            animeId: id,
                            episodeList: data.data,
                            animeInfo
                        }
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsPlaying(false);
            }
        },
        [continueWatching, fetchepisodeinfo, navigate, handlefetch]
    );


    const handlePlaylistChange = useCallback(
        async (selected) => {
            if (!user || !id || isUpdating) return;

            const existing = watchlistMap.get(id);
            const previousStatus = playlist1;

            setIsUpdating(true);

            if (selected.key === "remove") {
                setPlaylist1(null);
            } else {
                setPlaylist1(selected.key);
            }

            setOpen(false);
            setMobilePlaylistOpen(false);

            try {
                if (selected.key === "remove") {
                    if (existing?._id) {
                        await removeWatchlist(existing._id);
                    }
                } else {
                    if (existing?._id) {
                        await updateWatchlist(existing._id, selected.key);
                    } else {
                        // Fetch item info if not yet loaded for add operation
                        const fetchedItem = item || await handlefetch();
                        await addWatchlist(
                            id,
                            fetchedItem?.anime?.info?.name,
                            fetchedItem?.anime?.info?.poster,
                            selected.key
                        );
                    }
                }
            } catch (error) {
                console.error("Watchlist update failed:", error);
                setPlaylist1(previousStatus);
            } finally {
                setIsUpdating(false);
            }
        },
        [
            user,
            id,
            playlist1,
            isUpdating,
            watchlistMap,
            removeWatchlist,
            updateWatchlist,
            addWatchlist,
            item,
            handlefetch,
        ]
    );

    /* ── Three-dot watchlist button (mobile / tablet only) ── */
    const MobileWatchlistButton = user && (
        <Popover open={mobilePlaylistOpen} onOpenChange={setMobilePlaylistOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={isUpdating}
                    className="absolute top-1 right-1 z-20 h-7 w-7 rounded-full
                               bg-black/50 backdrop-blur-sm border border-white/10
                               text-white hover:bg-black/70 hover:text-white
                               transition-colors duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {isUpdating ? (
                        <Spinner className="h-3.5 w-3.5" />
                    ) : playlist1 !== null ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                        <EllipsisVertical className="h-3.5 w-3.5" />
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                side="bottom"
                align="end"
                className="w-40 p-1 border-border bg-popover shadow-xl z-50"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="space-y-0.5">
                    {playlist.map((i) => (
                        <Button
                            key={i.key}
                            variant="ghost"
                            size="sm"
                            disabled={isUpdating}
                            className={`w-full justify-between text-xs font-medium transition-colors
                                ${playlist1 === i.key
                                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                                    : "hover:bg-accent"
                                }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePlaylistChange(i);
                            }}
                        >
                            {i.label}
                            {playlist1 === i.key && <Check className="h-3.5 w-3.5" />}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );

    const CardContent = (
        <div className="relative">
            <div
                className="relative bg-card rounded-xl sm:rounded-2xl p-2 sm:p-3 
                           flex flex-col cursor-pointer 
                           transition-all duration-300 ease-out
                           hover:scale-105 hover:shadow-xl hover:shadow-primary/5 hover:z-10
                           active:scale-95
                           group border border-transparent hover:border-border/50"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleNavigate}
            >
                {showRank && rank !== null && (
                    <div
                        className="absolute -left-3 sm:-left-3 -bottom-2 sm:-bottom-3 z-0 
                                   text-6xl sm:text-7xl md:text-8xl lg:text-9xl 
                                   font-black leading-none pointer-events-none select-none
                                   italic tracking-tighter"
                        style={{
                            color: 'hsl(var(--foreground))',
                            WebkitTextStroke: '3px hsl(var(--background))',
                            textShadow: `
                                0 2px 10px rgba(0,0,0,0.3),
                                0 4px 20px rgba(0,0,0,0.2),
                                -2px -2px 0 hsl(var(--background)),
                                2px -2px 0 hsl(var(--background)),
                                -2px 2px 0 hsl(var(--background)),
                                2px 2px 0 hsl(var(--background))
                            `,
                            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                            WebkitFontSmoothing: 'antialiased'
                        }}
                    >
                        {rank}
                    </div>
                )}

                <div className="relative overflow-hidden rounded-lg aspect-2/3 bg-muted">
                    <img
                        src={poster}
                        alt={name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                    />

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Quick play button on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center text-primary-foreground shadow-lg">
                            <svg className="h-5 w-5 sm:h-6 sm:w-6 fill-current ml-0.5" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>

                    {/* Three-dot watchlist button — mobile/tablet only */}
                    {!isDesktop && MobileWatchlistButton}
                </div>

                <h3 className="mt-2 sm:mt-3 text-sm sm:text-base font-semibold leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200 z-20">
                    {language === "EN" ? name : jname ? jname : name}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-1">
                    {type && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                            {type}
                        </p>
                    )}
                    {sub && (
                        <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 sm:px-1 sm:py-1 text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                            <ClosedCaption className="h-3 w-3" />
                            {sub}
                        </span>
                    )}
                    {dub && (
                        <span className="flex items-center gap-1 rounded-md bg-blue-500/10 sm:px-1 sm:py-1 text-[10px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">
                            <Mic className="h-3 w-3" />
                            {dub}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )

    if (!isDesktop) {
        return CardContent;
    }

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
            handlePlaylistChange={handlePlaylistChange}
            isUpdating={isUpdating}
            isPlaying={isPlaying}
        >
            {CardContent}
        </MediaCardPopover>
    )
}

export default MediaCard1