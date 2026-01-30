import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useData } from "@/context/data-provider";

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
    // Initialize with proper calculation instead of hardcoded value
    const [currentStartIndex, setCurrentStartIndex] = useState(0);

    const days = useMemo(() => getMonthDays(selectedDate), [selectedDate]);

    // Ensure we always slice exactly 7 days, but guard against array bounds
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

    // CRITICAL FIX: Center the selected date while ensuring 7 days are always displayed
    useEffect(() => {
        const dayIndex = selectedDate.getDate() - 1;
        const maxStartIndex = Math.max(0, days.length - 7);
        
        // Try to center the selected date (3 days before), but don't exceed maxStartIndex
        const targetIndex = Math.max(0, dayIndex - 3);
        const clampedIndex = Math.min(targetIndex, maxStartIndex);
        
        setCurrentStartIndex(clampedIndex);
    }, [selectedDate.getMonth(), selectedDate.getFullYear(), days.length]);

    const scrollPrev = () => {
        setCurrentStartIndex((prev) => Math.max(0, prev - 1));
    };

    const scrollNext = () => {
        setCurrentStartIndex((prev) => {
            const maxIndex = Math.max(0, days.length - 7);
            return Math.min(maxIndex, prev + 1);
        });
    };

    const isSelected = (day) =>
        day.fullDate.toDateString() === selectedDate.toDateString();

    const isToday = (day) =>
        day.fullDate.toDateString() === new Date().toDateString();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchestimatedschedules(selectedDateFormatted);
                onScheduleChange(data?.data?.scheduledAnimes || []);
            } catch (error) {
                console.error("Failed to fetch schedules:", error);
                onScheduleChange([]);
            }
        };

        fetchData();
    }, [selectedDateFormatted, fetchestimatedschedules, onScheduleChange]);

    return (
        <div className="w-full px-2 py-4 rounded-lg">
            <div className="flex items-center justify-between gap-3">
                <button
                    onClick={scrollPrev}
                    disabled={currentStartIndex === 0}
                    className="p-2 rounded-full hover:bg-slate-800 disabled:opacity-50 transition-colors shrink-0"
                    aria-label="Previous week"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="flex gap-2 flex-1 justify-center overflow-hidden">
                    {visibleDays.map((day) => (
                        <button
                            key={day.fullDate.toISOString()}
                            onClick={() => setSelectedDate(day.fullDate)}
                            className={`
                                flex flex-col items-center justify-center
                                w-16 sm:w-20 md:w-24 h-16 rounded-xl font-medium
                                transition-all duration-200 shrink-0 my-0.5
                                ${
                                    isSelected(day)
                                        ? "bg-black dark:bg-white text-white dark:text-black scale-105 shadow-lg"
                                        : isToday(day)
                                        ? "bg-slate-700 text-white ring-2 ring-blue-500"
                                        : "bg-slate-800 text-gray-300 hover:bg-slate-700"
                                }
                            `}
                        >
                            <span className="text-xs sm:text-sm font-bold capitalize">
                                {day.day}
                            </span>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] sm:text-xs">{day.month}</span>
                                <span className="text-[10px] sm:text-xs font-bold">
                                    {day.date}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={scrollNext}
                    disabled={currentStartIndex >= days.length - 7}
                    className="p-2 rounded-full hover:bg-slate-800 disabled:opacity-50 transition-colors flex-shrink-0"
                    aria-label="Next week"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
};

export default DateCarousel;