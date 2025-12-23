import { FlopCard, FlopNumberCard } from "./cards"

export class Deck {
    #debugQueue: FlopCard[] = []
    #cards: FlopCard[] = []

    constructor() {
        this.replenish()
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
            this.replenish()
        }

        const index = Math.floor(Math.random() * this.#cards.length)
        const card = this.#cards[index]

        this.#cards.splice(index, 1)

        return card
    }

    replenish() {
        this.#cards.push({ type: "number", value: 0 })
        for (let i = 1; i <= 12; i++) {
            for (let j = 0; j < i; j++) {
                this.#cards.push({
                    type: "number",
                    value: i as FlopNumberCard["value"],
                })
            }
        }

        for (let i = 1; i <= 3; i++) {
            this.#cards.push({ type: "freeze" })
            this.#cards.push({ type: "flopThree" })
            this.#cards.push({ type: "secondChance" })
        }

        this.#cards.push({ type: "addModifier", add: 2 })
        this.#cards.push({ type: "addModifier", add: 4 })
        this.#cards.push({ type: "addModifier", add: 6 })
        this.#cards.push({ type: "addModifier", add: 8 })
        this.#cards.push({ type: "addModifier", add: 10 })
        this.#cards.push({ type: "multiplyModifier", multiplier: 2 })
    }
}
