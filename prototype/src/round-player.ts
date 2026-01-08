import { FlopCard, countCardScore } from "./cards"
import { BaseEvent, GameEvents } from "./game-events"
import { Player } from "./player"

type RoundPlayerState = "active" | "busted" | "frozen" | "stayed" | "won"

type RoundPlayerEventData = {
    playerId: string
    cards: FlopCard[]
    flopThreeCounter: number
    score: number
    state: "active" | "busted" | "frozen" | "stayed" | "won"
}

export type RoundPlayerEvents =
    | BaseEvent<"playerCardAdded", RoundPlayerEventData>
    | BaseEvent<"playerWon", RoundPlayerEventData>
    | BaseEvent<"playerFrozen", RoundPlayerEventData>
    | BaseEvent<"playerBusted", RoundPlayerEventData>
    | BaseEvent<"playerStayed", RoundPlayerEventData>
    | BaseEvent<"playerFlopThreeStarted", RoundPlayerEventData>
    | BaseEvent<"playerFlopThreeCounterDecreased", RoundPlayerEventData>
    | BaseEvent<"playerCardDiscared", RoundPlayerEventData & { card: FlopCard }>

export class RoundPlayer {
    #events: GameEvents

    #player: Player
    #cards: FlopCard[] = []
    #score = 0
    #state: RoundPlayerState = "active"
    #flopThreeCounter = 0

    constructor(events: GameEvents, player: Player) {
        this.#events = events
        this.#player = player
    }

    get player() {
        return this.#player
    }

    get cards() {
        return this.#cards
    }

    get score() {
        return this.#score
    }

    get state() {
        return this.#state
    }

    get flopThreeCounter() {
        return this.#flopThreeCounter
    }

    get #eventPayload(): RoundPlayerEventData {
        return {
            playerId: this.#player.id,
            cards: this.#cards,
            flopThreeCounter: this.#flopThreeCounter,
            score: this.#score,
            state: this.#state,
        }
    }

    pushCard(card: FlopCard) {
        this.#ensureActive()

        this.#cards = [...this.#cards, card]
        this.#score = countCardScore(this.#cards)

        this.#events.emit({
            type: "playerCardAdded",
            payload: this.#eventPayload,
        })
    }

    discardCard(card: FlopCard) {
        this.#ensureActive()

        this.#cards = this.#cards.filter((c) => c !== card)
        this.#score = countCardScore(this.#cards)

        this.#events.emit({
            type: "playerCardDiscarded",
            payload: { ...this.#eventPayload, card },
        })
    }

    bust() {
        this.#ensureActive()

        this.#state = "busted"
        this.#score = 0

        this.#events.emit({
            type: "playerBusted",
            payload: this.#eventPayload,
        })
    }

    freeze() {
        this.#ensureActive()

        this.#state = "frozen"

        this.#events.emit({
            type: "playerFrozen",
            payload: this.#eventPayload,
        })
    }

    stay() {
        this.#ensureActive()

        this.#state = "stayed"

        this.#events.emit({
            type: "playerStayed",
            payload: this.#eventPayload,
        })
    }

    win() {
        this.#ensureActive()

        this.#state = "won"

        this.#events.emit({
            type: "playerWon",
            payload: this.#eventPayload,
        })
    }

    bumpFlopThreeCounter() {
        this.#ensureActive()

        this.#flopThreeCounter = 3

        this.#events.emit({
            type: "playerFlopThreeStarted",
            payload: this.#eventPayload,
        })
    }

    decrementFlopThreeCounter() {
        this.#ensureActive()

        if (this.#flopThreeCounter === 0) {
            return
        }

        this.#flopThreeCounter -= 1

        this.#events.emit({
            type: "playerFlopThreeCounterDecreased",
            payload: this.#eventPayload,
        })
    }

    #ensureActive() {
        if (this.#state !== "active") {
            throw new Error(
                `Cannot make player state transitions when the player is not active.`,
            )
        }
    }
}
