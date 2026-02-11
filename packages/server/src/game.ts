import {
    GamePlayer,
    GameSnapshot,
    GameSummary,
} from "@flop-7/protocol/snapshots"

import { Deck } from "./deck"
import { GameEvents } from "./game-events"
import { ServerPlayerRequests } from "./player-requests/server-player-requests"
import { Round } from "./round"
import { RuleSystem } from "./rule-system"

export class Game {
    #players: GamePlayer[]

    #events: GameEvents
    #deck: Deck
    #rounds: Round[] = []

    #playerRequests: ServerPlayerRequests

    #ruleSystem: RuleSystem

    constructor(
        players: GamePlayer[],
        playerRequests: ServerPlayerRequests,
        gameEvents: GameEvents,
        flow: RuleSystem,
    ) {
        this.#players = players
        this.#playerRequests = playerRequests
        this.#events = gameEvents
        this.#ruleSystem = flow

        this.#deck = new Deck(this.#events)

        this.startRound()
    }

    get events() {
        return this.#events
    }

    get ruleSystem() {
        return this.#ruleSystem
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
            deckStats: this.#deck.state,
        }
    }

    async startRound() {
        const firstPlayer = this.#determineFirstPlayer()

        const round = new Round(this, firstPlayer)
        this.#rounds.push(round)

        this.#events.emit({
            type: "gameRoundStarted",
            payload: this.snapshot,
        })

        await this.#ruleSystem.runRound(this, round)

        const summary = this.#calculateRoundSummary()
        if (summary.winner) {
            this.#events.emit({
                type: "gameFinished",
                payload: this.snapshot,
            })
            return
        }

        await this.startRound()
    }

    #determineFirstPlayer() {
        const lastRound = this.#rounds.at(-1)
        if (!lastRound) {
            return this.#players[
                Math.floor(Math.random() * this.#players.length)
            ]!
        }

        const lastPlayerIndex = this.#players.findIndex(
            (player) => player.id === lastRound.currentPlayer.player.id,
        )

        return this.#players[(lastPlayerIndex + 1) % this.#players.length]!
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

        const maxTotal = Math.max(...totals.values())
        const playerIdsWithMaxScore = [...totals.entries()]
            .filter(([, score]) => score === maxTotal)
            .map(([id]) => id)

        let winner: GamePlayer | undefined = undefined
        if (maxTotal >= 200 && playerIdsWithMaxScore.length === 1) {
            winner = this.#players.find(
                (player) => player.id === playerIdsWithMaxScore[0],
            )
        }

        return {
            players: [...totals.entries()].map(([id, score]) => ({
                playerId: id,
                totalScore: score,
            })),
            winner,
        }
    }
}
