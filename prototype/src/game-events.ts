import { Emitter } from "@scidsgn/std"
import { z } from "zod"

import { gameEventsSchema } from "./schemas/events"

type GameEvent = z.infer<typeof gameEventsSchema>

export class GameEvents {
    #emitter = new Emitter<GameEvent>()

    get asyncStream() {
        return this.#emitter.asyncStream()
    }

    emit(event: GameEvent) {
        this.#emitter.emit(event)
    }
}
