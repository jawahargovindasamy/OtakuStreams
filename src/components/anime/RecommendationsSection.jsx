import React from "react";
import PosterCard from "@/components/PosterCard";

const RecommendationsSection = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <section className="w-full border-t border-border/70 bg-card/20 py-6 sm:py-8 text-foreground font-sans">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 space-y-6 sm:space-y-8">
        
        {/* Section Header */}
        <div className="space-y-1 text-left">
          <div className="text-[11px] font-semibold text-primary uppercase tracking-[0.22em]">
            HANDPICKED FOR YOU
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
            If this story stays with you
          </h2>
        </div>

        {/* Poster Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 w-full">
          {recommendations.slice(0, 12).map((item, idx) => {
            const anime = item.mediaRecommendation || item.node || item;
            return (
              <PosterCard
                key={anime.id || idx}
                item={anime}
                className="w-full cursor-pointer group flex flex-col focus-within:ring-2 focus-within:ring-primary rounded-2xl"
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecommendationsSection;
