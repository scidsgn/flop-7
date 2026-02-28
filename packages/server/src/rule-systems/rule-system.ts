import { FlopCard } from "@flop-7/protocol/cards"
import { RuleSystemInfo } from "@flop-7/protocol/responses"

import { Game } from "../game"
import { Round } from "../round"

export interface RuleSystem {
    info: RuleSystemInfo
    deck: FlopCard[]

    runRound(game: Game, round: Round): Promise<void>
    calculateScore(cards: FlopCard[]): number
}
