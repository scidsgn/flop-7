import { twMerge } from "tailwind-merge"

import { useGame } from "../game.store.ts"
import { useControllingPlayerId } from "./player-context.ts"

export const PlayerHeader = () => {
    const playerId = useControllingPlayerId()
    const player = useGame((state) => state.currentPlayer)
    const isCurrentTurn = useGame(
        (state) => state.game?.rounds?.at(-1)?.currentPlayerId === playerId,
    )

    if (!player) {
        return (
            <div className="rounded-md bg-yellow-600 p-4 text-center text-lg font-bold text-yellow-950">
                Spectating
            </div>
        )
    }

    return (
        <div
            className={twMerge(
                "rounded-md bg-cyan-900 p-4 text-center text-lg font-bold text-cyan-50",
                isCurrentTurn && "bg-cyan-300 text-cyan-950",
            )}
        >
            {player.name}
        </div>
    )
}
