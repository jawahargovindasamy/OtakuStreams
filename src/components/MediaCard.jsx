import React, { useCallback, useRef, useState, useMemo } from "react";
import { useData } from "@/context/data-provider";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-provider";
import MediaCardPopover from "./MediaCardPopover";

const MediaCard = ({ id, jname = "", rank = null, showRank = false }) => {
    const { fetchanimeinfo, fetchepisodeinfo } = useData();
    const { language } = useAuth();
    const [item, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const getAnimeInfo = async () => {
            setLoading(true);
            const data = await fetchanimeinfo(id);
            if (mounted) {
                setInfo(data);
                setLoading(false);
            }
        }
        getAnimeInfo();
        return () => {
            mounted = false;
        };
    }, [id, fetchanimeinfo])

    const navigate = useNavigate();

    const timerRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [playlist1, setPlaylist1] = useState(null);

    const playlist = useMemo(
        () => [
            "Watching",
            "On-Hold",
            "Plan to Watch",
            "Completed",
            "Dropped",
            "Remove",
        ],
        []
    );

    const handleMouseEnter = () => {
        timerRef.current = setTimeout(() => setOpen(true), 250);
    };

    const handleMouseLeave = () => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setOpen(false), 150);
    };

    const handlePlay = useCallback(
        async (id) => {
            const data = await fetchepisodeinfo(id);
            navigate(`/watch/${data.data.episodes[0].episodeId}`);
        },
        [fetchepisodeinfo, navigate]
    );

    if (loading) {
        return (
            <div className="bg-[#0f172a] px-2 py-4 rounded-2xl">
                <div className="h-60 w-full rounded-lg bg-[#1e293b] animate-pulse" />
                <div className="mt-3 h-4 w-3/4 rounded bg-[#1e293b] animate-pulse" />
            </div>
        );
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
            setPlaylist1={setPlaylist1}
        >
            <div
                className="relative bg-[#0f172a] px-2 py-4 rounded-2xl flex flex-col cursor-pointer transition-transform hover:scale-105 group"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Rank Number - Netflix Style */}
                {showRank && rank !== null && (
                    <div 
                        className="absolute -left-3 -bottom-3 z-10 text-8xl md:text-9xl font-black leading-none pointer-events-none select-none"
                        style={{ 
                            WebkitTextStroke: '2px rgba(255, 255, 255, 0.3)',
                            color: 'transparent',
                            textShadow: '0 0 20px rgba(0,0,0,0.5)'
                        }}
                    >
                        {rank}
                    </div>
                )}

                <div className="relative">
                    <img
                        src={item?.info.poster}
                        alt={item?.info.name}
                        className="h-60 w-full rounded-lg object-cover"
                    />
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                </div>

                <h1 className="line-clamp-1 mt-2 font-bold leading-tight text-white">
                    {language === "EN" ? item?.info.name : jname}
                </h1>
            </div>
        </MediaCardPopover>
    );
};

export default MediaCard;