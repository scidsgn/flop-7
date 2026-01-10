import * as crypto from "node:crypto"
import { createInterface } from "node:readline/promises"

import { GameEvents } from "../game-events"
import { RoundPlayer } from "../round-player"
import {
    PlayerChoiceReason,
    PlayerRequests,
    PlayerSelectionReason,
} from "./player-requests"

export class CliPlayerRequests implements PlayerRequests {
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
                id: crypto.randomUUID(),
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
                id: crypto.randomUUID(),
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
