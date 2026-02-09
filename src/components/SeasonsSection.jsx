import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import SectionHeader from '@/components/SectionHeader';

const SeasonsSection = ({ seasons }) => {
    const navigate = useNavigate();

    if (!seasons || seasons.length === 0) {
        return null;
    }

    return (
        <section className="space-y-4 sm:space-y-5">
            <SectionHeader title="More Seasons" />
            <div className="flex flex-wrap gap-2 sm:gap-3">
                {seasons.map((season) => (
                    <Button
                        key={season.id}
                        variant="outline"
                        className="flex items-center justify-between rounded-xl bg-card/50 border-border/50 px-4 sm:px-6 py-5 sm:py-6 h-auto backdrop-blur-sm hover:bg-accent hover:border-primary/30 transition-all duration-200 group"
                        onClick={() => navigate(`/${season.id}`)}
                    >
                        <span className="text-sm sm:text-base font-medium text-foreground group-hover:text-foreground">
                            {season.title}
                        </span>
                    </Button>
                ))}
            </div>
        </section>
    );
};

export default SeasonsSection;