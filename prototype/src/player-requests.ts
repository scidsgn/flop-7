import { createInterface } from "node:readline/promises"

import { RoundPlayer } from "./round-player"

type PlayerChoiceReason = "startTurnHitOrStay" | "firstTurnHit" | "flopThreeHit"

type PlayerSelectionReason = "flopThree" | "freeze"

// TODO it duplicates input for some reason but that's not to worry, this implemenation days' are numbered
export class PlayerRequests {
    #rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    async requestChoice<T extends string>(
        targetPlayer: RoundPlayer,
        reason: PlayerChoiceReason,
        choices: T[],
    ) {
        const question = `${reason} [${choices.join("/")}]`

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
