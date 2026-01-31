import React from 'react'
import VerticalList from './VerticalList'
import SectionHeader from './SectionHeader'
import { Button } from "@/components/ui/button";

const Top10 = ({ data, top10Animes, setTop10Animes }) => {
    return (
        <section className="space-y-3 sm:space-y-4">
            <SectionHeader title="Top 10" />

            {/* Time Period Toggle */}
            <div className="flex gap-1.5 sm:gap-2 p-1 bg-muted/50 rounded-lg border border-border/50">
                {["today", "week", "month"].map((t) => (
                    <Button
                        key={t}
                        onClick={() => setTop10Animes(t)}
                        size="sm"
                        className={`flex-1 capitalize text-xs sm:text-sm font-medium transition-all duration-200 rounded-md ${top10Animes === t
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
                            }`}
                    >
                        {t}
                    </Button>
                ))}
            </div>

            <div className="bg-card/30 rounded-xl sm:rounded-2xl border border-border/50 p-2 sm:p-3">
                <VerticalList
                    anime={data.top10Animes[top10Animes]}
                    list={10}
                />
            </div>
        </section>
    )
}

export default Top10