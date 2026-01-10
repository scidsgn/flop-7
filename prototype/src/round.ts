import { FlopCard } from "./cards"
import { Game } from "./game"
import { BaseEvent, GameEvents } from "./game-events"
import { RoundPlayer } from "./round-player"

export type RoundEvents = BaseEvent<"roundPlayerChange", { playerId: string }>

export class Round {
    #events: GameEvents

    #players: RoundPlayer[]
    #currentPlayer: RoundPlayer
    #flopThreePlayerQueue: RoundPlayer[] = []

    constructor(game: Game) {
        this.#events = game.events

        this.#players = game.players.map(
            (player) => new RoundPlayer(game.events, player),
        )
        // TODO ew
        this.#currentPlayer = this.#players[0]
    }

    get players() {
        return this.#players
    }

    get activePlayers() {
        return this.#players.filter((player) => player.state === "active")
    }

    get currentPlayer() {
        return this.#currentPlayer
    }

    get isFlopThreeQueueEmpty() {
        return this.#flopThreePlayerQueue.length === 0
    }

    addCardToCurrentPlayer(card: FlopCard) {
        const player = this.currentPlayer

        player.pushCard(card)
    }

    markCurrentPlayerWon() {
        const player = this.currentPlayer

        player.win()
    }

    markCurrentPlayerBusted() {
        const player = this.currentPlayer

        player.bust()
    }

    markCurrentPlayerStayed() {
        const player = this.currentPlayer

        player.stay()
    }

    freezePlayer(player: RoundPlayer) {
        this.#ensureHasPlayer(player)

        player.freeze()
    }

    startFlopThreeForCurrentPlayer() {
        const player = this.currentPlayer

        player.bumpFlopThreeCounter()
    }

    startFlopThreeForPlayer(player: RoundPlayer) {
        this.#ensureHasPlayer(player)

        this.#flopThreePlayerQueue.push(this.currentPlayer)

        player.bumpFlopThreeCounter()
        this.#currentPlayer = player

        this.#events.emit({
            type: "roundPlayerChange",
            payload: { playerId: player.player.id },
        })
    }

    setCurrentPlayer(player: RoundPlayer) {
        this.#ensureHasPlayer(player)

        this.#currentPlayer = player

        this.#events.emit({
            type: "roundPlayerChange",
            payload: { playerId: player.player.id },
        })
    }

    shiftFlopThreePlayerQueue() {
        return this.#flopThreePlayerQueue.shift()
    }

    discardCardFromCurrentPlayer(card: FlopCard) {
        const player = this.#currentPlayer

        player.discardCard(card)
    }

    decreaseFlopThreeCounter() {
        const player = this.#currentPlayer
        if (player.flopThreeCounter === 0) {
            return
        }

        player.decrementFlopThreeCounter()
    }

    finish() {
        this.#events.emit({
            type: "roundFinish",
            payload: {
                players: this.#players.map((player) => ({
                    playerId: player.player.id,
                    cards: player.cards,
                    state: player.state,
                    flopThreeCounter: player.flopThreeCounter,
                    score: player.score,
                })),
            },
        })
    }

    #ensureHasPlayer(player: RoundPlayer) {
        if (!this.#players.includes(player)) {
            throw new Error(`Player ${player.player.id} not present in round`)
        }
    }
}
