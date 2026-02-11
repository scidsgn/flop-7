import { FlopCard } from "@flop-7/protocol/cards"

import { Game } from "./game"
import { Round } from "./round"

export interface RuleSystem {
    runRound(game: Game, round: Round): Promise<void>
    calculateScore(cards: FlopCard[]): number
}