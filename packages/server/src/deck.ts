import { FlopCard } from "@flop-7/protocol/cards"

import { GameEvents } from "./game-events"

export class Deck {
    #emitter: GameEvents

    #cardSet: FlopCard[]
    #cards: FlopCard[]

    constructor(emitter: GameEvents, cardSet: FlopCard[]) {
        this.#emitter = emitter
        this.#cardSet = cardSet

        this.#cards = [...cardSet]
    }

    get state() {
        return {
            remainingCards: this.#cards.length,
            totalCards: this.#cardSet.length,
        }
    }

    grab() {
        if (this.#cards.length === 0) {
            this.#cards = [...this.#cardSet]
        }

        const index = Math.floor(Math.random() * this.#cards.length)
        const card = this.#cards[index]!

        this.#cards.splice(index, 1)

        this.#emitter.emit({
            type: "deckCardGrabbed",
            payload: {
                ...this.state,
                card,
            },
        })

        return card
    }
}
