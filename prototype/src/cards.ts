export type FlopNumberCard = {
    type: "number"
    value: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
}

export type FlopActionCard = {
    type: "freeze" | "flopThree"
}

export type FlopSecondChanceCard = {
    type: "secondChance"
}

export type FlopAddModifierCard = {
    type: "addModifier"
    add: 2 | 4 | 6 | 8 | 10
}

export type FlopMultiplyModifierCard = {
    type: "multiplyModifier"
    multiplier: 2
}

export type FlopCard =
    | FlopNumberCard
    | FlopActionCard
    | FlopSecondChanceCard
    | FlopAddModifierCard
    | FlopMultiplyModifierCard

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

function cardImage(card: FlopCard) {
    switch (card.type) {
        case "number":
            return ` --- \n|   |\n| ${card.value.toString().padEnd(2, " ")}|\n|   |\n --- `
        case "addModifier":
            return ` --- \n|   |\n|+${card.add.toString().padEnd(2, " ")}|\n|   |\n --- `
        case "multiplyModifier":
            return ` --- \n|   |\n|x${card.multiplier.toString().padEnd(2, " ")}|\n|   |\n --- `
        case "freeze":
            return ` --- \n|FRE|\n|///|\n|EZE|\n --- `
        case "flopThree":
            return ` --- \n|FLO|\n|P3P|\n|OLF|\n --- `
        case "secondChance":
            return ` --- \n|2nd|\n|<<3|\n|2nd|\n --- `
        default:
            return ` --- \n|***|\n|***|\n|***|\n --- `
    }
}

export function printCards(cards: FlopCard[]) {
    const imageLines = cards.map((card) => cardImage(card).split("\n"))

    for (let line = 0; line < 5; line++) {
        const row = imageLines.map((lines) => lines[line]).join("  ")
        console.log(row)
    }
}
