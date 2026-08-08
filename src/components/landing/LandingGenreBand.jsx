import React from "react";
import { ArrowUpRight, Compass } from "lucide-react";

const FEELING_GENRES = [
  { label: "Action & High Energy", genre: "Action", color: "from-rose-500/20 to-orange-500/20" },
  { label: "Deep Emotional Stories", genre: "Drama", color: "from-blue-500/20 to-indigo-500/20" },
  { label: "Heartwarming & Cozy", genre: "Slice of Life", color: "from-amber-500/20 to-emerald-500/20" },
  { label: "Mind-Bending Mysteries", genre: "Mystery", color: "from-purple-500/20 to-pink-500/20" },
  { label: "Epic Fantasy Worlds", genre: "Fantasy", color: "from-cyan-500/20 to-blue-500/20" },
  { label: "Futuristic Sci-Fi", genre: "Sci-Fi", color: "from-emerald-500/20 to-teal-500/20" },
  { label: "Laugh-Out-Loud Comedy", genre: "Comedy", color: "from-yellow-500/20 to-amber-500/20" },
  { label: "Dark Thrillers & Horror", genre: "Horror", color: "from-red-900/30 to-rose-900/30" },
  { label: "Romance & Slow Burns", genre: "Romance", color: "from-pink-500/20 to-rose-500/20" },
  { label: "Adrenaline Sports", genre: "Sports", color: "from-orange-500/20 to-amber-500/20" },
];

const LandingGenreBand = ({ onOpenSearch }) => {
  return (
    <section className="w-full border-b border-border/70 bg-card/20 py-16 sm:py-24 text-foreground font-sans">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 space-y-8 sm:space-y-10">
        
        {/* Heading Block */}
        <div className="space-y-2 text-left max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-[0.18em]">
            <Compass className="h-4 w-4 text-accent" />
            <span>Find your frequency</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground">
            Browse by feeling, not just title.
          </h2>
        </div>

        {/* 2 / 3 / 5 Responsive Tile Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
          {FEELING_GENRES.map((item) => (
            <div
              key={item.genre}
              onClick={onOpenSearch}
              className={`
                group relative overflow-hidden h-[96px] rounded-2xl border border-border/70 bg-surface/80 hover:bg-elevated p-4 cursor-pointer text-left
                flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-soft backdrop-blur-md
              `}
            >
              {/* Soft Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

              {/* Tile Label */}
              <span className="relative z-10 font-display font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors pr-2 leading-snug">
                {item.label}
              </span>

              {/* Arrow Up-Right Icon */}
              <div className="relative z-10 w-9 h-9 rounded-xl bg-card border border-border/60 group-hover:border-primary/40 text-muted-foreground group-hover:text-primary flex items-center justify-center shrink-0 transition-colors">
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default LandingGenreBand;
