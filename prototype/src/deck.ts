import { FlopCard, FlopNumberCard } from "./cards"
import { GameEvents } from "./game-events"

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

export class Deck {
    #emitter: GameEvents

    #cards: FlopCard[] = [...fullDeck]

    constructor(emitter: GameEvents) {
        this.#emitter = emitter
    }

    get state() {
        return {
            remainingCards: this.#cards.length,
            totalCards: fullDeckSize,
        }
    }

    grab() {
        if (this.#cards.length === 0) {
            this.#cards = [...fullDeck]
        }

        const index = Math.floor(Math.random() * this.#cards.length)
        const card = this.#cards[index]

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
