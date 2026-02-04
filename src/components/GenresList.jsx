import React from 'react'
import SectionHeader from './SectionHeader'
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const GenresList = ({
    data,
    showAll,
    setShowAll }) => {

    const navigate = useNavigate();

    const maxInitial = 24;
    const genresToShow = showAll
        ? data?.genres
        : data?.genres?.slice(0, maxInitial);

    const getGenreColor = (genre) => {
        let hash = 0;
        for (let i = 0; i < genre.length; i++) {
            hash = genre.charCodeAt(i) + ((hash << 5) - hash);
        }
        return `hsl(${hash % 360},70%,70%)`;
    };

    return (
        <section className="space-y-3 sm:space-y-4">
            <SectionHeader title="Genres" />
            <div className="bg-card/50 border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {genresToShow.map((genre) => (
                        <div
                            key={genre}
                            onClick={() =>
                                navigate(`/genre/${encodeURIComponent(genre.toLowerCase())}`)
                            }
                            className="group cursor-pointer text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-muted/50 hover:bg-accent border border-transparent hover:border-border/50 transition-all duration-200 flex items-center gap-1.5"
                        >
                            <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: getGenreColor(genre) }}
                            />
                            <span className="truncate text-foreground group-hover:text-primary transition-colors">
                                {genre}
                            </span>
                        </div>
                    ))}
                </div>

                {data.genres.length > maxInitial && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-3 sm:mt-4 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        onClick={() => setShowAll((p) => !p)}
                    >
                        {showAll ? (
                            <span className="flex items-center gap-1.5">
                                Show Less <ChevronUp className="h-3.5 w-3.5" />
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5">
                                Show More <ChevronDown className="h-3.5 w-3.5" />
                            </span>
                        )}
                    </Button>
                )}
            </div>
        </section>
    )
}

export default GenresList