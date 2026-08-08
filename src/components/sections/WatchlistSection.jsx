import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, BookmarkPlus, ArrowRight } from "lucide-react";
import WatchlistCard from "@/components/WatchlistCard";
import { useAuth } from "@/context/auth-provider";

const WatchlistSection = () => {
  const navigate = useNavigate();
  const { user, watchlist, removeWatchlist } = useAuth();
  const railRef = useRef(null);

  const [savedItems, setSavedItems] = useState([]);
  const [isReady, setIsReady] = useState(false);

  // Load and combine watchlist + favourites from auth provider or localStorage
  const loadSavedItems = () => {
    let combined = [];

    // 1. Get Watchlist items
    if (user && Array.isArray(watchlist)) {
      combined = watchlist.map((w) => ({
        ...w,
        id: w.animeId || w.id || w._id,
        animeId: w.animeId || w.id || w._id,
        _id: w._id,
        title: w.animeTitle || w.title || w.name,
        poster: w.animeImage || w.poster || w.coverImage?.extraLarge || w.coverImage?.large || w.coverImage,
        format: w.format || w.type || "TV",
        episodes: w.episodes,
        genres: w.genres,
      }));
    } else {
      try {
        const localW = JSON.parse(localStorage.getItem("otakustreams:watchlist") || "[]");
        combined = localW.map((w) => ({
          ...w,
          id: w.id || w.animeId,
          animeId: w.animeId || w.id,
        }));
      } catch (e) {
        console.error("Error reading local watchlist:", e);
      }
    }

    // 2. Get Favourites items (add non-duplicates)
    try {
      const localF = JSON.parse(localStorage.getItem("otakustreams:favourites") || "[]");
      localF.forEach((f) => {
        const fId = f.id || f.animeId;
        const exists = combined.some((item) => (item.id || item.animeId) === fId);
        if (!exists && fId) {
          combined.push({
            ...f,
            id: fId,
            animeId: fId,
            isFavoriteOnly: true,
          });
        }
      });
    } catch (e) {
      console.error("Error reading local favourites:", e);
    }

    setSavedItems(combined);
    setIsReady(true);
  };

  useEffect(() => {
    loadSavedItems();

    // Listen to local storage updates across windows/tabs or state changes
    const handleStorageChange = () => {
      loadSavedItems();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user, watchlist]);

  // Remove handler with immediate state filter
  const handleRemoveItem = async (targetItem) => {
    const targetId = targetItem.id || targetItem.animeId;
    setSavedItems((prev) => prev.filter((i) => (i.id || i.animeId) !== targetId));

    if (user && removeWatchlist && targetItem._id) {
      try {
        await removeWatchlist(targetItem._id);
      } catch (err) {
        console.error("Failed to remove item from watchlist:", err);
      }
    } else {
      try {
        const localW = JSON.parse(localStorage.getItem("otakustreams:watchlist") || "[]");
        const updatedW = localW.filter((i) => (i.id || i.animeId) !== targetId);
        localStorage.setItem("otakustreams:watchlist", JSON.stringify(updatedW));

        const localF = JSON.parse(localStorage.getItem("otakustreams:favourites") || "[]");
        const updatedF = localF.filter((i) => (i.id || i.animeId) !== targetId);
        localStorage.setItem("otakustreams:favourites", JSON.stringify(updatedF));
      } catch (err) {
        console.error("Failed to update localStorage:", err);
      }
    }
  };

  // Scroll Rail Actions
  const scrollLeft = () => {
    if (railRef.current) {
      railRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (railRef.current) {
      railRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  if (!isReady) return null;

  const displayItems = savedItems.slice(0, 12);
  const hasMore = savedItems.length > 12;

  return (
    <section id="watchlist" aria-labelledby="watchlist-title" className="w-full space-y-5 sm:space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-primary uppercase tracking-[0.22em] font-sans">
            SAVED BY YOU
          </div>
          <h2
            id="watchlist-title"
            className="text-2xl sm:text-3xl lg:text-[2rem] font-display font-bold text-foreground tracking-tight"
          >
            Your watchlist
          </h2>
          <p className="text-sm text-muted-foreground font-sans max-w-2xl">
            Everything you bookmarked or loved, on this device.
          </p>
        </div>

        {/* Header Action Slot (Scroll Controls + Optional View All) */}
        {savedItems.length > 0 && (
          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            {hasMore && (
              <Link
                to="/watchlist"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors mr-2"
              >
                View all ({savedItems.length})
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {/* Desktop Scroll Arrow Controls */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={scrollLeft}
                aria-label="Previous watchlist titles"
                className="w-10 h-10 rounded-full border border-border/70 hover:border-primary/50 hover:bg-muted/60 flex items-center justify-center text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={scrollRight}
                aria-label="Next watchlist titles"
                className="w-10 h-10 rounded-full border border-border/70 hover:border-primary/50 hover:bg-muted/60 flex items-center justify-center text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section Content: Horizontal Shelf Rail or Empty State */}
      {savedItems.length === 0 ? (
        <div className="w-full py-10 sm:py-12 px-6 rounded-3xl border border-border/50 bg-card/30 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <BookmarkPlus className="w-6 h-6" />
          </div>
          <h3 className="font-display font-semibold text-lg text-foreground">
            Save anime to your watchlist.
          </h3>
          <p className="text-sm text-muted-foreground font-sans max-w-md mx-auto">
            Tap the bookmark on any card and it will be here.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                const trendingEl = document.getElementById("trending");
                if (trendingEl) {
                  trendingEl.scrollIntoView({ behavior: "smooth" });
                } else {
                  navigate("/#trending");
                }
              }}
              className="px-5 py-2.5 rounded-full border border-border hover:border-primary/50 text-sm font-semibold text-foreground hover:bg-muted/50 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              Browse trending
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={railRef}
          className="flex gap-3 sm:gap-4 lg:gap-5 overflow-x-auto no-scrollbar pb-3 snap-x snap-mandatory w-full"
        >
          {displayItems.map((item, idx) => (
            <WatchlistCard
              key={item.id || item.animeId || idx}
              item={item}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default WatchlistSection;
