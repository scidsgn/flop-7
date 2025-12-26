import { z } from "zod"

import { playerSchema } from "../player"

// HIT OR STAY? //

export const hitOrStayDecisionSchema = z.object({
    type: z.literal("hit_or_stay"),
})

export type HitOrStayDecision = z.infer<typeof hitOrStayDecisionSchema>

export const hitOrStayDecisionResponseSchema = z.object({
    type: z.literal("hit_or_stay_repsonse"),
    decision: z.union([z.literal("hit"), z.literal("stay")]),
})

export type HitOrStayDecisionResponse = z.infer<
    typeof hitOrStayDecisionResponseSchema
>

// FREEZE //

export const freezePlayerDecisionSchema = z.object({
    type: z.literal("freeze_player"),
    players: z.array(playerSchema),
})

export type FreezePlayerDecision = z.infer<typeof freezePlayerDecisionSchema>

export const freezePlayerResponseSchema = z.object({
    type: z.literal("freeze_player_response"),
    selectedPlayerId: z.string(),
})

export type FreezePlayerResponse = z.infer<typeof freezePlayerResponseSchema>

// FLOP 3 - select player //

export const flop3PlayerDecisionSchema = z.object({
    type: z.literal("flop_3_player"),
    players: z.array(playerSchema),
})

export type Flop3PlayerDecision = z.infer<typeof flop3PlayerDecisionSchema>

export const flop3PlayerResponseSchema = z.object({
    type: z.literal("flop_3_player_response"),
    selectedPlayerId: z.string(),
})

export type Flop3PlayerResponse = z.infer<typeof flop3PlayerResponseSchema>

// FLOP 3 - hit //

export const flop3HitDecisionSchema = z.object({
    type: z.literal("flop_3_hit"),
    hitsRemaining: z.number(),
})

export type Flop3HitDecision = z.infer<typeof flop3HitDecisionSchema>

export const flop3HitDecisionResponseSchema = z.object({
    type: z.literal("flop_3_hit_response"),
    hit: z.literal(true),
})

export type Flop3HitDecisionResponse = z.infer<
    typeof flop3HitDecisionResponseSchema
>
