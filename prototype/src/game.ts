import { Deck } from "./deck"
import { GameEvents } from "./game-events"
import { PlayerRequests } from "./player-requests/player-requests"
import { Round } from "./round"

type GamePlayer = {
    id: string
    name: string
}

export interface GameFlow {
    runRound(game: Game, round: Round): Promise<void>
}

export class Game {
    #players: GamePlayer[]

    #events: GameEvents
    #deck: Deck
    #rounds: Round[] = []

    #playerRequests: PlayerRequests

    constructor(
        players: GamePlayer[],
        playerRequests: PlayerRequests,
        gameEvents: GameEvents,
    ) {
        this.#players = players
        this.#playerRequests = playerRequests
        this.#events = gameEvents

        this.#deck = new Deck(this.#events)

        this.startRound()
    }

    get events() {
        return this.#events
    }

    get deck() {
        return this.#deck
    }

    get rounds() {
        return this.#rounds
    }

    get players() {
        return this.#players
    }

    get playerRequests() {
        return this.#playerRequests
    }

    startRound() {
        const round = new Round(this)
        this.#rounds.push(round)

        return round
    }
}
