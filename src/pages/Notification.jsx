import Navbar from '@/components/Navbar';
import SecondaryNavbar from '@/components/SecondaryNavbar';
import { useAuth } from '@/context/auth-provider';
import { Link } from 'react-router-dom';
import {
    Bell,
    Check,
    Trash2,
    Clock,
    ChevronRight,
    Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import React, { useState, useMemo, useEffect } from 'react';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const Notification = () => {
    const { notification, clearNotifications, markRead } = useAuth();
    const [filter, setFilter] = useState('all');
    const [localNotifications, setLocalNotifications] = useState([]);


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
        if (filter === 'unread') return localNotifications.filter(n => !n.read);
        return localNotifications;
    }, [localNotifications, filter]);

    const unreadCount = localNotifications.filter(n => !n.read).length;
    const readCount = localNotifications.filter(n => n.read).length;

    const handleClearAll = () => {
        clearNotifications?.();
        setLocalNotifications([]);
    };

    const handleMarkAsRead =  async(e, id) => {
        e.preventDefault();
        e.stopPropagation();
        await markRead(id);
        setLocalNotifications(prev =>
            prev.map(n => n._id === id ? { ...n, read: true } : n)
        );
    };

    const handleNavigate = (id) => {
        // Mark as read when navigating
        setLocalNotifications(prev =>
            prev.map(n => n._id === id ? { ...n, read: true } : n)
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <SecondaryNavbar />

            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Bell className="h-8 w-8 text-primary" />
                            </div>
                            Notifications
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                            Stay updated with your favorite anime releases
                        </p>
                    </div>

                    {localNotifications.length > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="gap-2 w-full sm:w-auto"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Clear all</span>
                                    <span className="sm:hidden">Clear</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-popover border-border max-w-md">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2 text-lg">
                                        <div className="p-2 bg-destructive/10 rounded-full">
                                            <Trash2 className="h-5 w-5 text-destructive" />
                                        </div>
                                        Clear all notifications?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground pt-2">
                                        This will permanently remove all {localNotifications.length} notifications from your history.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-2">
                                    <AlertDialogCancel className="bg-muted text-muted-foreground hover:bg-muted/80 border-0">
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleClearAll}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Clear all
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>

                {/* Stats */}
                {localNotifications.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
                        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3 sm:p-4 text-center sm:text-left">
                            <div className="text-xl sm:text-2xl font-bold text-foreground">{localNotifications.length}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground">Total</div>
                        </div>
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 sm:p-4 text-center sm:text-left">
                            <div className="text-xl sm:text-2xl font-bold text-primary">{unreadCount}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground">Unread</div>
                        </div>
                        <div className="bg-muted/50 border border-border/50 rounded-xl p-3 sm:p-4 text-center sm:text-left">
                            <div className="text-xl sm:text-2xl font-bold text-muted-foreground">{readCount}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground">Read</div>
                        </div>
                    </div>
                )}

                {/* Filter Tabs */}
                {localNotifications.length > 0 && (
                    <div className="flex items-center gap-1 mb-6 border-b border-border/50">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 sm:px-4 py-3 text-sm font-medium transition-all cursor-pointer relative ${filter === 'all'
                                ? 'text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            All
                            <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground text-xs">
                                {localNotifications.length}
                            </Badge>
                            {filter === 'all' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-3 sm:px-4 py-3 text-sm font-medium transition-all cursor-pointer relative ${filter === 'unread'
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Unread
                            {unreadCount > 0 && (
                                <Badge className="ml-2 bg-primary text-primary-foreground text-xs">
                                    {unreadCount}
                                </Badge>
                            )}
                            {filter === 'unread' && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                            )}
                        </button>
                    </div>
                )}

                {/* Notifications List */}
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                    {filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                                <Bell className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/30" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 text-center">
                                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                            </h3>
                            <p className="text-muted-foreground text-center max-w-md text-sm mb-6">
                                {filter === 'unread'
                                    ? "You've caught up! Check back later for new episode alerts."
                                    : "We'll notify you when new episodes of your favorite anime are released."}
                            </p>
                            {filter === 'unread' && localNotifications.length > 0 && (
                                <Button variant="outline" onClick={() => setFilter('all')}>
                                    View all notifications
                                </Button>
                            )}
                        </div>
                    ) : (
                        <ScrollArea className="h-[500px] sm:h-[600px]">
                            <div className="divide-y divide-border/50">
                                {filteredNotifications.map((item) => {
                                    const isUnread = !item.read;
                                    return (
                                        <div
                                            key={item._id}
                                            className={`group flex items-start gap-3 sm:gap-4 p-3 sm:p-6 transition-all duration-200 hover:bg-accent/30 ${isUnread ? 'bg-primary/[0.03]' : 'bg-transparent'
                                                }`}
                                        >
                                            {/* Image */}
                                            <Link
                                                to={`/${item.animeId}`}
                                                onClick={() => handleNavigate(item._id)}
                                                className="relative shrink-0"
                                            >
                                                <img
                                                    src={item.animeImage}
                                                    alt={item.animeTitle}
                                                    className="w-14 h-20 sm:w-20 sm:h-28 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                                {isUnread && (
                                                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 sm:w-4 sm:h-4 bg-primary rounded-full border-2 border-card shadow-sm" />
                                                )}
                                            </Link>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 pt-0.5 sm:pt-1">
                                                <div className="flex items-start justify-between gap-2 sm:gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <Link
                                                            to={`/watch/${item.episodeId}`}
                                                            onClick={() => handleNavigate(item._id)}
                                                            className="inline-block"
                                                        >
                                                            <div className="flex items-center gap-2 mb-1.5 sm:mb-2 flex-wrap">
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-[10px] sm:text-xs gap-1 px-1.5 sm:px-2.5 py-0.5 border-primary/30 text-primary bg-primary/5 hover:bg-primary/10"
                                                                >
                                                                    <Play className="h-3 w-3" />
                                                                    New Episode
                                                                </Badge>
                                                                {isUnread && (
                                                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse" />
                                                                )}
                                                            </div>
                                                        </Link>

                                                        <Link
                                                            to={`/${item.animeId}`}
                                                            onClick={() => handleNavigate(item._id)}
                                                        >
                                                            <h3 className={`text-sm sm:text-lg font-semibold leading-tight mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors ${isUnread ? 'text-foreground' : 'text-muted-foreground'
                                                                }`}>
                                                                {item.animeTitle}
                                                            </h3>
                                                        </Link>

                                                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                                                            {item.message}
                                                        </p>

                                                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground/70">
                                                            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                                            {dayjs(item.createdAt).fromNow()}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                                        {isUnread && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                                onClick={(e) => handleMarkAsRead(e, item._id)}
                                                                title="Mark as read"
                                                            >
                                                                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                            </Button>
                                                        )}
                                                        <Link
                                                            to={`/${item.animeId}`}
                                                            onClick={() => handleNavigate(item._id)}
                                                            className="p-1.5 sm:p-2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                                                        >
                                                            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Notification;