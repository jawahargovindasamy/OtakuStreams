import GenresList from '@/components/GenresList';
import MediaCard from '@/components/MediaCard';
import Navbar from '@/components/Navbar'
import SectionHeader from '@/components/SectionHeader';
import Top10 from '@/components/Top10';
import { useData } from '@/context/data-provider';
import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight, Loader2, SlidersHorizontal } from 'lucide-react';
import Footer from '@/components/Footer';
import VerticalList from '@/components/VerticalList';

const Genre = () => {

    const { fetchgenres } = useData();
    const [searchParams, setSearchParams] = useSearchParams();

    const { name } = useParams();
    const [item, setItem] = useState(null);
    const [page, setPage] = useState(() => {
        const pageParam = searchParams.get('page');
        const parsed = parseInt(pageParam, 10);
        return parsed > 0 ? parsed : 1;
    });
    const [types, setTypes] = useState(() => {
        return searchParams.get('type') || "";
    });
    const [showAll, setShowAll] = useState(false);
    const [loading, setLoading] = useState(false);

    // Sync page & types state with URL when anime category changes
    useEffect(() => {
        const pageParam = searchParams.get('page');
        const parsed = parseInt(pageParam, 10);
        const newPage = parsed > 0 ? parsed : 1;
        setPage(newPage);

        const t = searchParams.get('type');
        setTypes(t || "");
    }, [name, searchParams]);

    // Update URL when page or types changes
    useEffect(() => {
        const params = {};
        if (page > 1) params.page = page.toString();
        if (types) params.type = types;
        setSearchParams(params, { replace: true });
    }, [page, types, setSearchParams]);

    useEffect(() => {
        const getAnimeInfo = async () => {
            setLoading(true);
            try {
                const data = await fetchgenres(name, page, types);
                setItem(data);
            } catch (error) {
                console.error("Failed to fetch anime list:", error);
            } finally {
                setLoading(false);
            }
        }
        getAnimeInfo()
    }, [name, fetchgenres, page, types]);

    // No client-side filtering needed as it's handled by API
    const displayedAnimes = item?.animes || [];

    const totalPages = item?.totalPages || 1;

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (page <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (page >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = page - 1; i <= page + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };


    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6 sm:pt-8 lg:pt-10">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_380px] gap-6 sm:gap-8 lg:gap-10 w-full">
                    <main className="flex-1 w-full space-y-6 sm:space-y-8">
                        {/* Header with Filter */}
                        <SectionHeader
                            title={item?.genreName || name}
                            filter={
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border-border/50 hover:bg-accent transition-all duration-200 ${
                                                types ? "border-primary/50 text-primary bg-primary/5" : ""
                                            }`}
                                        >
                                            <SlidersHorizontal className="h-3.5 w-3.5" />
                                            <span className="text-xs font-medium hidden sm:inline">
                                                {!types
                                                    ? "Filter"
                                                    : types.toUpperCase()}
                                            </span>
                                            {types && (
                                                <span className="flex items-center justify-center h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                                                    1
                                                </span>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                        <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center justify-between">
                                            Media Type
                                            {types && (
                                                <button
                                                    onClick={() => { setTypes(""); setPage(1); }}
                                                    className="text-[10px] text-primary hover:underline font-medium"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {["tv", "movie", "ona", "ova", "special"].map((t) => (
                                            <DropdownMenuCheckboxItem
                                                key={t}
                                                checked={types === t}
                                                onCheckedChange={(checked) => {
                                                    setTypes(checked ? t : "");
                                                    setPage(1);
                                                }}
                                                className="capitalize cursor-pointer"
                                            >
                                                {t.toUpperCase()}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            }
                        />

                        {/* Grid Content */}
                        <section className="space-y-4 sm:space-y-5 w-full min-h-100">
                            {loading ? (
                                <div className="flex items-center justify-center h-96">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                                            <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
                                        </div>
                                        <p className="text-muted-foreground animate-pulse text-sm">Loading anime...</p>
                                    </div>
                                </div>
                            ) : (
                                    displayedAnimes.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 w-full">
                                            {displayedAnimes.map((a) => (
                                                <MediaCard key={a.id} id={a.id} name={a.name} jname={a.jname} poster={a.poster} type={a.type} rating={a.rating} year={a.year} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
                                            <p className="text-lg font-medium">No anime found</p>
                                            <p className="text-sm">Try removing some filters or going back a page</p>
                                        </div>
                                    )
                            )}
                        </section>

                        {/* Pagination */}
                        {totalPages > 1 && !loading && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
                                <p className="text-sm text-muted-foreground order-2 sm:order-1">
                                    Page <span className="text-foreground font-medium">{page}</span> of <span className="text-foreground font-medium">{totalPages}</span>
                                </p>

                                <div className="flex items-center gap-2 order-1 sm:order-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                        className="h-9 w-9 p-0 rounded-lg border-border/50 hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    <div className="flex items-center gap-1">
                                        {getPageNumbers().map((pageNum, idx) => (
                                            pageNum === '...' ? (
                                                <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-muted-foreground text-sm">
                                                    ...
                                                </span>
                                            ) : (
                                                <Button
                                                    key={pageNum}
                                                    variant={page === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`h-9 w-9 p-0 rounded-lg text-sm font-medium transition-all duration-200 ${page === pageNum
                                                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                                                        : "border-border/50 hover:bg-accent hover:text-accent-foreground"
                                                        }`}
                                                >
                                                    {pageNum}
                                                </Button>
                                            )
                                        ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === totalPages}
                                        className="h-9 w-9 p-0 rounded-lg border-border/50 hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Mobile Sidebar Content */}
                        <section className="block lg:hidden w-full space-y-6">
                            {item?.genres && <GenresList data={item} showAll={showAll} setShowAll={setShowAll} />}
                            {item?.topAiringAnimes &&
                                <>
                                    <SectionHeader title="Top Airing" />
                                    <VerticalList list={item?.topAiringAnimes.length} anime={item.topAiringAnimes} />
                                </>}
                        </section>
                    </main>

                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block space-y-6 sm:space-y-8 min-w-0">
                        {item?.genres && <GenresList data={item} showAll={showAll} setShowAll={setShowAll} />}
                        {item?.topAiringAnimes &&
                            <>
                                <SectionHeader title="Top Airing" />
                                <VerticalList list={item?.topAiringAnimes.length} anime={item.topAiringAnimes} />
                            </>}
                    </aside>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Genre