import { useGame } from "../game.store.ts"
import { useControllingPlayerId } from "./player-context.ts"

type PlayerSelectButtonProps = {
    requestId: string
    playerId: string
}

export const PlayerSelectButton = ({
    requestId,
    playerId,
}: PlayerSelectButtonProps) => {
    const serverUrl = useGame((state) => state.serverUrl)

    const controllingPlayerId = useControllingPlayerId()

    const respond = async () => {
        if (!serverUrl) {
            return
        }

        await fetch(`${serverUrl}/game/requests`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                requestId: requestId,
                playerId: controllingPlayerId,
                choice: playerId,
            }),
        })
    }

    return (
        <div className="absolute top-1/2 left-1/2 -translate-1/2">
            <button
                className="cursor-pointer rounded-sm border-4 border-neutral-800 bg-blue-600 px-2 py-0.5 font-bold text-blue-50 uppercase"
                onClick={respond}
            >
                Select
            </button>
        </div>
    )
}
