import React, { useState, useEffect, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-provider";
import { toast } from "sonner";
import {
  Bookmark,
  Play,
  PauseCircle,
  XCircle,
  CheckCircle2,
  Trash2,
  Check,
} from "lucide-react";

export const WATCHLIST_CATEGORIES = [
  { key: "watching", label: "Watching", badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", dotColor: "bg-emerald-400", icon: Play },
  { key: "on_hold", label: "On-Hold", badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30", dotColor: "bg-amber-400", icon: PauseCircle },
  { key: "plan_to_watch", label: "Plan to Watch", badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30", dotColor: "bg-indigo-400", icon: Bookmark },
  { key: "dropped", label: "Dropped", badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30", dotColor: "bg-rose-400", icon: XCircle },
  { key: "completed", label: "Completed", badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30", dotColor: "bg-cyan-400", icon: CheckCircle2 },
];

const LOCAL_WATCHLIST_KEY = "otakustreams:watchlist";

const WatchlistDropdown = ({
  animeId,
  animeTitle,
  animeImage,
  children,
  align = "end",
  side = "bottom",
}) => {
  const { user, watchlist, addWatchlist, updateWatchlist, removeWatchlist } = useAuth();
  const [localWatchlist, setLocalWatchlist] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const cleanId = String(animeId || "");

  // Load guest watchlist if not logged in
  useEffect(() => {
    if (!user) {
      try {
        const stored = JSON.parse(localStorage.getItem(LOCAL_WATCHLIST_KEY) || "[]");
        setLocalWatchlist(Array.isArray(stored) ? stored : []);
      } catch {
        setLocalWatchlist([]);
      }
    }
  }, [user]);

  // Find existing item in logged-in or guest watchlist
  const currentEntry = useMemo(() => {
    if (user) {
      if (!Array.isArray(watchlist)) return null;
      return (
        watchlist.find(
          (item) =>
            String(item.animeId) === cleanId ||
            String(item.id) === cleanId ||
            String(item._id) === cleanId
        ) || null
      );
    } else {
      return (
        localWatchlist.find(
          (item) => String(item.id || item.animeId) === cleanId
        ) || null
      );
    }
  }, [user, watchlist, localWatchlist, cleanId]);

  const currentStatus = currentEntry?.status || (currentEntry ? "plan_to_watch" : null);

  const handleSelectStatus = async (targetCategoryKey) => {
    if (isUpdating || !cleanId) return;
    setIsUpdating(true);

    const categoryObj = WATCHLIST_CATEGORIES.find((c) => c.key === targetCategoryKey);
    const categoryLabel = categoryObj?.label || targetCategoryKey;

    try {
      if (user) {
        // Logged-In Flow via API
        if (targetCategoryKey === "remove" || currentStatus === targetCategoryKey) {
          // Remove from watchlist
          if (currentEntry?._id) {
            await removeWatchlist(currentEntry._id);
            toast.success(`Removed "${animeTitle}" from watchlist`);
          }
        } else if (currentEntry?._id) {
          // Update existing item category status
          await updateWatchlist(currentEntry._id, targetCategoryKey);
          toast.success(`Updated "${animeTitle}" status to ${categoryLabel}`);
        } else {
          // Add new item with status
          await addWatchlist(cleanId, animeTitle, animeImage, targetCategoryKey);
          toast.success(`Added "${animeTitle}" to ${categoryLabel}`);
        }
      } else {
        // Guest Flow via localStorage
        let updatedList = [...localWatchlist];

        if (targetCategoryKey === "remove" || currentStatus === targetCategoryKey) {
          updatedList = updatedList.filter(
            (i) => String(i.id || i.animeId) !== cleanId
          );
          toast.success(`Removed "${animeTitle}" from watchlist`);
        } else {
          const index = updatedList.findIndex(
            (i) => String(i.id || i.animeId) === cleanId
          );
          if (index !== -1) {
            updatedList[index] = {
              ...updatedList[index],
              status: targetCategoryKey,
              title: animeTitle || updatedList[index].title,
              poster: animeImage || updatedList[index].poster,
            };
            toast.success(`Updated "${animeTitle}" status to ${categoryLabel}`);
          } else {
            updatedList.unshift({
              id: cleanId,
              animeId: cleanId,
              title: animeTitle,
              poster: animeImage,
              status: targetCategoryKey,
            });
            toast.success(`Added "${animeTitle}" to ${categoryLabel}`);
          }
        }

        localStorage.setItem(LOCAL_WATCHLIST_KEY, JSON.stringify(updatedList));
        setLocalWatchlist(updatedList);
      }
    } catch (err) {
      console.error("Watchlist action error:", err);
      toast.error("Failed to update watchlist");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children ? (
          children
        ) : (
          <button
            type="button"
            aria-label="Manage watchlist"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer backdrop-blur-md shadow-soft border ${
              currentEntry
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-surface/80 border-border/70 text-foreground hover:bg-elevated"
            }`}
          >
            {currentEntry ? (
              <Check className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={6}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
        className="w-56 p-1.5 rounded-2xl bg-surface/95 backdrop-blur-xl border border-border/80 shadow-lift z-50 text-foreground font-sans animate-in fade-in zoom-in-95 duration-150 no-scrollbar [&::-webkit-scrollbar]:hidden"
      >
        <DropdownMenuLabel className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
          Set Watch Status
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/60 my-1" />

        {WATCHLIST_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = currentStatus === cat.key;

          return (
            <DropdownMenuItem
              key={cat.key}
              disabled={isUpdating}
              onClick={() => handleSelectStatus(cat.key)}
              className={`
                flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors
                ${isActive
                  ? "bg-primary/15 text-primary font-bold"
                  : "text-foreground hover:bg-elevated focus:bg-elevated"
                }
              `}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-2 h-2 rounded-full ${cat.dotColor} shrink-0`} />
                <span className="truncate">{cat.label}</span>
              </div>
              {isActive && <Check className="w-4 h-4 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}

        {currentEntry && (
          <>
            <DropdownMenuSeparator className="bg-border/60 my-1" />
            <DropdownMenuItem
              disabled={isUpdating}
              onClick={() => handleSelectStatus("remove")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10 focus:bg-rose-500/10 cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Remove from Watchlist</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WatchlistDropdown;
