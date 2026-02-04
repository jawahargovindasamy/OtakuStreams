// Filter.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Filter as FilterIcon, RotateCcw, Calendar, ChevronDown } from 'lucide-react';

const FilterSelect = ({
    placeholder,
    options,
    value,
    onChange,
    icon: Icon
}) => {
    return (
        <div className='flex flex-col gap-1.5'>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {placeholder}
            </label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full bg-muted/40 border-border/50 text-foreground hover:bg-muted/60 transition-all duration-200 focus:ring-2 focus:ring-primary/20 h-10 rounded-lg">
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground mr-2" />}
                    <SelectValue placeholder={`Select ${placeholder}`} />
                </SelectTrigger>
                <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/50 rounded-lg shadow-xl">
                    {options.map((opt) => (
                        <SelectItem 
                            key={opt.value} 
                            value={opt.value}
                            className="focus:bg-accent focus:text-accent-foreground cursor-pointer rounded-md mx-1 my-0.5"
                        >
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

const GENRES = [
    "Action", "Adventure", "Cars", "Comedy", "Dementia", "Demons", "Drama",
    "Ecchi", "Fantasy", "Game", "Harem", "Historical", "Horror", "Isekai",
    "Josei", "Kids", "Magic", "Martial Arts", "Mecha", "Military", "Music",
    "Mystery", "Parody", "Police", "Psychological", "Romance", "Samurai",
    "School", "Sci-Fi", "Seinen", "Shoujo", "Shoujo Ai", "Shounen", "Shounen Ai",
    "Slice of Life", "Space", "Sports", "Super Power", "Supernatural", "Thriller",
    "Vampire"
];

const Filter = ({ filters, onFilterChange, onReset, keyword }) => {
    const [localFilters, setLocalFilters] = useState(filters);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const toggleGenre = useCallback((genre) => {
        setLocalFilters((prev) => ({
            ...prev,
            genres: prev.genres.includes(genre)
                ? prev.genres.filter((g) => g !== genre)
                : [...prev.genres, genre]
        }));
    }, []);

    const clearGenres = useCallback(() => {
        setLocalFilters((prev) => ({ ...prev, genres: [] }));
    }, []);

    const handleFilterChange = useCallback((key, value) => {
        setLocalFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleApplyFilters = useCallback(() => {
        onFilterChange(localFilters);
    }, [localFilters, onFilterChange]);

    const handleReset = useCallback(() => {
        const resetState = {
            type: 'all',
            status: 'all',
            rated: 'all',
            score: 'all',
            season: 'all',
            language: 'all',
            sort: 'default',
            startDate: '',
            endDate: '',
            genres: []
        };
        setLocalFilters(resetState);
        onReset();
    }, [onReset]);

    const hasActiveFilters = 
        localFilters.type !== 'all' ||
        localFilters.status !== 'all' ||
        localFilters.rated !== 'all' ||
        localFilters.score !== 'all' ||
        localFilters.season !== 'all' ||
        localFilters.language !== 'all' ||
        localFilters.sort !== 'default' ||
        localFilters.startDate !== '' ||
        localFilters.endDate !== '' ||
        localFilters.genres.length > 0;

    const activeCount = [
        localFilters.type !== 'all',
        localFilters.status !== 'all',
        localFilters.rated !== 'all',
        localFilters.score !== 'all',
        localFilters.season !== 'all',
        localFilters.language !== 'all',
        localFilters.sort !== 'default',
        localFilters.startDate !== '',
        localFilters.endDate !== '',
        localFilters.genres.length > 0
    ].filter(Boolean).length;

    return (
        <div className="space-y-4 bg-background">
            {/* Enhanced Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <Link 
                    to="/home" 
                    className="hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                >
                    <span className="group-hover:underline underline-offset-4">Home</span>
                </Link>
                <span className="text-border font-light">/</span>
                <span className="text-foreground font-medium truncate max-w-50 sm:max-w-md flex items-center gap-2">
                    {keyword ? (
                        <>
                            <span className="text-muted-foreground">Search:</span>
                            <span className="text-primary font-semibold">"{keyword}"</span>
                        </>
                    ) : (
                        'Browse All'
                    )}
                </span>
                {hasActiveFilters && (
                    <>
                        <span className="text-border font-light">/</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                            {activeCount} Filter{activeCount !== 1 ? 's' : ''} Active
                        </span>
                    </>
                )}
            </nav>

            {/* Premium Filter Container */}
            <div className="rounded-2xl bg-card/50 backdrop-blur-md border border-border/50 shadow-xl shadow-primary/5 overflow-hidden">
                {/* Header */}
                <div 
                    className="flex items-center justify-between p-5 sm:p-6 border-b border-border/50 cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <FilterIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-foreground">Filters</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Refine your anime discovery
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {hasActiveFilters && (
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleReset();
                                }}
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 h-8 px-3"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Reset</span>
                            </Button>
                        )}
                        <ChevronDown 
                            className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                        />
                    </div>
                </div>

                {/* Collapsible Content */}
                <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-500 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="p-5 sm:p-6 space-y-8">
                        {/* Filter Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6 gap-5">
                            <FilterSelect
                                placeholder="Type"
                                options={[
                                    { label: "All Types", value: "all" },
                                    { label: "Movie", value: "movie" },
                                    { label: "TV Series", value: "tv" },
                                    { label: "OVA", value: "ova" },
                                    { label: "ONA", value: "ona" },
                                    { label: "Special", value: "special" },
                                    { label: "Music", value: "music" },
                                ]}
                                value={localFilters.type}
                                onChange={(val) => handleFilterChange('type', val)}
                            />
                            <FilterSelect
                                placeholder="Status"
                                options={[
                                    { label: "All Status", value: "all" },
                                    { label: "Finished Airing", value: "finished-airing" },
                                    { label: "Currently Airing", value: "currently-airing" },
                                    { label: "Not Yet Aired", value: "not-yet-aired" }
                                ]}
                                value={localFilters.status}
                                onChange={(val) => handleFilterChange('status', val)}
                            />
                            <FilterSelect
                                placeholder="Rating"
                                options={[
                                    { label: "All Ratings", value: "all" },
                                    { label: "G - All Ages", value: "g" },
                                    { label: "PG - Children", value: "pg" },
                                    { label: "PG-13 - Teens", value: "pg-13" },
                                    { label: "R - 17+", value: "r" },
                                    { label: "R+ - Mild Nudity", value: "r+" },
                                    { label: "Rx - Hentai", value: "rx" },
                                ]}
                                value={localFilters.rated}
                                onChange={(val) => handleFilterChange('rated', val)}
                            />
                            <FilterSelect
                                placeholder="Score"
                                options={[
                                    { label: "All Scores", value: "all" },
                                    { label: "10 - Masterpiece", value: "masterpiece" },
                                    { label: "9 - Great", value: "great" },
                                    { label: "8 - Very Good", value: "very-good" },
                                    { label: "7 - Good", value: "good" },
                                    { label: "6 - Fine", value: "fine" },
                                    { label: "5 - Average", value: "average" },
                                    { label: "4 - Bad", value: "bad" },
                                    { label: "3 - Very Bad", value: "very-bad" },
                                    { label: "2 - Horrible", value: "horrible" },
                                    { label: "1 - Appalling", value: "appalling" },
                                ]}
                                value={localFilters.score}
                                onChange={(val) => handleFilterChange('score', val)}
                            />
                            <FilterSelect
                                placeholder="Season"
                                options={[
                                    { label: "All Seasons", value: "all" },
                                    { label: "Spring", value: "spring" },
                                    { label: "Summer", value: "summer" },
                                    { label: "Fall", value: "fall" },
                                    { label: "Winter", value: "winter" },
                                ]}
                                value={localFilters.season}
                                onChange={(val) => handleFilterChange('season', val)}
                            />
                            <FilterSelect
                                placeholder="Language"
                                options={[
                                    { label: "All Languages", value: "all" },
                                    { label: "Subtitles", value: "sub" },
                                    { label: "Dubbed", value: "dub" },
                                    { label: "Sub & Dub", value: "sub-&-dub" },
                                ]}
                                value={localFilters.language}
                                onChange={(val) => handleFilterChange('language', val)}
                            />
                            <FilterSelect
                                placeholder="Sort By"
                                options={[
                                    { label: "Default", value: "default" },
                                    { label: "Recently Added", value: "recently-added" },
                                    { label: "Recently Updated", value: "recently-updated" },
                                    { label: "Name A-Z", value: "name_az" },
                                    { label: "Release Date", value: "released-date" },
                                    { label: "Most Popular", value: "most-watched" },
                                ]}
                                value={localFilters.sort}
                                onChange={(val) => handleFilterChange('sort', val)}
                            />
                            
                            {/* Date Range */}
                            <div className='flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1'>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Date Range
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        <input 
                                            type="date" 
                                            value={localFilters.startDate}
                                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border/50 bg-muted/40 text-sm text-foreground shadow-sm transition-all file:border-0 file:bg-transparent placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 hover:bg-muted/60"
                                            placeholder="Start"
                                        />
                                    </div>
                                    <span className="text-muted-foreground">-</span>
                                    <div className="relative flex-1">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        <input 
                                            type="date" 
                                            value={localFilters.endDate}
                                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border/50 bg-muted/40 text-sm text-foreground shadow-sm transition-all file:border-0 file:bg-transparent placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 hover:bg-muted/60"
                                            placeholder="End"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Genre Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-border/50 pb-3">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">Genres</h3>
                                    {localFilters.genres.length > 0 && (
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                            {localFilters.genres.length}
                                        </span>
                                    )}
                                </div>
                                {localFilters.genres.length > 0 && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={clearGenres}
                                        className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                        Clear genres
                                    </Button>
                                )}
                            </div>
                            
                            {/* Selected Genres */}
                            {localFilters.genres.length > 0 && (
                                <div className="flex flex-wrap gap-2 pb-2">
                                    {localFilters.genres.map((genre) => (
                                        <Button
                                            key={genre}
                                            size="sm"
                                            onClick={() => toggleGenre(genre)}
                                            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all duration-200 rounded-full px-4 h-8 font-medium group"
                                        >
                                            {genre}
                                            <X className="ml-1.5 h-3.5 w-3.5 group-hover:rotate-90 transition-transform" />
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {/* Genre Grid */}
                            <div className="flex flex-wrap gap-2">
                                {GENRES.map((genre) => {
                                    const isSelected = localFilters.genres.includes(genre);
                                    return (
                                        <Button
                                            key={genre}
                                            size="sm"
                                            variant={isSelected ? "default" : "outline"}
                                            onClick={() => toggleGenre(genre)}
                                            className={`rounded-full px-4 h-8 text-sm font-medium transition-all duration-200 ${
                                                isSelected
                                                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 scale-105"
                                                    : "border-border/60 bg-muted/30 text-foreground/80 hover:border-primary/50 hover:text-primary hover:bg-primary/5 hover:scale-105"
                                            }`}
                                        >
                                            {genre}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/50">
                            <Button 
                                onClick={handleApplyFilters}
                                disabled={!hasActiveFilters}
                                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed h-11 rounded-xl font-semibold"
                            >
                                <FilterIcon className="h-4 w-4 mr-2" />
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Filter