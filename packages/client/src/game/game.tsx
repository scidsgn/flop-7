import { gameEventsSchema } from "@flop-7/protocol/events"
import { useEffect } from "react"

import { useGame } from "../game.store.ts"
import { TypedEventSource } from "../typed-event-source.ts"
import { Board } from "./board.tsx"
import { PlayerHeader } from "./player-header.tsx"
import { PointsSummary } from "./points-summary.tsx"
import { WinScreen } from "./win-screen.tsx"


export const Game = () => {
    const serverUrl = useGame((state) => state.serverUrl)
    const hasGame = useGame((state) => state.game !== null)
    const winner = useGame((state) => state.game?.summary?.winner)

    const consumeGameEvent = useGame((state) => state.consumeGameEvent)

    useEffect(() => {
        if (!serverUrl) {
            return
        }

        const events = new TypedEventSource(
            `${serverUrl}/game/events`,
            gameEventsSchema,
        )

        events.addEventListener((event) => {
            consumeGameEvent(event)
        })

        return () => {
            events.close()
        }
    }, [serverUrl, consumeGameEvent])

    if (!hasGame) {
        return (
            <div className="fixed inset-2 grid place-items-center bg-neutral-900 text-center text-2xl font-bold text-neutral-500">
                Waiting for server...
            </div>
        )
    }

    return (
        <div className="fixed inset-2 grid grid-cols-[auto_1fr] gap-2">
            <div className="flex w-64 flex-col gap-2">
                <PlayerHeader />
                <PointsSummary />
            </div>
            <div className="@container-[size] relative rounded-lg bg-neutral-900">
                <Board />
            </div>
            {winner && <WinScreen player={winner} />}
        </div>
    )
}
