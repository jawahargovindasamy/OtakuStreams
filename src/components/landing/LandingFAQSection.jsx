import React, { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "What is OtakuStreams?",
    a: "OtakuStreams is a free, high-definition anime streaming platform designed to provide a fast, clean, and distraction-free viewing experience without mandatory registration or subscription fees."
  },
  {
    q: "Do I need to create an account to watch?",
    a: "No account is required to start watching or searching. Your watch progress, favorites, and search history are safely remembered in your browser's local storage."
  },
  {
    q: "Where does the anime metadata come from?",
    a: "Our catalog, titles, character galleries, voice actor listings, and trending scores are powered by the official AniList GraphQL API."
  },
  {
    q: "Is OtakuStreams optimized for mobile devices?",
    a: "Yes. OtakuStreams is designed mobile-first with touch-safe targets, swipeable rails, responsive grids, and full keyboard accessibility."
  }
];

const LandingFAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleItem = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="w-full border-t border-border/70 bg-surface/50 py-20 sm:py-24 text-foreground font-sans">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        
        {/* Heading */}
        <div className="space-y-2 text-left sm:text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-[0.18em]">
            <HelpCircle className="h-4 w-4 text-accent" />
            <span>Good to know</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-foreground">
            Questions, answered.
          </h2>
        </div>

        {/* Accordion List */}
        <div className="space-y-3 w-full">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.q}
                className="rounded-2xl border border-border/70 bg-background overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleItem(idx)}
                  aria-expanded={isOpen}
                  className="w-full min-h-[56px] py-4 px-6 flex items-center justify-between text-left font-display font-bold text-base sm:text-lg text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span>{item.q}</span>
                  <div className={`w-8 h-8 rounded-full bg-surface border border-border/60 flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : "text-muted-foreground"}`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm sm:text-base text-muted-foreground font-sans leading-relaxed text-left border-t border-border/40 animate-in fade-in duration-200">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default LandingFAQSection;
