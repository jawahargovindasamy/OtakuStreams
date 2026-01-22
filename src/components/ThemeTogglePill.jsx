import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/theme-provider";

const ThemeTogglePill = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative flex items-center rounded-full border border-black transition-colors
        h-7 w-12 md:h-8 md:w-16 cursor-pointer
        ${isDark ? "bg-zinc-900 border-zinc-700" : "bg-zinc-100"}
      `}
      aria-label="Toggle theme"
    >
      {/* Sliding knob */}
      <span
        className={`absolute left-1 flex items-center justify-center rounded-full transition-transform duration-300
          h-5 w-5 md:h-6 md:w-6
          ${isDark ? "translate-x-5 md:translate-x-8 bg-black" : "translate-x-0 bg-white"}
        `}
      >
        {isDark ? (
          <Moon className="h-3 w-3 md:h-4 md:w-4 text-white" />
        ) : (
          <Sun className="h-3 w-3 md:h-4 md:w-4 text-black" />
        )}
      </span>
    </button>
  );
};

export default ThemeTogglePill;
