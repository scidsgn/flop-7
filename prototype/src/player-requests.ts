import { createInterface } from "node:readline/promises"

import { GameEvents } from "./game-events"
import { Player } from "./player"
import { RoundPlayer } from "./round-player"

type PlayerChoiceReason = "startTurnHitOrStay" | "firstTurnHit" | "flopThreeHit"

type PlayerSelectionReason = "flopThree" | "freeze"

export type PlayerChoiceRequest = {
    targetPlayer: Player
    reason: PlayerChoiceReason
    choices: string[]
}

export type PlayerSelectionRequest = {
    targetPlayer: Player
    reason: PlayerSelectionReason
    players: Player[]
}

export class PlayerRequests {
    #events: GameEvents

    #rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    constructor(events: GameEvents) {
        this.#events = events
    }

    async requestChoice<T extends string>(
        targetPlayer: RoundPlayer,
        reason: PlayerChoiceReason,
        choices: T[],
    ) {
        const question = `${reason} [${choices.join("/")}]`

        this.#events.emit({
            type: "choiceRequested",
            payload: {
                targetPlayer: targetPlayer.player,
                reason,
                choices,
            },
        })

        while (true) {
            const userAnswer = (await this.#rl.question(question)).trim()

            if (!choices.includes(userAnswer as T)) {
                continue
            }

            return userAnswer as T
        }
    }

    async requestPlayerSelection(
        targetPlayer: RoundPlayer,
        reason: PlayerSelectionReason,
        players: RoundPlayer[],
    ) {
        const question = `${reason} [${players.map((p) => p.player.name).join("/")}]`

        this.#events.emit({
            type: "selectionRequested",
            payload: {
                targetPlayer: targetPlayer.player,
                reason,
                players: players.map((p) => p.player),
            },
        })

        while (true) {
            const answer = (await this.#rl.question(question)).trim()

            const player = players.find((p) => p.player.name === answer)
            if (player) {
                return player
            }
        }
    }

    close() {
        this.#rl.close()
    }
}
