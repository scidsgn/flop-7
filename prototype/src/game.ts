import { Deck } from "./deck"
import { GameEvents } from "./game-events"
import { PlayerRequests } from "./player-requests"
import { Round } from "./round"

type GamePlayer = {
    id: string
    name: string
}

export class Game {
    #players: GamePlayer[]

    #events = new GameEvents()

    #deck: Deck = new Deck(this.#events)
    #rounds: Round[] = []

    #playerRequests = new PlayerRequests(this.#events)

    constructor(players: GamePlayer[]) {
        this.#players = players

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
