import React from "react";

const ProductionStaffSection = ({ staff }) => {
  if (!staff || staff.length === 0) return null;

  return (
    <section className="w-full py-6 sm:py-8 text-foreground font-sans">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 space-y-6 sm:space-y-8">
        
        {/* Section Header */}
        <div className="space-y-1 text-left">
          <div className="text-[11px] font-semibold text-primary uppercase tracking-[0.22em]">
            PRODUCTION
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
            The people behind the night sky
          </h2>
        </div>

        {/* Staff Rows Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
          {staff.map((person, idx) => {
            const node = person.node || person;
            const name = node?.name?.full || node?.name?.userPreferred || person.name || "Creator Name";
            const role = person.role || "Production Staff";
            const image = node?.image?.large || node?.image?.medium || person.image;

            return (
              <div
                key={node?.id || idx}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/40 transition-colors border-b border-border/50 text-left group"
              >
                {/* 56px Circular Avatar */}
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-muted border border-border/60 shadow-xs">
                  <img
                    src={image}
                    alt={`${name}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Staff Name & Role */}
                <div className="min-w-0 space-y-0.5">
                  <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors font-display">
                    {name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate font-sans">
                    {role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductionStaffSection;
