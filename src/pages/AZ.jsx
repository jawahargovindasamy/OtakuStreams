import React, { useEffect, useState, useMemo, useCallback } from 'react'
import MediaCard from '@/components/MediaCard';
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer';
import { useData } from '@/context/data-provider';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import SectionHeader from '@/components/SectionHeader';

const AZ = () => {
  const { letter } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchazlistdata } = useData();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    const parsed = parseInt(pageParam, 10);
    return parsed > 0 ? parsed : 1;
  });

  const letters = useMemo(() => ["0-9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"], []);

  // Sync page state with URL when letter changes or when URL is manually edited
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const parsed = parseInt(pageParam, 10);
    const newPage = parsed > 0 ? parsed : 1;
    setPage(newPage);
  }, [letter, searchParams]);

  // Update URL when page changes
  useEffect(() => {
    if (page > 1) {
      setSearchParams({ page: page.toString() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [page, setSearchParams]);

  // Fetch data when letter or page changes
  useEffect(() => {
    const getAnimeInfo = async () => {
      setLoading(true);
      try {
        const data = await fetchazlistdata(letter, page);
        setItem(data);
      } catch (error) {
        console.error("Failed to fetch anime list:", error);
      } finally {
        setLoading(false);
      }
    }
    getAnimeInfo()
  }, [letter, fetchazlistdata, page]);

  const totalPages = item?.totalPages || 1;
  const currentLetter = letter || 'all';

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page, totalPages]);

  const getPageNumbers = useMemo(() => {
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
  }, [page, totalPages]);

  const handleLetterClick = useCallback((targetLetter) => {
    navigate(`/az-list/${targetLetter}`);
  }, [navigate]);

  const formatDisplayTitle = (sortOption, letter) => {
    if (sortOption) {
      // Capitalize first letter only: "popular" → "Popular", "NAME" → "Name"
      const capitalized = sortOption.charAt(0).toUpperCase() + sortOption.slice(1).toLowerCase();
      return `Sort by ${capitalized}`;
    }

    if (letter === 'other') return 'Sort by #';
    if (letter === 'all') return 'All Anime';
    if (letter === '0-9') return 'Sort by 0-9';
    if (letter) return `Sort by ${letter.toUpperCase()}`;
    return 'A-Z List';
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      <Navbar />

      {/* Hero Section with Glassmorphism */}
      <div className="relative border-b border-border/50 ">
        <div className="absolute inset-0" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 relative">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                A-Z LIST
              </h2>
              <p className="text-sm text-muted-foreground sm:border-l sm:border-border sm:pl-4">
                Searching anime order by alphabet name A to Z
              </p>
            </div>

            {/* Alphabet Filter - Sticky on mobile */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 pb-2">
              <Button
                size="sm"
                variant={currentLetter === 'all' ? "default" : "outline"}
                className={`min-w-10 sm:min-w-11 font-semibold transition-all duration-200 rounded-md ${currentLetter === 'all'
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                  : "border-border hover:border-primary hover:text-primary hover:bg-primary/5"
                  }`}
                onClick={() => handleLetterClick('all')}
                aria-current={currentLetter === 'all' ? "page" : undefined}
                aria-label="Show all anime"
              >
                All
              </Button>

              <Button
                size="sm"
                variant={currentLetter === 'other' ? "default" : "outline"}
                className={`min-w-9 sm:min-w-10 border-border transition-all duration-200 rounded-md font-medium ${currentLetter === 'other'
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                  : "hover:border-primary hover:text-primary hover:bg-primary/5"
                  }`}
                onClick={() => handleLetterClick('other')}
                aria-current={currentLetter === 'other' ? "page" : undefined}
                aria-label="Show anime starting with special characters"
              >
                #
              </Button>

              {letters.map((l) => (
                <Button
                  key={l}
                  size="sm"
                  variant={currentLetter === l ? "default" : "outline"}
                  className={`min-w-9 sm:min-w-10 transition-all duration-200 rounded-md font-medium ${currentLetter === l
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                    : "border-border hover:border-primary hover:text-primary hover:bg-primary/5"
                    }`}
                  onClick={() => handleLetterClick(l)}
                  aria-current={currentLetter === l ? "page" : undefined}
                  aria-label={`Filter anime starting with ${l}`}
                >
                  {l}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10 flex-1">
        <main className="w-full space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="space-y-2 border-b border-border/50 pb-4">
            <SectionHeader title={formatDisplayTitle(item?.sortOption, letter)} />
          </div>

          {/* Grid Content */}
          <section className="space-y-4 sm:space-y-6 w-full min-h-100">
            {loading ? (
              <div className="flex items-center justify-center h-96 backdrop-blur-sm bg-card/30 rounded-2xl border border-border/50">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                    <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
                  </div>
                  <p className="text-muted-foreground font-medium tracking-wide animate-pulse">Loading anime...</p>
                </div>
              </div>
            ) : (
              <>
                {item?.animes?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-5 w-full">
                    {item.animes.map((a) => (
                      <div
                        key={a.id}
                        className="group transition-all duration-300 hover:-translate-y-1"
                      >
                        <MediaCard
                          id={a.id}
                          jname={a.jname}
                          className="h-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-center space-y-4 bg-card/30 rounded-2xl border border-border/50 border-dashed">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-2xl text-muted-foreground">😕</span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-foreground">No anime found</h3>
                      <p className="text-muted-foreground text-sm max-w-sm">
                        No anime titles found starting with "{letter === 'other' ? '#' : letter}"
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleLetterClick('all')}
                      className="mt-2"
                    >
                      View All Anime
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground order-2 sm:order-1">
                Page <span className="text-foreground font-semibold">{page}</span> of <span className="text-foreground font-semibold">{totalPages}</span>
                <span className="hidden sm:inline text-muted-foreground/60 ml-2">
                  ({item?.animes?.length || 0} items)
                </span>
              </p>

              <div className="flex items-center gap-2 order-1 sm:order-2 bg-card/50 p-1.5 rounded-xl border border-border/50 backdrop-blur-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="h-9 w-9 p-0 rounded-lg hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 px-1">
                  {getPageNumbers.map((pageNum, idx) => (
                    pageNum === '...' ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="w-9 h-9 flex items-center justify-center text-muted-foreground text-sm select-none"
                      >
                        ...
                      </span>
                    ) : (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={`h-9 w-9 p-0 rounded-lg text-sm font-medium transition-all duration-200 ${page === pageNum
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/25"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          }`}
                        aria-current={page === pageNum ? "page" : undefined}
                        aria-label={`Page ${pageNum}`}
                      >
                        {pageNum}
                      </Button>
                    )
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="h-9 w-9 p-0 rounded-lg hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}

export default AZ