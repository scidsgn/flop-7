import type { FlopCard } from "@flop-7/protocol/cards"
import type { GameEvent, RoomEvent } from "@flop-7/protocol/events"
import type {
    DeckStats,
    GamePlayer,
    GameSummary,
    PlayerRequest,
    RoundSnapshot,
    RuleSystemInfo,
} from "@flop-7/protocol/snapshots"
import { create } from "zustand"

type GameState = {
    serverUrl: string | null

    room: {
        players: GamePlayer[]
        hasGame: boolean
    } | null
    currentPlayer: GamePlayer | null

    game: {
        ruleSystem: RuleSystemInfo
        players: GamePlayer[]
        unfulfilledRequests: PlayerRequest[]
        rounds: RoundSnapshot[]
        summary: GameSummary
        deckStats: DeckStats
        currentDeckCard: FlopCard | null
    } | null

    consumeRoomEvent: (event: RoomEvent) => void
    setCurrentPlayer: (player: GamePlayer) => void
    consumeGameEvent: (event: GameEvent) => void
    setServerUrl: (url: string) => void
}

export const useGame = create<GameState>()((set, get) => ({
    serverUrl: null,

    room: null,
    currentPlayer: null,
    game: null,

    consumeRoomEvent: (event) => {
        if (event.type === "initSnapshot") {
            set({
                room: event.payload,
            })
            return
        }

        const room = get().room
        if (!room) {
            return
        }

        switch (event.type) {
            case "playerJoined": {
                set({
                    room: {
                        ...room,
                        players: [...room.players, event.payload],
                    },
                })
                return
            }
            case "playerLeft": {
                set({
                    room: {
                        ...room,
                        players: room.players.filter(
                            (player) => player.id !== event.payload.id,
                        ),
                    },
                })
                return
            }
            case "gameStarted": {
                set({
                    room: {
                        ...room,
                        hasGame: true,
                    },
                })
                return
            }
            case "gameEnded": {
                set({
                    room: {
                        ...room,
                        hasGame: false,
                    },
                })
                return
            }
            default:
                unreachable(event)
        }
    },

    setCurrentPlayer: (player) => set({ currentPlayer: player }),

    consumeGameEvent: (event) => {
        if (event.type === "initSnapshot") {
            set({
                game: {
                    ...event.payload,
                    currentDeckCard: null,
                },
            })
            return
        }

        const game = get().game
        if (!game) {
            return
        }

        switch (event.type) {
            case "gameFinished":
            case "gameRoundStarted": {
                set({
                    game: {
                        ...game,
                        ...event.payload,
                    },
                })
                return
            }
            case "choiceRequested":
            case "selectionRequested": {
                set({
                    game: {
                        ...game,
                        unfulfilledRequests: [
                            ...game.unfulfilledRequests,
                            event.payload,
                        ],
                    },
                })
                return
            }
            case "requestFulfilled": {
                set({
                    game: {
                        ...game,
                        unfulfilledRequests: game.unfulfilledRequests.filter(
                            (request) => request.id !== event.payload.requestId,
                        ),
                    },
                })
                return
            }
            case "roundPlayerChange":
            case "roundFinish": {
                set({
                    game: {
                        ...game,
                        rounds: [...game.rounds.slice(0, -1), event.payload],
                    },
                })
                return
            }
            case "playerCardAdded":
            case "playerCardDiscarded":
            case "playerWon":
            case "playerFrozen":
            case "playerBusted":
            case "playerStayed": {
                set({
                    game: {
                        ...game,
                        rounds: game.rounds.map((round, i) =>
                            i === game.rounds.length - 1
                                ? {
                                      ...round,
                                      players: round.players.map((player) =>
                                          player.playerId ===
                                          event.payload.playerId
                                              ? event.payload
                                              : player,
                                      ),
                                  }
                                : round,
                        ),
                        currentDeckCard: null,
                    },
                })
                return
            }
            case "playerFlopThreeStarted":
            case "playerFlopThreeCounterDecreased": {
                set({
                    game: {
                        ...game,
                        rounds: game.rounds.map((round, i) =>
                            i === game.rounds.length - 1
                                ? {
                                      ...round,
                                      players: round.players.map((player) =>
                                          player.playerId ===
                                          event.payload.playerId
                                              ? event.payload
                                              : player,
                                      ),
                                  }
                                : round,
                        ),
                    },
                })
                return
            }
            case "deckCardGrabbed": {
                set({
                    game: {
                        ...game,
                        deckStats: event.payload,
                        currentDeckCard: event.payload.card,
                    },
                })
                return
            }
            default:
                unreachable(event)
        }
    },

    setServerUrl: (url) => set({ serverUrl: url }),
}))

function unreachable(value: never) {
    throw new Error(`Value not handled: ${value}`)
}
