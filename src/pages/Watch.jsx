import EpisodesList from '@/components/EpisodesList';
import Navbar from '@/components/Navbar';
import { useData } from '@/context/data-provider';
import { slugify, getAnimeTitle } from '@/lib/utils';
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Users, ThumbsUp, Flame, ChevronDown, ChevronUp, Play, AlertCircle, ArrowLeft, ChevronLeft, ChevronRight, Maximize2, Minimize2, Bookmark, Heart, Share2, Check, Sparkles } from 'lucide-react';
import SeasonsSection from '@/components/SeasonsSection';
import EpisodeServer from '@/components/EpisodeServer';
import SectionHeader from '@/components/SectionHeader';
import { Button } from "@/components/ui/button";
import Footer from '@/components/Footer';
import { useAuth } from '@/context/auth-provider';


const subServers = [
    { serverId: "hd-1", serverName: "HD-1" },
    { serverId: "hd-2", serverName: "HD-2" }
];
const dubServers = [
    { serverId: "hd-1", serverName: "HD-1" },
    { serverId: "hd-2", serverName: "HD-2" }
];


const Watch = () => {
    const { id, episodeNumber: rawEpisodeNumber } = useParams();
    const episodeNumber = rawEpisodeNumber?.replace('ep=', '');
    const location = useLocation();
    const navigate = useNavigate();

    const episodeList = location.state?.episodeList;
    const animeInfo = location.state?.animeInfo;

    const { fetchanimeinfo, fetchepisodeinfo, fetchepisodeserver, fetchnextepisodeschedule, checkEpisodeAvailability } = useData();
    const { updateProgress, user, preferences, updatePreferences, watchlist, addWatchlist, removeWatchlist, favourites, addFavourite, removeFavourite, language } = useAuth();

    const [item, setItem] = useState(animeInfo ?? null);
    const [nextEpisode, setNextEpisode] = useState(null);
    const [episode, setEpisode] = useState(null);
    const playerRef = useRef(null);

    const [loading, setLoading] = useState(!animeInfo);
    const [isTheatre, setIsTheatre] = useState(false);
    const [autoNext, setAutoNext] = useState(() => preferences?.autoNext ?? true);
    const [copied, setCopied] = useState(false);

    const [audioType, setAudioType] = useState(() => {
        if (location.state?.dub) return location.state.dub === "yes" ? "dub" : "sub";
        return preferences?.audio || "sub";
    });

    const [activeSub, setActiveSub] = useState(() => {
        if (location.state?.dub === "no" && location.state?.server) {
            return subServers.find(s => s.serverId === location.state.server) || subServers[0];
        }
        if (location.state?.dub === "yes") return null;

        if (!location.state?.dub && preferences?.audio === "sub") {
            return subServers.find(s => s.serverId === preferences.server) || subServers[0];
        }
        return preferences?.audio === "dub" ? null : subServers[0];
    });

    const [activeDub, setActiveDub] = useState(() => {
        if (location.state?.dub === "yes" && location.state?.server) {
            return dubServers.find(s => s.serverId === location.state.server) || dubServers[0];
        }
        if (!location.state?.dub && preferences?.audio === "dub") {
            return dubServers.find(s => s.serverId === preferences.server) || dubServers[0];
        }
        return null;
    });

    // Reset all states immediately during render when transitioning to a new anime ID
    const [prevId, setPrevId] = useState(id);
    if (id !== prevId) {
        setPrevId(id);
        setItem(null);
        setEpisode(null);
        setNextEpisode(null);
        setLoading(true);

        const stateAnimeId = location.state?.animeInfo?.id?.toString() || location.state?.animeInfo?.malId?.toString();
        if (stateAnimeId && stateAnimeId === id) {
            setItem(location.state.animeInfo);
            setLoading(false);

            const newAudioType = location.state?.dub ? (location.state.dub === "yes" ? "dub" : "sub") : (preferences?.audio || "sub");
            setAudioType(newAudioType);

            let newActiveSub = null;
            let newActiveDub = null;
            if (location.state?.dub === "no" && location.state?.server) {
                newActiveSub = subServers.find(s => s.serverId === location.state.server) || subServers[0];
            } else if (location.state?.dub === "yes") {
                newActiveSub = null;
            } else if (!location.state?.dub && preferences?.audio === "sub") {
                newActiveSub = subServers.find(s => s.serverId === preferences.server) || subServers[0];
            } else {
                newActiveSub = preferences?.audio === "dub" ? null : subServers[0];
            }

            if (location.state?.dub === "yes" && location.state?.server) {
                newActiveDub = dubServers.find(s => s.serverId === location.state.server) || dubServers[0];
            } else if (!location.state?.dub && preferences?.audio === "dub") {
                newActiveDub = dubServers.find(s => s.serverId === preferences.server) || dubServers[0];
            } else {
                newActiveDub = null;
            }
            setActiveSub(newActiveSub);
            setActiveDub(newActiveDub);
        } else {
            const newAudioType = location.state?.dub ? (location.state.dub === "yes" ? "dub" : "sub") : (preferences?.audio || "sub");
            setAudioType(newAudioType);

            let newActiveSub = null;
            let newActiveDub = null;

            if (location.state?.dub === "no" && location.state?.server) {
                newActiveSub = subServers.find(s => s.serverId === location.state.server) || subServers[0];
            } else if (location.state?.dub === "yes") {
                newActiveSub = null;
            } else if (!location.state?.dub && preferences?.audio === "sub") {
                newActiveSub = subServers.find(s => s.serverId === (location.state?.server || preferences.server)) || subServers[0];
            } else {
                newActiveSub = preferences?.audio === "dub" ? null : subServers[0];
            }

            if (location.state?.dub === "yes" && location.state?.server) {
                newActiveDub = dubServers.find(s => s.serverId === location.state.server) || dubServers[0];
            } else if (!location.state?.dub && preferences?.audio === "dub") {
                newActiveDub = dubServers.find(s => s.serverId === (location.state?.server || preferences.server)) || dubServers[0];
            } else {
                newActiveDub = null;
            }

            setActiveSub(newActiveSub);
            setActiveDub(newActiveDub);
        }
    }
    const [activeRaw, setActiveRaw] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeServerId = activeSub?.serverId || activeDub?.serverId || "hd-1";

    const currentEpisodeData = episode?.episodes?.find(
        (ep) => ep.number.toString() === episodeNumber
    );

    useEffect(() => {
        if (activeSub) setAudioType("sub");
        else if (activeDub) setAudioType("dub");
    }, [activeSub, activeDub]);

    // Keyboard Shortcuts (T: Theatre mode, Esc: Exit Theatre)
    useEffect(() => {
        const handleKeyDown = (e) => {
            const activeTag = document.activeElement?.tagName?.toLowerCase();
            if (
                activeTag === "input" ||
                activeTag === "textarea" ||
                activeTag === "select" ||
                document.activeElement?.isContentEditable ||
                document.activeElement?.tagName === "IFRAME"
            ) {
                return;
            }
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            if (e.key === "t" || e.key === "T") {
                e.preventDefault();
                setIsTheatre((prev) => !prev);
            } else if (e.key === "Escape" && isTheatre) {
                e.preventDefault();
                setIsTheatre(false);
            } else if (e.key === "[") {
                e.preventDefault();
                const epNum = parseInt(episodeNumber, 10);
                if (epNum > 1) {
                    navigate(`/watch/${id}/${epNum - 1}`, { state: location.state });
                }
            } else if (e.key === "]") {
                e.preventDefault();
                const epNum = parseInt(episodeNumber, 10);
                if (!episode?.totalEpisodes || epNum < episode.totalEpisodes) {
                    navigate(`/watch/${id}/${epNum + 1}`, { state: location.state });
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isTheatre, episodeNumber, episode?.totalEpisodes, id, location.state, navigate]);

    // Route entry: scroll smoothly to player when episodeNumber changes
    useEffect(() => {
        if (playerRef.current) {
            playerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }
    }, [episodeNumber]);


    const [showAllPopular, setShowAllPopular] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [isAvailable, setIsAvailable] = useState(false);
    const [hasDub, setHasDub] = useState(true);
    const [debugInfo, setDebugInfo] = useState([]);
    const cleanDescription = (text) => {
        if (!text) return "A synopsis for this episode hasn't been published yet.";
        const cleaned = text.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
        return cleaned || "A synopsis for this episode hasn't been published yet.";
    };

    let formatted = 0;

    if (nextEpisode?.airingTimestamp) {
        formatted = new Date(nextEpisode.airingTimestamp).toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
            month: "numeric",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    }

    useEffect(() => {
        const handlefetchnextepisodeschedule = async () => {
            try {
                const data = await fetchnextepisodeschedule(id);
                if (data) {
                    setNextEpisode(data);
                }
            } catch (err) {
                console.error(err);
            }
        }
        handlefetchnextepisodeschedule();
    }, [id, fetchnextepisodeschedule]);

    useEffect(() => {
        const checkEpisode = async () => {
            setIsChecking(true);
            try {
                const malId = item?.anime?.info?.malId || "";
                const response = await fetch(`/.netlify/functions/check-episode?animeId=${id}&episode=${episodeNumber}&malId=${malId}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new TypeError("Oops, we haven't got JSON!");
                }

                const data = await response.json();

                if (data.success) {
                    setIsAvailable(data.isAvailable);
                    setHasDub(data.hasDub);
                    setDebugInfo(data.debug || data.debugInfo || []);

                    if (!data.hasDub && audioType === "dub") {
                        setActiveDub(null);
                        setActiveSub(subServers[0]);
                    }
                } else {
                    setIsAvailable(false);
                }
            } catch (error) {
                console.error("Episode check failed:", error);
                setIsAvailable(false);
            } finally {
                setIsChecking(false);
            }
        };

        if (id && episodeNumber) {
            checkEpisode();
        }
    }, [id, episodeNumber, item, audioType]);

    useEffect(() => {
        const title = item ? getAnimeTitle(item?.Media || item?.anime?.info || item, language) : "";
        if (title && episodeNumber) {
            document.title = `Watch ${title} Episode ${episodeNumber} — OtakuStreams`;
        } else if (episodeNumber) {
            document.title = `Watch Episode ${episodeNumber} — OtakuStreams`;
        } else {
            document.title = "Watch Anime — OtakuStreams";
        }
    }, [item, episodeNumber, language]);

    // Update progress in auth-provider when user is logged in and episode is available
    useEffect(() => {
        if (user && updateProgress && isAvailable && !isChecking && id && episodeNumber) {
            const title = getAnimeTitle(item?.Media || item?.anime?.info || item, language) || item?.anime?.info?.name || "Anime";
            const poster = item?.anime?.info?.poster || item?.posterImage || item?.coverImage?.extraLarge || "";

            updateProgress({
                animeId: id,
                animeTitle: title,
                animeImage: poster,
                currentEpisode: parseInt(episodeNumber, 10),
                episodeNumber: parseInt(episodeNumber, 10),
                dub: audioType === "dub" ? "yes" : "no",
                server: activeServerId
            });
        }
    }, [user, isAvailable, isChecking, id, episodeNumber, item, audioType, activeServerId, updateProgress, language]);

    useEffect(() => {
        let isMounted = true;

        const getAnimeInfo = async () => {
            if (animeInfo && item) return;
            setLoading(true);
            try {
                const data = await fetchanimeinfo(id);
                if (isMounted) {
                    if (!data) {
                        navigate('/home');
                        return;
                    }
                    setItem(data);
                }
            } catch (error) {
                console.error('Failed to fetch anime:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        getAnimeInfo();

        return () => {
            isMounted = false;
        };
    }, [id, animeInfo, fetchanimeinfo, navigate, item]);

    useEffect(() => {
        let isMounted = true;

        const getAnimeEpisode = async () => {
            try {
                const data = await fetchepisodeinfo(id);
                if (isMounted && data?.data) {
                    setEpisode(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch episodes:', error);
            }
        };

        getAnimeEpisode();

        return () => {
            isMounted = false;
        };
    }, [id, fetchepisodeinfo]);

    const isCurrentServerWorking = () => {
        if (!debugInfo || debugInfo.length === 0) return true;

        const typePath = activeServerId === "hd-2" ? "/mal/" : "/ani/";
        const serverStatus = debugInfo.find(d => d.url.includes(typePath) && d.url.includes(`/${audioType}`));

        return !serverStatus || serverStatus.status === "Success";
    };

    const iframeSrc = `/player.html?id=${id}&ep=${episodeNumber}&audio=${audioType}&server=${activeServerId}&malId=${item?.anime?.info?.malId || ""}`;

    const hasRecommended = item?.recommendedAnimes?.length > 0;
    const hasPopular = item?.mostPopularAnimes?.length > 0;
    const popularCount = item?.mostPopularAnimes?.length || 0;

    const isInWatchlist = watchlist?.some(w => w.id?.toString() === id?.toString());
    const isFavourite = favourites?.some(f => f.id?.toString() === id?.toString());
    const isWatched = user?.progress?.[id]?.includes(episodeNumber);

    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
            {/* 0. Skip link (visible on focus, fixed top-left, primary background) */}
            <a
                href="#player-stage"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-xl focus:shadow-lg focus:font-semibold text-sm transition-all"
            >
                Skip to the player
            </a>

            {/* Shared Fixed Navbar */}
            <Navbar />

            {/* Main Content Layout: 68px navbar offset + 12px breathing gap = 80px clearance from top of page to player frame */}
            <main className="flex-1 w-full pb-16 lg:pb-24 pt-[68px]">
                <div className="pt-3">
                    {/* Centred container capped at 1440px (standard) / 1720px (theatre mode), px-0 on mobile, sm:px-4, lg:px-8 */}
                    <div
                        className={`w-full mx-auto px-0 sm:px-4 lg:px-8 space-y-6 transition-all duration-300 ${
                            isTheatre ? "max-w-[1720px]" : "max-w-[1440px]"
                        }`}
                    >
                        {/* FULL WIDTH IFRAME PLAYER STAGE (Height = width / 1.7778, 100% x 100% absolute fill, zero layout shift) */}
                        <section
                            id="player-stage"
                            ref={playerRef}
                            aria-label={`Player Stage Episode ${episodeNumber}`}
                            className="relative w-full aspect-video rounded-none sm:rounded-2xl overflow-hidden bg-black border-y sm:border border-border/80 shadow-lift"
                        >
                            {isChecking ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black">
                                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm text-muted-foreground animate-pulse font-sans">Checking episode availability...</p>
                                </div>
                            ) : isAvailable ? (
                                isCurrentServerWorking() ? (
                                    <iframe
                                        src={iframeSrc}
                                        title={`${item?.anime?.info?.name || "Anime"} - Episode ${episodeNumber}`}
                                        allowFullScreen
                                        className="absolute inset-0 w-full h-full border-0 bg-black"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center bg-card/95 backdrop-blur-md">
                                        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                                            <Play className="w-8 h-8 ml-0.5" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold text-foreground">Server Not Available</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                This episode is not available on this server, please try switching servers.
                                            </p>
                                        </div>
                                        <Button
                                            variant="default"
                                            onClick={() => {
                                                const nextServerId = activeServerId === "hd-1" ? "hd-2" : "hd-1";
                                                if (audioType === "dub") {
                                                    const nextServer = dubServers.find(s => s.serverId === nextServerId) || dubServers[0];
                                                    setActiveDub(nextServer);
                                                    setActiveSub(null);
                                                } else {
                                                    const nextServer = subServers.find(s => s.serverId === nextServerId) || subServers[0];
                                                    setActiveSub(nextServer);
                                                    setActiveDub(null);
                                                }
                                            }}
                                            className="mt-2 font-sans font-bold"
                                        >
                                            Try Next Server
                                        </Button>
                                    </div>
                                )
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center bg-card/95 backdrop-blur-md">
                                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                                        <AlertCircle className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-foreground">Episode Not Available</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            This episode is not available right now. Please try again later.
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => window.location.reload()}
                                        className="mt-2 font-sans font-medium"
                                    >
                                        Try Refreshing
                                    </Button>
                                </div>
                            )}
                        </section>

                        {/* ANIME TITLE HEADER ROW & EPISODE TITLE & METADATA */}
                        <div className="px-4 sm:px-0 space-y-1">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/${slugify(item?.anime?.info?.name || "anime")}/${item?.anime?.info?.id || id}`)}
                                    title="Back to anime details"
                                    className="w-9 h-9 rounded-full border border-border/80 bg-surface/60 hover:bg-card text-foreground/80 hover:text-foreground flex items-center justify-center transition-all cursor-pointer shrink-0"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <span
                                    onClick={() => navigate(`/${slugify(item?.anime?.info?.name || "anime")}/${item?.anime?.info?.id || id}`)}
                                    className="text-sm font-bold uppercase tracking-wider font-sans text-muted-foreground hover:text-foreground transition-colors cursor-pointer truncate"
                                >
                                    {item?.anime?.info?.name || "Anime"}
                                </span>
                            </div>
                            <div className="pl-12 space-y-1.5">
                                <h1 className="text-2xl sm:text-3xl font-extrabold font-sans text-foreground tracking-tight">
                                    Episode {episodeNumber}{currentEpisodeData?.title ? `: ${currentEpisodeData.title}` : ''}
                                </h1>
                                <div className="flex items-center justify-between gap-4 flex-wrap text-xs font-sans pt-1">
                                    {/* Left: Metadata Badges (EP 1, 24 min, Airing, Sub, Dub, Watched) */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* EP Pill */}
                                        <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-bold shadow-sm">
                                            EP {episodeNumber}
                                        </span>

                                        {/* Duration Pill */}
                                        <span className="px-3 py-1 rounded-full bg-[#121624] text-gray-300 border border-white/10 font-medium">
                                            {String(item?.anime?.info?.stats?.duration || "24 min").includes("m") || String(item?.anime?.info?.stats?.duration || "24 min").includes("min")
                                                ? (item?.anime?.info?.stats?.duration || "24 min")
                                                : `${item?.anime?.info?.stats?.duration || "24"} min`}
                                        </span>

                                        {/* Airing Status Pill */}
                                        {item?.anime?.info?.stats?.status && (
                                            <span className="px-3 py-1 rounded-full bg-[#121624] text-gray-300 border border-white/10 font-medium">
                                                {item.anime.info.stats.status}
                                            </span>
                                        )}

                                        {/* Audio Badges */}
                                        <span className="px-3 py-1 rounded-full bg-[#121624] text-gray-300 border border-white/10 font-medium">
                                            Sub
                                        </span>
                                        {hasDub && (
                                            <span className="px-3 py-1 rounded-full bg-[#121624] text-gray-300 border border-white/10 font-medium">
                                                Dub
                                            </span>
                                        )}

                                        {/* Watched Badge */}
                                        {isWatched && (
                                            <span className="px-3 py-1 rounded-full bg-[#121624] text-emerald-400 border border-emerald-500/20 font-medium">
                                                Watched
                                            </span>
                                        )}
                                    </div>

                                    {/* Right: Action Buttons Row matching media_1786025441000.png */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* Previous Episode */}
                                        <button
                                            type="button"
                                            disabled={parseInt(episodeNumber, 10) <= 1}
                                            onClick={() => navigate(`/watch/${id}/${parseInt(episodeNumber, 10) - 1}`, { state: location.state })}
                                            className="px-4 py-1.5 rounded-full bg-[#121624] border border-white/10 hover:border-white/20 text-gray-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 font-medium transition-all"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                            <span>Previous</span>
                                        </button>

                                        {/* Next Episode */}
                                        <button
                                            type="button"
                                            disabled={episode?.totalEpisodes && parseInt(episodeNumber, 10) >= episode.totalEpisodes}
                                            onClick={() => navigate(`/watch/${id}/${parseInt(episodeNumber, 10) + 1}`, { state: location.state })}
                                            className="px-5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md transition-all"
                                        >
                                            <span>Next episode</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>

                                        {/* Autoplay Next Toggle */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updated = !autoNext;
                                                setAutoNext(updated);
                                                updatePreferences?.({ autoNext: updated });
                                            }}
                                            className="px-3.5 py-1.5 rounded-full bg-[#121624] border border-white/10 hover:border-white/20 flex items-center gap-2 font-medium text-gray-300 cursor-pointer transition-all"
                                        >
                                            <div className={`w-7 h-4 rounded-full p-0.5 transition-colors ${autoNext ? "bg-indigo-600" : "bg-gray-700"}`}>
                                                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${autoNext ? "translate-x-3" : "translate-x-0"}`} />
                                            </div>
                                            <span>Autoplay next</span>
                                        </button>

                                        {/* Theatre Mode Toggle (visible ≥1024px, 44px target, immediately right of Autoplay next) */}
                                        <button
                                            type="button"
                                            aria-pressed={isTheatre}
                                            aria-label={isTheatre ? "Exit theatre mode" : "Enter theatre mode"}
                                            title={isTheatre ? "Exit theatre mode (T or Esc)" : "Enter theatre mode (T)"}
                                            onClick={() => setIsTheatre((prev) => !prev)}
                                            className="hidden lg:inline-flex min-w-[44px] min-h-[44px] h-[44px] w-[44px] rounded-full bg-[#121624] border border-white/10 hover:border-white/20 text-gray-300 hover:text-white items-center justify-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                                        >
                                            {isTheatre ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                        </button>

                                        {/* Bookmark / Watchlist Icon */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (isInWatchlist) removeWatchlist?.(id);
                                                else addWatchlist?.(item);
                                            }}
                                            title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                                            className={`w-9 h-9 rounded-full border border-white/10 hover:border-white/20 flex items-center justify-center transition-all cursor-pointer ${
                                                isInWatchlist ? "bg-indigo-600 text-white" : "bg-[#121624] text-gray-300 hover:text-white"
                                            }`}
                                        >
                                            <Bookmark className="w-4 h-4" fill={isInWatchlist ? "currentColor" : "none"} />
                                        </button>

                                        {/* Heart / Favourite Icon */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (isFavourite) removeFavourite?.(id);
                                                else addFavourite?.(item);
                                            }}
                                            title={isFavourite ? "Remove from Favourites" : "Add to Favourites"}
                                            className={`w-9 h-9 rounded-full border border-white/10 hover:border-white/20 flex items-center justify-center transition-all cursor-pointer ${
                                                isFavourite ? "bg-rose-600 text-white" : "bg-[#121624] text-gray-300 hover:text-white"
                                            }`}
                                        >
                                            <Heart className="w-4 h-4" fill={isFavourite ? "currentColor" : "none"} />
                                        </button>

                                        {/* Share Icon */}
                                        <button
                                            type="button"
                                            onClick={handleShare}
                                            title={copied ? "Link Copied!" : "Share Link"}
                                            className="w-9 h-9 rounded-full bg-[#121624] border border-white/10 hover:border-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* EPISODE SERVER SELECTOR */}
                        {isAvailable && (
                            <div className="px-4 sm:px-0">
                                <EpisodeServer
                                    episodeNo={episodeNumber}
                                    subServers={subServers}
                                    dubServers={hasDub ? dubServers : []}
                                    activeSub={activeSub}
                                    setActiveSub={setActiveSub}
                                    activeDub={activeDub}
                                    setActiveDub={setActiveDub}
                                    activeRaw={activeRaw}
                                    setActiveRaw={setActiveRaw}
                                    nextEpisodeTime={formatted || 0}
                                />
                            </div>
                        )}

                        {/* MAIN CONTENT GRID */}
                        <div className="px-4 sm:px-0 pt-4">
                            <div className={`grid grid-cols-1 ${!isTheatre ? "lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px]" : "w-full"} gap-6 lg:gap-8 items-start w-full`}>
                                {/* LEFT / MAIN COLUMN */}
                                <div className="space-y-8 min-w-0 w-full">
                                    {/* In Theatre Mode: Episode Navigator appears under server selector / top of section */}
                                    {isTheatre && (
                                        <div className="w-full">
                                            <EpisodesList
                                                episodeList={episode?.episodes}
                                                totalepisodes={episode?.totalEpisodes || item?.anime?.info?.stats?.episodes?.sub || item?.anime?.info?.stats?.episodes?.dub || item?.episodes?.sub}
                                                activeEpisode={episodeNumber}
                                                watchedEpisodes={user?.progress?.[id] || []}
                                                poster={item?.anime?.info?.poster}
                                                isWide={true}
                                                onEpisodeChange={(num) => navigate(`/watch/${id}/${num}`, { state: location.state, replace: true })}
                                            />
                                        </div>
                                    )}

                                    {/* About This Episode Section */}
                                    <section aria-labelledby="about-episode" className="font-sans text-left space-y-0">
                                        <div className="text-xs font-semibold text-primary uppercase tracking-normal mb-2">
                                            About this episode
                                        </div>
                                        <h2 id="about-episode" className="text-2xl sm:text-[30px] font-bold font-sans tracking-tight text-foreground leading-tight mb-5">
                                            {item?.anime?.info?.name || "Anime"} · Episode {episodeNumber}
                                        </h2>
                                        <div className="max-w-3xl">
                                            <p className={`text-sm sm:text-base font-normal leading-7 text-subtle ${!isDescriptionExpanded ? "line-clamp-4" : ""}`}>
                                                {cleanDescription(currentEpisodeData?.description || item?.anime?.info?.description)}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                                className="text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 rounded-sm inline-flex items-center justify-center min-h-[44px] mt-2 transition-colors duration-150 cursor-pointer"
                                            >
                                                {isDescriptionExpanded ? "Read less" : "Read more"}
                                            </button>
                                        </div>
                                        <div className="border-t border-border pt-6 mt-7">
                                            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 text-left">
                                                <div>
                                                    <dt className="text-xs font-normal text-muted-foreground mb-1">Studio</dt>
                                                    <dd className="text-sm font-semibold text-foreground truncate min-w-0">
                                                        {item?.anime?.info?.stats?.studios || item?.anime?.moreInfo?.studios || "Studio TBA"}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-xs font-normal text-muted-foreground mb-1">Format</dt>
                                                    <dd className="text-sm font-semibold text-foreground truncate min-w-0">
                                                        {item?.anime?.info?.stats?.type || "—"}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-xs font-normal text-muted-foreground mb-1">Season</dt>
                                                    <dd className="text-sm font-semibold text-foreground truncate min-w-0">
                                                        {item?.anime?.moreInfo?.premiered || item?.anime?.info?.stats?.season || "TBA"}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-xs font-normal text-muted-foreground mb-1">Score</dt>
                                                    <dd className="text-sm font-semibold text-foreground truncate min-w-0 tabular-nums">
                                                        {item?.anime?.info?.stats?.rating || item?.anime?.moreInfo?.malScore || "Unrated"}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>
                                        {item?.anime?.moreInfo?.genres && item.anime.moreInfo.genres.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-5">
                                                {item.anime.moreInfo.genres.map((genre) => (
                                                    <Link
                                                        key={genre}
                                                        to={`/genre/${encodeURIComponent(genre.toLowerCase())}`}
                                                        className="px-3 py-1 rounded-full bg-elevated border border-border text-xs font-medium text-subtle hover:text-primary hover:border-primary/40 hover:bg-elevated/80 transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/50"
                                                    >
                                                        {genre}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </section>

                                    {/* Franchise Timeline */}
                                    {item?.anime?.info?.id && (
                                        <SeasonsSection animeId={item.anime.info.id} compact={false} />
                                    )}

                                    {/* Related Anime Section */}
                                    <section aria-labelledby="recommendations" className="font-sans text-left pt-2">
                                        <div className="text-xs font-semibold text-primary uppercase tracking-normal mb-2">
                                            Because you're watching this
                                        </div>
                                        <h2 id="recommendations" className="text-2xl sm:text-[30px] font-bold font-sans tracking-tight text-foreground leading-tight mb-6">
                                            Related anime
                                        </h2>
                                        {item?.recommendedAnimes && item.recommendedAnimes.length > 0 && (
                                            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                                {item.recommendedAnimes.map((a) => {
                                                    if (!a || !a.id) return null;
                                                    const title = a.name || a.jname || "Anime";
                                                    const slug = slugify(a.name || a.jname || "anime");
                                                    return (
                                                        <Link
                                                            key={a.id}
                                                            to={`/${slug}/${a.id}`}
                                                            className="w-[144px] sm:w-[160px] shrink-0 snap-start group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 rounded-xl transition-all duration-150"
                                                        >
                                                            <div className="aspect-[2/3] w-full rounded-xl border border-border bg-elevated shadow-soft overflow-hidden relative">
                                                                <img
                                                                    src={a.poster}
                                                                    alt=""
                                                                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                                                    loading="lazy"
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-1 text-[11px] font-semibold text-primary mt-3 mb-1">
                                                                <Sparkles className="w-3 h-3 shrink-0" aria-hidden="true" />
                                                                <span>Similar feeling</span>
                                                            </div>
                                                            <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-150">
                                                                {title}
                                                            </h3>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </section>
                                </div>

                                {/* RIGHT COLUMN: EPISODES LIST & MOST POPULAR (Hidden in Theatre Mode) */}
                                {!isTheatre && (
                                    <div className="space-y-8 min-w-0 lg:sticky lg:top-[88px] self-start z-10">
                                        {/* Episodes List */}
                                        <EpisodesList
                                            episodeList={episode?.episodes}
                                            totalepisodes={episode?.totalEpisodes || item?.anime?.info?.stats?.episodes?.sub || item?.anime?.info?.stats?.episodes?.dub || item?.episodes?.sub}
                                            activeEpisode={episodeNumber}
                                            watchedEpisodes={user?.progress?.[id] || []}
                                            poster={item?.anime?.info?.poster}
                                            onEpisodeChange={(num) => navigate(`/watch/${id}/${num}`, { state: location.state, replace: true })}
                                        />

                                        {/* Most Popular */}
                                        {hasPopular && (
                                            <aside className="space-y-4 min-w-0">
                                                <SectionHeader title="Most Popular" icon={Flame} />
                                                <div className="bg-card/50 rounded-xl sm:rounded-2xl border border-border/50 backdrop-blur-sm overflow-hidden">
                                                    <div className="p-3 sm:p-4">
                                                        <VerticalList
                                                            anime={item?.mostPopularAnimes}
                                                            list={showAllPopular ? popularCount : 5}
                                                        />
                                                    </div>
                                                    {popularCount > 5 && (
                                                        <div className="p-2 border-t border-border/50 bg-card/50">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setShowAllPopular(!showAllPopular)}
                                                                className="w-full text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 group"
                                                            >
                                                                <span className="text-xs font-medium">
                                                                    {showAllPopular ? 'Show Less' : `Show More (${popularCount - 5})`}
                                                                </span>
                                                                {showAllPopular ? (
                                                                    <ChevronUp className="w-3 h-3 ml-1 group-hover:-translate-y-0.5 transition-transform" />
                                                                ) : (
                                                                    <ChevronDown className="w-3 h-3 ml-1 group-hover:translate-y-0.5 transition-transform" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </aside>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Shared Footer */}
            <Footer />
        </div>
    );
};

export default Watch;