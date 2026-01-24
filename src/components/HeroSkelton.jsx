import React from 'react'

const HeroSkelton = () => {
    return (
        <div className="relative h-[70vh] md:h-[calc(100vh-64px)] overflow-hidden">
            {/* Background shimmer */}
            <div className="absolute inset-0 bg-card animate-pulse" />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-bl from-transparent via-black/60 to-black" />

            {/* Content skeleton */}
            <div className="relative z-10 flex h-full max-w-3xl flex-col justify-end px-8 md:px-16 pb-8">
                <div className="h-4 w-32 rounded bg-white/20 mb-3 animate-pulse" />

                <div className="space-y-2">
                    <div className="h-8 md:h-12 w-full rounded bg-white/20 animate-pulse" />
                    <div className="h-8 md:h-12 w-3/4 rounded bg-white/20 animate-pulse" />
                </div>

                <div className="mt-4 hidden md:flex gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-7 w-24 rounded bg-white/15 animate-pulse"
                        />
                    ))}
                </div>

                <div className="mt-6 hidden md:block space-y-2">
                    <div className="h-4 w-full rounded bg-white/15 animate-pulse" />
                    <div className="h-4 w-5/6 rounded bg-white/15 animate-pulse" />
                    <div className="h-4 w-2/3 rounded bg-white/15 animate-pulse" />
                </div>

                <div className="mt-8 flex gap-4">
                    <div className="h-12 w-40 rounded-full bg-white/30 animate-pulse" />
                    <div className="h-12 w-32 rounded-full bg-white/15 animate-pulse" />
                </div>
            </div>
        </div>
    )
}

export default HeroSkelton