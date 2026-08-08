import React, { useEffect, useState } from "react";
import PosterCard from "@/components/PosterCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useData } from "@/context/data-provider";

const getCurrentSeasonInfo = () => {
  const seasons = ["WINTER", "SPRING", "SUMMER", "FALL"];
  const now = new Date();
  const month = now.getMonth();
  const season = seasons[Math.floor(month / 3)];
  const year = now.getFullYear();
  return { season, year };
};

const NewReleasesSection = ({ animes: propAnimes = [] }) => {
  const { fetchNewReleases, homedata } = useData();
  const { season: currentSeason, year: currentYear } = getCurrentSeasonInfo();
  const [mediaList, setMediaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Prioritize passed propAnimes
    if (propAnimes && propAnimes.length > 0) {
      if (isMounted) {
        setMediaList(propAnimes.slice(0, 14));
        setIsLoading(false);
      }
      return;
    }

    // 2. Try context data if available
    const homeNewReleases = homedata?.data?.newReleaseAnimes;
    if (homeNewReleases && homeNewReleases.length > 0) {
      if (isMounted) {
        setMediaList(homeNewReleases.slice(0, 14));
        setIsLoading(false);
      }
      return;
    }

    const loadNewReleases = async () => {
      try {
        if (fetchNewReleases) {
          const res = await fetchNewReleases(currentSeason, currentYear);
          if (isMounted && res && res.length > 0) {
            setMediaList(res.slice(0, 14));
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Error fetching new releases from DataContext:", err);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    loadNewReleases();

    return () => {
      isMounted = false;
    };
  }, [fetchNewReleases, homedata, currentSeason, currentYear, propAnimes]);

  if (isLoading) return <NewReleasesSkeleton seasonLabel={`${currentSeason} ${currentYear}`} />;
  if (!mediaList || mediaList.length === 0) return null;

  // Derive dynamic Season & Year from the API response item (fallback to system date)
  const firstItem = mediaList[0];
  const displaySeason = firstItem?.season || currentSeason;
  const displayYear = firstItem?.seasonYear || currentYear;
  const eyebrowLabel = `${displaySeason} ${displayYear}`;

  return (
    <section id="new-releases" aria-labelledby="new-releases-title" className="w-full space-y-6">
      {/* Section Header */}
      <div className="space-y-1">
        <div className="text-[11px] font-semibold text-primary uppercase tracking-[0.22em] font-sans">
          {eyebrowLabel}
        </div>
        <h2
          id="new-releases-title"
          className="text-2xl sm:text-3xl lg:text-[2rem] font-display font-bold text-foreground tracking-tight"
        >
          New releases
        </h2>
        <p className="text-sm text-muted-foreground font-sans max-w-2xl">
          Fresh from this season's line-up.
        </p>
      </div>

      {/* Horizontal Snap Rail (Aligned with section header margin) */}
      <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-3 snap-x snap-mandatory no-scrollbar w-full">
        {mediaList.map((item, idx) => (
          <PosterCard
            key={item.id || item._id || idx}
            item={item}
          />
        ))}
      </div>
    </section>
  );
};

const NewReleasesSkeleton = ({ seasonLabel = "NEW SEASON" }) => {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-4 overflow-hidden w-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="shrink-0 w-[46vw] sm:w-[13rem] lg:w-[14rem] space-y-2">
            <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewReleasesSection;
