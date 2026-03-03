import Navbar from '@/components/Navbar'
import SecondaryNavbar from '@/components/SecondaryNavbar'
import SectionHeader from '@/components/SectionHeader'
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-provider';
import { useSearchParams } from 'react-router-dom';
import MediaCard from '@/components/MediaCard';
import { ChevronLeft, ChevronRight } from "lucide-react";

// Static filter configuration outside component
const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "watching", label: "Watching" },
  { key: "on_hold", label: "On Hold" },
  { key: "plan_to_watch", label: "Plan To Watch" },
  { key: "dropped", label: "Dropped" },
  { key: "completed", label: "Completed" },
];

const Watchlist = () => {
  const { watchlist, fetchWatchlist } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const ITEMS_PER_PAGE = 30;
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get("page");
    const parsed = parseInt(pageParam, 10);
    return parsed > 0 ? parsed : 1;
  });

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  }, [items, page]);

  // Memoized type param
  const typeParam = useMemo(() => searchParams.get("type"), [searchParams]);

  // Memoized active filter computation
  const active = useMemo(() => {
    if (!typeParam) return "All";
    return typeParam.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  }, [typeParam]);

  // Sync items with watchlist when no filter is active
  useEffect(() => {
    if (!typeParam) {
      setItems(watchlist);
    }
  }, [watchlist, typeParam]);

  useEffect(() => {
    const pageParam = searchParams.get("page");
    const parsed = parseInt(pageParam, 10);
    const newPage = parsed > 0 ? parsed : 1;

    setPage((prev) => (prev === newPage ? prev : newPage));
  }, [searchParams]);


  useEffect(() => {
    const currentPage = searchParams.get("page");
    const currentType = searchParams.get("type");

    const nextPage = page > 1 ? page.toString() : null;
    const nextType = typeParam || null;

    if (currentPage === nextPage && currentType === nextType) return;

    const params = {};
    if (nextType) params.type = nextType;
    if (nextPage) params.page = nextPage;

    setSearchParams(params, { replace: true });
  }, [page, typeParam, searchParams, setSearchParams]);

  // Fetch filtered data when typeParam changes
  useEffect(() => {
    let isMounted = true;

    const loadWatchlist = async () => {
      if (!typeParam) return;

      setLoading(true);
      try {
        const data = await fetchWatchlist({ status: typeParam });
        if (isMounted) {
          setItems(data);
        }
      } catch (error) {
        if (isMounted) {
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadWatchlist();

    return () => {
      isMounted = false;
    };
  }, [typeParam, fetchWatchlist]);

  const handleFilterChange = useCallback((label) => {
    setPage(1); // reset page

    if (label === "All") {
      setSearchParams({});
    } else {
      const key = FILTER_OPTIONS.find(opt => opt.label === label)?.key;
      if (key) {
        setSearchParams({ type: key });
      }
    }
  }, [setSearchParams]);

  // Memoized filter buttons to prevent unnecessary re-renders
  const filterButtons = useMemo(() => {
    return FILTER_OPTIONS.map((option) => (
      <Button
        key={option.key}
        onClick={() => handleFilterChange(option.label)}
        variant={active === option.label ? "default" : "outline"}
      >
        {option.label === "On Hold" ? "On-Hold" : option.label}
      </Button>
    ));
  }, [active, handleFilterChange]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage < 1 || newPage > totalPages) return;

    setPage(newPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [totalPages]);

  const getPageNumbers = useCallback(() => {
    const pages = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (page > 3) {
      pages.push("...");
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  }, [page, totalPages]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <SecondaryNavbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10">
        <section className="space-y-4 sm:space-y-5 w-full">
          <div className="flex items-center justify-between">
            <SectionHeader
              title="Watchlist"
              className="text-foreground tracking-tight"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {filterButtons}
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : items.length > 0 ? (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6 w-full mt-6">
              {paginatedItems.map((item) => (
                <MediaCard key={item.animeId} id={item.animeId} name={item.animeTitle} poster={item.animeImage} />
              ))}
            </div>
            {totalPages > 1 && !loading && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
                <p className="text-sm text-muted-foreground order-2 sm:order-1">
                  Page <span className="text-foreground font-medium">{page}</span> of{" "}
                  <span className="text-foreground font-medium">{totalPages}</span>
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
                    {getPageNumbers().map((pageNum, idx) =>
                      pageNum === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="w-9 h-9 flex items-center justify-center text-muted-foreground text-sm"
                        >
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
                    )}
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
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
              No Anime in Watchlist
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md">
              Start add some anime in watchlist and they'll appear here for easy access.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Watchlist