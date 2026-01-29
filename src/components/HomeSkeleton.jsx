import React from "react";
import HeroSkelton from "./HeroSkelton";

const Skeleton = ({ className }) => (
    <div className={`animate-pulse rounded bg-gray-300 dark:bg-gray-700 ${className}`} />
);

const HomeSkeleton = () => {
    return (
        <>
            <HeroSkelton />
            <div className="px-6 space-y-12">
                {/* Trending */}
                <div>
                    <Skeleton className="h-8 w-40 mb-4" />
                    <div className="flex gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-60 w-40" />
                        ))}
                    </div>
                </div>

                {/* Grid Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i}>
                            <Skeleton className="h-6 w-32 mb-3" />
                            <div className="space-y-2">
                                {Array.from({ length: 5 }).map((_, j) => (
                                    <Skeleton key={j} className="h-12 w-full" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>

    );
};

export default HomeSkeleton;
