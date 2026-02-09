import EpisodesList from '@/components/EpisodesList';
import Navbar from '@/components/Navbar';
import { useData } from '@/context/data-provider';
import React, { useEffect, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { Users, ThumbsUp, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import SeasonsSection from '@/components/SeasonsSection';
import EpisodeServer from '@/components/EpisodeServer';
import SectionHeader from '@/components/SectionHeader';
import MediaCard from '@/components/MediaCard';
import VerticalList from '@/components/VerticalList';
import { Button } from "@/components/ui/button";
import Footer from '@/components/Footer';

const Watch = () => {
    const { episodeId } = useParams();
    const location = useLocation();

    const episodeList = location.state?.episodeList;
    const animeInfo = location.state?.animeInfo;

    const { fetchanimeinfo, fetchepisodeinfo, fetchepisodeserver } = useData();

    const [item, setItem] = useState(animeInfo ?? null);
    const [episode, setEpisode] = useState(episodeList ?? null);
    const [episodeserver, setEpisodeserver] = useState(null);
    const [loading, setLoading] = useState(!animeInfo);

    const [searchParams, setSearchParams] = useSearchParams();
    const epFromUrl = Number(searchParams.get("ep"));

    const epId = `${episodeId}?ep=${epFromUrl}`;

    const [activeSub, setActiveSub] = useState(null);
    const [activeDub, setActiveDub] = useState(null);
    const [activeRaw, setActiveRaw] = useState(null);
    const [showAllRelated, setShowAllRelated] = useState(false);
    const [showAllPopular, setShowAllPopular] = useState(false);

    const selected = activeDub || activeSub
    const type = activeDub ? "dub" : "sub"

    useEffect(() => {
        if (!episodeserver) return;

        // reset everything first
        setActiveSub(null);
        setActiveDub(null);
        setActiveRaw(null);

        // prefer previously selected type
        if (activeDub && episodeserver.dub?.length) {
            setActiveDub(episodeserver.dub[0]);
        } else if (episodeserver.sub?.length) {
            setActiveSub(episodeserver.sub[0]);
        }
    }, [episodeserver]);




    const hasSeasons = item?.seasons && item?.seasons.length > 0;

    useEffect(() => {
        if (animeInfo) return;

        let mounted = true;
        const getAnimeInfo = async () => {
            setLoading(true);
            try {
                const data = await fetchanimeinfo(episodeId);
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
    }, [episodeId, animeInfo, fetchanimeinfo])

    const hasRecommended = item?.recommendedAnimes && item?.recommendedAnimes.length > 0;
    const hasRelated = item?.relatedAnimes && item?.relatedAnimes.length > 0;
    const hasPopular = item?.mostPopularAnimes && item?.mostPopularAnimes.length > 0;

    const relatedCount = item?.relatedAnimes?.length || 0;
    const popularCount = item?.mostPopularAnimes?.length || 0;

    useEffect(() => {
        if (animeInfo) return;

        let mounted = true;
        const getAnimeEpisode = async () => {
            setLoading(true);
            try {
                const data = await fetchepisodeinfo(episodeId);
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
    }, [episodeId, episodeList, fetchepisodeinfo])

    useEffect(() => {
        if (!epFromUrl) return;

        let mounted = true;

        const getAnimeEpisodeServer = async () => {
            try {
                const data = await fetchepisodeserver(`${episodeId}?ep=${epFromUrl}`);
                if (mounted) setEpisodeserver(data);
            } catch (error) {
                console.error("Failed to fetch server:", error);
            }
        };

        getAnimeEpisodeServer();

        return () => {
            mounted = false;
        };
    }, [episodeId, epFromUrl, fetchepisodeserver]);


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
                    <span className="text-foreground font-medium">{item?.anime.info.name}</span>
                </nav>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[340px_1fr] gap-6 lg:gap-8">
                    <div>
                        <EpisodesList
                            episodeList={episode?.episodes}
                            totalepisodes={episode?.totalEpisodes}
                            activeEpisode={epFromUrl}
                            onEpisodeChange={(id) => setSearchParams({ ep: id })} />
                    </div>
                    <div className="space-y-4">
                        <div className="rounded-2xl overflow-hidden border border-border/50 shadow-lg shadow-primary/5 bg-card">
                            <iframe
                                src={`https://megaplay.buzz/stream/s-2/${epFromUrl}/${type}`}
                                width="100%"
                                height="500px"
                                allowFullScreen
                                className="bg-black"
                            >
                            </iframe>
                        </div>

                        <div className="rounded-2xl bg-card border border-border/50 p-4 flex flex-col lg:flex-row gap-4 backdrop-blur-sm">
                            <EpisodeServer
                                episodeNo={episodeserver?.episodeNo}
                                subServers={episodeserver?.sub}
                                dubServers={episodeserver?.dub}
                                rawServers={episodeserver?.raw}
                                activeSub={activeSub}
                                setActiveSub={setActiveSub}
                                activeDub={activeDub}
                                setActiveDub={setActiveDub}
                                activeRaw={activeRaw}
                                setActiveRaw={setActiveRaw}
                            />
                        </div>

                        <div className='mt-2'>
                            {hasSeasons && (
                                <SeasonsSection seasons={item?.seasons} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10 space-y-8 sm:space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_380px] gap-6 sm:gap-8 lg:gap-10 w-full">
                    <div className="space-y-8 sm:space-y-10 min-w-0">
                        {hasRecommended && (
                            <section className="space-y-4 sm:space-y-5 w-full">
                                <SectionHeader title="Recommended For You" icon={ThumbsUp} />
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 w-full">
                                    {item?.recommendedAnimes.map((a) => (
                                        <MediaCard key={a.id} id={a.id} jname={a.jname} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                    <aside className="space-y-6 sm:space-y-8 min-w-0">
                        {/* Related Anime */}
                        {hasRelated && (
                            <section className="space-y-3 sm:space-y-4">
                                <SectionHeader title="Related Anime" icon={Users} />
                                <div className="bg-card/50 rounded-xl sm:rounded-2xl border border-border/50 backdrop-blur-sm overflow-hidden">
                                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-3 sm:p-4">
                                        <VerticalList
                                            anime={item?.relatedAnimes}
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
                                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-3 sm:p-4">
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
                </div>
            </div>

            <Footer />

            {/* Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: hsl(var(--primary) / 0.3);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: hsl(var(--primary) / 0.5);
                }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: hsl(var(--primary) / 0.3) transparent;
                }
            `}</style>
        </div>
    )
}

export default Watch