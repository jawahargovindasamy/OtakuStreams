import Navbar from '@/components/Navbar'
import SecondaryNavbar from '@/components/SecondaryNavbar'
import SectionHeader from '@/components/SectionHeader'
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-provider';
import { useSearchParams } from 'react-router-dom';
import MediaCard from '@/components/MediaCard';

// Static filter configuration outside component
const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "watching", label: "Watching" },
  { key: "on_hold", label: "On Hold" },
  { key: "plan_to_watch", label: "Plan to Watch" },
  { key: "dropped", label: "Dropped" },
  { key: "completed", label: "Completed" },
];

const Watchlist = () => {
  const { watchlist, fetchWatchlist } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

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
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6 w-full mt-6">
            {items.map((item) => (
              <MediaCard
                key={item._id}
                id={item.animeId}
              />
            ))}
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