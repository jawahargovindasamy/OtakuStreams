import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const SectionHeader = ({ title, icon, link, time }) => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        if (!time) return;
        const i = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(i);
    }, [time]);

    return (
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
                <div className="h-9 w-1.5 rounded bg-black dark:bg-white" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {title}
                </h2>
            </div>

            {icon && (
                <Link
                    to={link}
                    className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                >
                    View All <ArrowRight className="w-4 h-4" />
                </Link>
            )}

            {time && (
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    (GMT+05:30) {now.toLocaleTimeString()}
                </span>
            )}
        </div>
    );
};

export default SectionHeader;
