import React from "react";

const CarouselSkeleton = () => {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-[#0f172a] px-2 py-4 rounded-2xl w-50 shrink-0"
        >
          {/* Poster skeleton */}
          <div className="relative h-60 rounded-lg overflow-hidden bg-[#1e293b]">
            <div className="absolute inset-0 animate-pulse bg-linear-to-r from-[#1e293b] via-[#334155] to-[#1e293b]" />
          </div>

          {/* Title skeleton */}
          <div className="mt-3 space-y-2">
            <div className="h-4 w-full rounded bg-[#1e293b] animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-[#1e293b] animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CarouselSkeleton;
