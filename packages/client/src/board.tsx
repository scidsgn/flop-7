import { useMemo } from "react"
import { useShallow } from "zustand/react/shallow"

import { BoardDeck } from "./board-deck.tsx"
import { BoardPlayer } from "./board-player.tsx"
import { useGame } from "./game.store.ts"
import { useControllingPlayerId } from "./player-context.ts"

export const Board = () => {
    const players = useGame(useShallow((state) => state.players))
    const controllingPlayerId = useControllingPlayerId()

    const playerOffset = useMemo(
        () =>
            (controllingPlayerId &&
                players.findIndex((p) => p.id === controllingPlayerId)) ||
            0,
        [players, controllingPlayerId],
    )

    return (
        <div className="size-256 bg-neutral-800 rounded-full relative scale-[calc(100vmin/1024px)]">
            {players.map((player, i) => {
                const angle = (360 * (i - playerOffset)) / players.length
                const positiveAngle = angle < 0 ? angle + 360 : angle
                const flip = positiveAngle >= 180 && positiveAngle <= 270

                return (
                    <div
                        key={player.id}
                        className="absolute inset-0 pointer-events-none"
                        style={{ rotate: `${angle}deg` }}
                    >
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-0">
                            <BoardPlayer playerId={player.id} flip={flip} />
                        </div>
                    </div>
                )
            })}
            <div className="absolute inset-0 pointer-events-none grid place-items-center">
                <BoardDeck />
            </div>
        </div>
    )
}
