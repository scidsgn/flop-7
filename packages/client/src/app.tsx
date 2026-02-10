import { roomEventsSchema } from "@flop-7/protocol/events"
import { useEffect } from "react"

import { useGame } from "./game.store.ts"
import { Game } from "./game/game.tsx"
import { RoomLobby } from "./room/room-lobby.tsx"
import { ServerConnect } from "./server-connect.tsx"
import { TypedEventSource } from "./typed-event-source.ts"

export const App = () => {
    const serverUrl = useGame((state) => state.serverUrl)

    const room = useGame((state) => state.room)
    const consumeRoomEvent = useGame((state) => state.consumeRoomEvent)

    useEffect(() => {
        if (!serverUrl) {
            return
        }

        const events = new TypedEventSource(
            `${serverUrl}/room/events`,
            roomEventsSchema,
        )

        events.addEventListener((event) => consumeRoomEvent(event))

        return () => {
            events.close()
        }
    }, [serverUrl, consumeRoomEvent])

    if (!serverUrl) {
        return <ServerConnect />
    }

    if (!room) {
        return null
    }

    if (!room.hasGame) {
        return <RoomLobby />
    }

    return <Game />
}
