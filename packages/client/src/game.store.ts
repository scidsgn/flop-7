import type { GameEvent } from "@flop-7/protocol/events"
import { create } from "zustand"

type GameState = {
    consumeEvent: (event: GameEvent) => void
}

export const useGame = create<GameState>()(() => ({
    players: [],
    unfulfilledRequests: [],
    rounds: [],
    summary: {
        players: [],
    },

    consumeEvent: () => {
        // TODO handle event
    },
}))
