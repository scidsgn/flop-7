import { useGame } from "../game.store.ts"
import { Lightbox } from "../lightbox.tsx"
import { RoomLobbyGameSetup } from "./room-lobby-game-setup.tsx"
import { RoomLobbyPlayerSetup } from "./room-lobby-player-setup.tsx"

export const RoomLobby = () => {
    const room = useGame((state) => state.room)

    if (!room) {
        return null
    }

    return (
        <Lightbox>
            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap justify-center gap-2">
                    {room.players.length === 0 && (
                        <div className="h-48 w-32 rounded-lg inset-ring-2 inset-ring-neutral-600 outline-4 outline-black/20" />
                    )}

                    {room.players.map((player) => (
                        <div
                            key={player.id}
                            className="grid h-48 w-32 place-items-center rounded-lg bg-neutral-700 text-center text-xl font-bold outline-4 outline-black/20"
                        >
                            {player.name}
                        </div>
                    ))}
                </div>
                <RoomLobbyPlayerSetup />
                <RoomLobbyGameSetup />
            </div>
        </Lightbox>
    )
}
