import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import HeroSkelton from "./HeroSkelton";

const HomeSkeleton = () => {
  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-300">
      <HeroSkelton />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10 space-y-8 sm:space-y-10 lg:space-y-12">
        
        {/* Trending Section */}
        <section className="space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 sm:h-8 w-32 sm:w-40" />
            <Skeleton className="h-8 sm:h-9 w-20 sm:w-24" />
          </div>
          <div className="flex gap-3 sm:gap-4 overflow-hidden pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shrink-0 w-35 sm:w-40 lg:w-45 space-y-2">
                <Skeleton className="aspect-2/3 w-full rounded-lg sm:rounded-xl" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </section>

        {/* Grid Sections - Top Lists */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 sm:space-y-4">
              <Skeleton className="h-6 sm:h-7 w-28 sm:w-32" />
              <div className="bg-card/30 rounded-xl border border-border/50 p-3 sm:p-4 space-y-2 sm:space-y-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-14 w-10 sm:h-16 sm:w-12 rounded-md shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 sm:h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_380px] gap-6 sm:gap-8 lg:gap-10">
          {/* Main Column */}
          <div className="space-y-8 sm:space-y-10">
            
            {/* Latest Episodes */}
            <section className="space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-7 sm:h-8 w-36 sm:w-44" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-2/3 w-full rounded-lg" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </section>

            {/* Schedule Section */}
            <section className="space-y-4 sm:space-y-5 bg-card/30 rounded-2xl p-4 sm:p-6 border border-border/50">
              <Skeleton className="h-7 sm:h-8 w-40 sm:w-48" />
              <Skeleton className="h-20 sm:h-24 w-full rounded-xl" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 sm:h-14 w-full rounded-lg" />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar - Desktop Skeleton */}
          <aside className="hidden lg:block space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-20" />
                <div className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full rounded-md" />
                    ))}
                  </div>
                  <Skeleton className="h-8 w-full rounded-md mt-2" />
                </div>
              </div>
              
              <div className="space-y-3">
                <Skeleton className="h-6 w-20" />
                <div className="bg-card/30 border border-border/50 rounded-xl p-3 space-y-2">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-64 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile Sidebar Skeleton */}
        <section className="block lg:hidden space-y-4">
          <Skeleton className="h-6 w-20" />
          <div className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md" />
              ))}
            </div>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomeSkeleton;