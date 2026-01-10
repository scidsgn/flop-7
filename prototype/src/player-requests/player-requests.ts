import { Player } from "../player"
import { RoundPlayer } from "../round-player"

export type PlayerChoiceReason =
    | "startTurnHitOrStay"
    | "firstTurnHit"
    | "flopThreeHit"

export type PlayerSelectionReason = "flopThree" | "freeze"

export type PlayerChoiceRequest = {
    id: string
    targetPlayer: Player
    reason: PlayerChoiceReason
    choices: string[]
}

export type PlayerSelectionRequest = {
    id: string
    targetPlayer: Player
    reason: PlayerSelectionReason
    players: Player[]
}

export interface PlayerRequests {
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
