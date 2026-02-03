import { twMerge } from "tailwind-merge"
import { useShallow } from "zustand/react/shallow"

import { Card } from "./card.tsx"
import { useGame } from "./game.store.ts"
import { PlayerRequestStack } from "./player-request-stack.tsx"

type BoardPlayerProps = {
    playerId: string
}

export const BoardPlayer = ({ playerId }: BoardPlayerProps) => {
    const player = useGame((state) =>
        state.players.find((player) => player.id === playerId),
    )
    const isCurrent = useGame(
        (state) => state.rounds.at(-1)?.currentPlayerId === playerId,
    )

    const score = useGame(
        (state) =>
            state.rounds.at(-1)?.players.find((p) => p.playerId === playerId)
                ?.score ?? 0,
    )
    const state = useGame(
        (state) =>
            state.rounds.at(-1)?.players.find((p) => p.playerId === playerId)
                ?.state,
    )
    const cards = useGame(
        useShallow(
            (state) =>
                state.rounds
                    .at(-1)
                    ?.players.find((p) => p.playerId === playerId)?.cards ?? [],
        ),
    )

    if (!player) {
        return null
    }

    return (
        <div className="flex flex-col items-center pointer-events-auto">
            <PlayerRequestStack playerId={playerId} />
            <div className="flex gap-2">
                {cards.map((card, i) => (
                    <Card key={i} card={card} />
                ))}
            </div>
            <span
                className={twMerge(
                    "p-4 text-neutral-500 font-bold",
                    isCurrent && "text-neutral-50",
                    state === "busted" && "text-red-500",
                    state === "frozen" && "text-cyan-500",
                    state === "won" && "text-green-500",
                    state === "stayed" && "italic",
                )}
            >
                {player.name} ({score})
            </span>
        </div>
    )
}
