import type { FlopCard } from "@flop-7/protocol/cards"
import type { GameEvent } from "@flop-7/protocol/events"
import type {
    DeckStats,
    GamePlayer,
    GameSummary,
    PlayerRequest,
    RoundSnapshot,
} from "@flop-7/protocol/snapshots"
import { create } from "zustand"

import { unreachable } from "./utils.ts"

type GameState = {
    players: GamePlayer[]
    unfulfilledRequests: PlayerRequest[]
    rounds: RoundSnapshot[]
    summary: GameSummary
    deckStats: DeckStats
    currentDeckCard: FlopCard | null

    consumeEvent: (event: GameEvent) => void
}

export const useGame = create<GameState>()((set) => ({
    players: [],
    unfulfilledRequests: [],
    rounds: [],
    summary: {
        players: [],
    },
    deckStats: {
        remainingCards: 0,
        totalCards: 0,
    },
    currentDeckCard: null,

    consumeEvent: (event) => {
        switch (event.type) {
            case "initSnapshot":
            case "gameFinished":
            case "gameRoundStarted": {
                set(event.payload)
                return
            }
            case "choiceRequested":
            case "selectionRequested": {
                set((state) => ({
                    unfulfilledRequests: [
                        ...state.unfulfilledRequests,
                        event.payload,
                    ],
                }))
                return
            }
            case "requestFulfilled": {
                set((state) => ({
                    unfulfilledRequests: state.unfulfilledRequests.filter(
                        (request) => request.id !== event.payload.requestId,
                    ),
                }))
                return
            }
            case "roundPlayerChange":
            case "roundFinish": {
                set((state) => ({
                    rounds: [...state.rounds.slice(0, -1), event.payload],
                }))
                return
            }
            case "playerCardAdded":
            case "playerCardDiscarded":
            case "playerWon":
            case "playerFrozen":
            case "playerBusted":
            case "playerStayed": {
                set((state) => ({
                    rounds: state.rounds.map((round, i) =>
                        i === state.rounds.length - 1
                            ? {
                                  ...round,
                                  players: round.players.map((player) =>
                                      player.playerId === event.payload.playerId
                                          ? event.payload
                                          : player,
                                  ),
                              }
                            : round,
                    ),
                    currentDeckCard: null,
                }))
                return
            }
            case "playerFlopThreeStarted":
            case "playerFlopThreeCounterDecreased": {
                set((state) => ({
                    rounds: state.rounds.map((round, i) =>
                        i === state.rounds.length - 1
                            ? {
                                  ...round,
                                  players: round.players.map((player) =>
                                      player.playerId === event.payload.playerId
                                          ? event.payload
                                          : player,
                                  ),
                              }
                            : round,
                    ),
                }))
                return
            }
            case "deckCardGrabbed": {
                set({
                    deckStats: event.payload,
                    currentDeckCard: event.payload.card,
                })
                return
            }
            default:
                unreachable(event)
        }
    },
}))
