import React, { useEffect, useState } from "react";
import CompactUpdateCard from "@/components/CompactUpdateCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useData } from "@/context/data-provider";

const RecentlyUpdatedSection = ({ initialAnimes }) => {
  const { fetchRecentlyUpdated } = useData();

  const [animes, setAnimes] = useState(initialAnimes || []);
  const [isLoading, setIsLoading] = useState(!initialAnimes || initialAnimes.length === 0);

  useEffect(() => {
    let isMounted = true;

    if (initialAnimes && initialAnimes.length > 0) {
      if (isMounted) {
        setAnimes(initialAnimes);
        setIsLoading(false);
      }
      return;
    }

    const loadUpdates = async () => {
      try {
        if (fetchRecentlyUpdated) {
          const data = await fetchRecentlyUpdated();
          if (isMounted && data && data.length > 0) {
            setAnimes(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch recently updated anime:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadUpdates();

    return () => {
      isMounted = false;
    };
  }, [initialAnimes, fetchRecentlyUpdated]);

  if (isLoading) return <RecentlyUpdatedSkeleton />;
  if (!animes || animes.length === 0) return null;

  // Deduplicate and take first 12 entries
  const uniqueMap = new Map();
  animes.forEach((item) => {
    const id = item.id || item.idMal || item._id;
    if (id && !uniqueMap.has(id)) {
      uniqueMap.set(id, item);
    }
  });
  const displayItems = Array.from(uniqueMap.values()).slice(0, 12);

  return (
    <section
      id="recently-updated"
      aria-labelledby="recently-updated-title"
      className="w-full space-y-5 sm:space-y-6"
    >
      {/* Section Header */}
      <div className="space-y-1">
        <div className="text-[11px] font-semibold text-primary uppercase tracking-[0.22em] font-sans">
          JUST LANDED
        </div>
        <h2
          id="recently-updated-title"
          className="text-2xl sm:text-3xl lg:text-[2rem] font-display font-bold text-foreground tracking-tight"
        >
          Recently updated
        </h2>
        <p className="text-sm text-muted-foreground font-sans max-w-2xl">
          New episodes added across the catalogue.
        </p>
      </div>

      {/* Restrained Single Panel Feed Container */}
      <div className="w-full rounded-3xl border border-border/70 bg-card/30 p-2 sm:p-2.5 shadow-soft">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2 w-full list-none p-0 m-0">
          {displayItems.map((anime, idx) => (
            <CompactUpdateCard key={anime.id || idx} anime={anime} />
          ))}
        </ul>
      </div>
    </section>
  );
};

const RecentlyUpdatedSkeleton = () => {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="w-full rounded-3xl border border-border/70 bg-card/30 p-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentlyUpdatedSection;
