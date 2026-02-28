import { gamePlayerSchema } from "@flop-7/protocol/snapshots"
import { useState } from "react"

import { Button } from "../button.tsx"
import { useGame } from "../game.store.ts"
import { Panel } from "../panel.tsx"
import { TextInput } from "../text-input.tsx"

export const RoomLobbyPlayerSetup = () => {
    const serverUrl = useGame((state) => state.serverUrl)
    const currentPlayer = useGame((state) => state.currentPlayer)
    const setCurrentPlayer = useGame((state) => state.setCurrentPlayer)

    const [playerName, setPlayerName] = useState("")
    const isPlayerNameValid = playerName.trim() !== ""

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

    return (
        <Panel
            className="grid grid-cols-2 gap-6"
            active={currentPlayer === null}
        >
            <div>
                <h1 className="text-3xl font-bold">Player setup</h1>
            </div>
            <div className="flex flex-col gap-3 self-end">
                <TextInput
                    placeholder="Player name"
                    value={currentPlayer?.name ?? playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                />
                <Button
                    className="self-end"
                    primary
                    disabled={!isPlayerNameValid || !!currentPlayer}
                    onClick={join}
                >
                    Connect
                </Button>
            </div>
        </Panel>
    )
}
