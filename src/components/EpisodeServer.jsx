import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mic, Subtitles } from "lucide-react"

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
    setActiveRaw
}) => {
    const formatName = (name) => name.toUpperCase()
    
    return (
        <div className="w-full flex flex-col lg:flex-row gap-4">
            {/* LEFT INFO */}
            <div className="bg-primary/10 text-primary rounded-xl p-4 w-full lg:w-64 text-center border border-primary/20">
                <p className="font-semibold text-foreground">You are watching</p>
                <p className="text-lg font-bold text-primary mt-1">Episode {episodeNo}</p>
            </div>

            {/* RIGHT SERVERS */}
            <div className="flex-1 space-y-4">
                {/* SUB */}
                {subServers.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="flex gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400">
                            <Subtitles className="h-4 w-4" /> SUB:
                        </Badge>

                        <div className="flex flex-wrap gap-2">
                            {subServers.map((s) => (
                                <Button
                                    key={s.serverId}
                                    size="sm"
                                    variant={activeSub?.serverId === s.serverId ? "default" : "secondary"}
                                    onClick={() => {
                                        setActiveSub(s)
                                        setActiveDub(null)
                                        setActiveRaw(null)
                                    }}
                                    className={activeSub?.serverId === s.serverId ? 
                                        "shadow-md shadow-primary/25" : 
                                        "hover:bg-accent hover:text-accent-foreground"
                                    }
                                >
                                    {formatName(s.serverName)}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* DUB */}
                {dubServers.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="flex gap-1 px-2 py-1 bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400">
                            <Mic className="h-4 w-4" /> DUB:
                        </Badge>

                        <div className="flex flex-wrap gap-2">
                            {dubServers.map((s) => (
                                <Button
                                    key={s.serverId}
                                    size="sm"
                                    variant={activeDub?.serverId === s.serverId ? "default" : "secondary"}
                                    onClick={() => {
                                        setActiveDub(s)
                                        setActiveSub(null)
                                        setActiveRaw(null)
                                    }}
                                    className={activeDub?.serverId === s.serverId ? 
                                        "shadow-md shadow-primary/25" : 
                                        "hover:bg-accent hover:text-accent-foreground"
                                    }
                                >
                                    {formatName(s.serverName)}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* RAW */}
                {rawServers.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="flex gap-1 px-2 py-1 bg-muted text-muted-foreground border-border">
                            <Mic className="h-4 w-4" /> RAW:
                        </Badge>

                        <div className="flex flex-wrap gap-2">
                            {rawServers.map((s) => (
                                <Button
                                    key={s.serverId}
                                    size="sm"
                                    variant={activeRaw?.serverId === s.serverId ? "default" : "secondary"}
                                    onClick={() => {
                                        setActiveRaw(s)
                                        setActiveSub(null)
                                        setActiveDub(null)
                                    }}
                                    className={activeRaw?.serverId === s.serverId ? 
                                        "shadow-md shadow-primary/25" : 
                                        "hover:bg-accent hover:text-accent-foreground"
                                    }
                                >
                                    {formatName(s.serverName)}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default EpisodeServer