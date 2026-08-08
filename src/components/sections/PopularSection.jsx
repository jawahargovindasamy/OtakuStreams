import React from "react";
import RankingCard from "@/components/RankingCard";
import { Skeleton } from "@/components/ui/skeleton";

const PopularSection = ({ animes = [], isLoading = false }) => {
  if (isLoading) return <PopularSkeleton />;
  if (!animes || animes.length === 0) return null;

  // Render top 10 popular titles
  const top10Animes = animes.slice(0, 10);

  return (
    <section id="popular" aria-labelledby="popular-title" className="w-full space-y-6">
      {/* Section Header */}
      <div className="space-y-1">
        <div className="text-[11px] font-semibold text-primary uppercase tracking-[0.18em] font-sans">
          MOST WATCHED
        </div>
        <h2
          id="popular-title"
          className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground tracking-tight"
        >
          Popular this week
        </h2>
        <p className="text-sm text-muted-foreground font-sans max-w-[48ch]">
          The ten titles pulling the biggest audiences.
        </p>
      </div>

      {/* Leaderboard List (2-column desktop, 1-column mobile) */}
      <ol className="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full">
        {top10Animes.map((item, idx) => (
          <RankingCard
            key={item.id || item._id || idx}
            item={item}
            rank={idx + 1}
          />
        ))}
      </ol>
    </section>
  );
};

const PopularSkeleton = () => {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl w-full" />
        ))}
      </div>
    </div>
  );
};

export default PopularSection;
