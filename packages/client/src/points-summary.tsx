import { twMerge } from "tailwind-merge"
import { useShallow } from "zustand/react/shallow"

import { useGame } from "./game.store.ts"

export const PointsSummary = () => {
    const players = useGame(useShallow((state) => state.players))
    const rounds = useGame(useShallow((state) => state.rounds))

    return (
        <table className="text-center">
            <thead className="text-sm font-bold text-neutral-500">
                {players.map((player) => (
                    <td key={player.id}>{player.name}</td>
                ))}
            </thead>
            <tbody className="text-lg">
                {rounds.map((round, i) => (
                    <tr
                        key={i}
                        className={twMerge(
                            i === rounds.length - 1 &&
                                "font-bold text-yellow-400",
                        )}
                    >
                        {round.players.map((player) => (
                            <td key={player.playerId}>{player.score}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
