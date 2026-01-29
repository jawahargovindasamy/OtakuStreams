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
    const [currentStartIndex, setCurrentStartIndex] = useState(1);

    const days = useMemo(
        () => getMonthDays(selectedDate),
        [selectedDate]
    );

    const visibleDays = days.slice(currentStartIndex, currentStartIndex + 7);

    const selectedDateFormatted = useMemo(() => {
        const y = selectedDate.getFullYear();
        const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const d = String(selectedDate.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }, [selectedDate]);

    useEffect(() => {
        const dayIndex = selectedDate.getDate() - 1;
        setCurrentStartIndex(Math.max(0, dayIndex - 3));
    }, [selectedDate.getMonth(), selectedDate.getFullYear()]);

    const scrollPrev = () => {
        setCurrentStartIndex((prev) => Math.max(0, prev - 1));
    };

    const scrollNext = () => {
        setCurrentStartIndex((prev) =>
            Math.min(Math.max(days.length - 7, 0), prev + 1)
        );
    };

    const isSelected = (day) =>
        day.fullDate.toDateString() === selectedDate.toDateString();

    const isToday = (day) =>
        day.fullDate.toDateString() === new Date().toDateString();

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchestimatedschedules(selectedDateFormatted);
            onScheduleChange(data?.data?.scheduledAnimes || []);
        };

        fetchData();
    }, [selectedDateFormatted, fetchestimatedschedules, onScheduleChange]);


    return (
        <div className="w-full px-2 py-4 rounded-lg">
            <div className="flex items-center justify-between gap-3">
                <button
                    onClick={scrollPrev}
                    disabled={currentStartIndex === 0}
                    className="p-2 rounded-full hover:bg-slate-800 disabled:opacity-50"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="flex gap-2 flex-1 justify-center">
                    {visibleDays.map((day) => (
                        <button
                            key={day.fullDate.toISOString()}
                            onClick={() => setSelectedDate(day.fullDate)}
                            className={`
                                    flex flex-col items-center justify-center
                                    w-22 h-16 rounded-xl font-medium
                                    transition-all duration-200
                                    ${isSelected(day)
                                    ? "bg-black dark:bg-white text-white dark:text-black scale-105 shadow-lg"
                                    : isToday(day)
                                        ? "bg-slate-700 text-white border-2 border-blue-500"
                                        : "bg-slate-800 text-gray-300 hover:bg-slate-700"
                                }
                                `}
                        >
                            <span className="text-sm font-bold capitalize">
                                {day.day}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs">{day.month}</span>
                                <span className="text-xs font-bold">
                                    {day.date}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={scrollNext}
                    disabled={currentStartIndex >= days.length - 7}
                    className="p-2 rounded-full hover:bg-slate-800 disabled:opacity-50"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
};

export default DateCarousel;
