import React from "react";
import { Link } from "react-router-dom";
import { Play, Sparkles, ArrowRight } from "lucide-react";
import ContinueWatchingCard from "../ContinueWatchingCard";

const ContinueWatchingSection = ({ items = [] }) => {
  return (
    <section className="w-full space-y-5 sm:space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-primary uppercase tracking-[0.14em] font-sans">
            PICK UP WHERE YOU LEFT OFF
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
            Continue watching
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-sans">
            Your last sessions, saved to this device.
          </p>
        </div>

        {/* Header Action Slot (View All) */}
        {items.length > 0 && (
          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            <Link
              to="/continue-watching"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Content Grid or Empty State */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
          {items.slice(0, 6).map((item, index) => (
            <ContinueWatchingCard
              key={`${item._id || item.animeId}-${index}`}
              item={item}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="w-full border border-dashed border-border/70 rounded-2xl p-8 sm:p-10 text-center bg-surface/40 backdrop-blur-xs flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-elevated text-primary flex items-center justify-center shadow-soft">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
          <h3 className="font-display font-bold text-foreground text-base sm:text-lg">
            You haven't started watching anything yet.
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground font-sans max-w-md">
            Hit Watch now on any title and it will appear here with your exact progress.
          </p>
          <Link
            to="/trending"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full brand-gradient text-white font-sans font-bold text-xs shadow-soft hover:shadow-glow transition-all active:scale-95 mt-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore trending</span>
          </Link>
        </div>
      )}
    </section>
  );
};

export default ContinueWatchingSection;
