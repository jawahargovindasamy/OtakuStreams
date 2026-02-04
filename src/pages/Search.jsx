// Search.jsx
import Filter from '@/components/Filter'
import Footer from '@/components/Footer'
import MediaCard from '@/components/MediaCard'
import Navbar from '@/components/Navbar'
import SectionHeader from '@/components/SectionHeader'
import { useData } from '@/context/data-provider'
import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Loader2, SlidersHorizontal } from 'lucide-react';
import VerticalList from '@/components/VerticalList'

// Helper to check if any filters are active
const hasActiveFilters = (filters) => {
  if (!filters) return false;
  return (
    filters.type !== 'all' ||
    filters.status !== 'all' ||
    filters.rated !== 'all' ||
    filters.score !== 'all' ||
    filters.season !== 'all' ||
    filters.language !== 'all' ||
    filters.sort !== 'default' ||
    filters.startDate !== '' ||
    filters.endDate !== '' ||
    (filters.genres && filters.genres.length > 0)
  );
};

const Search = () => {
  const { fetchsearch, fetchadvancedsearch } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || '';

  const [item, setItem] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    const parsed = parseInt(pageParam, 10);
    return parsed > 0 ? parsed : 1;
  });

  const [filters, setFilters] = useState(() => ({
    type: searchParams.get('type') || 'all',
    status: searchParams.get('status') || 'all',
    rated: searchParams.get('rated') || 'all',
    score: searchParams.get('score') || 'all',
    season: searchParams.get('season') || 'all',
    language: searchParams.get('language') || 'all',
    sort: searchParams.get('sort') || 'default',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    genres: searchParams.get('genres')?.split(',').filter(Boolean) || []
  }));

  const isAdvancedSearch = hasActiveFilters(filters);

  useEffect(() => {
    const resetFilters = {
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
    setFilters(resetFilters);
    setPage(1);
    
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    setSearchParams(params, { replace: true });
  }, [keyword]);

  useEffect(() => {
    const parsed = Number(searchParams.get("page"));
    if (parsed > 0 && parsed !== page) {
      setPage(parsed);
    }
  }, [searchParams.get("page")]);

  useEffect(() => {
    const params = new URLSearchParams();
    
    if (keyword) params.set('keyword', keyword);
    if (page > 1) params.set('page', page.toString());
    
    if (filters.type !== 'all') params.set('type', filters.type);
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.rated !== 'all') params.set('rated', filters.rated);
    if (filters.score !== 'all') params.set('score', filters.score);
    if (filters.season !== 'all') params.set('season', filters.season);
    if (filters.language !== 'all') params.set('language', filters.language);
    if (filters.sort !== 'default') params.set('sort', filters.sort);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.genres.length > 0) params.set('genres', filters.genres.join(','));

    setSearchParams(params, { replace: true });
  }, [page, filters, keyword]);

  useEffect(() => {
    const getAnimeInfo = async () => {
      if (!keyword) return;
      
      setLoading(true);
      try {
        let data;
        
        if (isAdvancedSearch) {
          data = await fetchadvancedsearch({
            q: keyword,
            page,
            type: filters.type === 'all' ? undefined : filters.type,
            status: filters.status === 'all' ? undefined : filters.status,
            rated: filters.rated === 'all' ? undefined : filters.rated,
            score: filters.score === 'all' ? undefined : filters.score,
            season: filters.season === 'all' ? undefined : filters.season,
            language: filters.language === 'all' ? undefined : filters.language,
            sort: filters.sort === 'default' ? undefined : filters.sort,
            start_date: filters.startDate || undefined,
            end_date: filters.endDate || undefined,
            genres: filters.genres.length > 0 ? filters.genres : undefined
          });
        } else {
          data = await fetchsearch(keyword, page);
        }
        
        setItem(data);
      } catch (error) {
        console.error("Failed to fetch anime list:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getAnimeInfo();
  }, [keyword, page, filters, fetchsearch, fetchadvancedsearch, isAdvancedSearch]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    const resetFilters = {
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
    setFilters(resetFilters);
    setPage(1);
  }, []);

  const totalPages = item?.totalPages || 1;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => {
    if (k === 'genres') return v.length > 0;
    if (k === 'sort') return v !== 'default';
    return v !== 'all' && v !== '';
  }).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-6 sm:pt-8 lg:pt-10 pb-12">
        <Filter 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onReset={handleResetFilters}
          keyword={keyword}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_380px] gap-6 sm:gap-8 lg:gap-10 w-full pt-6 sm:pt-8 lg:pt-10">
          <main className="flex-1 w-full space-y-6 sm:space-y-8">
            {/* Enhanced Header Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <SectionHeader 
                  title={item?.searchQuery || keyword || 'Browse Anime'} 
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                />
                {isAdvancedSearch && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                    <SlidersHorizontal className="h-3 w-3" />
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              
              {isAdvancedSearch && (
                <p className="text-sm text-muted-foreground/80 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Using advanced filters • {item?.animes?.length || 0} results found
                </p>
              )}
            </div>

            {/* Grid Content with Glassmorphism Loading State */}
            <section className="space-y-4 sm:space-y-6 w-full min-h-100">
              {loading ? (
                <div className="flex items-center justify-center h-96 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/50">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                      <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
                    </div>
                    <p className="text-muted-foreground animate-pulse text-sm font-medium">
                      {isAdvancedSearch ? 'Curating results...' : 'Discovering anime...'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 w-full">
                  {item?.animes?.map((a) => (
                    <MediaCard key={a.id} id={a.id} jname={a.jname} />
                  ))}
                </div>
              )}
            </section>

            {/* Enhanced Pagination */}
            {totalPages > 1 && !loading && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border/50">
                <p className="text-sm text-muted-foreground order-2 sm:order-1 font-medium">
                  Page <span className="text-foreground font-semibold">{page}</span> of{' '}
                  <span className="text-foreground font-semibold">{totalPages}</span>
                </p>

                <div className="flex items-center gap-2 order-1 sm:order-2 bg-card/50 backdrop-blur-sm p-1.5 rounded-xl border border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="h-9 w-9 p-0 rounded-lg hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNum, idx) => (
                      pageNum === '...' ? (
                        <span 
                          key={`ellipsis-${idx}`} 
                          className="w-9 h-9 flex items-center justify-center text-muted-foreground/60 text-sm font-medium"
                        >
                          ...
                        </span>
                      ) : (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={`h-9 w-9 p-0 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            page === pageNum
                              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 scale-105"
                              : "hover:bg-accent text-muted-foreground hover:text-foreground"
                          }`}
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
                    className="h-9 w-9 p-0 rounded-lg hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && item?.animes?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/50 border-dashed">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                  <SlidersHorizontal className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-foreground">No results found</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Try adjusting your filters or search terms to find what you're looking for.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleResetFilters}
                  className="mt-4 border-border/50 hover:border-primary hover:text-primary"
                >
                  Clear all filters
                </Button>
              </div>
            )}

            {/* Mobile Sidebar Content */}
            <section className="block lg:hidden w-full space-y-6 pt-8 border-t border-border/50">
              {item?.mostPopularAnimes && (
                <div className="space-y-4">
                  <SectionHeader title="Most Popular" className="text-xl font-bold" />
                  <VerticalList list={item?.mostPopularAnimes.length} anime={item.mostPopularAnimes} />
                </div>
              )}
            </section>
          </main>

          {/* Desktop Sidebar with Glassmorphism */}
          <aside className="hidden lg:block space-y-6 sm:space-y-8 min-w-0">
            <div className="sticky top-24 space-y-6">
              {item?.mostPopularAnimes && (
                <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-6 shadow-lg shadow-primary/5">
                  <SectionHeader 
                    title="Most Popular" 
                    className="text-xl font-bold tracking-tight mb-4"
                  />
                  <VerticalList 
                    list={item?.mostPopularAnimes.length} 
                    anime={item.mostPopularAnimes} 
                  />
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Search