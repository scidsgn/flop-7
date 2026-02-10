import { twMerge } from "tailwind-merge"
import { useShallow } from "zustand/react/shallow"

import { useGame } from "../game.store.ts"
import { useControllingPlayerId } from "./player-context.ts"

type PlayerRequestCalloutProps = {
    playerId: string
    flip: boolean
}

export const PlayerRequestCallout = ({
    playerId,
    flip,
}: PlayerRequestCalloutProps) => {
    const controllingPlayerId = useControllingPlayerId()
    const requests = useGame(
        useShallow(
            (state) =>
                state.game?.unfulfilledRequests.filter(
                    (request) =>
                        request.targetPlayer.id === playerId &&
                        request.type === "playerSelection",
                ) ?? [],
        ),
    )
    const firstRequest = requests.at(0)
    if (!firstRequest) {
        return null
    }

    if (firstRequest.targetPlayer.id !== controllingPlayerId) {
        return (
            <div className="relative my-4 flex flex-col items-center gap-2 rounded-md bg-neutral-700 px-4 py-3 font-bold">
                {firstRequest.reason === "flopThree" && (
                    <span>Thinking which player to Flop 3...</span>
                )}
                {firstRequest.reason === "freeze" && (
                    <span>Thinking which player to freeze...</span>
                )}
                <div
                    className={twMerge(
                        "absolute bottom-0 left-1/2 size-4 -translate-x-1/2 rotate-45 bg-neutral-700",
                        flip
                            ? "top-0 -translate-y-1/2"
                            : "bottom-0 translate-y-1/2",
                    )}
                />
            </div>
        )
    }

    return (
        <div className="relative my-4 flex flex-col items-center gap-2 rounded-md bg-neutral-50 px-4 py-3 font-bold text-neutral-950">
            {firstRequest.reason === "flopThree" && (
                <span>Select a player to Flop 3!</span>
            )}
            {firstRequest.reason === "freeze" && (
                <span>Select a player to freeze!</span>
            )}
        </div>
    )
}
