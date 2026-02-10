import { gamePlayerSchema } from "@flop-7/protocol/snapshots"
import { useState } from "react"

import { useGame } from "../game.store.ts"

export const RoomLobby = () => {
    const serverUrl = useGame((state) => state.serverUrl)
    const room = useGame((state) => state.room)
    const currentPlayer = useGame((state) => state.currentPlayer)
    const setCurrentPlayer = useGame((state) => state.setCurrentPlayer)

    const [playerName, setPlayerName] = useState("")

    if (!room) {
        return null
    }

    const join = async () => {
        if (!serverUrl) {
            return
        }

        const name = playerName.trim()
        if (name === "") {
            return
        }

        try {
            const response = await fetch(`${serverUrl}/room/connect`, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({ name }),
                headers: { "Content-Type": "application/json" },
            })
            const player = gamePlayerSchema.parse(await response.json())

            setCurrentPlayer(player)
        } catch {
            alert("Could not connect to the server")
        }
    }

    const startGame = async () => {
        if (!serverUrl) {
            return
        }

        try {
            await fetch(`${serverUrl}/room/game`, {
                method: "POST",
                credentials: "include",
            })
        } catch {
            alert("Could not start game")
        }
    }

    return (
        <div className="fixed inset-2 flex flex-col items-center justify-center gap-8 rounded-lg bg-neutral-900">
            <div className="flex flex-wrap justify-center gap-2">
                <img
                    className="h-48 w-32"
                    src="/cards/flop-7/back.svg"
                    alt="Flop 7 card reverse"
                />

                {room.players.map((player) => (
                    <div
                        key={player.id}
                        className="grid h-48 w-32 place-items-center rounded-lg bg-neutral-700 text-center text-xl font-bold"
                    >
                        {player.name}
                    </div>
                ))}
            </div>

            {currentPlayer ? (
                <button
                    className="cursor-pointer rounded-full bg-yellow-500 px-6 py-2 text-2xl font-bold text-yellow-950"
                    onClick={startGame}
                >
                    Start game!
                </button>
            ) : (
                <div className="flex flex-col items-center gap-2 rounded-lg bg-neutral-800 px-4 py-3">
                    <h1 className="text-2xl font-bold">Get in!</h1>
                    <input
                        className="rounded-sm bg-neutral-950 px-3 py-2 text-center text-neutral-50"
                        placeholder="Player name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                    />
                    <button
                        className="cursor-pointer rounded-full bg-cyan-800 px-4 py-1 text-lg font-semibold text-cyan-50 hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={playerName.trim() === ""}
                        onClick={join}
                    >
                        Join
                    </button>
                </div>
            )}
        </div>
    )
}
