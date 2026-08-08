import React from "react";
import { Layers } from "lucide-react";

const STORY_CARDS = [
  {
    num: "01",
    title: "Search with intent",
    desc: "Instant command-palette search connecting you directly to titles, characters, and voice actors without catalog bloat."
  },
  {
    num: "02",
    title: "Follow the signal",
    desc: "Real-time popularity metrics and live community pulses curate what's genuinely captured the culture."
  },
  {
    num: "03",
    title: "Keep your place",
    desc: "Zero-friction local progress tracking keeps your episode state remembered seamlessly across browser sessions."
  },
  {
    num: "04",
    title: "Go deeper",
    desc: "Explore full franchise timelines, prequels, sequels, production staff, and voice actor galleries."
  }
];

const LandingStorySection = () => {
  return (
    <section className="w-full border-y border-border/70 bg-surface/50 py-20 sm:py-28 text-foreground font-sans">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column (5 Cols Desktop): Heading */}
          <div className="lg:col-span-5 space-y-3 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-[0.18em]">
              <Layers className="h-4 w-4 text-accent" />
              <span>Built for the curious</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground leading-[1.05]">
              Discovery should feel like the opening scene.
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground font-sans pt-2 leading-relaxed">
              We built OtakuStreams to remove the friction between wanting to watch anime and actually diving into a great story.
            </p>
          </div>

          {/* Right Column (7 Cols Desktop): 2x2 Story Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STORY_CARDS.map((card) => (
              <article
                key={card.num}
                className="p-6 rounded-2xl bg-background border border-border/70 flex flex-col justify-between space-y-8 text-left shadow-soft"
              >
                {/* Number Badge */}
                <div className="font-display font-black text-2xl text-primary tracking-tight">
                  {card.num}
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-xl text-foreground tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default LandingStorySection;
