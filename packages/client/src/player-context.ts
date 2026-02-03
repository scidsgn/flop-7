import { createContext, useContext } from "react"

const PlayerContext = createContext<string | null>(null)

export function useControllingPlayerId() {
    return useContext(PlayerContext)
}

export const PlayerProvider = PlayerContext.Provider
