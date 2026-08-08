import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/auth-provider";
import { getAnimeTitle, slugify } from "@/lib/utils";
import {
  Bell,
  Check,
  Trash2,
  Clock,
  Play,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const Notification = () => {
  const { notification, clearNotifications, markRead, deleteNotification, continueWatching, language } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // 'all' | 'unread' | 'read'
  const [localNotifications, setLocalNotifications] = useState([]);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    document.title = "Notifications — OtakuStreams";
  }, []);

  // Transform and enrich notification data
  useEffect(() => {
    if (notification && Array.isArray(notification)) {
      const enriched = notification.map((item, index) => ({
        ...item,
        read: item.read ?? false,
        createdAt: item.createdAt || new Date(Date.now() - index * 1000 * 60 * 60 * 2).toISOString(),
        message: item.message || "New episode available NOW!",
      }));
      setLocalNotifications(enriched);
    }
  }, [notification]);

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") return localNotifications.filter((n) => !n.read);
    if (filter === "read") return localNotifications.filter((n) => n.read);
    return localNotifications;
  }, [localNotifications, filter]);

  const unreadCount = useMemo(
    () => localNotifications.filter((n) => !n.read).length,
    [localNotifications]
  );
  const readCount = useMemo(
    () => localNotifications.filter((n) => n.read).length,
    [localNotifications]
  );

  const handleClearAll = () => {
    clearNotifications?.();
    setLocalNotifications([]);
    setShowClearModal(false);
    toast.success("Notifications cleared");
  };

  const handleMarkAsRead = (id) => {
    markRead?.(id);
    setLocalNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  const handleDeleteNotification = (e, id) => {
    e.stopPropagation();
    deleteNotification?.(id);
    setLocalNotifications((prev) => prev.filter((n) => n._id !== id));
    toast.success("Notification deleted");
  };

  const handleCardClick = (item) => {
    handleMarkAsRead(item._id);
    const progress = continueWatching?.find(
      (cw) => (cw.animeId || cw.id) === (item.animeId || item.id)?.toString()
    );
    navigate(`/watch/${item.animeId}/${item.episode || 1}`, {
      state: {
        server: progress?.server,
        dub: progress?.dub,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* Skip to Content Link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-xl focus:shadow-glow focus:outline-none text-sm font-semibold"
      >
        Skip to content
      </a>

      {/* 1. Shared Navbar */}
      <header className="sticky top-0 z-40 w-full glass border-b border-glass-border">
        <Navbar />
      </header>

      <main id="main" className="flex-1 w-full pb-16 lg:pb-24">
        {/* 2. Library Hero Section (Matching Watchlist / Continue Watching design system) */}
        <section
          aria-labelledby="notification-hero-title"
          className="relative w-full overflow-hidden border-b border-border pt-28 pb-10 sm:pt-32 sm:pb-12 px-4 sm:px-6 lg:px-10"
        >
          {/* Aurora Glow Layer */}
          <div aria-hidden="true" className="aurora opacity-75 pointer-events-none" />

          <div className="relative z-10 max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-6 lg:items-end">
            {/* Identity & Stats */}
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-primary font-sans flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-primary" />
                <span>Stay updated</span>
              </div>
              <h1
                id="notification-hero-title"
                className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl font-sans text-foreground"
              >
                Notifications
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base max-w-xl font-sans">
                Real-time alerts for new episode releases and updates on your favorite anime series.
              </p>

              {/* Stats Row (<dl>) */}
              <dl className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2">
                <div className="space-y-0.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground font-sans">
                    Total
                  </dt>
                  <dd className="font-display font-black text-2xl sm:text-3xl text-foreground tabular-nums">
                    {localNotifications.length}
                  </dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground font-sans">
                    Unread
                  </dt>
                  <dd className="font-display font-black text-2xl sm:text-3xl text-primary tabular-nums">
                    {unreadCount}
                  </dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground font-sans">
                    Read
                  </dt>
                  <dd className="font-display font-black text-2xl sm:text-3xl text-muted-foreground tabular-nums">
                    {readCount}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Controls Cluster (Clear All Button) */}
            <div className="flex items-center gap-3 self-start lg:self-end">
              <Button
                variant="outline"
                disabled={localNotifications.length === 0}
                onClick={() => setShowClearModal(true)}
                className="rounded-full h-10 px-4 text-xs font-semibold border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition-colors cursor-pointer disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Clear all
              </Button>
            </div>
          </div>
        </section>

        {/* 3. Sticky Control Shell (Status Tabs) */}
        <div className="sticky top-[64px] z-30 border-y border-border bg-background/85 backdrop-blur-xl">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
            <div
              role="tablist"
              aria-label="Notification status"
              className="no-scrollbar flex items-center gap-2 overflow-x-auto py-2.5 -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {[
                { key: "all", label: "All", count: localNotifications.length, icon: Bell },
                { key: "unread", label: "Unread", count: unreadCount, icon: Play, tone: "text-primary" },
                { key: "read", label: "Read", count: readCount, icon: CheckCircle2, tone: "text-muted-foreground" },
              ].map((tab) => {
                const isSelected = filter === tab.key;
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setFilter(tab.key)}
                    className={`min-h-11 px-4 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-200 shrink-0 cursor-pointer border ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-transparent shadow-glow"
                        : "bg-card/50 border-border/80 text-muted-foreground hover:text-foreground hover:bg-card"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-primary-foreground" : tab.tone || "text-muted-foreground"}`} />
                    <span>{tab.label}</span>
                    <span
                      className={`text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded-full ${
                        isSelected ? "bg-white/20 text-primary-foreground" : "bg-elevated text-muted-foreground"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Collection Content Section */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-8">
          {/* Collection Header */}
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black sm:text-2xl font-sans text-foreground tracking-tight">
                {filter === "all" ? "All alerts" : filter === "unread" ? "Unread updates" : "Read alerts"}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {filteredNotifications.length} {filteredNotifications.length === 1 ? "notification" : "notifications"}
              </p>
            </div>
          </div>

          {/* Accessible Live Region */}
          <div className="sr-only" aria-live="polite">
            {filteredNotifications.length} notifications shown
          </div>

          {/* Notifications List */}
          {filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((item) => {
                const isUnread = !item.read;
                const title = getAnimeTitle(item, language) || item.animeTitle || "Anime Update";

                return (
                  <div
                    key={item._id}
                    onClick={() => handleCardClick(item)}
                    className={`group flex items-center gap-4 p-3 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isUnread
                        ? "border-primary/40 bg-primary/[0.04] shadow-soft"
                        : "border-border/80 bg-card/50 hover:bg-card"
                    }`}
                  >
                    {/* Poster Thumbnail */}
                    <div className="relative shrink-0">
                      <div className="w-14 h-20 aspect-[2/3] rounded-xl overflow-hidden bg-elevated">
                        <img
                          src={item.animeImage}
                          alt={title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      {isUnread && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full border-2 border-background shadow-glow ring-2 ring-primary/40 flex items-center justify-center z-20">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        </span>
                      )}
                    </div>

                    {/* Notification Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-[10px] sm:text-xs gap-1 px-2 py-0.5 border-primary/30 text-primary bg-primary/10 font-semibold"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          New Episode {item.episode ? `E${item.episode}` : ""}
                        </Badge>
                        {isUnread && (
                          <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                            New
                          </Badge>
                        )}
                      </div>

                      <h3
                        className={`truncate text-sm sm:text-base font-semibold transition-colors group-hover:text-primary ${
                          isUnread ? "text-foreground font-bold" : "text-muted-foreground"
                        }`}
                      >
                        {title}
                      </h3>

                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                        {item.message}
                      </p>

                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 font-sans pt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{dayjs(item.createdAt).fromNow()}</span>
                      </div>
                    </div>

                    {/* Actions: Mark As Read & Delete */}
                    <div className="shrink-0 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {isUnread && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(item._id)}
                          title="Mark as read"
                          aria-label="Mark as read"
                          className="p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow transition-all duration-200 cursor-pointer"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteNotification(e, item._id)}
                        title="Delete notification"
                        aria-label="Delete notification"
                        className="p-2.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State Presentation */
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 bg-card/30 rounded-3xl border border-border/60 p-8 max-w-xl mx-auto">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <Bell className="h-8 w-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-sans text-foreground">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {filter === "unread"
                  ? "You've caught up! Check back later for new episode alerts."
                  : "We'll notify you here when new episodes of your favorite anime release."}
              </p>
              {filter === "unread" && localNotifications.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setFilter("all")}
                  className="rounded-full text-xs font-semibold border-border hover:bg-elevated cursor-pointer"
                >
                  View all notifications
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Clear All Confirmation Modal */}
      <Dialog open={showClearModal} onOpenChange={setShowClearModal}>
        <DialogContent className="max-w-md bg-surface border-border rounded-3xl p-6 sm:p-7 shadow-lift">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
              <Trash2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold font-sans text-foreground">
              Clear all notifications?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              This will permanently remove all {localNotifications.length} notifications from your history.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowClearModal(false)}
              className="h-11 px-5 rounded-xl text-sm font-semibold border-border hover:bg-elevated cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleClearAll}
              className="h-11 px-6 rounded-xl text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              Clear all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
};

export default Notification;