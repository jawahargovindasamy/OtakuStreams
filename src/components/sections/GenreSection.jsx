import React from "react";
import GenreTile from "@/components/GenreTile";

// Shuffled curated genre tiles for optimal color and genre contrast
const GENRE_TILES = [
  // Row 1
  { name: "Action", from: "#f43f5e", to: "#f97316" },
  { name: "Romance", from: "#ec4899", to: "#a855f7" },
  { name: "Fantasy", from: "#6366f1", to: "#22d3ee" },
  { name: "Comedy", from: "#f59e0b", to: "#84cc16" },
  { name: "Adventure", from: "#0ea5e9", to: "#14b8a6" },
  // Row 2
  { name: "Thriller", from: "#dc2626", to: "#7f1d1d" },
  { name: "Sci-Fi", from: "#06b6d4", to: "#3b82f6" },
  { name: "Slice of Life", from: "#10b981", to: "#06b6d4" },
  { name: "Mystery", from: "#64748b", to: "#0f172a" },
  { name: "Supernatural", from: "#a855f7", to: "#f43f5e" },
  // Row 3
  { name: "Drama", from: "#8b5cf6", to: "#4f46e5" },
  { name: "Horror", from: "#991b1b", to: "#450a0a" },
  { name: "Sports", from: "#22c55e", to: "#eab308" },
  { name: "Psychological", from: "#475569", to: "#1e1b4b" },
  { name: "Ecchi", from: "#f43f5e", to: "#ec4899" },
];

const GenreSection = () => {
  return (
    <section id="genres" aria-labelledby="genres-title" className="w-full space-y-6">
      {/* Section Header */}
      <div className="space-y-1">
        <div className="text-[11px] font-semibold text-primary uppercase tracking-[0.22em] font-sans">
          FIND YOUR MOOD
        </div>
        <h2
          id="genres-title"
          className="text-2xl sm:text-3xl lg:text-[2rem] font-display font-bold text-foreground tracking-tight"
        >
          Browse by genre
        </h2>
        <p className="text-sm text-muted-foreground font-sans max-w-2xl">
          Fifteen doors into the catalogue.
        </p>
      </div>

      {/* Grid of 15 Genre Tiles (5 cols desktop, 3 cols tablet, 2 cols mobile) */}
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full list-none p-0 m-0">
        {GENRE_TILES.map((genre) => (
          <li key={genre.name} className="w-full">
            <GenreTile
              name={genre.name}
              from={genre.from}
              to={genre.to}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default GenreSection;
