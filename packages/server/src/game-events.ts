import { gameEventsSchema } from "@flop-7/protocol/events"
import { Subject } from "rxjs"
import { eachValueFrom } from "rxjs-for-await"
import { z } from "zod"

type GameEvent = z.infer<typeof gameEventsSchema>

export class GameEvents {
    #subject = new Subject<GameEvent>()

    get asyncStream() {
        return eachValueFrom(this.#subject)
    }

    emit(event: GameEvent) {
        this.#subject.next(event)
    }
}
