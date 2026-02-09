import AnimeDetails from '@/components/AnimeDetails';
import Navbar from '@/components/Navbar';
import { useData } from '@/context/data-provider';
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from "@/components/ui/button";
import { Loader2, Users, ThumbsUp, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import CharactersSection from '@/components/CharactersSection';
import SectionHeader from '@/components/SectionHeader';
import SeasonsSection from '@/components/SeasonsSection';
import VerticalList from '@/components/VerticalList';
import MediaCard from '@/components/MediaCard';
import Footer from '@/components/Footer';

const Anime = () => {
    const { id } = useParams();
    const { fetchanimeinfo, fetchepisodeinfo } = useData();

    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showAllRelated, setShowAllRelated] = useState(false);
    const [showAllPopular, setShowAllPopular] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;
        const getAnimeInfo = async () => {
            setLoading(true);
            try {
                const data = await fetchanimeinfo(id, "a");
                if (mounted) {
                    setItem(data);
                }
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
    }, [id, fetchanimeinfo])

    const handlePlay = useCallback(
        async (id) => {
            setIsPlaying(true);
            try {
                const data = await fetchepisodeinfo(id);
                if (data?.data?.episodes?.length > 0) {
                    navigate(`/watch/${data.data.episodes[0].episodeId}`, {
                        state: {
                            animeId: id,
                            episodeList: data.data,
                            animeInfo : item
                        }
                    });
                }
            } catch (err) {
                console.error(err);
                setIsPlaying(false);
            }
        },
        [fetchepisodeinfo, navigate,item]
    );

    // Loading skeleton
    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                            <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
                        </div>
                        <p className="text-muted-foreground animate-pulse text-sm">Loading anime details...</p>
                    </div>
                </div>
            </div>
        );
    }

    const hasSeasons = item?.seasons && item?.seasons.length > 0;
    const hasCharacters = item?.anime?.info?.charactersVoiceActors && item?.anime?.info?.charactersVoiceActors.length > 0;
    const hasRecommended = item?.recommendedAnimes && item?.recommendedAnimes.length > 0;
    const hasRelated = item?.relatedAnimes && item?.relatedAnimes.length > 0;
    const hasPopular = item?.mostPopularAnimes && item?.mostPopularAnimes.length > 0;

    const relatedCount = item?.relatedAnimes?.length || 0;
    const popularCount = item?.mostPopularAnimes?.length || 0;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <main className="flex-1 w-full">
                <AnimeDetails
                    anime={item?.anime}
                    handlePlay={handlePlay}
                    isPlaying={isPlaying}
                />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10 space-y-8 sm:space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_380px] gap-6 sm:gap-8 lg:gap-10 w-full">
                        {/* Main Column */}
                        <div className="space-y-8 sm:space-y-10 min-w-0">
                            {/* Seasons Section */}
                            {hasSeasons && (
                                <SeasonsSection seasons={item?.seasons} />
                            )}

                            {/* Characters Section */}
                            {hasCharacters && (
                                <CharactersSection charactersVoiceActors={item?.anime?.info?.charactersVoiceActors} />
                            )}

                            {/* Recommended Section */}
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

                        {/* Sidebar Column */}
                        <aside className="space-y-6 sm:space-y-8 min-w-0">
                            {/* Related Anime */}
                            {hasRelated && (
                                <section className="space-y-3 sm:space-y-4">
                                    <SectionHeader title="Related Anime" icon={Users} />
                                    <div className="bg-card/30 rounded-xl sm:rounded-2xl border border-border/50 backdrop-blur-sm overflow-hidden">
                                        <div className="max-h-175 overflow-y-auto custom-scrollbar p-3 sm:p-4">
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
                                    <div className="bg-card/30 rounded-xl sm:rounded-2xl border border-border/50 backdrop-blur-sm overflow-hidden">
                                        <div className="max-h-175 overflow-y-auto custom-scrollbar p-3 sm:p-4">
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
            </main>


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

export default Anime