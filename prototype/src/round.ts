import { Emitter } from "@scidsgn/std"

import { FlopCard } from "./cards"
import { Game } from "./game"
import { RoundPlayer } from "./round-player"

type RoundPlayerState = {
    cards: FlopCard[]
    flopThreeCounter: number
    score: number
    state: "active" | "busted" | "frozen" | "stayed" | "won"
}

type RoundPlayerUpdate<TType> = {
    type: TType
    playerId: string
    playerState: RoundPlayerState
}

export type RoundUpdate =
    | RoundPlayerUpdate<"roundPlayerChangeUpdate">
    | RoundPlayerUpdate<"roundAddCardToPlayerUpdate">
    | RoundPlayerUpdate<"roundPlayerWonUpdate">
    | RoundPlayerUpdate<"roundPlayerFrozenUpdate">
    | RoundPlayerUpdate<"roundPlayerBustedUpdate">
    | RoundPlayerUpdate<"roundPlayerStayedUpdate">
    | RoundPlayerUpdate<"roundPlayerFlopThreeStarted">
    | (RoundPlayerUpdate<"roundPlayerUseCardUpdate"> & { card: FlopCard })
    | RoundPlayerUpdate<"roundPlayerDecreaseFTCounterUpdate">

export class Round {
    #players: RoundPlayer[]
    #currentPlayer: RoundPlayer
    #flopThreePlayerQueue: RoundPlayer[] = []

    #emitter = new Emitter<RoundUpdate>()

    constructor(game: Game) {
        this.#players = game.players.map((player) => new RoundPlayer(player))
        // TODO ew
        this.#currentPlayer = this.#players[0]
    }

    get updateStream() {
        return this.#emitter.asyncStream()
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

    getPlayer(playerId: string) {
        const player = this.#players.find(
            (player) => player.player.id === playerId,
        )
        if (!player) {
            throw new Error(`Player not found: ${playerId}`)
        }

        return player
    }

    addCardToCurrentPlayer(card: FlopCard) {
        const player = this.currentPlayer

        player.pushCard(card)

        this.#emitter.emit({
            type: "roundAddCardToPlayerUpdate",
            ...this.#oldEventFromPlayer(player),
        })
    }

    markCurrentPlayerWon() {
        const player = this.currentPlayer

        player.win()

        this.#emitter.emit({
            type: "roundPlayerWonUpdate",
            ...this.#oldEventFromPlayer(player),
        })
    }

    markCurrentPlayerBusted() {
        const player = this.currentPlayer

        player.bust()

        this.#emitter.emit({
            type: "roundPlayerBustedUpdate",
            ...this.#oldEventFromPlayer(player),
        })
    }

    markCurrentPlayerStayed() {
        const player = this.currentPlayer

        player.stay()

        this.#emitter.emit({
            type: "roundPlayerStayedUpdate",
            ...this.#oldEventFromPlayer(player),
        })
    }

    freezePlayer(playerId: string) {
        const player = this.getPlayer(playerId)

        player.freeze()

        this.#emitter.emit({
            type: "roundPlayerFrozenUpdate",
            ...this.#oldEventFromPlayer(player),
        })
    }

    startFlopThreeForCurrentPlayer() {
        const player = this.currentPlayer

        player.bumpFlopThreeCounter()

        this.#emitter.emit({
            type: "roundPlayerFlopThreeStarted",
            ...this.#oldEventFromPlayer(player),
        })
    }

    startFlopThreeForPlayer(playerId: string) {
        const player = this.getPlayer(playerId)

        this.#flopThreePlayerQueue.push(this.currentPlayer)

        player.bumpFlopThreeCounter()
        this.#currentPlayer = player

        this.#emitter.emit({
            type: "roundPlayerChangeUpdate",
            ...this.#oldEventFromPlayer(player),
        })

        this.#emitter.emit({
            type: "roundPlayerFlopThreeStarted",
            ...this.#oldEventFromPlayer(player),
        })
    }

    setCurrentPlayer(playerId: string) {
        const player = this.getPlayer(playerId)

        this.#currentPlayer = player

        this.#emitter.emit({
            type: "roundPlayerChangeUpdate",
            ...this.#oldEventFromPlayer(player),
        })
    }

    shiftFlopThreePlayerQueue() {
        return this.#flopThreePlayerQueue.shift()
    }

    discardCardFromCurrentPlayer(card: FlopCard) {
        const player = this.#currentPlayer

        player.discardCard(card)

        this.#emitter.emit({
            type: "roundPlayerUseCardUpdate",
            ...this.#oldEventFromPlayer(player),
            card,
        })
    }

    decreaseFlopThreeCounter() {
        const player = this.#currentPlayer
        if (player.flopThreeCounter === 0) {
            return
        }

        player.decrementFlopThreeCounter()

        this.#emitter.emit({
            type: "roundPlayerDecreaseFTCounterUpdate",
            ...this.#oldEventFromPlayer(player),
        })
    }

    #oldEventFromPlayer(
        player: RoundPlayer,
    ): Omit<RoundPlayerUpdate<string>, "type"> {
        return {
            playerId: player.player.id,
            playerState: {
                cards: player.cards,
                state: player.state,
                score: player.score,
                flopThreeCounter: player.flopThreeCounter,
            },
        }
    }
}
