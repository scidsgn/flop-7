import crypto from "node:crypto"

import { GameEvents } from "../game-events"
import { RoundPlayer } from "../round-player"
import {
    PlayerChoiceReason,
    PlayerRequest,
    PlayerRequests,
    PlayerSelectionReason,
} from "./player-requests"

type WaitingRequest = {
    request: PlayerRequest
    resolver: (v: string) => void
}

export class ServerPlayerRequests implements PlayerRequests {
    #waitingRequests: WaitingRequest[] = []

    #events: GameEvents

    constructor(events: GameEvents) {
        this.#events = events
    }

    get unfulfilledRequests() {
        return this.#waitingRequests.map((r) => r.request)
    }

    requestChoice<T extends string>(
        targetPlayer: RoundPlayer,
        reason: PlayerChoiceReason,
        choices: T[],
    ): Promise<T> {
        const request: PlayerRequest = {
            id: crypto.randomUUID(),
            type: "choice",
            targetPlayer: targetPlayer.player,
            reason,
            choices,
        }

        this.#events.emit({
            type: "choiceRequested",
            payload: request,
        })

        return new Promise<T>((resolve, reject) => {
            const resolver = (v: string) => {
                if (!choices.includes(v as T)) {
                    throw new Error("Invalid choice")
                }

                resolve(v as T)
            }

            this.#waitingRequests.push({
                request,
                resolver,
            })
        })
    }

    requestPlayerSelection(
        targetPlayer: RoundPlayer,
        reason: PlayerSelectionReason,
        players: RoundPlayer[],
    ): Promise<RoundPlayer> {
        const request: PlayerRequest = {
            id: crypto.randomUUID(),
            type: "playerSelection",
            targetPlayer: targetPlayer.player,
            reason,
            players: players.map((p) => p.player),
        }

        this.#events.emit({
            type: "selectionRequested",
            payload: request,
        })

        return new Promise<RoundPlayer>((resolve, reject) => {
            const resolver = (v: string) => {
                const chosenPlayer = players.find((p) => p.player.id === v)
                if (!chosenPlayer) {
                    throw new Error("Invalid choice")
                }

                resolve(chosenPlayer)
            }

            this.#waitingRequests.push({
                request,
                resolver,
            })
        })
    }

    fulfillRequest(
        requestId: string,
        targetPlayer: RoundPlayer,
        value: string,
    ) {
        const request = this.#waitingRequests.find(
            (r) => r.request.id === requestId,
        )
        if (!request) {
            throw new Error(`Request with id ${requestId} not found`)
        }

        if (request.request.targetPlayer.id !== targetPlayer.player.id) {
            throw new Error(`Request with id ${requestId} sent by wrong player`)
        }

        request.resolver(value)
    }
}
