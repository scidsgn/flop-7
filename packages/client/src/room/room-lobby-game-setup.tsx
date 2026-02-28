import {
    type RuleSystemInfo,
    ruleSystemsResponseSchema,
} from "@flop-7/protocol/responses"
import { useEffect, useState } from "react"

import { Button } from "../button.tsx"
import { cx } from "../cva.ts"
import { useGame } from "../game.store.ts"
import { Panel } from "../panel.tsx"

export const RoomLobbyGameSetup = () => {
    const serverUrl = useGame((state) => state.serverUrl)
    const currentPlayer = useGame((state) => state.currentPlayer)
    const [availableRuleSystems, setAvailableRuleSystems] = useState<
        RuleSystemInfo[]
    >([])
    const [selectedRuleSystem, setSelectedRuleSystem] =
        useState<RuleSystemInfo | null>(null)

    useEffect(() => {
        if (!serverUrl) {
            return
        }

        const run = async () => {
            try {
                const response = await fetch(`${serverUrl}/rule-systems`)
                const data = await response.json()

                const { ruleSystems } = ruleSystemsResponseSchema.parse(data)

                setAvailableRuleSystems(ruleSystems)
            } catch {
                // TODO error handling all over
            }
        }

        run()
    }, [serverUrl])

    const startGame = async () => {
        if (!serverUrl || !selectedRuleSystem) {
            return
        }

        try {
            await fetch(`${serverUrl}/room/game`, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({ ruleSystemId: selectedRuleSystem.id }),
                headers: { "Content-Type": "application/json" },
            })
        } catch {
            alert("Could not start game")
        }
    }

    if (!serverUrl) return null

    return (
        <Panel className="flex flex-col gap-8" active={currentPlayer !== null}>
            <div className="flex items-center gap-4">
                <h1 className="grow truncate text-3xl font-bold">Game setup</h1>
                <Button
                    className="self-end"
                    primary
                    disabled={selectedRuleSystem === null}
                    onClick={startGame}
                >
                    Start game
                    {selectedRuleSystem && ` of ${selectedRuleSystem.name}`}
                </Button>
            </div>

            <div className="flex flex-wrap gap-3">
                {availableRuleSystems.map((ruleSystem) => (
                    <button
                        key={ruleSystem.id}
                        className={cx(
                            "cursor-pointer overflow-hidden rounded-lg outline-4 outline-black/20 transition-[scale,rotate] duration-100 hover:scale-110",
                            ruleSystem.id === selectedRuleSystem?.id &&
                                "scale-105 rotate-4 outline-yellow-500",
                        )}
                        onClick={() => setSelectedRuleSystem(ruleSystem)}
                    >
                        <img
                            className="h-48 w-32"
                            src={`${serverUrl}/assets${ruleSystem.assets.cardBack}`}
                            alt={`Card of ${ruleSystem.name}`}
                        />
                    </button>
                ))}
            </div>

            {selectedRuleSystem && (
                <div>
                    <span className="font-bold text-yellow-500">
                        {selectedRuleSystem.name}:{" "}
                    </span>
                    <span className="font-semibold text-neutral-400">
                        {selectedRuleSystem.description}
                    </span>
                </div>
            )}
        </Panel>
    )
}
