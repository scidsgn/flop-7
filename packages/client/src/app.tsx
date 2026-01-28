import { useEffect } from "react"

import { GameEventSource } from "./game-event-source.ts"
import { useGame } from "./game.store.ts"

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

    return <div>dfs</div>
}
