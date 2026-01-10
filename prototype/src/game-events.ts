import { Emitter } from "@scidsgn/std"

import { FlopCard } from "./cards"
import {
    PlayerChoiceRequest,
    PlayerSelectionRequest,
} from "./player-requests/player-requests"
import { RoundSnapshot } from "./round"
import { RoundPlayerSnapshot } from "./round-player"

export type BaseEvent<TType extends string, TPayload> = {
    type: TType
    payload: TPayload
}

type RoundPlayerEvents =
    | BaseEvent<"playerCardAdded", RoundPlayerSnapshot>
    | BaseEvent<"playerWon", RoundPlayerSnapshot>
    | BaseEvent<"playerFrozen", RoundPlayerSnapshot>
    | BaseEvent<"playerBusted", RoundPlayerSnapshot>
    | BaseEvent<"playerStayed", RoundPlayerSnapshot>
    | BaseEvent<"playerFlopThreeStarted", RoundPlayerSnapshot>
    | BaseEvent<"playerFlopThreeCounterDecreased", RoundPlayerSnapshot>
    | BaseEvent<"playerCardDiscarded", RoundPlayerSnapshot & { card: FlopCard }>

type RoundEvents =
    | BaseEvent<"roundPlayerChange", RoundSnapshot>
    | BaseEvent<"roundFinish", RoundSnapshot>

type DeckEvents = BaseEvent<
    "deckCardGrabbed",
    {
        remainingCards: number
        totalCards: number
        card: FlopCard
    }
>

type PlayerRequestEvents =
    | BaseEvent<"choiceRequested", PlayerChoiceRequest>
    | BaseEvent<"selectionRequested", PlayerSelectionRequest>

type GameEvent =
    | RoundPlayerEvents
    | RoundEvents
    | DeckEvents
    | PlayerRequestEvents

export class GameEvents {
    #emitter = new Emitter<GameEvent>()

    get asyncStream() {
        return this.#emitter.asyncStream()
    }

    emit(event: GameEvent) {
        this.#emitter.emit(event)
    }
}
