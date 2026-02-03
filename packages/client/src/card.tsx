import type { FlopCard } from "@flop-7/protocol/cards"

type CardProps = {
    card: FlopCard
}

export const Card = ({ card }: CardProps) => {
    if (card.type === "number") {
        return (
            <img
                className="h-24"
                src={`/cards/flop-7/number${card.value}.svg`}
                alt={`Number ${card.value} card`}
            />
        )
    }
    if (card.type === "addModifier") {
        return (
            <img
                className="h-24"
                src={`/cards/flop-7/add${card.add}.svg`}
                alt={`Add ${card.add} card`}
            />
        )
    }
    if (card.type === "multiplyModifier") {
        return (
            <img
                className="h-24"
                src={`/cards/flop-7/multiply${card.multiplier}.svg`}
                alt={`Multiply by ${card.multiplier} card`}
            />
        )
    }
    if (card.type === "secondChance") {
        return (
            <img
                className="h-24"
                src="/cards/flop-7/secondChance.svg"
                alt={`Second chance card`}
            />
        )
    }
    if (card.type === "freeze") {
        return (
            <img
                className="h-24"
                src="/cards/flop-7/freeze.svg"
                alt={`Freeze card`}
            />
        )
    }
    if (card.type === "flopThree") {
        return (
            <img
                className="h-24"
                src="/cards/flop-7/flop3.svg"
                alt={`Flop three card`}
            />
        )
    }
}
