import React from "react";
import BentoCard from "@/components/BentoCard";
import { Skeleton } from "@/components/ui/skeleton";

const TopRatedSection = ({ animes = [], isLoading = false }) => {
  if (isLoading) return <TopRatedSkeleton />;
  if (!animes || animes.length === 0) return null;

  // Render exactly 7 unique top rated titles
  const top7Animes = animes.slice(0, 7);

  return (
    <section id="top-rated" aria-labelledby="top-rated-title" className="w-full space-y-6">
      {/* Section Header */}
      <div className="space-y-1">
        <div className="text-[11px] font-semibold text-primary uppercase tracking-[0.22em] font-sans">
          CRITICALLY ADORED
        </div>
        <h2
          id="top-rated-title"
          className="text-2xl sm:text-3xl lg:text-[2rem] font-display font-bold text-foreground tracking-tight"
        >
          Top rated of all time
        </h2>
        <p className="text-sm text-muted-foreground font-sans max-w-2xl">
          Highest community scores across TV and film.
        </p>
      </div>

      {/* Bento Grid (4 Columns Desktop, 2 Columns Mobile, 7 Tiles total) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[11rem] gap-4 w-full">
        {top7Animes.map((item, idx) => {
          const isHero = idx === 0;
          const isWide = idx === 3;
          return (
            <BentoCard
              key={item.id || item._id || idx}
              item={item}
              isHero={isHero}
              isWide={isWide}
            />
          );
        })}
      </div>
    </section>
  );
};

const TopRatedSkeleton = () => {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-9 w-60" />
        <Skeleton className="h-4 w-72" />
      </div>
      {/* Single 34rem rounded-3xl shimmer block spanning the grid area */}
      <Skeleton className="h-[34rem] w-full rounded-3xl" />
    </div>
  );
};

export default TopRatedSection;
