import { z } from "zod"

import {
    flopActionCardSchema,
    flopAddModifierCardSchema,
    flopCardSchema,
    flopMultiplyModifierCardSchema,
    flopNumberCardSchema,
    flopSecondChanceCardSchema,
} from "./schemas/cards"

export type FlopNumberCard = z.infer<typeof flopNumberCardSchema>

export type FlopActionCard = z.infer<typeof flopActionCardSchema>

export type FlopSecondChanceCard = z.infer<typeof flopSecondChanceCardSchema>

export type FlopAddModifierCard = z.infer<typeof flopAddModifierCardSchema>

export type FlopMultiplyModifierCard = z.infer<
    typeof flopMultiplyModifierCardSchema
>

export type FlopCard = z.infer<typeof flopCardSchema>

export function countCardScore(cards: FlopCard[]) {
    let sum = 0

    const numberCards: FlopNumberCard[] = cards.filter(
        (card) => card.type === "number",
    )
    const addModifierCards: FlopAddModifierCard[] = cards.filter(
        (card) => card.type === "addModifier",
    )
    const multiplyModifierCards: FlopMultiplyModifierCard[] = cards.filter(
        (card) => card.type === "multiplyModifier",
    )

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
