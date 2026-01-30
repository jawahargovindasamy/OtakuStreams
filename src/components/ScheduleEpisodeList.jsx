import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Play, Clock, CalendarX, ChevronDown, ChevronUp } from 'lucide-react';

const ScheduleEpisodeList = ({ animes = [] }) => {
    const navigate = useNavigate();
    const [showAll, setShowAll] = useState(false);
    
    const INITIAL_COUNT = 7;
    const hasMore = animes.length > INITIAL_COUNT;
    const displayedAnimes = showAll ? animes : animes.slice(0, INITIAL_COUNT);

    if (!animes.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <CalendarX className="w-12 h-12 text-slate-600 mb-4" />
                <p className="text-slate-400 text-sm">
                    No episodes found for this date
                </p>
            </div>
        );
    }

    return (
        <div className="mt-4 space-y-1">
            {displayedAnimes.map((anime) => (
                <div
                    key={anime.id}
                    onClick={() => navigate(`/${anime.id}`)}
                    className="group flex items-center gap-4 p-3 rounded-lg bg-slate-800/50 
                             hover:bg-slate-800 border border-transparent hover:border-slate-700/50
                             transition-all duration-200 cursor-pointer"
                >
                    {/* Time Column */}
                    <div className="shrink-0 w-16 text-center">
                        <span className="text-sm font-bold text-slate-300 group-hover:text-pink-500 transition-colors">
                            {anime.time}
                        </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="text-sm font-semibold text-slate-200 group-hover:text-pink-400 
                                    transition-colors line-clamp-1">
                            {anime.name}
                        </h3>
                    </div>

                    {/* Episode Badge */}
                    <div className="shrink-0">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/10 
                                      border border-pink-500/20 text-pink-400 group-hover:bg-pink-500 
                                      group-hover:text-white group-hover:border-pink-500 transition-all duration-200">
                            <Play className="w-3 h-3 fill-current" />
                            <span className="text-xs font-bold">Episode</span>
                            <span className="text-xs font-bold">{anime.episode}</span>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Show More/Less Button */}
            {hasMore && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full mt-4 py-3 flex items-center gap-2 text-sm font-medium cursor-pointer
                             text-slate-400 hover:text-pink-400 
                             transition-all duration-200 group"
                >
                    {showAll ? (
                        <>
                            <span>Show Less</span>
                            <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                        </>
                    ) : (
                        <>
                            <span>Show {animes.length - INITIAL_COUNT} More</span>
                            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                        </>
                    )}
                </button>
            )}
        </div>
    )
}

export default ScheduleEpisodeList