import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Play, CalendarX, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const ScheduleEpisodeList = ({ animes = [] }) => {
    const navigate = useNavigate();
    const [showAll, setShowAll] = useState(false);
    
    const INITIAL_COUNT = 7;
    const hasMore = animes.length > INITIAL_COUNT;
    const displayedAnimes = showAll ? animes : animes.slice(0, INITIAL_COUNT);

    if (!animes.length) {
        return (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center bg-card/30 rounded-2xl border border-dashed border-border/50">
                <div className="p-3 rounded-full bg-muted mb-3">
                    <CalendarX className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">
                    No episodes scheduled for this date
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                    Check back later for updates
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <ScrollArea className={showAll ? "h-150" : "h-auto"}>
                <div className="space-y-2 pr-2">
                    {displayedAnimes.map((anime, index) => (
                        <div
                            key={anime.id}
                            onClick={() => navigate(`/${anime.id}`)}
                            className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl 
                                     bg-card border border-border/50 
                                     hover:border-primary/30 hover:bg-accent/50
                                     transition-all duration-300 ease-out cursor-pointer
                                     hover:shadow-lg hover:shadow-primary/5 hover:translate-x-1"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Time Column */}
                            <div className="shrink-0 w-14 sm:w-16 text-center">
                                <div className="flex flex-col items-center gap-1">
                                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors">
                                        {anime.time}
                                    </span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-px h-8 sm:h-10 bg-border group-hover:bg-primary/30 transition-colors" />

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary 
                                            transition-colors line-clamp-1">
                                    {anime.name}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                    Episode {anime.episode} • {anime.type || 'TV'}
                                </p>
                            </div>

                            {/* Episode Badge */}
                            <div className="shrink-0">
                                <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full 
                                              bg-primary/10 border border-primary/20 
                                              text-primary group-hover:bg-primary group-hover:text-primary-foreground 
                                              group-hover:border-primary transition-all duration-300">
                                    <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                                    <span className="text-xs font-bold hidden sm:inline">EP</span>
                                    <span className="text-xs font-bold">{anime.episode}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            
            {/* Show More/Less Button */}
            {hasMore && (
                <Button
                    variant="ghost"
                    onClick={() => setShowAll(!showAll)}
                    className="w-full mt-3 sm:mt-4 py-2.5 sm:py-3 h-auto flex items-center justify-center gap-2 
                             text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5
                             rounded-xl transition-all duration-200 group"
                >
                    {showAll ? (
                        <>
                            <span>Show Less</span>
                            <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                        </>
                    ) : (
                        <>
                            <span>Show {animes.length - INITIAL_COUNT} More Episodes</span>
                            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                        </>
                    )}
                </Button>
            )}
        </div>
    )
}

export default ScheduleEpisodeList;