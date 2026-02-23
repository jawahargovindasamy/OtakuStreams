import React, { useEffect, useState } from 'react';
import { Bell, Check } from "lucide-react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/context/auth-provider';

const NotificationDropdown = ({ notifications = [] }) => {
    const { fetchNotifications, markRead } = useAuth();
    const unreadCount = notifications?.filter((n) => n.read === false).length || 0;
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (open) {
            fetchNotifications(true); // force refresh
        }
    }, [open]);

    const handleNotificationClick = async (notificationId) => {
        await markRead(notificationId);
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    className="relative rounded-full hover:bg-accent hover:text-accent-foreground transition-colors duration-200 cursor-pointer"
                >
                    <Bell className="h-5 w-5" strokeWidth={2} />
                    {/* Badge */}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-medium shadow-lg shadow-primary/25">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-80 sm:w-96 p-0 bg-popover/95 backdrop-blur-xl text-popover-foreground border border-border/50 rounded-xl overflow-hidden shadow-xl shadow-primary/10"
            >
                <div className="flex items-center justify-between px-4 py-3 bg-muted/50">
                    <DropdownMenuLabel className="text-base font-semibold tracking-tight p-0">
                        Notifications
                    </DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                            {unreadCount} new
                        </span>
                    )}
                </div>

                {/* Notification List */}
                <div className="max-h-100 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" strokeWidth={1.5} />
                            <p className="text-sm text-muted-foreground">
                                No notifications yet
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                                We'll notify you when new episodes arrive
                            </p>
                        </div>
                    ) : (
                        notifications.map((item) => {
                            const isUnread = item.read === false;
                            return (
                                <Link
                                    key={item._id}
                                    to={`/watch/${item.episodeId}`}
                                    onClick={() => handleNotificationClick(item._id)}
                                    className={`flex gap-3 px-4 py-3 transition-all duration-200 hover:bg-accent group ${isUnread ? "bg-primary/5" : "bg-transparent"}`}
                                >
                                    <div className="relative shrink-0">
                                        <img
                                            src={item.animeImage}
                                            alt={item.animeTitle}
                                            className="w-12 h-16 object-cover rounded-md shadow-md group-hover:shadow-lg transition-shadow duration-200"
                                            loading="lazy"
                                        />
                                        {isUnread && (
                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-popover shadow-sm" />
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span
                                            className={`text-sm leading-snug line-clamp-2 ${isUnread
                                                ? "text-foreground font-semibold"
                                                : "text-muted-foreground"
                                                }`}
                                        >
                                            {item.animeTitle}
                                        </span>
                                        <span className="text-xs text-muted-foreground/80 mt-1 line-clamp-1">
                                            {item.message || "New episode available NOW!"}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                            {dayjs(item.createdAt).fromNow()}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <>
                        <Separator className="bg-border/50" />
                        <Link
                            to="/notification"
                            className="block text-center py-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200 font-medium"
                        >
                            View all notifications
                        </Link>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationDropdown;