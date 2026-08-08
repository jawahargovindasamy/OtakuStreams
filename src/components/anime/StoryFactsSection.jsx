import React, { useState } from "react";

const StoryFactsSection = ({ anime }) => {
  const [expanded, setExpanded] = useState(false);

  const rawDesc = anime?.description || anime?.info?.description || "";
  const synopsis = rawDesc ? rawDesc.replace(/<[^>]*>?/gm, "").trim() : "No synopsis available.";
  const isLongSynopsis = synopsis.length > 280;

  const title =
    typeof anime?.title === "object"
      ? anime.title.english || anime.title.romaji || anime.title.native
      : anime?.name || anime?.jname || anime?.title || "Anime Title";

  // Facts Extraction
  const status = (anime?.status || anime?.moreInfo?.status || "FINISHED")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const studioName =
    anime?.studios?.nodes?.[0]?.name ||
    anime?.studios?.[0] ||
    (typeof anime?.studios === "string" ? anime.studios : "TBA");

  const season = anime?.season || anime?.moreInfo?.premiered || "TBA";
  const year = anime?.seasonYear || anime?.startDate?.year || anime?.year || "";
  const seasonYearText = year ? `${season} ${year}` : season;

  const rawFormat =
    anime?.format ||
    anime?.type ||
    anime?.stats?.type ||
    anime?.info?.stats?.type ||
    "TV";
  const format = String(rawFormat).replace(/_/g, " ").toUpperCase();
  const rawDuration = anime?.duration || anime?.stats?.duration || anime?.moreInfo?.duration;
  let runtimeText = "TBA";
  if (rawDuration) {
    const str = String(rawDuration).trim().toLowerCase();
    const hMatch = str.match(/(\d+)\s*h/);
    const mMatch = str.match(/(\d+)\s*m/);

    let totalMins = 0;
    if (hMatch) {
      const hours = parseInt(hMatch[1], 10);
      const mins = mMatch ? parseInt(mMatch[1], 10) : 0;
      totalMins = hours * 60 + mins;
    } else {
      const digits = str.replace(/\D/g, "");
      if (digits) totalMins = parseInt(digits, 10);
    }

    if (totalMins && !isNaN(totalMins) && totalMins > 0) {
      runtimeText = totalMins === 1 ? "1 minute" : `${totalMins} minutes`;
    }
  }

  const source = (anime?.source || anime?.moreInfo?.source || "Original")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const epCountRaw = anime?.episodes || anime?.totalEpisodes || anime?.stats?.episodes?.sub;
  let epCountText = "";
  if (format === "MOVIE") {
    epCountText = "Movie";
  } else if (epCountRaw) {
    const num = typeof epCountRaw === "object" ? epCountRaw.sub || epCountRaw.dub : epCountRaw;
    epCountText = num === 1 ? "1 episode" : `${num} episodes`;
  } else {
    epCountText = "Episode count TBA";
  }

  const facts = [
    { label: "Status", value: status },
    { label: "Main Studio", value: studioName },
    { label: "Season & Year", value: seasonYearText },
    { label: "Format", value: format },
    { label: "Runtime", value: runtimeText },
    { label: "Source", value: source },
    { label: "Total Episodes", value: epCountText },
  ];

  return (
    <section className="w-full border-y border-border/70 bg-card/30 py-6 sm:py-8 text-foreground font-sans">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8 lg:gap-12 items-start">
          
          {/* Story Column */}
          <div className="space-y-3.5 text-left">
            <div className="text-[11px] font-semibold text-primary uppercase tracking-[0.22em]">
              THE STORY
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
              What {title} is about
            </h2>

            <div className="space-y-3 pt-1">
              <p className={`text-sm sm:text-base text-muted-foreground leading-relaxed font-sans ${expanded ? "" : "line-clamp-4"}`}>
                {synopsis}
              </p>

              {isLongSynopsis && (
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  aria-expanded={expanded}
                  className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
                >
                  {expanded ? "Read less" : "Read more"}
                </button>
              )}
            </div>
          </div>

          {/* Essential Facts Column */}
          <div className="space-y-3.5 text-left border-t pt-8 lg:border-t-0 lg:pt-0 lg:border-l border-border/70 lg:pl-10">
            <div className="text-[11px] font-semibold text-primary uppercase tracking-[0.22em]">
              ESSENTIAL FACTS
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 font-sans pt-1">
              {facts.map((fact, idx) => (
                <div key={idx} className="space-y-0.5">
                  <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {fact.label}
                  </dt>
                  <dd className="text-sm font-semibold text-foreground truncate">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryFactsSection;
