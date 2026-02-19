import React, { useCallback, useRef, useState, useMemo } from "react";
import { useData } from "@/context/data-provider";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-provider";
import MediaCardPopover from "./MediaCardPopover";

const MediaCard = ({ id, jname = "", rank = null, showRank = false }) => {
    const { fetchanimeinfo, fetchepisodeinfo } = useData();
    const { user, language, continueWatching, watchlistMap, removeWatchlist, updateWatchlist, addWatchlist } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const navigate = useNavigate();

    const timerRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [playlist1, setPlaylist1] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

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
        let mounted = true;
        const getAnimeInfo = async () => {
            setLoading(true);
            const data = await fetchanimeinfo(id);
            if (mounted) {
                setItem(data);
                setLoading(false);
            }
        }
        getAnimeInfo();
        return () => {
            mounted = false;
        };
    }, [id, fetchanimeinfo])

    useEffect(() => {
        if (!user || !id) {
            setPlaylist1(null);
            return;
        }

        const item = watchlistMap.get(id);

        setPlaylist1(item?.status || null);

    }, [user, id, watchlistMap])

    const handleNavigate = () => {
        navigate(`/${id}`, {
            state: { animeInfo: item }
        });
    };

    const handleMouseEnter = () => {
        timerRef.current = setTimeout(() => setOpen(true), 400);
    };

    const handleMouseLeave = () => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setOpen(false), 200);
    };

    const handlePlaylistChange = useCallback(
        async (selected) => {
            if (!user || !id || isUpdating) return;

            const existing = watchlistMap.get(id);
            const previousStatus = playlist1;

            setIsUpdating(true);

            // Optimistic update
            if (selected.key === "remove") {
                setPlaylist1(null);
            } else {
                setPlaylist1(selected.key);
            }

            // Close popover
            setOpen(false);

            try {
                if (selected.key === "remove") {
                    if (existing?._id) {
                        await removeWatchlist(existing._id);
                    }
                } else {
                    if (existing?._id) {
                        await updateWatchlist(existing._id, selected.key);
                    } else {
                        await addWatchlist(
                            id,
                            item?.anime?.info?.name,
                            item?.anime?.info?.poster,
                            selected.key
                        );
                    }
                }
            } catch (error) {
                console.error("Watchlist update failed:", error);

                // Rollback on failure
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
            item
        ]
    );


    const handlePlay = useCallback(
        async (id) => {
            setIsPlaying(true);
            try {
                const data = await fetchepisodeinfo(id);
                if (data?.data?.episodes?.length > 0) {

                    const progress = continueWatching.find((item) => item.animeId === id);

                    const episodeToPlay = progress ? `/watch/${progress.animeId}?${progress.episodeId}` : `/watch/${data.data.episodes[0].episodeId}`;

                    navigate(episodeToPlay, {
                        state: {
                            animeId: id,
                            episodeList: data.data,
                            animeInfo: item
                        }
                    });
                }
            } catch (err) {
                console.error(err);
                setIsPlaying(false);
            }
        },
        [continueWatching, fetchepisodeinfo, navigate, item]
    );

    if (loading) {
        return (
            <div className="bg-card rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-transparent hover:border-border/50 transition-all duration-300">
                <div className="relative aspect-2/3 w-full rounded-lg bg-muted animate-pulse overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-background/10 to-transparent skeleton-shimmer" />
                </div>
                <div className="mt-2 sm:mt-3 h-4 w-3/4 rounded bg-muted animate-pulse" />
                <div className="mt-1.5 h-3 w-1/2 rounded bg-muted/50 animate-pulse" />
            </div>
        );
    }

    // console.log(item);


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
                {/* Rank Number - Visible Netflix/HiAnime Style */}
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
                        src={item?.anime.info.poster}
                        alt={item?.anime.info.name}
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
                </div>

                <h3 className="mt-2 sm:mt-3 text-sm sm:text-base font-semibold leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200 z-20">
                    {language === "EN" ? item?.anime.info.name : jname}
                </h3>

                {item?.anime.info.stats?.type && (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                        {item?.anime.info.stats.type} • {item?.anime.info.stats.episodes.sub} Eps
                    </p>
                )}
            </div>
        </MediaCardPopover>
    );
};

export default MediaCard;