import EpisodesList from '@/components/EpisodesList';
import Navbar from '@/components/Navbar';
import { useData } from '@/context/data-provider';
import { slugify } from '@/lib/utils';
import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Users, ThumbsUp, Flame, ChevronDown, ChevronUp, Play, AlertCircle } from 'lucide-react';
import SeasonsSection from '@/components/SeasonsSection';
import EpisodeServer from '@/components/EpisodeServer';
import SectionHeader from '@/components/SectionHeader';
import MediaCard from '@/components/MediaCard';
import VerticalList from '@/components/VerticalList';
import { Button } from "@/components/ui/button";
import Footer from '@/components/Footer';
import { useAuth } from '@/context/auth-provider';

const Watch = () => {
    const { id, episodeNumber: rawEpisodeNumber } = useParams();
    const episodeNumber = rawEpisodeNumber?.replace('ep=', '');
    const location = useLocation();

    const episodeList = location.state?.episodeList;
    const animeInfo = location.state?.animeInfo;

    const { fetchanimeinfo, fetchepisodeinfo, fetchepisodeserver, fetchnextepisodeschedule } = useData();
    const { updateProgress } = useAuth();

    const [item, setItem] = useState(animeInfo ?? null);
    const [nextEpisode, setNextEpisode] = useState(null);
    const [episode, setEpisode] = useState(episodeList ?? null);

    const [loading, setLoading] = useState(!animeInfo);

    const [searchParams, setSearchParams] = useSearchParams();
    const epFromUrl = searchParams.get("ep");

    const currentEpisodeData = episode?.episodes?.find(
        (ep) => ep.number.toString() === episodeNumber
    );

    const [audioType, setAudioType] = useState("sub");
    
    const subServers = [
        { serverId: "hd-1", serverName: "HD-1" },
        { serverId: "hd-2", serverName: "HD-2" }
    ];
    const dubServers = [
        { serverId: "hd-1", serverName: "HD-1" },
        { serverId: "hd-2", serverName: "HD-2" }
    ];
    
    const [activeSub, setActiveSub] = useState(subServers[0]);
    const [activeDub, setActiveDub] = useState(null);
    const [activeRaw, setActiveRaw] = useState(null);

    useEffect(() => {
        if (activeSub) setAudioType("sub");
        else if (activeDub) setAudioType("dub");
    }, [activeSub, activeDub]);

    const [showAllRelated, setShowAllRelated] = useState(false);
    const [showAllPopular, setShowAllPopular] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [isAvailable, setIsAvailable] = useState(false);
    const [hasDub, setHasDub] = useState(true);
    const [debugInfo, setDebugInfo] = useState([]);

    const navigate = useNavigate();

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
    }, [id]);

    // No episodeserver fetch needed.
    useEffect(() => {
        const checkEpisode = async () => {
            setIsChecking(true);
            try {
                const malId = item?.anime?.info?.malId || "";
                const response = await fetch(`/api/check-episode/${id}/${episodeNumber}?malId=${malId}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new TypeError("Oops, we haven't got JSON!");
                }

                const data = await response.json();
                
                if (data.success) {
                    console.log("Episode Check Result:", data); // For debugging
                    setIsAvailable(data.isAvailable);
                    setHasDub(data.hasDub);
                    setDebugInfo(data.debug || []);
                    
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
    }, [id, episodeNumber]);




    const hasSeasons = item?.seasons && item?.seasons.length > 0;

    useEffect(() => {
        if (animeInfo) return;

        let mounted = true;
        const getAnimeInfo = async () => {
            setLoading(true);
            try {
                const data = await fetchanimeinfo(id);
                if (mounted) setItem(data);
            } catch (error) {
                console.error("Failed to fetch anime:", error);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        getAnimeInfo();
        return () => {
            mounted = false;
        };
    }, [id, animeInfo, fetchanimeinfo])

    const hasRecommended = item?.recommendedAnimes && item?.recommendedAnimes.length > 0;
    const filteredRelated = item?.relatedAnimes?.filter(a => a.type.toUpperCase() !== 'MANGA') || [];
    const hasRelated = filteredRelated.length > 0;
    const hasPopular = item?.mostPopularAnimes && item?.mostPopularAnimes.length > 0;
    const relatedCount = filteredRelated.length;
    const popularCount = item?.mostPopularAnimes?.length || 0;

    useEffect(() => {
        if (episode?.totalEpisodes) return;

        let mounted = true;
        const getAnimeEpisode = async () => {
            setLoading(true);
            try {
                const data = await fetchepisodeinfo(id);
                if (mounted) setEpisode(data.data);
            } catch (error) {
                console.error("Failed to fetch anime:", error);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        getAnimeEpisode();
        return () => {
            mounted = false;
        };
    }, [id, episodeList, fetchepisodeinfo])

    // Removed episode server fetch effect

    useEffect(() => {
        if (!item || !currentEpisodeData) return;

        updateProgress({
            animeId: id,
            episodeId: episodeNumber,
            animeTitle: item?.anime?.info?.name,
            animeImage: item?.anime?.info?.poster,

            currentEpisode: currentEpisodeData.number,
            currentTime: 0,
            duration: 0,

            episodeTitle:
                currentEpisodeData.title ||
                `Episode ${currentEpisodeData.number}`,
        });

    }, [id, episodeNumber, item, currentEpisodeData, updateProgress]);

    const activeServerId = activeSub?.serverId || activeDub?.serverId || "hd-1";
    
    // Check if current server is actually working based on debug info
    const isCurrentServerWorking = () => {
        if (!debugInfo || debugInfo.length === 0) return true; // Default to showing if no debug info
        
        const typePath = activeServerId === "hd-2" ? "/mal/" : "/ani/";
        const serverStatus = debugInfo.find(d => d.url.includes(typePath) && d.url.includes(`/${audioType}`));
        
        return !serverStatus || serverStatus.status === "Success";
    };

    const iframeSrc = activeServerId === "hd-2" 
        ? `https://megaplay.buzz/stream/mal/${item?.anime?.info?.malId || id}/${episodeNumber}/${audioType}`
        : `https://megaplay.buzz/stream/ani/${id}/${episodeNumber}/${audioType}`;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
            <Navbar />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6 sm:pt-8 lg:pt-10 pb-2">
                <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                    <Link
                        to="/home"
                        className="hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                    >
                        <span className="group-hover:underline underline-offset-4">Home</span>
                    </Link>
                    <span className="text-muted-foreground/40 font-light">/</span>
                    <Link
                        to={`/${item?.anime.info.stats.type === "TV" ? "tv" : "movie"}`}
                        className="hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                    >
                        <span className="group-hover:underline underline-offset-4">{item?.anime.info.stats.type === "TV" ? "Tv" : "Movie"}</span>
                    </Link>
                    <span className="text-muted-foreground/40 font-light">/</span>
                    <span className="text-foreground font-medium cursor-pointer" onClick={()=> navigate(`/${slugify(item?.anime.info.name)}/${item?.anime.info.id}`)}>{item?.anime.info.name}</span>
                </nav>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[340px_1fr] gap-6 lg:gap-8">
                    <div className="order-3 lg:order-1">
                        <EpisodesList
                            episodeList={episode?.episodes}
                            totalepisodes={episode?.totalEpisodes}
                            activeEpisode={episodeNumber}
                            onEpisodeChange={(num) => navigate(`/watch/${id}/${num}`, { state: location.state })} />
                    </div>
                    <div className="space-y-4 order-1 lg:order-2">
                        <div className="rounded-2xl overflow-hidden border border-border/50 shadow-lg shadow-primary/5 bg-card min-h-[300px] flex items-center justify-center">
                            {isChecking ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm text-muted-foreground animate-pulse">Checking episode availability...</p>
                                </div>
                            ) : isAvailable ? (
                                isCurrentServerWorking() ? (
                                    <iframe
                                        src={iframeSrc}
                                        width="100%"
                                        height="500px"
                                        allowFullScreen
                                        className="bg-black w-full h-[300px] sm:h-[400px] lg:h-[500px]"
                                    ></iframe>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-card/50">
                                        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                                            <Play className="w-8 h-8" /> 
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold text-foreground">Server Not Available</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                This episode is not available in this server, so please check the next server.
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="default" 
                                                onClick={() => {
                                                    const nextServer = activeServerId === "hd-1" ? subServers[1] : subServers[0];
                                                    setActiveSub(nextServer);
                                                }}
                                                className="mt-2"
                                            >
                                                Try Next Server
                                            </Button>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="flex flex-col items-center gap-4 p-8 text-center max-w-md">
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
                                        className="mt-2"
                                    >
                                        Try Refreshing
                                    </Button>
                                </div>
                            )}
                        </div>

                        {isAvailable && (
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
                        )}

                        <div className='mt-2'>
                            {hasSeasons && (
                                <SeasonsSection seasons={item?.seasons} id={id} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10 space-y-8 sm:space-y-10">
                <div className={`grid grid-cols-1 ${hasRelated || hasPopular ? 'lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_380px]' : ''} gap-6 sm:gap-8 lg:gap-10 w-full`}>
                    <div className="space-y-8 sm:space-y-10 min-w-0">
                        {hasRecommended && (
                            <section className="space-y-4 sm:space-y-5 w-full">
                                <SectionHeader title="Recommended For You" icon={ThumbsUp} />
                                <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${hasRelated || hasPopular ? 'xl:grid-cols-5' : 'lg:grid-cols-5 xl:grid-cols-6'} gap-3 sm:gap-4 w-full`}>
                                    {item?.recommendedAnimes.map((a) => (
                                        <MediaCard key={a.id} id={a.id} name={a.name} jname={a.jname} poster={a.poster} type={a.type} rating={a.rating} year={a.year} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                    {(hasRelated || hasPopular) && (
                        <aside className="space-y-6 sm:space-y-8 min-w-0">
                            {/* Related Anime */}
                            {hasRelated && (
                                <section className="space-y-3 sm:space-y-4">
                                    <SectionHeader title="Related Anime" icon={Users} />
                                    <div className="bg-card/50 rounded-xl sm:rounded-2xl border border-border/50 backdrop-blur-sm overflow-hidden">
                                        <div className="p-3 sm:p-4">
                                            <VerticalList
                                                anime={filteredRelated}
                                                list={showAllRelated ? relatedCount : 5}
                                            />
                                        </div>
                                        {relatedCount > 5 && (
                                            <div className="p-2 border-t border-border/50 bg-card/50">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowAllRelated(!showAllRelated)}
                                                    className="w-full text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 group"
                                                >
                                                    <span className="text-xs font-medium">
                                                        {showAllRelated ? 'Show Less' : `Show More (${relatedCount - 5})`}
                                                    </span>
                                                    {showAllRelated ? (
                                                        <ChevronUp className="w-3 h-3 ml-1 group-hover:-translate-y-0.5 transition-transform" />
                                                    ) : (
                                                        <ChevronDown className="w-3 h-3 ml-1 group-hover:translate-y-0.5 transition-transform" />
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Most Popular */}
                            {hasPopular && (
                                <section className="space-y-3 sm:space-y-4">
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
                                </section>
                            )}
                        </aside>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default Watch