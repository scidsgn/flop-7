import { FlopCard, FlopCardOfType } from "@flop-7/protocol/cards"

import { delay } from "../delay"
import { Game } from "../game"
import { Round } from "../round"
import { RuleSystem } from "../rule-system"

export class Flop7RuleSystem implements RuleSystem {
    get info() {
        return {
            id: "flop7",
            name: "Flop 7",
            assets: {
                cardBack: "/flop-7/back.svg",
            },
        }
    }

    async runRound(game: Game, round: Round): Promise<void> {
        await this.#startTurn(game, round)
    }

    calculateScore(cards: FlopCard[]) {
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

        round.decreaseFlopThreeCounter()

        await delay(1250)

        switch (card.type) {
            case "number": {
                await this.#handleNumberCard(game, round, card)
                break
            }
            case "flopThree": {
                if (round.currentPlayer.flopThreeCounter > 0) {
                    await this.#addToHand(game, round, card)
                } else {
                    await this.#flopThree(game, round)
                }
                break
            }
            case "freeze": {
                if (round.currentPlayer.flopThreeCounter > 0) {
                    await this.#addToHand(game, round, card)
                } else {
                    await this.#freeze(game, round)
                }
                break
            }
            case "secondChance":
            case "addModifier":
            case "multiplyModifier": {
                await this.#addToHand(game, round, card)
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
            const secondChance = playerState.cards.find(
                (c) => c.type === "secondChance",
            )
            if (!secondChance) {
                await this.#bust(game, round)
            } else {
                round.discardCardFromCurrentPlayer(secondChance)

                if (playerState.flopThreeCounter > 0) {
                    await this.#hitMoreDuringFlop3(game, round)
                    return
                }

                await this.#performRemainingActions(game, round)
            }

            return
        }

        await this.#addToHand(game, round, card)
    }

    async #hitMoreDuringFlop3(game: Game, round: Round) {
        await game.playerRequests.requestChoice(
            round.currentPlayer,
            "flopThreeHit",
            ["hit"],
        )

        await this.#hit(game, round)
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

        if (round.currentPlayer.flopThreeCounter > 0) {
            await this.#hitMoreDuringFlop3(game, round)
            return
        }

        await this.#performRemainingActions(game, round)
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

    async #performRemainingActions(game: Game, round: Round) {
        const playerState = round.currentPlayer
        const actionCards = playerState.cards.filter(
            (c) => c.type === "freeze" || c.type === "flopThree",
        )

        if (actionCards.length > 0) {
            const firstActionCard = actionCards[0]!
            round.discardCardFromCurrentPlayer(firstActionCard)

            if (firstActionCard.type === "freeze") {
                await this.#freeze(game, round)
            } else {
                await this.#flopThree(game, round)
            }
        }

        await this.#nextPlayer(game, round)
    }

    async #freeze(game: Game, round: Round) {
        const activePlayers = round.activePlayers
        if (activePlayers.length === 0) {
            // Freeze player
            round.freezePlayer(round.currentPlayer)

            await delay(1000)

            await this.#finishRound(game, round)
            return
        }

        const selectedPlayer = await game.playerRequests.requestPlayerSelection(
            round.currentPlayer,
            "freeze",
            activePlayers,
        )
        if (selectedPlayer === round.currentPlayer) {
            round.freezePlayer(round.currentPlayer)

            if (activePlayers.length === 1) {
                await delay(1000)

                await this.#finishRound(game, round)
                return
            }

            await this.#nextPlayer(game, round)
            return
        }

        round.freezePlayer(selectedPlayer)

        await this.#performRemainingActions(game, round)
    }

    async #flopThree(game: Game, round: Round) {
        const activePlayers = round.activePlayers

        const selectedPlayer = await game.playerRequests.requestPlayerSelection(
            round.currentPlayer,
            "flopThree",
            activePlayers,
        )
        if (selectedPlayer === round.currentPlayer) {
            round.startFlopThreeForCurrentPlayer()

            await this.#hitMoreDuringFlop3(game, round)
        } else {
            round.startFlopThreeForPlayer(selectedPlayer)

            await this.#hitMoreDuringFlop3(game, round)
        }
    }

    async #nextPlayer(game: Game, round: Round) {
        const countActivePlayers = round.activePlayers.length
        if (countActivePlayers === 0) {
            await this.#finishRound(game, round)
            return
        }

        while (!round.isFlopThreeQueueEmpty) {
            const player = round.shiftFlopThreePlayerQueue()
            if (!player) {
                break
            }

            if (player.state !== "active") {
                continue
            }

            round.setCurrentPlayer(player)
            await this.#performRemainingActions(game, round)
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
