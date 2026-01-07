import { FlopCard, countCardScore } from "./cards"
import { Player } from "./player"

type RoundPlayerState = "active" | "busted" | "frozen" | "stayed" | "won"

export class RoundPlayer {
    #player: Player
    #cards: FlopCard[] = []
    #score = 0
    #state: RoundPlayerState = "active"
    #flopThreeCounter = 0

    constructor(player: Player) {
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

    pushCard(card: FlopCard) {
        this.#ensureActive()

        this.#cards = [...this.#cards, card]
        this.#score = countCardScore(this.#cards)
    }

    discardCard(card: FlopCard) {
        this.#ensureActive()

        this.#cards = this.#cards.filter((c) => c !== card)
        this.#score = countCardScore(this.#cards)
    }

    bust() {
        this.#ensureActive()

        this.#state = "busted"
        this.#score = 0
    }

    freeze() {
        this.#ensureActive()

        this.#state = "frozen"
    }

    stay() {
        this.#ensureActive()

        this.#state = "stayed"
    }

    win() {
        this.#ensureActive()

        this.#state = "won"
    }

    bumpFlopThreeCounter() {
        this.#ensureActive()

        this.#flopThreeCounter = 3
    }

    decrementFlopThreeCounter() {
        this.#ensureActive()

        if (this.#flopThreeCounter === 0) {
            return
        }

        this.#flopThreeCounter -= 1
    }

    #ensureActive() {
        if (this.#state !== "active") {
            throw new Error(
                `Cannot make player state transitions when the player is not active.`,
            )
        }
    }
}
