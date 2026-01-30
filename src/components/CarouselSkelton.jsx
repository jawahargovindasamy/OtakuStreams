import React from "react";

const CarouselSkeleton = () => {
  return (
    <div className="flex gap-3 sm:gap-4 overflow-hidden px-1">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="shrink-0 basis-[45%] sm:basis-[30%] md:basis-[23%] lg:basis-[18%] xl:basis-[15%] min-w-0"
        >
          <div className="bg-card rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-transparent">
            {/* Poster skeleton with shimmer */}
            <div className="relative aspect-2/3 w-full rounded-lg bg-muted overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-background/20 to-transparent animate-[shimmer_2s_infinite]"
                style={{ backgroundSize: '200% 100%' }} />
            </div>

            {/* Title skeleton */}
            <div className="mt-2 sm:mt-3 space-y-1.5">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-3 w-2/3 rounded bg-muted/50" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CarouselSkeleton;