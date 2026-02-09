import { ClosedCaption, Mic, Play, Plus, Check, Share2, Calendar, Clock, Star, Building2, Globe, Clapperboard, Loader2, Users, AppWindow, TrendingUp } from 'lucide-react';
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// Color styles mapping for Tailwind
const colorStyles = {
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400",
};

// Utility to convert strings to URL-friendly slugs
const slugify = (text) => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};

function Meta({ label, value, icon: Icon, href, isArray }) {
    if (!value || value === '?' || (Array.isArray(value) && value.length === 0)) return null;

    const renderContent = () => {
        if (isArray && Array.isArray(value)) {
            return (
                <div className="flex flex-wrap gap-1">
                    {value.map((item, index) => (
                        <span key={item}>
                            <Link
                                to={`/producer/${slugify(item)}`}
                                className="text-sm text-primary font-medium hover:underline hover:text-primary/80 transition-colors"
                            >
                                {item}
                            </Link>
                            {index < value.length - 1 && <span className="text-muted-foreground">, </span>}
                        </span>
                    ))}
                </div>
            );
        }

        if (href) {
            return (
                <Link
                    to={href}
                    className="text-sm text-primary font-medium hover:underline hover:text-primary/80 transition-colors"
                >
                    {value}
                </Link>
            );
        }

        return (
            <p className="text-sm text-foreground font-medium leading-relaxed">
                {value}
            </p>
        );
    };

    return (
        <div className="flex items-start gap-3 group">
            {Icon && (
                <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-4 h-4" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                    {label}
                </p>
                {renderContent()}
            </div>
        </div>
    );
}

function GenrePill({ label }) {
    return (
        <Link to={`/genre/${label.toLowerCase().replace(/\s+/g, '-')}`}>
            <Badge
                variant="secondary"
                className="px-3 py-1 rounded-full bg-secondary/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-border/50 text-xs cursor-pointer transition-all duration-200 hover:scale-105"
            >
                {label}
            </Badge>
        </Link>
    );
}

function StatBadge({ icon: Icon, value, label, colorKey = "emerald" }) {
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${colorStyles[colorKey]}`}>
            <Icon className="w-4 h-4" />
            <span className="text-sm font-semibold">{value}</span>
            <span className="text-xs opacity-80 hidden sm:inline">{label}</span>
        </div>
    );
}

const AnimeDetails = ({ anime, handlePlay, isPlaying }) => {
    const [playlist1, setPlaylist1] = useState(null);
    const [showmore, setShowmore] = useState(false);

    const playlist = useMemo(
        () => [
            "Watching",
            "On-Hold",
            "Plan to Watch",
            "Completed",
            "Dropped",
            "Remove",
        ],
        []
    );

    if (!anime?.info) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-8">
                    <Skeleton className="h-100 rounded-xl" />
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                    <Skeleton className="h-75 rounded-xl" />
                </div>
            </div>
        );
    }

    const { info, moreInfo } = anime;
    const backdropImage = info.poster?.replace('poster', 'banner') || info.poster;

    return (
        <div className="relative min-h-150">
            {/* Background Image with Gradient Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${backdropImage})` }}
            >
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/95 to-background/60" />
                <div className="absolute inset-0 bg-linear-to-r from-background/90 via-background/40 to-transparent" />
                <div className="absolute inset-0 backdrop-blur-[2px]" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_320px] xl:grid-cols-[280px_1fr_340px] gap-6 lg:gap-8">

                        {/* LEFT – Poster */}
                        <div className="space-y-4">
                            <div className="relative group max-w-75 lg:max-w-none mx-auto lg:mx-0">
                                <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-primary/40 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                                <img
                                    src={info.poster}
                                    alt={info.name}
                                    className="relative w-full rounded-xl shadow-2xl shadow-black/20 border border-border/50 
                                             transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-primary/10"
                                    loading="eager"
                                />
                                {info.stats?.rating && (
                                    <div className="absolute top-3 left-3">
                                        <Badge className="bg-black/60 backdrop-blur-md text-white border-0 font-semibold">
                                            {info.stats.rating}
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {/* Mobile-only action buttons */}
                            <div className="lg:hidden flex gap-3 max-w-75 mx-auto">
                                <Button
                                    disabled={isPlaying}
                                    onClick={() => handlePlay(info.id)}
                                    className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground 
                                             font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 
                                             hover:scale-[1.02] active:scale-95"
                                >
                                    {isPlaying ? (
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    ) : (
                                        <Play className="h-5 w-5 fill-current mr-2" />
                                    )}
                                    Watch Now
                                </Button>
                                <Popover modal={false}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="h-12 px-6 rounded-xl border-border/50 hover:bg-accent hover:text-accent-foreground 
                                                     transition-all duration-200 hover:border-primary/30"
                                        >
                                            {playlist1 === null ? (
                                                <div className='flex items-center gap-2'>
                                                    <Plus className="h-5 w-5" />
                                                    <span>Add to List</span>
                                                </div>
                                            ) : (
                                                <div className='flex items-center gap-2'>
                                                    <Check className="h-5 w-5 text-emerald-500" />
                                                    <span>{playlist1}</span>
                                                </div>
                                            )}
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent
                                        side="bottom"
                                        align="start"
                                        className="w-48 p-1.5 border-border/50 bg-popover/95 backdrop-blur-xl shadow-xl"
                                    >
                                        <div className="space-y-0.5">
                                            {playlist.map((item) => (
                                                <Button
                                                    key={item}
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`w-full justify-between text-sm font-medium transition-all duration-200 rounded-lg
                                                        ${playlist1 === item
                                                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                                                            : "hover:bg-accent text-foreground"
                                                        }`}
                                                    onClick={() => setPlaylist1(item === 'Remove' ? null : item)}
                                                >
                                                    {item}
                                                    {playlist1 === item && item !== 'Remove' && (
                                                        <Check className="h-4 w-4 text-primary" />
                                                    )}
                                                </Button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* CENTER – Main content */}
                        <div className="space-y-6">
                            {/* Breadcrumb */}
                            <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                <Link to="/home" className="hover:text-primary transition-colors">
                                    Home
                                </Link>
                                <span className="text-border">/</span>
                                <Link to={`/${info.stats.type === "TV" ? "tv" : "movie"}`} className="hover:text-primary transition-colors">
                                    {info.stats.type === "TV" ? "Tv" : "Movie"}
                                </Link>
                                <span className="text-border">/</span>
                                <span className="text-foreground font-medium truncate max-w-50 sm:max-w-md">
                                    {info.name}
                                </span>
                            </nav>

                            {/* Title */}
                            <div>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-2">
                                    {info.name}
                                </h1>
                                {moreInfo?.japanese && (
                                    <p className="text-lg text-muted-foreground font-medium">
                                        {moreInfo.japanese}
                                    </p>
                                )}
                            </div>

                            {/* Stats Row */}
                            <div className="flex flex-wrap items-center gap-3">
                                {info.stats?.quality && (
                                    <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-2.5 py-1">
                                        {info.stats.quality}
                                    </Badge>
                                )}

                                {info.stats?.episodes?.sub > 0 && (
                                    <StatBadge
                                        icon={ClosedCaption}
                                        value={info.stats.episodes.sub}
                                        label="SUB"
                                        colorKey="emerald"
                                    />
                                )}

                                {info.stats?.episodes?.dub > 0 && (
                                    <StatBadge
                                        icon={Mic}
                                        value={info.stats.episodes.dub}
                                        label="DUB"
                                        colorKey="blue"
                                    />
                                )}

                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>{info.stats?.duration || '24 min'}</span>
                                </div>

                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <Calendar className="w-4 h-4" />
                                    <span>{info.stats?.type || 'TV'}</span>
                                </div>
                            </div>

                            {/* Action Buttons - Desktop */}
                            <div className="hidden lg:flex gap-3">
                                <Button
                                    disabled={isPlaying}
                                    onClick={() => handlePlay(info.id)}
                                    className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground 
                                             font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 
                                             hover:scale-[1.02] active:scale-95 text-base"
                                >
                                    {isPlaying ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-5 w-5 fill-current mr-2" />
                                            Watch Now
                                        </>
                                    )}
                                </Button>

                                <Popover modal={false}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="h-12 px-6 rounded-xl border-border/50 hover:bg-accent hover:text-accent-foreground 
                                                     transition-all duration-200 hover:border-primary/30"
                                        >
                                            {playlist1 === null ? (
                                                <div className='flex items-center gap-2'>
                                                    <Plus className="h-5 w-5" />
                                                    <span>Add to List</span>
                                                </div>
                                            ) : (
                                                <div className='flex items-center gap-2'>
                                                    <Check className="h-5 w-5 text-emerald-500" />
                                                    <span>{playlist1}</span>
                                                </div>
                                            )}
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent
                                        side="bottom"
                                        align="start"
                                        className="w-48 p-1.5 border-border/50 bg-popover/95 backdrop-blur-xl shadow-xl"
                                    >
                                        <div className="space-y-0.5">
                                            {playlist.map((item) => (
                                                <Button
                                                    key={item}
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`w-full justify-between text-sm font-medium transition-all duration-200 rounded-lg
                                                        ${playlist1 === item
                                                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                                                            : "hover:bg-accent text-foreground"
                                                        }`}
                                                    onClick={() => setPlaylist1(item === 'Remove' ? null : item)}
                                                >
                                                    {item}
                                                    {playlist1 === item && item !== 'Remove' && (
                                                        <Check className="h-4 w-4 text-primary" />
                                                    )}
                                                </Button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 rounded-xl border-border/50 hover:bg-accent hover:text-accent-foreground 
                                             transition-all duration-200 hover:scale-105"
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                    }}
                                >
                                    <Share2 className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Synopsis */}
                            <div className="space-y-3">
                                <div className={`relative ${showmore ? '' : 'max-h-30'} overflow-hidden transition-all duration-300`}>
                                    <p className="text-muted-foreground leading-relaxed text-base">
                                        {info.description || "No description available."}
                                    </p>
                                    {!showmore && info.description?.length > 200 && (
                                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-background to-transparent" />
                                    )}
                                </div>
                                {info.description?.length > 200 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-primary hover:text-primary hover:bg-primary/10 px-0 h-auto font-medium"
                                        onClick={() => setShowmore(!showmore)}
                                    >
                                        {showmore ? "Show less" : "Show more"}
                                    </Button>
                                )}
                            </div>

                            {/* Info Footer */}
                            <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Star className="w-5 h-5 text-primary fill-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-foreground">{moreInfo?.malscore || 'N/A'}</p>
                                        <p className="text-xs text-muted-foreground">MAL Score</p>
                                    </div>
                                </div>

                                <Separator orientation="vertical" className="h-10 bg-border/50" />

                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">
                                        OtakuStreams is the best site to Watch <span className="text-foreground font-semibold">{info.name}</span> SUB online, or you can even watch <span className="text-foreground font-semibold">{info.name}</span> DUB in HD quality. You can also find<span className="text-foreground font-semibold">{moreInfo?.studios && ` Produced by ${moreInfo.studios}`}</span> anime on OtakuStreams website.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT – Metadata Panel */}
                        <div className="lg:sticky lg:top-24 h-fit">
                            <div className="bg-card/50 backdrop-blur-xl rounded-2xl p-6 border border-border/50 shadow-xl shadow-black/5 space-y-5">
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    <Clapperboard className="w-5 h-5 text-primary" />
                                    Information
                                </h3>

                                <div className="space-y-4">
                                    <Meta label="Synonyms" value={moreInfo?.synonyms} icon={AppWindow} />
                                    <Meta label="Aired" value={moreInfo?.aired} icon={Calendar} />
                                    <Meta label="Premiered" value={moreInfo?.premiered} icon={Calendar} />
                                    <Meta label="Status" value={moreInfo?.status} icon={TrendingUp} />

                                    <Meta
                                        label="Studios"
                                        value={moreInfo?.studios}
                                        icon={Building2}
                                        href={moreInfo?.studios ? `/producer/${slugify(moreInfo.studios)}` : null}
                                    />

                                    {moreInfo?.producers && moreInfo.producers.length > 0 && (
                                        <div className="flex items-start gap-3 group">
                                            <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                                    Producers
                                                </p>
                                                <div className="flex flex-wrap gap-x-1 gap-y-1">
                                                    {moreInfo.producers.map((producer, index) => (
                                                        <span key={producer}>
                                                            <Link
                                                                to={`/producer/${slugify(producer)}`}
                                                                className="text-sm text-primary font-medium hover:underline hover:text-primary/80 transition-colors"
                                                            >
                                                                {producer}
                                                            </Link>
                                                            {index < moreInfo.producers.length - 1 && (
                                                                <span className="text-muted-foreground">, </span>
                                                            )}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {moreInfo?.genres && moreInfo.genres.length > 0 && (
                                    <>
                                        <Separator className="bg-border/50" />
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                                Genres
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {moreInfo.genres.map((g) => (
                                                    <GenrePill key={g} label={g} />
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnimeDetails