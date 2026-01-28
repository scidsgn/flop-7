import { gameEventsSchema } from "@flop-7/protocol/events"
import { Emitter } from "@scidsgn/std"
import { z } from "zod"

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
