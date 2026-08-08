import React, { useMemo, useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, Play, Check, LayoutGrid, List as ListIcon } from "lucide-react";

const EpisodesList = ({
  episodeList = [],
  totalepisodes = 0,
  activeEpisode,
  onEpisodeChange,
  watchedEpisodes = [],
  poster,
  maxHeight,
  isWide = false,
}) => {
  const [search, setSearch] = useState("");
  const [selectedRangeStart, setSelectedRangeStart] = useState(null);
  const [viewMode, setViewMode] = useState(null); // null = auto by total count

  const lastEpNum = episodeList && episodeList.length > 0 ? Number(episodeList[episodeList.length - 1]?.number) || episodeList.length : 0;
  const totalCount = Math.max(Number(totalepisodes) || 0, Number(activeEpisode) || 0, lastEpNum, episodeList?.length || 0);
  const isGridMode = viewMode ? viewMode === "grid" : totalCount > 60;

  // ================= HELPERS =================
  const getEpId = (episodeId) => {
    if (!episodeId) return "";
    return episodeId.includes("ep=") ? episodeId.split("ep=")[1] : episodeId;
  };

  // ================= RANGES =================
  const ranges = useMemo(() => {
    const list = [];
    for (let i = 1; i <= totalCount; i += 100) {
      const start = i;
      const end = Math.min(i + 99, totalCount);

      list.push({
        label: `${start}–${end}`,
        start,
        end,
      });
    }
    return list;
  }, [totalCount]);

  const currentRange = useMemo(() => {
    if (selectedRangeStart === null) return ranges[0];
    const match = ranges.find((r) => r.start === selectedRangeStart);
    return match || ranges[0];
  }, [ranges, selectedRangeStart]);

  const scrollContainerRef = useRef(null);
  const activePillRef = useRef(null);
  const activeEpRef = useRef(null);

  // ================= AUTO RANGE SWITCH =================
  const prevActiveEpRef = useRef(activeEpisode);
  useEffect(() => {
    if (!isGridMode || !activeEpisode) return;

    if (selectedRangeStart === null || prevActiveEpRef.current !== activeEpisode) {
      prevActiveEpRef.current = activeEpisode;

      const activeEp = (episodeList || []).find((ep) => {
        const epId = getEpId(ep.episodeId);
        return Number(epId) === Number(activeEpisode) || Number(ep.number) === Number(activeEpisode);
      });

      const epNum = activeEp ? activeEp.number : Number(activeEpisode);
      if (!epNum || isNaN(epNum)) return;

      const correctRange = ranges.find((r) => epNum >= r.start && epNum <= r.end);

      if (correctRange) {
        setSelectedRangeStart(correctRange.start);
      }
    }
  }, [activeEpisode, episodeList, isGridMode, ranges, selectedRangeStart]);

  // ================= AUTO SCROLL ACTIVE ITEM INTO VIEW (Section 6 Spec) =================
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activePillRef.current && activePillRef.current.parentElement) {
        const container = activePillRef.current.parentElement;
        const targetLeft = activePillRef.current.offsetLeft - container.offsetLeft - container.clientWidth / 2 + activePillRef.current.clientWidth / 2;
        container.scrollTo({ left: targetLeft, behavior: "smooth" });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [activeEpisode, currentRange]);

  // ================= SEARCH RANGE SWITCH =================
  useEffect(() => {
    if (!isGridMode || !search) return;

    const matchedEp = (episodeList || []).find((ep) => ep.number.toString() === search);
    if (matchedEp) {
      const correctRange = ranges.find(
        (r) => matchedEp.number >= r.start && matchedEp.number <= r.end
      );
      if (correctRange && selectedRangeStart !== correctRange.start) {
        setSelectedRangeStart(correctRange.start);
      }
    }
  }, [search, episodeList, isGridMode, ranges, selectedRangeStart]);

  // Ensure episodeList entries match totalCount (metadata count)
  const effectiveEpisodes = useMemo(() => {
    if (!episodeList || episodeList.length === 0) {
      if (totalCount === 0) return [];
      const dummy = [];
      for (let i = 1; i <= totalCount; i++) {
        dummy.push({ episodeId: i.toString(), number: i, title: `Episode ${i}`, isFiller: false });
      }
      return dummy;
    }
    const lastEp = episodeList[episodeList.length - 1]?.number || episodeList.length;
    if (lastEp < totalCount) {
      const merged = [...episodeList];
      for (let i = lastEp + 1; i <= totalCount; i++) {
        merged.push({ episodeId: i.toString(), number: i, title: `Episode ${i}`, isFiller: false });
      }
      return merged;
    }
    return episodeList;
  }, [episodeList, totalCount]);

  // ================= FILTER =================
  const filteredEpisodes = useMemo(() => {
    return effectiveEpisodes.filter((ep) => {
      const matchesSearch = ep.number.toString().includes(search);
      const inRange =
        !isGridMode || 
        search.length > 0 || 
        (ep.number >= currentRange.start && ep.number <= currentRange.end);

      return matchesSearch && inRange;
    });
  }, [effectiveEpisodes, search, isGridMode, currentRange]);

  return (
    <div
      className="w-full rounded-2xl border border-border bg-surface/40 backdrop-blur-md p-4 flex flex-col overflow-hidden font-sans"
      style={maxHeight ? { height: maxHeight } : undefined}
    >
      {/* HEADER ROW */}
      <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
        <h2 className="text-sm font-bold tracking-tight text-foreground font-sans">Episodes</h2>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium tabular-nums text-muted-foreground font-sans">
            {activeEpisode || 1}/{totalCount}
          </span>
          {/* List / Grid Toggle Buttons */}
          <div className="flex items-center gap-0.5 bg-surface/50 border border-border p-0.5 rounded-lg">
            <button
              type="button"
              title="List view"
              aria-label="List view"
              onClick={() => setViewMode("list")}
              className={`p-1 rounded transition-colors cursor-pointer ${
                !isGridMode ? "bg-primary text-primary-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Grid view"
              aria-label="Grid view"
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isGridMode ? "bg-primary text-primary-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH INPUT (44px tall pill, bg-surface/40) */}
      <div className="relative w-full mb-3 shrink-0">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          inputMode="numeric"
          placeholder="Jump to episode"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-[44px] rounded-full bg-surface/40 border-border text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/20 font-sans"
        />
      </div>

      {/* ================= CAROUSEL MODE (SHORT SERIES IN THEATRE LAYOUT) ================= */}
      {isWide && !isGridMode && (
        <div className="flex-1 min-h-0">
          <div className="flex overflow-x-auto gap-3.5 pb-2.5 pt-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {filteredEpisodes.map((ep) => {
              const epId = getEpId(ep.episodeId);
              const isActive = Number(epId) === Number(activeEpisode) || Number(ep.number) === Number(activeEpisode);
              const isWatched = watchedEpisodes.includes(ep.number.toString()) || watchedEpisodes.includes(epId);
              const isUnaired = ep.isUnaired;
              const thumb = ep.image || ep.poster || ep.img || ep.thumbnail || poster;

              if (isUnaired) {
                return (
                  <div
                    key={ep.episodeId || ep.number}
                    className="w-[160px] shrink-0 snap-start opacity-45 cursor-not-allowed select-none"
                  >
                    <div className="aspect-video w-full rounded-2xl bg-overlay/40 border border-border/40 overflow-hidden relative">
                      {thumb && <img src={thumb} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <h4 className="text-xs font-semibold text-foreground truncate mt-2">
                      Episode {ep.number}
                    </h4>
                    <p className="text-[11px] font-normal text-muted-foreground mt-0.5">
                      Not aired yet
                    </p>
                  </div>
                );
              }

              return (
                <div
                  key={ep.episodeId || ep.number}
                  ref={isActive ? activeEpRef : null}
                  role="button"
                  onClick={() => onEpisodeChange(epId)}
                  className={`w-[160px] shrink-0 snap-start group cursor-pointer transition-all duration-150 p-1.5 rounded-2xl ${
                    isActive ? "bg-primary/10 border border-primary/40 shadow-glow" : "hover:bg-elevated/60 border border-transparent"
                  }`}
                >
                  {/* 16:9 Thumbnail Container with Centered Play Button */}
                  <div
                    className={`aspect-video w-full rounded-xl overflow-hidden relative bg-overlay/40 border transition-all duration-200 ${
                      isActive
                        ? "border-primary ring-2 ring-primary/50 shadow-glow"
                        : "border-border/60 group-hover:border-primary/40"
                    }`}
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={ep.title || `Episode ${ep.number}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-card text-xs font-bold text-muted-foreground">
                        {ep.number}
                      </div>
                    )}

                    {/* Centered 36px Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary-foreground/30"
                            : "bg-black/60 border border-white/20 text-white group-hover:bg-primary group-hover:border-primary"
                        }`}
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Watched Check Top-Right */}
                    {isWatched && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/70 backdrop-blur-sm border border-emerald-500/40 flex items-center justify-center">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                    )}
                  </div>

                  {/* Below Thumbnail Copy */}
                  <h4 className="text-xs font-semibold text-foreground truncate mt-2 group-hover:text-primary transition-colors">
                    Episode {ep.number}
                  </h4>
                  <p className="text-[11px] font-normal text-muted-foreground mt-0.5">
                    {isActive ? "Now playing" : "Available"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= LIST MODE (SHORT SERIES <= 60 EPS IN STANDARD SIDEBAR) ================= */}
      {!isWide && !isGridMode && (
        <div className="flex-1 min-h-0 max-h-[62vh] overflow-y-auto p-1 space-y-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filteredEpisodes.map((ep) => {
            const epId = getEpId(ep.episodeId);
            const isActive = Number(epId) === Number(activeEpisode) || Number(ep.number) === Number(activeEpisode);
            const isWatched = watchedEpisodes.includes(ep.number.toString()) || watchedEpisodes.includes(epId);
            const isUnaired = ep.isUnaired;
            const thumb = ep.image || ep.poster || ep.img || ep.thumbnail || poster;

            if (isUnaired) {
              return (
                <div
                  key={ep.episodeId || ep.number}
                  className="flex items-center gap-2.5 rounded-xl p-1.5 opacity-45 cursor-not-allowed transition-all duration-150"
                >
                  <div className="w-[64px] h-[36px] rounded-md bg-overlay/40 shrink-0 overflow-hidden relative">
                    {thumb && <img src={thumb} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-semibold truncate text-foreground">{ep.title || `Episode ${ep.number}`}</h4>
                    <p className="text-[11px] font-normal text-muted-foreground">Not aired yet</p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={ep.episodeId || ep.number}
                ref={isActive ? activeEpRef : null}
                role="button"
                onClick={() => onEpisodeChange(epId)}
                className={`group flex items-center gap-2.5 rounded-xl p-1.5 cursor-pointer transition-all duration-150 border ${
                  isActive
                    ? "bg-primary/12 border-primary/50 ring-1 ring-primary/50"
                    : "bg-transparent border-transparent hover:bg-elevated"
                }`}
              >
                {/* 36px 16:9 Thumbnail */}
                <div className="w-[64px] h-[36px] rounded-md bg-overlay/40 shrink-0 overflow-hidden relative border border-border/40">
                  {thumb ? (
                    <img src={thumb} alt={ep.title || `Episode ${ep.number}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-card text-xs font-bold text-muted-foreground">
                      {ep.number}
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 fill-white text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs sm:text-sm font-semibold truncate text-foreground">
                      {ep.title || `Episode ${ep.number}`}
                    </h4>
                    {isWatched && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] font-normal text-muted-foreground mt-0.5">
                    {isActive ? "Now playing" : "Available"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= GRID MODE (LONG SERIES > 60 EPS) ================= */}
      {isGridMode && (
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          {/* RANGE CHIPS */}
          {!search && (
            <div
              ref={scrollContainerRef}
              role="tablist"
              className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shrink-0 pb-1"
            >
              {ranges.map((range) => {
                const isSelected = currentRange.label === range.label;
                return (
                  <button
                    key={range.label}
                    ref={isSelected ? activePillRef : null}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedRangeStart(range.start)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tabular-nums transition-all duration-150 cursor-pointer shrink-0 border ${
                      isSelected
                        ? "bg-primary/15 border-primary text-primary shadow-sm font-bold"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* NUMBER TILES GRID */}
          <div className="max-h-[62vh] overflow-y-auto p-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div
              className={`grid ${
                isWide
                  ? "grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12"
                  : "grid-cols-4 sm:grid-cols-5"
              } gap-2 content-start`}
            >
              {filteredEpisodes.map((ep) => {
                const epId = getEpId(ep.episodeId);
                const isActive = Number(epId) === Number(activeEpisode) || Number(ep.number) === Number(activeEpisode);
                const isWatched = watchedEpisodes.includes(ep.number.toString()) || watchedEpisodes.includes(epId);
                const isUnaired = ep.isUnaired;

                if (isUnaired) {
                  return (
                    <div
                      key={ep.episodeId || ep.number}
                      className="min-h-[44px] rounded-lg border border-border/40 text-xs font-semibold tabular-nums flex items-center justify-center opacity-40 cursor-not-allowed select-none"
                    >
                      {ep.number}
                    </div>
                  );
                }

                return (
                  <button
                    key={ep.episodeId || ep.number}
                    ref={isActive ? activeEpRef : null}
                    onClick={() => onEpisodeChange(epId)}
                    title={`Episode ${ep.number}${ep.title ? `: ${ep.title}` : ""}`}
                    aria-label={`Episode ${ep.number}${isWatched ? ", watched" : ""}`}
                    className={`relative min-h-[44px] rounded-lg text-xs font-semibold tabular-nums transition-all duration-150 cursor-pointer flex items-center justify-center border ${
                      isActive
                        ? "bg-primary/15 border-primary text-primary shadow-glow font-bold"
                        : isWatched
                          ? "bg-elevated border-border text-muted-foreground"
                          : "bg-transparent border-border text-foreground hover:border-primary/40 hover:bg-elevated"
                    }`}
                  >
                    <span>{ep.number}</span>
                    {isWatched && (
                      <Check className="absolute top-1 right-1 w-3 h-3 text-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {filteredEpisodes.length === 0 && (
              <div className="text-center py-12 text-sm font-normal text-muted-foreground">
                No episode matches that number.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EpisodesList;
