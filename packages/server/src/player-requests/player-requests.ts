import {
    PlayerChoiceRequest,
    PlayerRequest,
    PlayerSelectionRequest,
} from "@flop-7/protocol/snapshots"

import { RoundPlayer } from "../round-player"

export type PlayerChoiceReason = PlayerChoiceRequest["reason"]

export type PlayerSelectionReason = PlayerSelectionRequest["reason"]

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
