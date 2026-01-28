import {
    gamePlayerSchema,
    gameSnapshotSchema,
    gameSummarySchema,
} from "@flop-7/protocol/snapshots"
import { z } from "zod"

import { Deck } from "./deck"
import { GameEvents } from "./game-events"
import { PlayerRequests } from "./player-requests/player-requests"
import { Round } from "./round"

type GamePlayer = z.infer<typeof gamePlayerSchema>

export type GameSnapshot = z.infer<typeof gameSnapshotSchema>

type GameSummary = z.infer<typeof gameSummarySchema>

export interface GameFlow {
    runRound(game: Game, round: Round): Promise<void>
}

export class Game {
    #players: GamePlayer[]

    #events: GameEvents
    #deck: Deck
    #rounds: Round[] = []

    #playerRequests: PlayerRequests

    #flow: GameFlow

    constructor(
        players: GamePlayer[],
        playerRequests: PlayerRequests,
        gameEvents: GameEvents,
        flow: GameFlow,
    ) {
        this.#players = players
        this.#playerRequests = playerRequests
        this.#events = gameEvents
        this.#flow = flow

        this.#deck = new Deck(this.#events)

        this.startRound()
    }

    get events() {
        return this.#events
    }

    get deck() {
        return this.#deck
    }

    get rounds() {
        return this.#rounds
    }

    get players() {
        return this.#players
    }

    get playerRequests() {
        return this.#playerRequests
    }

    get snapshot(): GameSnapshot {
        return {
            players: this.#players,
            unfulfilledRequests: this.#playerRequests.unfulfilledRequests,
            rounds: this.#rounds.map((round) => round.snapshot),
            summary: this.#calculateRoundSummary(),
        }
    }

    async startRound() {
        const round = new Round(this)
        this.#rounds.push(round)

        this.#events.emit({
            type: "gameRoundStarted",
            payload: this.snapshot,
        })

        await this.#flow.runRound(this, round)

        console.log(this.#calculateRoundSummary())
    }

    #calculateRoundSummary(): GameSummary {
        const totals: Map<string, number> = new Map()

        for (const round of this.#rounds) {
            for (const player of round.players) {
                totals.set(
                    player.player.id,
                    (totals.get(player.player.id) ?? 0) + player.score,
                )
            }
        }

        return {
            players: [...totals.entries()].map(([id, score]) => ({
                playerId: id,
                totalScore: score,
            })),
        }
    }
}
