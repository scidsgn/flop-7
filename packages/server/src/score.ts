import { FlopCard, FlopCardOfType } from "@flop-7/protocol/cards"

export function countCardScore(cards: FlopCard[]) {
    let sum = 0

    const numberCards: FlopCardOfType<"number">[] = cards.filter(
        (card) => card.type === "number",
    )
    const addModifierCards: FlopCardOfType<"addModifier">[] = cards.filter(
        (card) => card.type === "addModifier",
    )
    const multiplyModifierCards: FlopCardOfType<"multiplyModifier">[] =
        cards.filter((card) => card.type === "multiplyModifier")

    for (const card of numberCards) {
        sum += card.value
    }
    for (const card of multiplyModifierCards) {
        sum *= card.multiplier
    }
    for (const card of addModifierCards) {
        sum += card.add
    }

    if (numberCards.length === 7) {
        sum += 15
    }

    return sum
}
