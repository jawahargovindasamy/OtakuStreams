import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import SectionHeader from '@/components/SectionHeader';

const SeasonsSection = ({ seasons, id }) => {
    const navigate = useNavigate();

    if (!seasons || seasons.length === 0) {
        return null;
    }

    return (
        <section className="space-y-4 sm:space-y-5">
            <SectionHeader title="More Seasons" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {seasons.map((season) => {
                    const isActive = season.id === id;
                    return (
                        <Button
                            key={season.id}
                            variant={isActive ? "default" : "outline"}
                            className={`
                                w-full h-16 rounded-xl backdrop-blur-sm transition-all
                                ${isActive
                                    ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-lg shadow-primary/25'
                                    : 'bg-card/50 border-border/50 hover:bg-accent hover:border-primary/30'
                                }
                            `}
                            onClick={() => navigate(`/${season.id}`)}
                        >
                            <span className="truncate text-sm font-medium" title={season.title}>
                                {season.title}
                            </span>
                        </Button>
                    )
                }

                )}
            </div>

        </section>
    );
};

export default SeasonsSection;