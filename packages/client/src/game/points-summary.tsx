import { twMerge } from "tailwind-merge"
import { useShallow } from "zustand/react/shallow"

import { useGame } from "../game.store.ts"

export const PointsSummary = () => {
    const players = useGame(useShallow((state) => state.game?.players ?? []))
    const rounds = useGame(useShallow((state) => state.game?.rounds ?? []))

    return (
        <>
            <div className="p-4 text-center text-2xl font-bold">
                Round {rounds.length}
            </div>
            <table className="text-center">
                <thead className="text-sm font-bold text-neutral-500">
                    {players.map((player) => (
                        <th key={player.id}>{player.name}</th>
                    ))}
                </thead>
                <tbody>
                    {rounds.map((round, i) => (
                        <tr
                            key={i}
                            className={twMerge(
                                "text-lg",
                                i === rounds.length - 1 &&
                                    "font-bold text-yellow-400",
                            )}
                        >
                            {round.players.map((player) => (
                                <td key={player.playerId}>{player.score}</td>
                            ))}
                        </tr>
                    ))}

                    <tr className="border-t border-neutral-700 font-bold text-neutral-400">
                        {players.map((_, i) => (
                            <td key={i}>
                                {rounds.reduce(
                                    (acc, r) => r.players[i].score + acc,
                                    0,
                                )}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </>
    )
}
