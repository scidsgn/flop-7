import { useEffect } from "react"

import { Board } from "./board.tsx"
import { GameEventSource } from "./game-event-source.ts"
import { useGame } from "./game.store.ts"
import { PlayerProvider } from "./player-context.ts"
import { PointsSummary } from "./points-summary.tsx"

export const App = () => {
    const consumeEvent = useGame((state) => state.consumeEvent)

    useEffect(() => {
        const events = new GameEventSource("http://localhost:3000/game/events")

        events.addEventListener((event) => {
            consumeEvent(event)
        })

        return () => {
            events.close()
        }
    }, [consumeEvent])

    return (
        <div className="fixed inset-2 grid grid-cols-[auto_1fr_1fr_1fr] gap-2">
            <div className="w-64">
                <PointsSummary />
            </div>
            <div className="@container-[size] relative rounded-lg bg-neutral-900">
                <PlayerProvider value="p1">
                    <Board />
                </PlayerProvider>
            </div>
            <div className="@container-[size] relative rounded-lg bg-neutral-900">
                <PlayerProvider value="p2">
                    <Board />
                </PlayerProvider>
            </div>
            <div className="@container-[size] relative rounded-lg bg-neutral-900">
                <PlayerProvider value="p3">
                    <Board />
                </PlayerProvider>
            </div>
        </div>
    )
}
