import React, { useState, useEffect, useRef } from "react";
import { Search, X, Clock, Flame, Film, ArrowRight, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/data-provider";
import { useAuth } from "@/context/auth-provider";
import { slugify, getAnimeTitle } from "@/lib/utils";

const TRENDING_SEARCHES = [
  "Solo Leveling",
  "Frieren",
  "Jujutsu Kaisen",
  "Demon Slayer",
  "One Piece",
  "Attack on Titan"
];

const GENRE_TAGS = [
  "Action", "Romance", "Fantasy", "Comedy", "Adventure", "Sci-Fi", "Drama"
];

const CATEGORY_TAGS = [
  { label: "Most popular", route: "/most-popular" },
  { label: "Top airing", route: "/top-airing" },
  { label: "Most favourite", route: "/most-favorite" },
  { label: "Completed", route: "/completed" },
  { label: "TV series", route: "/tv" },
  { label: "Anime movies", route: "/movie" },
  { label: "OVA", route: "/ova" },
  { label: "ONA", route: "/ona" },
  { label: "Specials", route: "/special" }
];

const PRODUCTION_TAGS = [
  { name: "MAPPA", route: "/producer/mappa" },
  { name: "ufotable", route: "/producer/ufotable" },
  { name: "Toei Animation", route: "/producer/toei-animation" },
  { name: "Wit Studio", route: "/producer/wit-studio" },
  { name: "Madhouse", route: "/producer/madhouse" },
  { name: "Bones", route: "/producer/bones" },
  { name: "Kyoto Animation", route: "/producer/kyoto-animation" },
  { name: "A-1 Pictures", route: "/producer/a-1-pictures" },
  { name: "Production I.G", route: "/producer/production-i-g" },
  { name: "Studio Pierrot", route: "/producer/studio-pierrot" }
];

const CommandPalette = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { fetchsearchsuggestions } = useData();
  const { language } = useAuth();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem("otakustreams:recent_searches");
      return saved ? JSON.parse(saved) : ["Frieren", "Solo Leveling"];
    } catch {
      return ["Frieren", "Solo Leveling"];
    }
  });

  const inputRef = useRef(null);

  // Keyboard shortcut listener (⌘K / Ctrl+K / '/')
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange((prev) => !prev);
      } else if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSuggestions([]);
    }
  }, [open]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetchsearchsuggestions(query);
        setSuggestions(res?.data?.suggestions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, fetchsearchsuggestions]);

  const handleSelectTerm = (term) => {
    saveRecentSearch(term);
    onOpenChange(false);
    navigate(`/search?keyword=${encodeURIComponent(term)}`);
  };

  const handleSelectAnime = (item) => {
    const title = getAnimeTitle(item, language);
    saveRecentSearch(title);
    onOpenChange(false);
    navigate(`/${slugify(item.name || title)}/${item.id}`);
  };

  const saveRecentSearch = (term) => {
    if (!term) return;
    const updated = [term, ...recentSearches.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem("otakustreams:recent_searches", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const removeRecentSearch = (e, term) => {
    e.stopPropagation();
    const updated = recentSearches.filter((t) => t !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem("otakustreams:recent_searches", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("otakustreams:recent_searches");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Dimmed backdrop with blur */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity animate-in fade-in-0 duration-200"
        onClick={() => onOpenChange(false)} 
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-lift overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-200">
        
        {/* Input Bar */}
        <div className="flex items-center px-4 h-14 border-b border-border gap-3 bg-surface">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                handleSelectTerm(query.trim());
              } else if (e.key === "Escape") {
                onOpenChange(false);
              }
            }}
            placeholder="Search anime, genres, studios..."
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-base outline-none border-none font-sans"
          />
          {query ? (
            <button 
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-elevated transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="px-2 py-0.5 text-xs font-semibold text-muted-foreground bg-elevated border border-border rounded-md shadow-xs shrink-0">
              ESC
            </kbd>
          )}
        </div>

        {/* Results / Default State */}
        <div className="max-h-[60vh] overflow-y-auto no-scrollbar p-4 space-y-5">
          {isLoading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-elevated/40 animate-pulse">
                  <div className="w-10 h-14 bg-muted rounded-lg shrink-0" />
                  <div className="space-y-2 grow">
                    <div className="w-1/2 h-4 bg-muted rounded" />
                    <div className="w-1/4 h-3 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim().length > 0 ? (
            /* Live Suggestions */
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Results
              </div>
              {suggestions.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <Film className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-subtle text-sm">No anime found. Try another title.</p>
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    {TRENDING_SEARCHES.slice(0, 4).map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSelectTerm(term)}
                        className="px-3 py-1 text-xs rounded-full bg-elevated text-subtle hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectAnime(item)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-elevated cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.poster}
                          alt={getAnimeTitle(item, language)}
                          className="w-10 h-14 object-cover rounded-lg bg-muted shrink-0 shadow-xs"
                        />
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {getAnimeTitle(item, language)}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.moreInfo?.join(" • ") || item.type || "Anime"}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-2" />
                    </div>
                  ))}
                  <button
                    onClick={() => handleSelectTerm(query)}
                    className="w-full mt-3 py-2.5 px-4 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-soft"
                  >
                    View all results for "{query}"
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Idle State: Recent + Trending + Genres */
            <div className="space-y-5">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Recent Searches
                    </span>
                    <button
                      onClick={clearAllRecent}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => handleSelectTerm(term)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-elevated text-sm text-subtle hover:text-foreground hover:bg-elevated/80 cursor-pointer transition-colors group"
                      >
                        <span>{term}</span>
                        <X
                          className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={(e) => removeRecentSearch(e, term)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-accent" /> Trending Now
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSelectTerm(term)}
                      className="px-3 py-1.5 rounded-xl bg-elevated/60 border border-border/50 text-sm text-subtle hover:bg-primary hover:text-primary-foreground hover:border-transparent transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genres */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Browse Genres
                </div>
                <div className="flex flex-wrap gap-2">
                  {GENRE_TAGS.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => {
                        onOpenChange(false);
                        navigate(`/genre/${genre.toLowerCase()}`);
                      }}
                      className="px-3 py-1 text-xs rounded-lg bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Category
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_TAGS.map((cat) => (
                    <button
                      key={cat.route}
                      onClick={() => {
                        onOpenChange(false);
                        navigate(cat.route);
                      }}
                      className="px-3 py-1 text-xs rounded-lg bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Production */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" /> Production
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRODUCTION_TAGS.map((prod) => (
                    <button
                      key={prod.route}
                      onClick={() => {
                        onOpenChange(false);
                        navigate(prod.route);
                      }}
                      className="px-3 py-1 text-xs rounded-lg bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      {prod.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-4 py-3 bg-elevated/50 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-surface border border-border rounded text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded text-[10px]">↓</kbd> navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-surface border border-border rounded text-[10px]">↵</kbd> select</span>
            <span><kbd className="px-1.5 py-0.5 bg-surface border border-border rounded text-[10px]">esc</kbd> close</span>
          </div>
          <span className="font-display font-bold brand-gradient-text">OtakuStreams</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
