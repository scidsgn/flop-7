import { create } from "zustand/react"

import type { GameEvent } from "./api"

type StoreValue = {
    // TODO game stuff

    consumeEvent: (event: GameEvent) => void
}

export const useStore = create<StoreValue>()(() => ({
    consumeEvent: () => {},
}))
