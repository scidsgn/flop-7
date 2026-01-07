import { Deck } from "./deck"
import { PlayerDecisionsManager } from "./player-decisions/player-decisions-manager"
import { Round } from "./round"

type GamePlayer = {
    id: string
    name: string
}

export class Game {
    #players: GamePlayer[]

    #deck: Deck = new Deck()
    #rounds: Round[] = []

    #playerDecisions: PlayerDecisionsManager

    constructor(
        players: GamePlayer[],
        playerDecisions: PlayerDecisionsManager,
    ) {
        this.#players = players
        this.#playerDecisions = playerDecisions

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

    get playerDecisions() {
        return this.#playerDecisions
    }

    startRound() {
        const round = new Round({
            playerStates: Object.fromEntries(
                this.#players.map((player) => [
                    player.id,
                    {
                        cards: [],
                        flopThreeCounter: 0,
                        score: 0,
                        state: "active",
                    },
                ]),
            ),
            currentPlayerId: this.#players[0].id, // TODO ew
            playerOrder: this.#players.map((player) => player.id),
            flopThreePlayerQueue: [],
        })
        this.#rounds.push(round)

        return round
    }
}
