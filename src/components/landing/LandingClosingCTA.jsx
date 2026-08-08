import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles } from "lucide-react";

const LandingClosingCTA = () => {
  return (
    <section className="w-full border-t border-border/70 bg-background py-20 sm:py-28 text-foreground font-sans">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 text-center space-y-6">
        
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border/80 text-accent text-xs font-bold uppercase tracking-[0.18em]">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>Your next favorite is waiting</span>
        </div>

        {/* H2 Heading */}
        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight text-foreground leading-[0.98]">
          One search away from another world.
        </h2>

        {/* Supporting Copy */}
        <p className="text-base sm:text-lg text-muted-foreground font-sans max-w-xl mx-auto leading-relaxed">
          Step into the complete catalog with instant search, seasonal rankings, character galleries, and high-definition streaming.
        </p>

        {/* CTA Button */}
        <div className="pt-4">
          <Link
            to="/home"
            className="inline-flex items-center justify-center gap-2.5 h-[52px] px-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-base sm:text-lg shadow-glow transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>Explore OtakuStreams</span>
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default LandingClosingCTA;
