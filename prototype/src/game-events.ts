import { Emitter } from "@scidsgn/std"

import { FlopCard } from "./cards"
import { PlayerChoiceRequest, PlayerSelectionRequest } from "./player-requests"

export type BaseEvent<TType extends string, TPayload> = {
    type: TType
    payload: TPayload
}

type RoundPlayerEventData = {
    playerId: string
    cards: FlopCard[]
    flopThreeCounter: number
    score: number
    state: "active" | "busted" | "frozen" | "stayed" | "won"
}

type RoundPlayerEvents =
    | BaseEvent<"playerCardAdded", RoundPlayerEventData>
    | BaseEvent<"playerWon", RoundPlayerEventData>
    | BaseEvent<"playerFrozen", RoundPlayerEventData>
    | BaseEvent<"playerBusted", RoundPlayerEventData>
    | BaseEvent<"playerStayed", RoundPlayerEventData>
    | BaseEvent<"playerFlopThreeStarted", RoundPlayerEventData>
    | BaseEvent<"playerFlopThreeCounterDecreased", RoundPlayerEventData>
    | BaseEvent<
          "playerCardDiscarded",
          RoundPlayerEventData & { card: FlopCard }
      >

type RoundEvents = BaseEvent<"roundPlayerChange", { playerId: string }>

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
