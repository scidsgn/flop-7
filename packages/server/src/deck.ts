import { FlopCard, FlopCardOfType } from "@flop-7/protocol/cards"

import { GameEvents } from "./game-events"

const fullDeck: FlopCard[] = []

fullDeck.push({
    type: "number",
    value: 0,
    asset: `/flop-7/number0.svg`,
})
for (let i = 1; i <= 12; i++) {
    for (let j = 0; j < i; j++) {
        fullDeck.push({
            type: "number",
            value: i as FlopCardOfType<"number">["value"],
            asset: `/flop-7/number${i}.svg`,
        })
    }
}

for (let i = 1; i <= 3; i++) {
    fullDeck.push({ type: "freeze", asset: "/flop-7/freeze.svg" })
    fullDeck.push({ type: "flopThree", asset: "/flop-7/flop3.svg" })
    fullDeck.push({
        type: "secondChance",
        asset: "/flop-7/secondChance.svg",
    })
}

fullDeck.push({
    type: "addModifier",
    add: 2,
    asset: "/flop-7/add2.svg",
})
fullDeck.push({ type: "addModifier", add: 4, asset: "/flop-7/add4.svg" })
fullDeck.push({ type: "addModifier", add: 6, asset: "/flop-7/add6.svg" })
fullDeck.push({ type: "addModifier", add: 8, asset: "/flop-7/add8.svg" })
fullDeck.push({
    type: "addModifier",
    add: 10,
    asset: "/flop-7/add10.svg",
})
fullDeck.push({
    type: "multiplyModifier",
    multiplier: 2,
    asset: "/flop-7/multiply2.svg",
})

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
