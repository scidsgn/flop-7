import { roomEventsSchema } from "@flop-7/protocol/events"
import { useEffect } from "react"

import { useGame } from "./game.store.ts"
import { Game } from "./game/game.tsx"
import { Lightbox } from "./lightbox.tsx"
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

    if (room?.hasGame) {
        return <Game />
    }

    return (
        <Lightbox>
            {!serverUrl && <ServerConnect />}
            {room && !room.hasGame && <RoomLobby />}
        </Lightbox>
    )
}
