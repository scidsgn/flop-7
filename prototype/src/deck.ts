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

export class Deck {
    #debugQueue: FlopCard[] = []
    #cards: FlopCard[] = []

    constructor() {
        this.reshuffle()
    }

    get remainingCards() {
        return this.#cards.length + this.#debugQueue.length
    }

    pushDebug(card: FlopCard) {
        this.#debugQueue.push(card)
    }

    grab() {
        const debugCard = this.#debugQueue.shift()
        if (debugCard) {
            return debugCard
        }

        if (this.#cards.length === 0) {
            this.reshuffle()
        }

        const index = Math.floor(Math.random() * this.#cards.length)
        const card = this.#cards[index]

        this.#cards.splice(index, 1)

        return card
    }

    reshuffle() {
        this.#cards = [...fullDeck]
    }
}
