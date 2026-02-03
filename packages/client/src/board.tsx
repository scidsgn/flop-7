import { useShallow } from "zustand/react/shallow"

import { BoardPlayer } from "./board-player.tsx"
import { useGame } from "./game.store.ts"

export const Board = () => {
    const players = useGame(useShallow((state) => state.players))

    return (
        <div className="size-256 bg-neutral-800 rounded-full relative">
            {players.map((player, i) => {
                const angle = (360 * i) / players.length
                const flip = angle >= 180 && angle <= 270

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
        </div>
    )
}
