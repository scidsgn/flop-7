import { type GameEvent, gameEventsSchema } from "@flop-7/protocol/events"

export class GameEventSource {
    #eventSource: EventSource

    constructor(url: string) {
        this.#eventSource = new EventSource(url)
    }

    addEventListener(listener: (event: GameEvent) => void) {
        this.#eventSource.addEventListener("message", (e) => {
            const result = gameEventsSchema.safeParse(JSON.parse(e.data))
            if (!result.success) {
                console.error(`Invalid data for event:`, e.data)
                return
            }

            console.info(result.data.type, result.data.payload)
            listener(result.data)
        })
    }

    close() {
        this.#eventSource.close()
    }
}
