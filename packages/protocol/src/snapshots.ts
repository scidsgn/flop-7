import { z } from "zod"

import { flopCardSchema } from "./cards"

export const roundPlayerSnapshotSchema = z
    .object({
        playerId: z.string(),
        cards: z.array(flopCardSchema),
        flopThreeCounter: z.number(),
        score: z.number(),
        state: z.enum(["active", "busted", "frozen", "stayed", "won"]),
    })
    .meta({ title: "RoundPlayerSnapshot" })

export type RoundPlayerSnapshot = z.infer<typeof roundPlayerSnapshotSchema>

export const roundSnapshotSchema = z
    .object({
        state: z.enum(["started", "finished"]),
        players: z.array(roundPlayerSnapshotSchema),
        currentPlayerId: z.string(),
    })
    .meta({ title: "RoundSnapshot" })

export type RoundSnapshot = z.infer<typeof roundSnapshotSchema>

export const gamePlayerSchema = z
    .object({
        id: z.string(),
        name: z.string(),
    })
    .meta({ title: "GamePlayer" })

export type GamePlayer = z.infer<typeof gamePlayerSchema>

export const playerChoiceRequestSchema = z
    .object({
        id: z.string(),
        type: z.literal("choice"),
        targetPlayer: gamePlayerSchema,
        reason: z.enum(["startTurnHitOrStay", "firstTurnHit", "flopThreeHit"]),
        choices: z.array(z.string()),
    })
    .meta({ title: "PlayerChoiceRequest" })

export type PlayerChoiceRequest = z.infer<typeof playerChoiceRequestSchema>

export const playerSelectionRequestSchema = z
    .object({
        id: z.string(),
        type: z.literal("playerSelection"),
        targetPlayer: gamePlayerSchema,
        reason: z.enum(["flopThree", "freeze"]),
        players: z.array(gamePlayerSchema),
    })
    .meta({ title: "PlayerSelectionRequest" })

export type PlayerSelectionRequest = z.infer<
    typeof playerSelectionRequestSchema
>

export const playerRequestSchema = z
    .discriminatedUnion("type", [
        playerChoiceRequestSchema,
        playerSelectionRequestSchema,
    ])
    .meta({ title: "PlayerRequest" })

export type PlayerRequest = z.infer<typeof playerRequestSchema>

export const gameSummarySchema = z
    .object({
        players: z.array(
            z.object({
                playerId: z.string(),
                totalScore: z.number(),
            }),
        ),
    })
    .meta({ title: "GameSummary" })

export type GameSummary = z.infer<typeof gameSummarySchema>

export const deckStatsSchema = z.object({
    remainingCards: z.number(),
    totalCards: z.number(),
})

export type DeckStats = z.infer<typeof deckStatsSchema>

export const gameSnapshotSchema = z
    .object({
        players: z.array(gamePlayerSchema),
        unfulfilledRequests: z.array(playerRequestSchema),
        rounds: z.array(roundSnapshotSchema),
        summary: gameSummarySchema,
        deckStats: deckStatsSchema,
    })
    .meta({ title: "GameSnapshot" })

export type GameSnapshot = z.infer<typeof gameSnapshotSchema>
