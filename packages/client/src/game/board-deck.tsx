import type { PlayerChoiceRequest } from "@flop-7/protocol/snapshots"
import { twMerge } from "tailwind-merge"
import { useShallow } from "zustand/react/shallow"

import { useGame } from "../game.store.ts"
import { Card } from "./card.tsx"
import { useControllingPlayerId } from "./player-context.ts"

export const BoardDeck = () => {
    const serverUrl = useGame((state) => state.serverUrl)
    const cardBack = useGame(
        (state) => state.game?.ruleSystem?.assets?.cardBack,
    )
    const currentDeckCard = useGame((state) => state.game?.currentDeckCard)
    const controllingPlayerId = useControllingPlayerId()

    const hitRequest = useGame(
        useShallow(
            (state) =>
                state.game?.unfulfilledRequests
                    .filter(
                        (request) =>
                            request.targetPlayer.id === controllingPlayerId &&
                            request.type === "choice",
                    )
                    .at(0) as PlayerChoiceRequest | undefined,
        ),
    )

    const respond = async (choice: string) => {
        if (!hitRequest || !controllingPlayerId || !serverUrl) {
            return
        }

        if (!hitRequest.choices.includes(choice)) {
            return
        }

        await fetch(`${serverUrl}/game/requests`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                requestId: hitRequest.id,
                playerId: controllingPlayerId,
                choice,
            }),
        })
    }

    return (
        <div className="pointer-events-auto flex scale-150 gap-2">
            <button
                className={twMerge(
                    "h-24 w-16 rounded-sm",
                    hitRequest?.choices?.includes("hit")
                        ? "cursor-pointer ring-4 ring-amber-300"
                        : "cursor-not-allowed",
                )}
                disabled={!hitRequest}
                onClick={() => respond("hit")}
            >
                {serverUrl && cardBack && (
                    <img
                        className="h-24 w-16"
                        src={`${serverUrl}/assets${cardBack}`}
                        alt="Grab a card"
                    />
                )}
            </button>

            {currentDeckCard ? (
                <Card card={currentDeckCard} />
            ) : (
                <div className="grid h-24 w-16 place-items-center rounded-sm inset-ring-2 inset-ring-neutral-600">
                    {hitRequest?.choices?.includes("stay") && (
                        <div className="flex flex-col items-center gap-1 text-center">
                            <span className="text-xs font-bold uppercase">
                                or
                            </span>
                            <button
                                className="cursor-pointer rounded-sm bg-amber-300 px-1.5 py-0.5 text-sm font-bold text-amber-950 uppercase"
                                onClick={() => respond("stay")}
                            >
                                Stay
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
