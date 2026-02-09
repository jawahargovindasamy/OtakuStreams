import React, { useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PlayIcon, ChevronDown } from "lucide-react";

const EpisodesList = ({
  episodeList = [],
  totalepisodes = 0,
  activeEpisode,
  onEpisodeChange,
}) => {
  const [search, setSearch] = useState("");
  const [selectedRange, setSelectedRange] = useState(null);
  const [showRangeMenu, setShowRangeMenu] = useState(false);

  const isGridMode = totalepisodes > 25;

  // ================= RANGES =================
  const ranges = useMemo(() => {
    const list = [];
    for (let i = 1; i <= totalepisodes; i += 100) {
      const start = i;
      const end = Math.min(i + 99, totalepisodes);

      list.push({
        label: `EPS: ${String(start).padStart(3, "0")}–${String(end).padStart(
          3,
          "0"
        )}`,
        start,
        end,
      });
    }
    return list;
  }, [totalepisodes]);

  const initialRange = ranges[0];
  const currentRange = selectedRange || initialRange;

  // ================= AUTO RANGE SWITCH ON SEARCH =================
  useEffect(() => {
    if (!search || !isGridMode) return;

    const searchNum = parseInt(search);

    if (isNaN(searchNum)) return;

    if (searchNum < currentRange.start || searchNum > currentRange.end) {
      const correct = ranges.find(
        (r) => searchNum >= r.start && searchNum <= r.end
      );
      if (correct) setSelectedRange(correct);
    }
  }, [search, isGridMode, currentRange, ranges]);

  // ================= FILTER =================
  const filteredEpisodes = useMemo(() => {
    return episodeList.filter((ep) => {
      const matchesSearch = ep.number.toString().includes(search);

      const inRange =
        !isGridMode ||
        (ep.number >= currentRange.start && ep.number <= currentRange.end);

      return matchesSearch && inRange;
    });
  }, [episodeList, search, isGridMode, currentRange]);

  const getEpId = (episodeId) => episodeId.split("ep=")[1];

  return (
    <div className="w-full max-w-md rounded-2xl bg-card/50 backdrop-blur-md border border-border/50 p-4 space-y-4 h-full shadow-lg shadow-primary/5">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">List of episodes:</h2>

        <div className="relative w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Number of Ep"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-background/50 border-border/50 focus-visible:ring-primary/20"
          />
        </div>
      </div>

      {/* ================= SMALL LIST ================= */}
      {!isGridMode && (
        <div className="space-y-1 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
          {filteredEpisodes.map((ep) => {
            const epId = getEpId(ep.episodeId);
            const isActive = Number(epId) === Number(activeEpisode);
            const isFillerEp = ep.isFiller;

            return (
              <div
                key={ep.episodeId}
                role="button"
                onClick={() => onEpisodeChange(epId)}
                className={`group flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : isFillerEp
                        ? "hover:bg-yellow-500/10 bg-yellow-500/5 border border-yellow-500/20"
                        : "hover:bg-accent hover:text-accent-foreground"
                  }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-6 text-sm font-medium shrink-0 ${
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}>
                    {ep.number}
                  </span>
                  <span className={`truncate text-sm ${
                    isFillerEp && !isActive ? "italic text-muted-foreground/80" : ""
                  }`}>
                    {ep.title}
                    {isFillerEp && !isActive && <span className="text-yellow-600 dark:text-yellow-400 ml-1">(Filler)</span>}
                  </span>
                </div>

                {isActive && (
                  <Button size="icon" className="h-7 w-7 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 shrink-0">
                    <PlayIcon className="h-4 w-4 fill-current" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ================= GRID ================= */}
      {isGridMode && (
        <div className="space-y-4">
          {/* RANGE DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setShowRangeMenu(!showRangeMenu)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted hover:bg-accent transition-all duration-200 cursor-pointer border border-transparent hover:border-border/50"
            >
              <span className="text-sm font-medium">{currentRange.label}</span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  showRangeMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {showRangeMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-xl shadow-primary/10 z-50 overflow-hidden backdrop-blur-xl">
                {ranges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => {
                      setSelectedRange(range);
                      setShowRangeMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      currentRange.label === range.label
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-accent text-foreground"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GRID */}
          <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
            {filteredEpisodes.map((ep) => {
              const epId = getEpId(ep.episodeId);
              const isActive = Number(epId) === Number(activeEpisode);
              const isFillerEp = ep.isFiller;

              return (
                <button
                  key={ep.episodeId}
                  onClick={() => onEpisodeChange(epId)}
                  title={`${ep.number}: ${ep.title}${isFillerEp ? " (Filler)" : ""}`}
                  className={`h-12 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-2 ring-primary/50"
                        : isFillerEp
                          ? "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/25 border border-yellow-500/30"
                          : "bg-muted hover:bg-accent text-foreground"
                    }`}
                >
                  {ep.number}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {filteredEpisodes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No episodes found
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.4);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--muted-foreground) / 0.2) transparent;
        }
      `}</style>
    </div>
  );
};

export default EpisodesList;