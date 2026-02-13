import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/theme-provider";

const ThemeTogglePill = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        relative flex items-center rounded-full border transition-all duration-300 ease-spring cursor-pointer
        h-7 w-12 sm:h-8 sm:w-14 lg:h-9 lg:w-16 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
        ${isDark
          ? "bg-slate-900 border-slate-700 shadow-inner shadow-black/20"
          : "bg-slate-100 border-slate-300 shadow-inner shadow-black/5"
        }
      `}
      aria-label="Toggle theme"
    >
      {/* Background Icons */}
      <span className="absolute left-1.5 text-slate-400">
        <Sun className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-0 transition-opacity duration-300 dark:opacity-50" />
      </span>
      <span className="absolute right-1.5 text-slate-400">
        <Moon className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-50 transition-opacity duration-300 dark:opacity-0" />
      </span>

      {/* Sliding Knob */}
      <span
        className={`
          absolute flex items-center justify-center rounded-full shadow-lg transition-all duration-300 ease-spring
          h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7
          ${isDark
            ? "translate-x-6 sm:translate-x-7 lg:translate-x-8 bg-slate-800 shadow-black/40"
            : "translate-x-0.5 bg-white shadow-black/20"
          }
        `}
      >
        {isDark ? (
          <Moon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-400" />
        ) : (
          <Sun className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500" />
        )}
      </span>
    </button>
  );
};

export default ThemeTogglePill;