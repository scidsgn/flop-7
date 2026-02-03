import { useQueryState } from "nuqs"
import { useEffect } from "react"

import { Board } from "./board.tsx"
import { GameEventSource } from "./game-event-source.ts"
import { useGame } from "./game.store.ts"
import { PlayerProvider } from "./player-context.ts"

export const App = () => {
    const [controllingPlayerId] = useQueryState("player")

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
        <PlayerProvider value={controllingPlayerId}>
            <Board />
        </PlayerProvider>
    )
}
