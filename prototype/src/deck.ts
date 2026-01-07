import { Emitter } from "@scidsgn/std"

import { FlopCard, FlopNumberCard } from "./cards"

const fullDeck: FlopCard[] = []

fullDeck.push({ type: "number", value: 0 })
for (let i = 1; i <= 12; i++) {
    for (let j = 0; j < i; j++) {
        fullDeck.push({
            type: "number",
            value: i as FlopNumberCard["value"],
        })
    }
}

for (let i = 1; i <= 3; i++) {
    fullDeck.push({ type: "freeze" })
    fullDeck.push({ type: "flopThree" })
    fullDeck.push({ type: "secondChance" })
}

fullDeck.push({ type: "addModifier", add: 2 })
fullDeck.push({ type: "addModifier", add: 4 })
fullDeck.push({ type: "addModifier", add: 6 })
fullDeck.push({ type: "addModifier", add: 8 })
fullDeck.push({ type: "addModifier", add: 10 })
fullDeck.push({ type: "multiplyModifier", multiplier: 2 })

export const fullDeckSize = fullDeck.length

type DeckGrabUpdate = {
    type: "deckGrabUpdate"
    remainingCards: number
    totalCards: number
    card: FlopCard
}

export class Deck {
    #cards: FlopCard[] = [...fullDeck]

    #emitter = new Emitter<DeckGrabUpdate>()

    get state() {
        return {
            remainingCards: this.#cards.length,
            totalCards: fullDeckSize,
        }
    }

    get updateStream() {
        return this.#emitter.asyncStream()
    }

    grab() {
        if (this.#cards.length === 0) {
            this.#cards = [...fullDeck]
        }

        const index = Math.floor(Math.random() * this.#cards.length)
        const card = this.#cards[index]

        this.#cards.splice(index, 1)

        this.#emitter.emit({
            type: "deckGrabUpdate",
            ...this.state,
            card,
        })

        return card
    }
}
