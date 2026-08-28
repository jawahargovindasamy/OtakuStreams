import React from "react"
import { useAuth } from "@/context/auth-provider"

const EpisodeServer = ({
    episodeNo,
    subServers = [],
    dubServers = [],
    rawServers = [],
    activeSub,
    setActiveSub,
    activeDub,
    setActiveDub,
    activeRaw,
    setActiveRaw,
    nextEpisodeTime,
    onReloadPlayer
}) => {
    const { updatePreferences } = useAuth();
    const formatName = (name) => {
        if (!name) return "";
        if (name.toLowerCase() === "hd-1") return "Server 1";
        if (name.toLowerCase() === "hd-2") return "Server 2";
        return name;
    };

    return (
        <div className="space-y-3 font-sans">
            {/* Pill Capsule Server Groups */}
            <div className="flex flex-wrap items-center gap-3">
                {/* SUB CAPSULE */}
                {subServers.length > 0 && (
                    <div className="inline-flex items-center p-1.5 rounded-full bg-[#121624] border border-white/10 gap-1 sm:gap-2">
                        <span className="px-3 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                            SUB
                        </span>
                        {subServers.map((s) => {
                            const isActive = activeSub?.serverId === s.serverId;
                            return (
                                <button
                                    key={s.serverId}
                                    type="button"
                                    onClick={() => {
                                        if (isActive) {
                                            onReloadPlayer?.();
                                        } else {
                                            setActiveSub(s);
                                            setActiveDub(null);
                                            setActiveRaw(null);
                                            updatePreferences({ audio: "sub", server: s.serverId });
                                        }
                                    }}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                        isActive
                                            ? "bg-indigo-600 text-white shadow-md"
                                            : "text-gray-300 hover:text-white"
                                    }`}
                                >
                                    {formatName(s.serverName)}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* DUB CAPSULE */}
                {dubServers.length > 0 && (
                    <div className="inline-flex items-center p-1.5 rounded-full bg-[#121624] border border-white/10 gap-1 sm:gap-2">
                        <span className="px-3 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                            DUB
                        </span>
                        {dubServers.map((s) => {
                            const isActive = activeDub?.serverId === s.serverId;
                            return (
                                <button
                                    key={s.serverId}
                                    type="button"
                                    onClick={() => {
                                        if (isActive) {
                                            onReloadPlayer?.();
                                        } else {
                                            setActiveDub(s);
                                            setActiveSub(null);
                                            setActiveRaw(null);
                                            updatePreferences({ audio: "dub", server: s.serverId });
                                        }
                                    }}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                        isActive
                                            ? "bg-indigo-600 text-white shadow-md"
                                            : "text-gray-300 hover:text-white"
                                    }`}
                                >
                                    {formatName(s.serverName)}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* RAW CAPSULE */}
                {rawServers.length > 0 && (
                    <div className="inline-flex items-center p-1.5 rounded-full bg-[#121624] border border-white/10 gap-1 sm:gap-2">
                        <span className="px-3 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                            RAW
                        </span>
                        {rawServers.map((s) => {
                            const isActive = activeRaw?.serverId === s.serverId;
                            return (
                                <button
                                    key={s.serverId}
                                    type="button"
                                    onClick={() => {
                                        if (isActive) {
                                            onReloadPlayer?.();
                                        } else {
                                            setActiveRaw(s);
                                            setActiveSub(null);
                                            setActiveDub(null);
                                            updatePreferences({ audio: "raw", server: s.serverId });
                                        }
                                    }}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                        isActive
                                            ? "bg-indigo-600 text-white shadow-md"
                                            : "text-gray-300 hover:text-white"
                                    }`}
                                >
                                    {formatName(s.serverName)}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ESTIMATED NEXT EPISODE TEXT */}
            {nextEpisodeTime && nextEpisodeTime !== 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground pt-1">
                    Estimated next episode at <span className="font-bold text-foreground">{nextEpisodeTime}</span>
                </p>
            ) : null}
        </div>
    );
};

export default EpisodeServer;