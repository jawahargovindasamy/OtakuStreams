import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-provider';
import { Button } from '@/components/ui/button';

const ContinueWatchingCard = ({ item }) => {
    const navigate = useNavigate();
    const { api, setContinueWatching } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);

    const progress = item?.duration > 0 ? Math.min((item.currentTime / item.duration) * 100, 100) : 0;

    const handleContinue = () => {
        navigate(`/watch/${item.animeId}?${item.episodeId}`, {
            state: {
                animeId: item.animeId,
                resumeTime: item.currentTime,
            },
        });
    };

    const handleRemove = async (e) => {
        e.stopPropagation();

        if (isDeleting) return;

        setIsDeleting(true);

        try {
            await api.delete(`/continue-watching/${item.animeId}`);

            setContinueWatching(prev => prev.filter(watchItem => watchItem._id !== item._id));

            toast.success("Removed from continue watching");
        } catch (error) {
            toast.error("Failed to remove", {
                description: error.response?.data?.message || "Please try again",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div
            className="relative bg-card rounded-xl sm:rounded-2xl p-2 sm:p-3 flex flex-col cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl hover:shadow-primary/5 hover:z-10 active:scale-95 group border border-transparent hover:border-border/50"
            onClick={handleContinue}
        >
            {/* Remove Button - Appears on hover */}
            <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                disabled={isDeleting}
                className="absolute top-3 right-3 z-20 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-black/60 text-white hover:bg-destructive hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 focus-visible:opacity-100"
                aria-label="Remove from continue watching"
            >
                {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
            </Button>

            <div className="relative overflow-hidden rounded-lg aspect-2/3 bg-muted">
                <img
                    src={item?.animeImage}
                    alt={item?.animeTitle}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />

                {/* Hover gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center text-primary-foreground shadow-lg">
                        <svg
                            className="h-5 w-5 sm:h-6 sm:w-6 fill-current ml-0.5"
                            viewBox="0 0 24 24"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/40">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Title */}
            <h3 className="mt-2 sm:mt-3 text-sm sm:text-base font-semibold leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
                {item?.animeTitle}
            </h3>

            {/* Episode info */}
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1" title={item?.episodeTitle}>
                {item?.episodeTitle}
            </p>
        </div>
    );
};

export default ContinueWatchingCard;