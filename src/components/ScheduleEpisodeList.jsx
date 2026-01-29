import React from 'react'
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Play } from 'lucide-react';

const ScheduleEpisodeList = ({ animes = [] }) => {

    const navigate = useNavigate();

    if (!animes.length) {
        return (
            <div className="text-center text-gray-400 mt-4">
                No episodes scheduled for this date
            </div>
        );
    }
    return (
        <div className="mt-4 space-y-3">
            {animes.map((anime) => (
                <div
                    key={anime.id}
                    className="flex justify-between items-center gap-2 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer"
                    onClick={() => navigate(`/${anime.id}`)}
                >
                    <div className="flex gap-3 items-center">
                        <span className="text-sm text-gray-400">
                            {anime.time}
                        </span>
                        <span className="font-medium text-white">
                            {anime.name}
                        </span>
                    </div>

                    <Button className="flex items-center gap-1 text-sm" variant="outline">
                        <Play />
                        <span>Episode</span>
                        <span className="font-semibold">
                            {anime.episode}
                        </span>
                    </Button>
                </div>
            ))}
        </div>
    )
}

export default ScheduleEpisodeList