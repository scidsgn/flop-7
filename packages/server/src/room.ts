import { RoomEvent } from "@flop-7/protocol/events"
import { RoomSnapshot } from "@flop-7/protocol/snapshots"
import { Emitter } from "@scidsgn/std"

import { Game } from "./game"
import { GameEvents } from "./game-events"
import { ServerPlayerRequests } from "./player-requests/server-player-requests"
import { RuleSystem } from "./rule-system"


type RoomPlayer = {
    id: string
    name: string
    secret: string
}

export class Room {
    #emitter = new Emitter<RoomEvent>()

    #players: RoomPlayer[] = []
    #game: Game | null = null

    get eventStream() {
        return this.#emitter.asyncStream()
    }

    get isOpen() {
        return this.#game === null
    }

    get game() {
        return this.#game
    }

    get snapshot(): RoomSnapshot {
        return {
            players: this.#players.map(({ id, name }) => ({ id, name })),
            hasGame: this.#game !== null,
        }
    }

    join(name: string) {
        if (!this.isOpen) {
            return null
        }

        const player = {
            id: crypto.randomUUID(),
            name,
            secret: crypto.randomUUID(),
        }
        this.#players.push(player)

        this.#emitter.emit({
            type: "playerJoined",
            payload: { id: player.id, name },
        })

        return player
    }

    validate(id: string, secret: string) {
        return (
            this.#players.find(
                (player) => player.id === id && player.secret === secret,
            ) !== undefined
        )
    }

    startGame(ruleSystem: RuleSystem) {
        const events = new GameEvents()
        const playerRequests = new ServerPlayerRequests(events)
        const game = new Game(
            this.#players.map(({ id, name }) => ({ id, name })),
            playerRequests,
            events,
            ruleSystem,
        )

        this.#game = game

        this.#emitter.emit({
            type: "gameStarted",
            payload: game.snapshot,
        })
    }

    endGame() {
        if (!this.#game) {
            return
        }

        this.#emitter.emit({
            type: "gameEnded",
            payload: this.#game.snapshot,
        })
        this.#game = null
    }
}
