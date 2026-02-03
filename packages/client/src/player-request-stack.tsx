import { useShallow } from "zustand/react/shallow"

import { useGame } from "./game.store.ts"

type PlayerRequestStackProps = {
    playerId: string
}

export const PlayerRequestStack = ({ playerId }: PlayerRequestStackProps) => {
    const requests = useGame(
        useShallow((state) =>
            state.unfulfilledRequests.filter(
                (request) => request.targetPlayer.id === playerId,
            ),
        ),
    )
    const firstRequest = requests.at(0)
    if (!firstRequest) {
        return null
    }

    const respond = async (choice: string) => {
        await fetch("http://localhost:3000/game/requests", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                requestId: firstRequest.id,
                playerId,
                choice,
            }),
        })
    }

    return (
        <div className="bg-neutral-700 w-96 p-4 flex flex-col gap-2 items-center rounded-md">
            <span className="font-bold">{firstRequest.reason}?</span>

            {firstRequest.type === "choice" && (
                <div className="flex gap-2">
                    {firstRequest.choices.map((choice) => (
                        <button
                            key={choice}
                            className="bg-neutral-100 hover:bg-neutral-200 cursor-pointer text-neutral-900 font-medium px-3 py-1 rounded-full"
                            onClick={() => respond(choice)}
                        >
                            {choice}
                        </button>
                    ))}
                </div>
            )}

            {firstRequest.type === "playerSelection" && (
                <div className="flex gap-2">
                    {firstRequest.players.map((player) => (
                        <button
                            key={player.id}
                            className="bg-neutral-100 hover:bg-neutral-200 cursor-pointer text-neutral-900 font-medium px-3 py-1 rounded-full"
                            onClick={() => respond(player.id)}
                        >
                            {player.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
