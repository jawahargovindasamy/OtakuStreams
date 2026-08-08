import React from "react";
import { Users } from "lucide-react";

const METRICS = [
  { value: "2.4M", label: "Monthly Active Viewers" },
  { value: "190+", label: "Countries Represented" },
  { value: "24/7", label: "Live Community Pulse" }
];

const LandingCommunitySection = () => {
  return (
    <section className="w-full border-b border-border/70 bg-background py-20 sm:py-28 text-foreground font-sans">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Narrative Column */}
          <div className="lg:col-span-5 space-y-3 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-[0.18em]">
              <Users className="h-4 w-4 text-accent" />
              <span>The shared experience</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-foreground leading-[1.05]">
              Anime hits different when everyone is talking.
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground font-sans pt-2 leading-relaxed max-w-xl">
              Join millions of fans exploring seasonal rankings, character fandoms, and real-time community highlights every single day.
            </p>
          </div>

          {/* Metrics Grid Column */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {METRICS.map((item, idx) => (
              <div
                key={item.label}
                className={`
                  p-5 sm:p-7 rounded-2xl bg-surface/80 border border-border/70 flex flex-col justify-center space-y-2 text-left backdrop-blur-md shadow-soft
                  ${idx === 2 ? "col-span-2 sm:col-span-1" : ""}
                `}
              >
                <div className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-primary tracking-tight">
                  {item.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-muted-foreground">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default LandingCommunitySection;
