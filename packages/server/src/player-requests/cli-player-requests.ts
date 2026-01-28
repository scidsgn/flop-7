import * as crypto from "node:crypto"
import { createInterface } from "node:readline/promises"

import { GameEvents } from "../game-events"
import { RoundPlayer } from "../round-player"
import {
    PlayerChoiceReason,
    PlayerRequest,
    PlayerRequests,
    PlayerSelectionReason,
} from "./player-requests"

export class CliPlayerRequests implements PlayerRequests {
    #unfulfilledRequests: PlayerRequest[] = []

    #events: GameEvents

    #rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    constructor(events: GameEvents) {
        this.#events = events
    }

    get unfulfilledRequests() {
        return this.#unfulfilledRequests
    }

    async requestChoice<T extends string>(
        targetPlayer: RoundPlayer,
        reason: PlayerChoiceReason,
        choices: T[],
    ) {
        const question = `${reason} [${choices.join("/")}]`
        const request: PlayerRequest = {
            id: crypto.randomUUID(),
            type: "choice",
            targetPlayer: targetPlayer.player,
            reason,
            choices,
        }

        this.#events.emit({
            type: "choiceRequested",
            payload: request,
        })

        this.#unfulfilledRequests.push(request)

        while (true) {
            const userAnswer = (await this.#rl.question(question)).trim()

            if (!choices.includes(userAnswer as T)) {
                continue
            }

            this.#unfulfilledRequests = this.#unfulfilledRequests.filter(
                (r) => r.id !== request.id,
            )

            return userAnswer as T
        }
    }

    async requestPlayerSelection(
        targetPlayer: RoundPlayer,
        reason: PlayerSelectionReason,
        players: RoundPlayer[],
    ) {
        const question = `${reason} [${players.map((p) => p.player.name).join("/")}]`
        const request: PlayerRequest = {
            id: crypto.randomUUID(),
            type: "playerSelection",
            targetPlayer: targetPlayer.player,
            reason,
            players: players.map((p) => p.player),
        }

        this.#events.emit({
            type: "selectionRequested",
            payload: request,
        })

        this.#unfulfilledRequests.push(request)

        while (true) {
            const answer = (await this.#rl.question(question)).trim()

            const player = players.find((p) => p.player.name === answer)
            if (!player) {
                continue
            }

            this.#unfulfilledRequests = this.#unfulfilledRequests.filter(
                (r) => r.id !== request.id,
            )

            return player
        }
    }

    close() {
        this.#rl.close()
    }
}
