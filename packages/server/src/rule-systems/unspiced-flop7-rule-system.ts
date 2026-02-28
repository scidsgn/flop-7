import { FlopCard, FlopCardOfType } from "@flop-7/protocol/cards"

import { delay } from "../delay"
import { Game } from "../game"
import { Round } from "../round"
import { RuleSystem } from "./rule-system"

const flop7Deck: FlopCard[] = []

flop7Deck.push({
    type: "number",
    value: 0,
    asset: `/flop-7/number0.svg`,
})
for (let i = 1; i <= 12; i++) {
    for (let j = 0; j < i; j++) {
        flop7Deck.push({
            type: "number",
            value: i as FlopCardOfType<"number">["value"],
            asset: `/flop-7/number${i}.svg`,
        })
    }
}

export class UnspicedFlop7RuleSystem implements RuleSystem {
    info = {
        id: "unspicedFlop7",
        name: "Unspiced Flop 7",
        description: "Flop 7 sans modifier and action cards.",
        assets: {
            cardBack: "/unspiced-flop-7/back.svg",
        },
    }
    deck = flop7Deck

    async runRound(game: Game, round: Round): Promise<void> {
        await this.#startTurn(game, round)
    }

    calculateScore(cards: FlopCard[]) {
        let sum = 0

        const numberCards: FlopCardOfType<"number">[] = cards.filter(
            (card) => card.type === "number",
        )

        for (const card of numberCards) {
            sum += card.value
        }

        if (numberCards.length === 7) {
            sum += 15
        }

        return sum
    }

    async #startTurn(game: Game, round: Round): Promise<void> {
        if (round.currentPlayer.cards.length === 0) {
            const decision = await game.playerRequests.requestChoice(
                round.currentPlayer,
                "firstTurnHit",
                ["hit"],
            )

            if (decision === "hit") {
                await this.#hit(game, round)
            }
        } else {
            const decision = await game.playerRequests.requestChoice(
                round.currentPlayer,
                "startTurnHitOrStay",
                ["hit", "stay"],
            )

            if (decision === "hit") {
                await this.#hit(game, round)
            } else {
                await this.#stay(game, round)
            }
        }
    }

    async #hit(game: Game, round: Round) {
        const card = game.deck.grab()

        await delay(1250)

        switch (card.type) {
            case "number": {
                await this.#handleNumberCard(game, round, card)
                break
            }
        }
    }

    async #handleNumberCard(
        game: Game,
        round: Round,
        card: FlopCardOfType<"number">,
    ) {
        const playerState = round.currentPlayer
        const alreadyHasThatCard = playerState.cards.some(
            (c) => c.type === "number" && c.value === card.value,
        )
        if (alreadyHasThatCard) {
            await this.#bust(game, round)
            return
        }

        await this.#addToHand(game, round, card)
    }

    async #addToHand(game: Game, round: Round, card: FlopCard) {
        round.addCardToCurrentPlayer(card)

        const numberCardsCount = round.currentPlayer.cards.filter(
            (c) => c.type === "number",
        ).length
        if (numberCardsCount >= 7) {
            round.markCurrentPlayerWon()
            await this.#finishRound(game, round)
            return
        }

        await this.#nextPlayer(game, round)
    }

    async #stay(game: Game, round: Round) {
        round.markCurrentPlayerStayed()

        await delay(750)

        await this.#nextPlayer(game, round)
    }

    async #bust(game: Game, round: Round) {
        round.markCurrentPlayerBusted()

        await delay(1500)

        await this.#nextPlayer(game, round)
    }

    async #nextPlayer(game: Game, round: Round) {
        const countActivePlayers = round.activePlayers.length
        if (countActivePlayers === 0) {
            await this.#finishRound(game, round)
            return
        }

        const currentPlayerIndex = round.players.indexOf(round.currentPlayer)
        const nextIndexStart = (currentPlayerIndex + 1) % round.players.length
        const nextPlayersQueue = [
            ...round.players.slice(nextIndexStart),
            ...round.players.slice(0, nextIndexStart),
        ]

        const nextPlayer = nextPlayersQueue.find(
            (player) => player.state === "active",
        )
        if (!nextPlayer) {
            await this.#finishRound(game, round)
            return
        }

        round.setCurrentPlayer(nextPlayer)
        await this.#startTurn(game, round)
    }

    async #finishRound(_game: Game, round: Round) {
        round.finish()
    }
}
