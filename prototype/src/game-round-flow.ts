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
        const decision = await this.#game.playerDecisions.requestHitOrStay({
            type: "hit_or_stay",
        })
        if (decision.decision === "hit") {
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
                if (this.#round.currentPlayerState.flopThreeCounter > 0) {
                    await this.addToHand(card)
                } else {
                    await this.flopThree()
                }
                break
            }
            case "freeze": {
                if (this.#round.currentPlayerState.flopThreeCounter > 0) {
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
        const playerState = this.#round.currentPlayerState
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
                this.#round.applyCard(secondChance)

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
        await this.#game.playerDecisions.requestFlop3Hit({
            type: "flop_3_hit",
            hitsRemaining: this.#round.currentPlayerState.flopThreeCounter,
        })

        await this.hit()
    }

    async addToHand(card: FlopCard) {
        this.#round.addCardToHand(card)

        const numberCardsCount = this.#round.currentPlayerState.cards.filter(
            (c) => c.type === "number",
        ).length
        if (numberCardsCount >= 7) {
            this.#round.markPlayerWon()
            await this.finishRound()
            return
        }

        if (this.#round.currentPlayerState.flopThreeCounter > 0) {
            await this.hitMoreDuringFlop3()
            return
        }

        await this.performRemainingActions()
    }

    async stay() {
        this.#round.markPlayerStayed()

        await this.nextPlayer()
    }

    async bust() {
        this.#round.markPlayerBusted()

        await this.nextPlayer()
    }

    async performRemainingActions() {
        const playerState = this.#round.currentPlayerState
        const actionCards = playerState.cards.filter(
            (c) => c.type === "freeze" || c.type === "flopThree",
        )

        if (actionCards.length > 0) {
            const firstActionCard = actionCards[0]
            this.#round.applyCard(firstActionCard)

            if (firstActionCard.type === "freeze") {
                await this.freeze()
            } else {
                await this.flopThree()
            }
        }

        await this.nextPlayer()
    }

    async freeze() {
        const activePlayerEntries = Object.entries(
            this.#round.state.playerStates,
        ).filter(([, p]) => p.state === "active")
        if (activePlayerEntries.length === 0) {
            // Freeze player
            this.#round.freezePlayer(this.#round.state.currentPlayerId)

            await this.finishRound()
            return
        }

        const activePlayerIds = activePlayerEntries.map(([id]) => id)

        const selection = await this.#game.playerDecisions.requestFreeze({
            type: "freeze_player",
            players: this.#game.players.filter((p) =>
                activePlayerIds.includes(p.id),
            ),
        })
        this.#round.freezePlayer(selection.selectedPlayerId)

        if (selection.selectedPlayerId === this.#round.state.currentPlayerId) {
            await this.nextPlayer()
            return
        }

        await this.performRemainingActions()
    }

    async flopThree() {
        const activePlayerEntries = Object.entries(
            this.#round.state.playerStates,
        ).filter(([, p]) => p.state === "active")
        const activePlayerIds = activePlayerEntries.map(([id]) => id)

        const selection = await this.#game.playerDecisions.requestFlop3Player({
            type: "flop_3_player",
            players: this.#game.players.filter((p) =>
                activePlayerIds.includes(p.id),
            ),
        })
        if (selection.selectedPlayerId === this.#round.state.currentPlayerId) {
            this.#round.startFlopThree()

            await this.hitMoreDuringFlop3()
        } else {
            this.#round.startPlayerFlopThree(this.#round.state.currentPlayerId)

            await this.hitMoreDuringFlop3()
        }
    }

    async nextPlayer() {
        const countActivePlayers = Object.values(
            this.#round.state.playerStates,
        ).filter((p) => p.state === "active").length
        if (countActivePlayers === 0) {
            await this.finishRound()
            return
        }

        while (this.#round.state.flopThreePlayerQueue.length > 0) {
            const { playerId, playerState } =
                this.#round.shiftFlopThreePlayerQueue()
            if (playerState.state !== "active") {
                continue
            }

            this.#round.changePlayer(playerId)
            await this.performRemainingActions()
            return
        }

        const currentPlayerIndex = this.#round.state.playerOrder.indexOf(
            this.#round.state.currentPlayerId,
        )
        const nextIndexStart =
            (currentPlayerIndex + 1) % this.#round.state.playerOrder.length
        const nextPlayersQueue = [
            ...this.#round.state.playerOrder.slice(nextIndexStart),
            ...this.#round.state.playerOrder.slice(0, nextIndexStart),
        ]

        const nextPlayer = nextPlayersQueue.find(
            (playerId) =>
                this.#round.state.playerStates[playerId].state === "active",
        )
        if (!nextPlayer) {
            await this.finishRound()
            return
        }

        this.#round.changePlayer(nextPlayer)
        await this.startTurn()
    }

    async finishRound() {
        // TODO
        console.log("round over")
    }
}
