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
        <div className="absolute top-1/2 left-1/2 size-256 -translate-1/2 scale-[calc(100cqmin/1024px)] rounded-full bg-neutral-800">
            {players.map((player, i) => {
                const angle = (360 * (i - playerOffset)) / players.length
                const positiveAngle = angle < 0 ? angle + 360 : angle
                const flip = positiveAngle >= 90 && positiveAngle <= 270

                return (
                    <div
                        key={player.id}
                        className="pointer-events-none absolute inset-0"
                        style={{ rotate: `${angle}deg` }}
                    >
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                            <BoardPlayer playerId={player.id} flip={flip} />
                        </div>
                    </div>
                )
            })}
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <BoardDeck />
            </div>
        </div>
    )
}
