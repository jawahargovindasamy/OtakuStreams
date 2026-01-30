import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const HeroSkelton = () => {
  return (
    <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[calc(100vh-80px)] w-full overflow-hidden bg-muted">
      {/* Background shimmer effect */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-background/10 to-transparent animate-shimmer" 
           style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite' }} />
      
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-r from-background/90 via-background/30 to-transparent" />
      
      {/* Content skeleton */}
      <div className="relative z-10 flex h-full items-end pb-8 sm:pb-12 lg:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-2xl lg:max-w-3xl space-y-4 sm:space-y-6">
            {/* Badge skeleton */}
            <Skeleton className="h-6 sm:h-8 w-32 sm:w-40 rounded-full" />
            
            {/* Title skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-8 sm:h-12 md:h-16 lg:h-20 w-3/4" />
              <Skeleton className="h-8 sm:h-12 md:h-16 lg:h-20 w-1/2" />
            </div>
            
            {/* Meta info skeleton - hidden on mobile */}
            <div className="hidden sm:flex flex-wrap gap-2">
              <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 rounded-md" />
              <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 rounded-md" />
              <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 rounded-md" />
              <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 rounded-md" />
            </div>
            
            {/* Description skeleton - tablet and up */}
            <div className="hidden md:block space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            
            {/* Buttons skeleton */}
            <div className="flex gap-3 sm:gap-4 pt-2">
              <Skeleton className="h-10 sm:h-12 w-32 sm:w-40 rounded-full" />
              <Skeleton className="h-10 sm:h-12 w-28 sm:w-36 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomeSkeleton = () => {
  return (
    <>
      <HeroSkelton />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* Trending Section */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 sm:h-8 w-32 sm:w-48" />
            <Skeleton className="h-8 sm:h-9 w-20 sm:w-24 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2 sm:space-y-3">
                <Skeleton className="aspect-2/3 w-full rounded-lg sm:rounded-xl" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </section>

        {/* Grid Sections - Latest Episodes, etc */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <section key={i} className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 sm:h-7 w-28 sm:w-36" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-md shrink-0" />
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
};

export default HomeSkeleton;