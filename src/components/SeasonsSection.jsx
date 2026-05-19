import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { slugify } from '@/lib/utils';
import { useData } from '@/context/data-provider';
import SectionHeader from '@/components/SectionHeader';

// Global cache to store the full season chain for each anime ID
const seasonsCache = new Map();

const SeasonsSection = ({ animeId }) => {
    const navigate = useNavigate();
    const { fetchmediarelations } = useData();
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!animeId) return;

        const stringId = animeId.toString();

        // Check Cache first
        if (seasonsCache.has(stringId)) {
            setSeasons(seasonsCache.get(stringId));
            return;
        }

        let isMounted = true;
        const fetchChain = async () => {
            setLoading(true);
            try {
                const visited = new Set();
                const fetchedData = new Map();

                // Helper to format node title
                const formatTitle = (node) => {
                    return node?.title?.english || node?.title?.romaji || node?.title?.native || "Unknown Title";
                };

                // Get starting node from DataProvider context method
                const startNode = await fetchmediarelations(stringId);
                if (!startNode) {
                    if (isMounted) setLoading(false);
                    return;
                }

                const currentEntry = {
                    id: startNode.id.toString(),
                    malId: startNode.idMal,
                    title: formatTitle(startNode),
                    year: startNode.startDate?.year || startNode.seasonYear,
                    format: startNode.format ? startNode.format.toUpperCase() : null
                };

                fetchedData.set(currentEntry.id, startNode);
                visited.add(currentEntry.id);

                // Traverse Prequels
                const prequels = [];
                let currentPrequel = startNode;
                let prequelDepth = 0;

                while (currentPrequel && prequelDepth < 5) {
                    const prequelEdge = currentPrequel.relations?.edges?.find(
                        edge => edge.relationType === 'PREQUEL' && edge.node?.type === 'ANIME'
                    );

                    if (prequelEdge?.node?.id) {
                        const nextId = prequelEdge.node.id.toString();
                        if (visited.has(nextId)) break;

                        visited.add(nextId);
                        try {
                            const nodeData = await fetchmediarelations(nextId);
                            if (nodeData) {
                                currentPrequel = nodeData;
                                prequels.push({
                                    id: nodeData.id.toString(),
                                    malId: nodeData.idMal,
                                    title: formatTitle(nodeData),
                                    year: nodeData.startDate?.year || nodeData.seasonYear,
                                    format: nodeData.format ? nodeData.format.toUpperCase() : null
                                });
                                fetchedData.set(nextId, nodeData);
                            } else {
                                break;
                            }
                        } catch (err) {
                            console.error("Error fetching prequel:", err);
                            break;
                        }
                    } else {
                        break;
                    }
                    prequelDepth++;
                }

                // Traverse Sequels
                const sequels = [];
                let currentSequel = startNode;
                let sequelDepth = 0;

                while (currentSequel && sequelDepth < 5) {
                    const sequelEdge = currentSequel.relations?.edges?.find(
                        edge => edge.relationType === 'SEQUEL' && edge.node?.type === 'ANIME'
                    );

                    if (sequelEdge?.node?.id) {
                        const nextId = sequelEdge.node.id.toString();
                        if (visited.has(nextId)) break;

                        visited.add(nextId);
                        try {
                            const nodeData = await fetchmediarelations(nextId);
                            if (nodeData) {
                                currentSequel = nodeData;
                                sequels.push({
                                    id: nodeData.id.toString(),
                                    malId: nodeData.idMal,
                                    title: formatTitle(nodeData),
                                    year: nodeData.startDate?.year || nodeData.seasonYear,
                                    format: nodeData.format ? nodeData.format.toUpperCase() : null
                                });
                                fetchedData.set(nextId, nodeData);
                            } else {
                                break;
                            }
                        } catch (err) {
                            console.error("Error fetching sequel:", err);
                            break;
                        }
                    } else {
                        break;
                    }
                    sequelDepth++;
                }

                // Combine to form chronological chain
                const fullChain = [...prequels.reverse(), currentEntry, ...sequels];

                if (isMounted) {
                    // Cache the built chain for all IDs in the franchise
                    fullChain.forEach(item => {
                        seasonsCache.set(item.id, fullChain);
                    });

                    setSeasons(fullChain);
                }
            } catch (error) {
                console.error("Failed to build seasons chain:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchChain();

        return () => {
            isMounted = false;
        };
    }, [animeId]);

    if (loading) {
        return (
            <section className="space-y-4 sm:space-y-5">
                <SectionHeader title="More Seasons" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="w-full h-24 rounded-2xl bg-card/40 border border-border/30" />
                    ))}
                </div>
            </section>
        );
    }

    // Don't render anything if it's not a multi-season franchise
    if (seasons.length <= 1) {
        return null;
    }

    const activeIndex = seasons.findIndex(s => s.id === animeId?.toString());

    return (
        <section className="space-y-4 sm:space-y-5">
            <SectionHeader title="More Seasons" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {seasons.map((season, index) => {
                    const isActive = season.id === animeId?.toString();
                    let label = "Season";
                    if (isActive) {
                        label = "Current Season";
                    } else if (activeIndex !== -1) {
                        label = index < activeIndex ? "Prequel" : "Sequel";
                    }

                    const chronologicalNumber = (index + 1).toString().padStart(2, '0');

                    return (
                        <div
                            key={season.id}
                            onClick={() => {
                                if (!isActive) {
                                    navigate(`/${slugify(season.title)}/${season.id}`);
                                }
                            }}
                            className={`
                                group relative overflow-hidden rounded-2xl p-4 cursor-pointer
                                transition-all duration-300 ease-out border backdrop-blur-md flex flex-col justify-between min-h-[96px]
                                ${isActive
                                    ? 'bg-gradient-to-br from-primary/15 to-primary/5 border-primary/60 shadow-lg shadow-primary/15'
                                    : 'bg-card/35 border-border/40 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5'
                                }
                            `}
                        >
                            {/* Background Glow Effect on Hover */}
                            <div className={`
                                absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300
                                ${isActive ? 'opacity-30' : 'group-hover:opacity-25'}
                            `} />

                            {/* Timeline Number (Chronological Index) */}
                            <div className={`
                                absolute top-3 right-4 text-3xl font-extrabold select-none transition-colors duration-300
                                ${isActive ? 'text-primary/25' : 'text-muted-foreground/10 group-hover:text-primary/15'}
                            `}>
                                {chronologicalNumber}
                            </div>

                            {/* Header: Label */}
                            <div className="relative z-10 flex items-center gap-1.5 mb-1.5">
                                {isActive && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                )}
                                <span className={`
                                    text-[10px] font-extrabold uppercase tracking-wider
                                    ${isActive ? 'text-primary' : 'text-muted-foreground/80'}
                                `}>
                                    {label}
                                </span>
                            </div>

                            {/* Body: Title */}
                            <h4 className={`
                                relative z-10 text-[13px] sm:text-[14px] font-semibold line-clamp-2 leading-snug w-[82%] transition-colors duration-200
                                ${isActive ? 'text-foreground font-bold' : 'text-foreground/90 group-hover:text-primary'}
                            `} title={season.title}>
                                {season.title}
                            </h4>

                            {/* Footer: Format & Year Metadata */}
                            {(season.format || season.year) && (
                                <div className="relative z-10 flex items-center gap-2 mt-3 text-[11px] text-muted-foreground/75 font-semibold">
                                    {season.format && (
                                        <span className={`
                                            px-1.5 py-0.5 rounded text-[9px] font-bold border
                                            ${isActive 
                                                ? 'bg-primary/10 border-primary/20 text-primary' 
                                                : 'bg-accent/40 border-border/25 text-muted-foreground'
                                            }
                                        `}>
                                            {season.format}
                                        </span>
                                    )}
                                    {season.year && (
                                        <span>{season.year}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default SeasonsSection;