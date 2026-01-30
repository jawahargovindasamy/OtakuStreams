import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";

const SectionHeader = ({ title, icon, link, time }) => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        if (!time) return;
        const i = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(i);
    }, [time]);

    return (
        <div className="flex justify-between items-center gap-4 mb-4 sm:mb-5 group">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* HiAnime-style Accent Bar */}
                <div className="h-8 sm:h-9 w-1 sm:w-1.5 rounded-full bg-linear-to-b from-primary to-primary/50 shrink-0 shadow-sm shadow-primary/20" />
                
                {/* Title with responsive sizing */}
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground tracking-tight truncate">
                    {title}
                </h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {icon && link && (
                    <Link
                        to={link}
                        className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors duration-200 group/link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg px-2 py-1 -mr-2"
                    >
                        <span className="hidden sm:inline">View All</span>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover/link:translate-x-0.5" />
                    </Link>
                )}

                {time && (
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-primary/10 text-primary px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-primary/20 backdrop-blur-sm ring-1 ring-primary/10">
                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span className="tabular-nums tracking-wide">(GMT+05:30) {now.toLocaleTimeString()}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SectionHeader;