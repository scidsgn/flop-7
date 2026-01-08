import { FlopCard, FlopNumberCard } from "./cards"
import { Game } from "./game"
import { Round } from "./round"

export class GameRoundFlow {
    #game: Game
    #round: Round

    constructor(game: Game, round: Round) {
        this.#game = game
        this.#round = round
    }

    async startTurn() {
        const decision = await this.#game.playerRequests.requestChoice(
            this.#round.currentPlayer,
            "startTurnHitOrStay",
            ["hit", "stay"],
        )
        if (decision === "hit") {
            await this.hit()
        } else {
            await this.stay()
        }
    }

    async hit() {
        const card = this.#game.deck.grab()

        this.#round.decreaseFlopThreeCounter()

        switch (card.type) {
            case "number": {
                await this.handleNumberCard(card)
                break
            }
            case "flopThree": {
                if (this.#round.currentPlayer.flopThreeCounter > 0) {
                    await this.addToHand(card)
                } else {
                    await this.flopThree()
                }
                break
            }
            case "freeze": {
                if (this.#round.currentPlayer.flopThreeCounter > 0) {
                    await this.addToHand(card)
                } else {
                    await this.freeze()
                }
                break
            }
            case "secondChance":
            case "addModifier":
            case "multiplyModifier": {
                await this.addToHand(card)
                break
            }
        }
    }

    async handleNumberCard(card: FlopNumberCard) {
        const playerState = this.#round.currentPlayer
        const alreadyHasThatCard = playerState.cards.some(
            (c) => c.type === "number" && c.value === card.value,
        )
        if (alreadyHasThatCard) {
            const secondChance = playerState.cards.find(
                (c) => c.type === "secondChance",
            )
            if (!secondChance) {
                await this.bust()
            } else {
                this.#round.discardCardFromCurrentPlayer(secondChance)

                if (playerState.flopThreeCounter > 0) {
                    await this.hitMoreDuringFlop3()
                    return
                }

                await this.performRemainingActions()
            }

            return
        }

        await this.addToHand(card)
    }

    async hitMoreDuringFlop3() {
        await this.#game.playerRequests.requestChoice(
            this.#round.currentPlayer,
            "flopThreeHit",
            ["hit"],
        )

        await this.hit()
    }

    async addToHand(card: FlopCard) {
        this.#round.addCardToCurrentPlayer(card)

        const numberCardsCount = this.#round.currentPlayer.cards.filter(
            (c) => c.type === "number",
        ).length
        if (numberCardsCount >= 7) {
            this.#round.markCurrentPlayerWon()
            await this.finishRound()
            return
        }

        if (this.#round.currentPlayer.flopThreeCounter > 0) {
            await this.hitMoreDuringFlop3()
            return
        }

        await this.performRemainingActions()
    }

    async stay() {
        this.#round.markCurrentPlayerStayed()

        await this.nextPlayer()
    }

    async bust() {
        this.#round.markCurrentPlayerBusted()

        await this.nextPlayer()
    }

    async performRemainingActions() {
        const playerState = this.#round.currentPlayer
        const actionCards = playerState.cards.filter(
            (c) => c.type === "freeze" || c.type === "flopThree",
        )

        if (actionCards.length > 0) {
            const firstActionCard = actionCards[0]
            this.#round.discardCardFromCurrentPlayer(firstActionCard)

            if (firstActionCard.type === "freeze") {
                await this.freeze()
            } else {
                await this.flopThree()
            }
        }

        await this.nextPlayer()
    }

    async freeze() {
        const activePlayers = this.#round.activePlayers
        if (activePlayers.length === 0) {
            // Freeze player
            this.#round.freezePlayer(this.#round.currentPlayer)

            await this.finishRound()
            return
        }

        const selectedPlayer =
            await this.#game.playerRequests.requestPlayerSelection(
                this.#round.currentPlayer,
                "freeze",
                activePlayers,
            )
        if (selectedPlayer === this.#round.currentPlayer) {
            if (activePlayers.length === 1) {
                await this.finishRound()
                return
            }

            await this.nextPlayer()
            return
        }

        await this.performRemainingActions()
    }

    async flopThree() {
        const activePlayers = this.#round.activePlayers

        const selectedPlayer =
            await this.#game.playerRequests.requestPlayerSelection(
                this.#round.currentPlayer,
                "flopThree",
                activePlayers,
            )
        if (selectedPlayer === this.#round.currentPlayer) {
            this.#round.startFlopThreeForCurrentPlayer()

            await this.hitMoreDuringFlop3()
        } else {
            this.#round.startFlopThreeForPlayer(selectedPlayer)

            await this.hitMoreDuringFlop3()
        }
    }

    async nextPlayer() {
        const countActivePlayers = this.#round.activePlayers.length
        if (countActivePlayers === 0) {
            await this.finishRound()
            return
        }

        while (!this.#round.isFlopThreeQueueEmpty) {
            const player = this.#round.shiftFlopThreePlayerQueue()
            if (player.state !== "active") {
                continue
            }

            this.#round.setCurrentPlayer(player)
            await this.performRemainingActions()
            return
        }

        const currentPlayerIndex = this.#round.players.indexOf(
            this.#round.currentPlayer,
        )
        const nextIndexStart =
            (currentPlayerIndex + 1) % this.#round.players.length
        const nextPlayersQueue = [
            ...this.#round.players.slice(nextIndexStart),
            ...this.#round.players.slice(0, nextIndexStart),
        ]

        const nextPlayer = nextPlayersQueue.find(
            (player) => player.state === "active",
        )
        if (!nextPlayer) {
            await this.finishRound()
            return
        }

        this.#round.setCurrentPlayer(nextPlayer)
        await this.startTurn()
    }

    async finishRound() {
        // TODO
        console.log("round over")
    }
}
