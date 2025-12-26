import { createInterface } from "node:readline/promises"

import {
    Flop3HitDecision,
    Flop3HitDecisionResponse,
    Flop3PlayerDecision,
    Flop3PlayerResponse,
    FreezePlayerDecision,
    FreezePlayerResponse,
    HitOrStayDecision,
    HitOrStayDecisionResponse,
} from "./player-decisions.types"

export class PlayerDecisionsManager {
    #rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    async requestHitOrStay(
        _decision: HitOrStayDecision,
    ): Promise<HitOrStayDecisionResponse> {
        const question = `Hit or stay? [hit/stay]`

        while (true) {
            const answer = (await this.#rl.question(question)).trim()

            if (answer === "hit") {
                return {
                    type: "hit_or_stay_repsonse",
                    decision: "hit",
                }
            } else if (answer === "stay") {
                return {
                    type: "hit_or_stay_repsonse",
                    decision: "stay",
                }
            }
        }
    }

    async requestFreeze(
        decision: FreezePlayerDecision,
    ): Promise<FreezePlayerResponse> {
        const question = `Freeze time! Select a player to freeze! [${decision.players.map((p) => p.name).join("/")}]`

        while (true) {
            const answer = (await this.#rl.question(question)).trim()

            const player = decision.players.find((p) => p.name === answer)
            if (player) {
                return {
                    type: "freeze_player_response",
                    selectedPlayerId: player.id,
                }
            }
        }
    }

    async requestFlop3Player(
        decision: Flop3PlayerDecision,
    ): Promise<Flop3PlayerResponse> {
        const question = `Flop 3! Select a player to flop 3! [${decision.players.map((p) => p.name).join("/")}]`

        while (true) {
            const answer = (await this.#rl.question(question)).trim()

            const player = decision.players.find((p) => p.name === answer)
            if (player) {
                return {
                    type: "flop_3_player_response",
                    selectedPlayerId: player.id,
                }
            }
        }
    }

    async requestFlop3Hit(
        decision: Flop3HitDecision,
    ): Promise<Flop3HitDecisionResponse> {
        const question = `Flop 3! Hit? (${decision.hitsRemaining} remaining) [hit]`

        while (true) {
            const answer = (await this.#rl.question(question)).trim()

            if (answer === "hit") {
                return {
                    type: "flop_3_hit_response",
                    hit: true,
                }
            }
        }
    }

    close() {
        this.#rl.close()
    }
}
