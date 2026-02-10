import type { GamePlayer } from "@flop-7/protocol/snapshots"

import { useGame } from "../game.store.ts"

type WinScreenProps = {
    player: GamePlayer
}

export const WinScreen = ({ player }: WinScreenProps) => {
    const serverUrl = useGame((state) => state.serverUrl)

    const finishGame = async () => {
        if (!serverUrl) {
            return
        }

        try {
            await fetch(`${serverUrl}/room/game`, {
                method: "DELETE",
                credentials: "include",
            })
        } catch {
            alert("Could not finish game")
        }
    }

    return (
        <div className="absolute inset-0 grid place-items-center bg-neutral-900/80">
            <div className="flex flex-col items-center gap-6 rounded-lg bg-neutral-800 px-8 py-6 text-center">
                <span className="text-4xl font-bold">{player.name} wins!</span>
                <button
                    className="cursor-pointer rounded-full bg-yellow-500 px-6 py-2 text-2xl font-bold text-yellow-950"
                    onClick={finishGame}
                >
                    Finish game
                </button>
            </div>
        </div>
    )
}
