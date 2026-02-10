import { useGame } from "../game.store.ts"

export function useControllingPlayerId() {
    return useGame((state) => state.currentPlayer?.id ?? null)
}
