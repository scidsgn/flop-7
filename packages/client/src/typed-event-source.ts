import type { ZodType } from "zod"

export class TypedEventSource<T extends { type: string; payload: unknown }> {
    #schema: ZodType<T>
    #eventSource: EventSource

    constructor(url: string, schema: ZodType<T>) {
        this.#schema = schema
        this.#eventSource = new EventSource(url)
    }

    addEventListener(listener: (event: T) => void) {
        this.#eventSource.addEventListener("message", (e) => {
            const result = this.#schema.safeParse(JSON.parse(e.data))
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
