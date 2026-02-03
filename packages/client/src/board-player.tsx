import type { PlayerSelectionRequest } from "@flop-7/protocol/snapshots"
import { twMerge } from "tailwind-merge"
import { useShallow } from "zustand/react/shallow"

import { Card } from "./card.tsx"
import { useGame } from "./game.store.ts"
import { useControllingPlayerId } from "./player-context.ts"
import { PlayerRequestCallout } from "./player-request-callout.tsx"
import { PlayerSelectButton } from "./player-select-button.tsx"

type BoardPlayerProps = {
    playerId: string
    flip: boolean
}

export const BoardPlayer = ({ playerId, flip }: BoardPlayerProps) => {
    const controllingPlayerId = useControllingPlayerId()
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
    const selectRequest = useGame(
        useShallow(
            (state) =>
                state.unfulfilledRequests
                    .filter(
                        (request) =>
                            request.targetPlayer.id === controllingPlayerId &&
                            request.type === "playerSelection" &&
                            request.players.find((p) => p.id === playerId),
                    )
                    .at(0) as PlayerSelectionRequest | undefined,
        ),
    )

    if (!player) {
        return null
    }

    return (
        <div className="pointer-events-auto flex flex-col items-center">
            <div className={twMerge(flip && "rotate-180")}>
                <PlayerRequestCallout playerId={playerId} flip={flip} />
            </div>
            <div className={twMerge("relative max-w-80", flip && "rotate-180")}>
                <div
                    className={twMerge(
                        "flex flex-wrap justify-center gap-2",
                        (state !== "active" || selectRequest) && "opacity-30",
                    )}
                >
                    {cards.length === 0 && (
                        <div className="h-24 w-16 rounded-sm inset-ring-2 inset-ring-neutral-600" />
                    )}
                    {cards.map((card, i) => (
                        <Card key={i} card={card} />
                    ))}
                </div>

                {state !== "active" && (
                    <div className="absolute top-1/2 left-1/2 -translate-1/2 text-center">
                        {state === "busted" && (
                            <span className="rounded-sm bg-neutral-950/80 px-2 py-1 text-2xl font-bold text-red-400 uppercase">
                                Busted!
                            </span>
                        )}
                        {state === "frozen" && (
                            <span className="rounded-sm bg-neutral-950/80 px-2 py-1 text-2xl font-bold text-cyan-400 uppercase">
                                Frozen
                            </span>
                        )}
                        {state === "stayed" && (
                            <span className="rounded-sm bg-neutral-950/80 px-2 py-1 text-2xl font-bold text-neutral-400 uppercase">
                                Stayed
                            </span>
                        )}
                    </div>
                )}

                {selectRequest && (
                    <PlayerSelectButton
                        requestId={selectRequest.id}
                        playerId={playerId}
                    />
                )}
            </div>
            <span
                className={twMerge(
                    "p-3 text-xl font-bold text-neutral-500",
                    isCurrent && "text-neutral-50",
                    state === "busted" && "text-red-500",
                    state === "frozen" && "text-cyan-500",
                    state === "won" && "text-green-500",
                    state === "stayed" && "italic",
                    flip && "rotate-180",
                )}
            >
                {player.name} ({score})
            </span>
        </div>
    )
}
