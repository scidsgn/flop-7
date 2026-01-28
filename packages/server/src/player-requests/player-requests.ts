import { GamePlayer } from "@flop-7/protocol/snapshots"

import { RoundPlayer } from "../round-player"

export type PlayerChoiceReason =
    | "startTurnHitOrStay"
    | "firstTurnHit"
    | "flopThreeHit"

export type PlayerSelectionReason = "flopThree" | "freeze"

export type PlayerChoiceRequest = {
    id: string
    type: "choice"
    targetPlayer: GamePlayer
    reason: PlayerChoiceReason
    choices: string[]
}

export type PlayerSelectionRequest = {
    id: string
    type: "playerSelection"
    targetPlayer: GamePlayer
    reason: PlayerSelectionReason
    players: GamePlayer[]
}

export type PlayerRequest = PlayerChoiceRequest | PlayerSelectionRequest

export interface PlayerRequests {
    unfulfilledRequests: PlayerRequest[]

    requestChoice<T extends string>(
        targetPlayer: RoundPlayer,
        reason: PlayerChoiceReason,
        choices: T[],
    ): Promise<T>

    requestPlayerSelection(
        targetPlayer: RoundPlayer,
        reason: PlayerSelectionReason,
        players: RoundPlayer[],
    ): Promise<RoundPlayer>
}
