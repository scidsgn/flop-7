import { Emitter } from "@scidsgn/std"

import { FlopCard, countCardScore } from "./cards"

type RoundPlayerState = {
    cards: FlopCard[]
    flopThreeCounter: number
    score: number
    state: "active" | "busted" | "frozen" | "stayed" | "won"
}

type RoundState = {
    playerStates: Record<string, RoundPlayerState>
    currentPlayerId: string
    playerOrder: string[]
    flopThreePlayerQueue: string[]
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
    #state: RoundState

    #emitter = new Emitter<RoundUpdate>()

    constructor(initialState: RoundState) {
        this.#state = initialState
    }

    get state() {
        return this.#state
    }

    get updateStream() {
        return this.#emitter.asyncStream()
    }

    get currentPlayerState() {
        return this.#state.playerStates[this.#state.currentPlayerId]
    }

    addCardToHand(card: FlopCard) {
        const playerState =
            this.#state.playerStates[this.#state.currentPlayerId]

        playerState.cards.push(card)
        playerState.score = countCardScore(playerState.cards)

        this.#emitter.emit({
            type: "roundAddCardToPlayerUpdate",
            playerId: this.#state.currentPlayerId,
            playerState,
        })
    }

    markPlayerWon() {
        const playerState =
            this.#state.playerStates[this.#state.currentPlayerId]

        playerState.state = "won"

        this.#emitter.emit({
            type: "roundPlayerWonUpdate",
            playerId: this.#state.currentPlayerId,
            playerState,
        })
    }

    markPlayerBusted() {
        const playerState =
            this.#state.playerStates[this.#state.currentPlayerId]

        playerState.state = "busted"
        playerState.score = 0

        this.#emitter.emit({
            type: "roundPlayerBustedUpdate",
            playerId: this.#state.currentPlayerId,
            playerState,
        })
    }

    markPlayerStayed() {
        const playerState =
            this.#state.playerStates[this.#state.currentPlayerId]

        playerState.state = "stayed"

        this.#emitter.emit({
            type: "roundPlayerStayedUpdate",
            playerId: this.#state.currentPlayerId,
            playerState,
        })
    }

    freezePlayer(playerId: string) {
        const playerState = this.#state.playerStates[playerId]
        if (!playerState) {
            throw new Error(`Player not found: ${playerId}`)
        }

        playerState.state = "frozen"

        this.#emitter.emit({
            type: "roundPlayerFrozenUpdate",
            playerId,
            playerState,
        })
    }

    startFlopThree() {
        const playerState =
            this.#state.playerStates[this.#state.currentPlayerId]

        playerState.flopThreeCounter = 3

        this.#emitter.emit({
            type: "roundPlayerFlopThreeStarted",
            playerId: this.#state.currentPlayerId,
            playerState,
        })
    }

    startPlayerFlopThree(playerId: string) {
        const playerState = this.#state.playerStates[playerId]
        if (!playerState) {
            throw new Error(`Player not found: ${playerId}`)
        }

        this.#state.flopThreePlayerQueue.push(this.#state.currentPlayerId)

        playerState.flopThreeCounter = 3
        this.#state.currentPlayerId = playerId

        this.#emitter.emit({
            type: "roundPlayerChangeUpdate",
            playerId,
            playerState,
        })

        this.#emitter.emit({
            type: "roundPlayerFlopThreeStarted",
            playerId,
            playerState,
        })
    }

    changePlayer(playerId: string) {
        const playerState = this.#state.playerStates[playerId]
        if (!playerState) {
            throw new Error(`Player not found: ${playerId}`)
        }

        this.#state.currentPlayerId = playerId

        this.#emitter.emit({
            type: "roundPlayerChangeUpdate",
            playerId,
            playerState,
        })
    }

    shiftFlopThreePlayerQueue() {
        const playerId = this.#state.flopThreePlayerQueue.shift()
        const playerState = this.#state.playerStates[playerId]
        if (!playerState) {
            throw new Error(`Player not found: ${playerId}`)
        }

        return { playerId, playerState }
    }

    applyCard(card: FlopCard) {
        const playerState =
            this.#state.playerStates[this.#state.currentPlayerId]
        const cardIndex = playerState.cards.indexOf(card)

        if (cardIndex >= 0) {
            playerState.cards.splice(cardIndex, 1)
        }

        this.#emitter.emit({
            type: "roundPlayerUseCardUpdate",
            playerId: this.#state.currentPlayerId,
            playerState,
            card,
        })
    }

    decreaseFlopThreeCounter() {
        const playerState =
            this.#state.playerStates[this.#state.currentPlayerId]

        if (playerState.flopThreeCounter <= 0) {
            return
        }

        playerState.flopThreeCounter -= 1

        this.#emitter.emit({
            type: "roundPlayerDecreaseFTCounterUpdate",
            playerId: this.#state.currentPlayerId,
            playerState,
        })
    }
}
