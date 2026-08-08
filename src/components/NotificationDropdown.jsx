import React, { useState } from "react";
import { Bell, Play, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-provider";
import { getAnimeTitle } from "@/lib/utils";

dayjs.extend(relativeTime);

const NotificationDropdown = ({ notifications = [] }) => {
  const { markRead, continueWatching, language } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const unreadCount = notifications?.filter((n) => n.read === false).length || 0;

  const handleNotificationClick = async (item) => {
    setOpen(false);
    if (!item.read) {
      await markRead(item._id);
    }
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
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Notifications"
          className="relative rounded-full hover:bg-card hover:text-foreground transition-all duration-200 cursor-pointer shadow-soft hover:shadow-glow"
        >
          <Bell className="h-5 w-5" strokeWidth={2} />
          {/* Unread Pill Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-glow animate-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-84 sm:w-96 p-0 bg-background/95 backdrop-blur-2xl text-foreground border border-border/80 rounded-3xl overflow-hidden shadow-lift z-50"
      >
        {/* Dropdown Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-card/60 border-b border-border/60">
          <DropdownMenuLabel className="text-base font-extrabold font-sans tracking-tight p-0 flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
              <Bell className="h-4 w-4" />
            </div>
            <span>Notifications</span>
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Badge className="bg-primary text-primary-foreground font-bold text-xs px-2.5 py-0.5 rounded-full shadow-glow">
              {unreadCount} new
            </Badge>
          )}
        </div>

        {/* Notification Items List */}
        <div className="max-h-[380px] overflow-y-auto p-3 space-y-2 no-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center space-y-3">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Bell className="h-8 w-8" />
              </div>
              <p className="text-sm font-bold font-sans text-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground max-w-[220px]">
                We'll notify you here as soon as new episodes are released!
              </p>
            </div>
          ) : (
            notifications.slice(0, 10).map((item) => {
              const isUnread = item.read === false;
              const title = getAnimeTitle(item, language) || item.animeTitle || "Anime Update";

              return (
                <div
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  className={`group flex items-center gap-3 p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isUnread
                      ? "border-primary/40 bg-primary/[0.04] shadow-soft hover:bg-primary/10"
                      : "border-border/60 bg-card/40 hover:bg-card/80"
                  }`}
                >
                  {/* Poster Thumbnail */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-16 aspect-[2/3] rounded-xl overflow-hidden bg-elevated">
                      <img
                        src={item.animeImage}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    {isUnread && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background shadow-glow ring-2 ring-primary/40 flex items-center justify-center z-20">
                        <span className="w-1 h-1 bg-white rounded-full" />
                      </span>
                    )}
                  </div>

                  {/* Content Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-[9px] gap-1 px-1.5 py-0 border-primary/30 text-primary bg-primary/10 font-semibold"
                      >
                        <Play className="h-2.5 w-2.5 fill-current" />
                        E{item.episode || 1}
                      </Badge>
                    </div>

                    <h4
                      className={`truncate text-xs sm:text-sm font-semibold transition-colors group-hover:text-primary ${
                        isUnread ? "text-foreground font-bold" : "text-muted-foreground"
                      }`}
                    >
                      {title}
                    </h4>

                    <p className="text-[11px] text-muted-foreground/80 line-clamp-1 font-sans">
                      {item.message || "New episode available NOW!"}
                    </p>

                    <div className="text-[10px] text-muted-foreground/60 font-sans">
                      {dayjs(item.createdAt).fromNow()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Dropdown Footer Link */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-border/60 bg-card/40">
            <Link
              to="/notification"
              onClick={() => setOpen(false)}
              className="w-full h-9 rounded-xl text-xs font-bold text-primary hover:text-primary-foreground hover:bg-primary transition-all duration-200 flex items-center justify-center gap-1.5 border border-primary/20 hover:border-transparent cursor-pointer"
            >
              <span>View all notifications</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;