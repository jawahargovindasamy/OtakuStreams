import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useData } from "@/context/data-provider";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

/* ------------------ Utils ------------------ */
const getMonthDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: totalDays }, (_, i) => {
        const d = new Date(year, month, i + 1);
        return {
            day: d.toLocaleDateString("en-US", { weekday: "short" }),
            date: i + 1,
            fullDate: d,
            month: d.toLocaleDateString("en-US", { month: "short" }),
        };
    });
};

/* ------------------ Component ------------------ */
const DateCarousel = ({ onScheduleChange }) => {
    const { fetchestimatedschedules } = useData();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentStartIndex, setCurrentStartIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const days = useMemo(() => getMonthDays(selectedDate), [selectedDate]);

    const visibleDays = useMemo(() => {
        const maxStartIndex = Math.max(0, days.length - 7);
        const safeStartIndex = Math.min(currentStartIndex, maxStartIndex);
        return days.slice(safeStartIndex, safeStartIndex + 7);
    }, [days, currentStartIndex]);

    const selectedDateFormatted = useMemo(() => {
        const y = selectedDate.getFullYear();
        const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const d = String(selectedDate.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }, [selectedDate]);

    useEffect(() => {
        const dayIndex = selectedDate.getDate() - 1;
        const maxStartIndex = Math.max(0, days.length - 7);
        const targetIndex = Math.max(0, dayIndex - 3);
        const clampedIndex = Math.min(targetIndex, maxStartIndex);

        setCurrentStartIndex(clampedIndex);
    }, [selectedDate.getMonth(), selectedDate.getFullYear(), days.length]);

    const scrollPrev = () => {
        if (isLoading) return;
        setCurrentStartIndex((prev) => Math.max(0, prev - 1));
    };

    const scrollNext = () => {
        if (isLoading) return;
        setCurrentStartIndex((prev) => {
            const maxIndex = Math.max(0, days.length - 7);
            return Math.min(maxIndex, prev + 1);
        });
    };

    const handleDateSelect = (day) => {
        if (isLoading) return;
        setSelectedDate(day.fullDate);
    };

    const isSelected = (day) =>
        day.fullDate.toDateString() === selectedDate.toDateString();

    const isToday = (day) =>
        day.fullDate.toDateString() === new Date().toDateString();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchestimatedschedules(selectedDateFormatted);
                onScheduleChange(data?.data?.scheduledAnimes || []);
            } catch (error) {
                console.error("Failed to fetch schedules:", error);
                onScheduleChange([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedDateFormatted, fetchestimatedschedules, onScheduleChange]);


    return (
        <div className={`w-full bg-card/50 rounded-2xl border border-border/50 p-3 sm:p-4 backdrop-blur-sm transition-opacity duration-200 ${isLoading ? 'opacity-80' : 'opacity-100'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-foreground">
                        {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </h3>
                </div>
                {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                        <div className="h-3 w-3 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                        <span className="hidden sm:inline font-medium">Loading schedule...</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollPrev}
                    disabled={currentStartIndex === 0 || isLoading}
                    className="shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full border-border/50 bg-background/50 hover:bg-accent hover:text-accent-foreground disabled:opacity-30 transition-all duration-200 z-10"
                    aria-label="Previous week"
                >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>

                <ScrollArea className="flex-1 w-full min-w-0 overflow-hidden">
                    <div className="flex gap-1.5 sm:gap-2 justify-between w-full">
                        {visibleDays.map((day) => {
                            const selected = isSelected(day);
                            const today = isToday(day);

                            return (
                                <button
                                    key={day.fullDate.toISOString()}
                                    onClick={() => handleDateSelect(day)}
                                    disabled={isLoading}
                                    className={`
                            relative flex flex-col items-center justify-center cursor-pointer
                            flex-1 min-w-0 my-1
                            h-14 sm:h-16 md:h-20 rounded-xl sm:rounded-2xl
                            font-medium transition-all duration-300 ease-out
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                            disabled:cursor-not-allowed disabled:opacity-60
                            ${selected
                                            ? "bg-primary text-primary-foreground scale-105 shadow-lg shadow-primary/25"
                                            : today
                                                ? "bg-accent text-accent-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                                                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        }
                            ${isLoading ? "pointer-events-none" : ""}
                        `}
                                >
                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-80 truncate w-full text-center px-1">
                                        {day.day}
                                    </span>
                                    <div className="flex items-baseline gap-0.5 mt-0.5">
                                        <span className="text-[10px] sm:text-xs opacity-70">{day.month}</span>
                                        <span className="text-base sm:text-lg md:text-xl font-bold">{day.date}</span>
                                    </div>

                                    {today && !selected && (
                                        <span className="absolute -top-1 -right-1 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-primary ring-2 ring-background" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <ScrollBar orientation="horizontal" className="invisible" />
                </ScrollArea>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollNext}
                    disabled={currentStartIndex >= days.length - 7 || isLoading}
                    className="shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full border-border/50 bg-background/50 hover:bg-accent hover:text-accent-foreground disabled:opacity-30 transition-all duration-200 z-10"
                    aria-label="Next week"
                >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
            </div>
        </div>
    );
};

export default DateCarousel;