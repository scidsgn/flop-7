import { useShallow } from "zustand/react/shallow"

import { BoardPlayer } from "./board-player.tsx"
import { useGame } from "./game.store.ts"

export const Board = () => {
    const players = useGame(useShallow((state) => state.players))

    return (
        <div className="size-256 bg-neutral-800 rounded-full relative">
            {players.map((player, i) => (
                <div
                    key={player.id}
                    className="absolute inset-0 pointer-events-none"
                    style={{ rotate: `${(360 * i) / players.length}deg` }}
                >
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-0">
                        <BoardPlayer playerId={player.id} />
                    </div>
                </div>
            ))}
        </div>
    )
}
