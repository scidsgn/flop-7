import { Deck } from "./deck"
import { PlayerRequests } from "./player-requests"
import { Round } from "./round"

type GamePlayer = {
    id: string
    name: string
}

export class Game {
    #players: GamePlayer[]

    #deck: Deck = new Deck()
    #rounds: Round[] = []

    #playerRequests = new PlayerRequests()

    constructor(players: GamePlayer[], playerRequests: PlayerRequests) {
        this.#players = players
        this.#playerRequests = playerRequests

        this.startRound()
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
