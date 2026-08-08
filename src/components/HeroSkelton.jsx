import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const HeroSkelton = () => {
  return (
    <div className="relative h-[490px] sm:h-[580px] lg:h-[88vh] min-h-[460px] max-h-[760px] w-full overflow-hidden bg-background">
      {/* Background scrim skeleton */}
      <div className="absolute inset-0 bg-muted/20 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      
      {/* Content Skeleton */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-full flex flex-col justify-center pt-14 sm:pt-20 pb-12 sm:pb-16">
        <div className="w-full max-w-xl lg:max-w-2xl bg-surface/80 border border-border/60 rounded-2xl sm:rounded-[22px] p-4 sm:p-6 lg:p-8 space-y-3">
          {/* Eyebrow */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-3.5 w-14" />
          </div>
          
          {/* Title */}
          <div className="space-y-1.5">
            <Skeleton className="h-7 sm:h-10 w-full rounded-lg" />
            <Skeleton className="h-7 sm:h-10 w-3/4 rounded-lg" />
          </div>

          {/* Meta */}
          <div className="flex gap-2.5">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>

          {/* Genre chips */}
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-32 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSkelton;