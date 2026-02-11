import { FlopCard } from "@flop-7/protocol/cards"
import { GamePlayer, RoundPlayerSnapshot } from "@flop-7/protocol/snapshots"

import { Game } from "./game"
import { GameEvents } from "./game-events"
import { RuleSystem } from "./rule-system"

type RoundPlayerState = RoundPlayerSnapshot["state"]

export class RoundPlayer {
    #events: GameEvents
    #ruleSystem: RuleSystem

    #player: GamePlayer
    #cards: FlopCard[] = []
    #score = 0
    #state: RoundPlayerState = "active"
    #flopThreeCounter = 0

    constructor(game: Game, player: GamePlayer) {
        this.#events = game.events
        this.#ruleSystem = game.ruleSystem
        this.#player = player
    }

    get player() {
        return this.#player
    }

    get cards() {
        return this.#cards
    }

    get score() {
        return this.#score
    }

    get state() {
        return this.#state
    }

    get flopThreeCounter() {
        return this.#flopThreeCounter
    }

    get snapshot(): RoundPlayerSnapshot {
        return {
            playerId: this.#player.id,
            cards: this.#cards,
            flopThreeCounter: this.#flopThreeCounter,
            score: this.#score,
            state: this.#state,
        }
    }

    pushCard(card: FlopCard) {
        this.#ensureActive()

        this.#cards = [...this.#cards, card]
        this.#score = this.#ruleSystem.calculateScore(this.#cards)

        this.#events.emit({
            type: "playerCardAdded",
            payload: this.snapshot,
        })
    }

    discardCard(card: FlopCard) {
        this.#ensureActive()

        this.#cards = this.#cards.filter((c) => c !== card)
        this.#score = this.#ruleSystem.calculateScore(this.#cards)

        this.#events.emit({
            type: "playerCardDiscarded",
            payload: { ...this.snapshot, card },
        })
    }

    bust() {
        this.#ensureActive()

        this.#state = "busted"
        this.#score = 0

        this.#events.emit({
            type: "playerBusted",
            payload: this.snapshot,
        })
    }

    freeze() {
        this.#ensureActive()

        this.#state = "frozen"

        this.#events.emit({
            type: "playerFrozen",
            payload: this.snapshot,
        })
    }

    stay() {
        this.#ensureActive()

        this.#state = "stayed"

        this.#events.emit({
            type: "playerStayed",
            payload: this.snapshot,
        })
    }

    win() {
        this.#ensureActive()

        this.#state = "won"

        this.#events.emit({
            type: "playerWon",
            payload: this.snapshot,
        })
    }

    bumpFlopThreeCounter() {
        this.#ensureActive()

        this.#flopThreeCounter = 3

        this.#events.emit({
            type: "playerFlopThreeStarted",
            payload: this.snapshot,
        })
    }

    decrementFlopThreeCounter() {
        this.#ensureActive()

        if (this.#flopThreeCounter === 0) {
            return
        }

        this.#flopThreeCounter -= 1

        this.#events.emit({
            type: "playerFlopThreeCounterDecreased",
            payload: this.snapshot,
        })
    }

    #ensureActive() {
        if (this.#state !== "active") {
            throw new Error(
                `Cannot make player state transitions when the player is not active.`,
            )
        }
    }
}
