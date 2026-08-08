import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

const AnimeSkeleton = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full pt-16 lg:pt-20">
        {/* Band 1: Cinematic Hero Skeleton */}
        <section className="relative w-full min-h-[75vh] lg:min-h-[85vh] bg-surface/30 border-b border-border/60 overflow-hidden flex items-center">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 py-10 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12 items-center">
              {/* Poster Card Skeleton */}
              <div className="flex justify-center lg:justify-start">
                <Skeleton className="w-[200px] sm:w-[240px] lg:w-[280px] aspect-[2/3] rounded-2xl shadow-2xl" />
              </div>

              {/* Detail Info Skeleton */}
              <div className="space-y-6 text-center lg:text-left">
                {/* Badges row */}
                <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Skeleton className="h-9 sm:h-12 w-3/4 mx-auto lg:mx-0 rounded-xl" />
                  <Skeleton className="h-6 w-1/2 mx-auto lg:mx-0 rounded-lg" />
                </div>

                {/* Quick Stats Grid */}
                <div className="flex items-center justify-center lg:justify-start gap-6 py-2">
                  <Skeleton className="h-10 w-20 rounded-xl" />
                  <Skeleton className="h-10 w-24 rounded-xl" />
                  <Skeleton className="h-10 w-20 rounded-xl" />
                </div>

                {/* Description lines */}
                <div className="space-y-2 max-w-2xl mx-auto lg:mx-0">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-11/12 rounded" />
                  <Skeleton className="h-4 w-4/5 rounded" />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
                  <Skeleton className="h-12 w-40 rounded-full" />
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Band 2: Story & Essential Facts Skeleton */}
        <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-10">
            {/* Story & Synopsis */}
            <div className="space-y-6">
              <Skeleton className="h-8 w-44 rounded-lg" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
                <Skeleton className="h-4 w-4/5 rounded" />
                <Skeleton className="h-4 w-11/12 rounded" />
              </div>

              {/* Genres Tag Cloud */}
              <div className="pt-4 space-y-3">
                <Skeleton className="h-5 w-24 rounded" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-8 w-16 rounded-full" />
                  <Skeleton className="h-8 w-28 rounded-full" />
                  <Skeleton className="h-8 w-22 rounded-full" />
                </div>
              </div>
            </div>

            {/* Essential Facts Sidebar */}
            <div className="bg-surface/50 border border-border/70 rounded-3xl p-6 space-y-4">
              <Skeleton className="h-7 w-36 rounded-lg mb-6" />
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-32 rounded" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Band 3: Characters Rail Skeleton */}
        <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 py-8 space-y-6">
          <Skeleton className="h-8 w-56 rounded-lg" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* Band 4: Recommendations Rail Skeleton */}
        <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 py-10 space-y-6">
          <Skeleton className="h-8 w-60 rounded-lg" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-3 w-2/3 rounded" />
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AnimeSkeleton;
