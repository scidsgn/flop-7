import { Card } from "./card.tsx"
import { useGame } from "./game.store.ts"

export const BoardDeck = () => {
    const currentDeckCard = useGame((state) => state.currentDeckCard)

    return (
        <div className="pointer-events-auto flex gap-2 scale-150">
            <img
                className="h-24"
                src="/cards/flop-7/back.svg"
                alt="Grab a card"
            />

            {currentDeckCard ? (
                <Card card={currentDeckCard} />
            ) : (
                <div className="w-16 h-24 inset-ring-2 inset-ring-neutral-600 rounded-md" />
            )}
        </div>
    )
}
