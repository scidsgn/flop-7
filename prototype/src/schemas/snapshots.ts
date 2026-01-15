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

export const roundSnapshotSchema = z
    .object({
        state: z.enum(["started", "finished"]),
        players: z.array(roundPlayerSnapshotSchema),
        currentPlayerId: z.string(),
    })
    .meta({ title: "RoundSnapshot" })

export const gamePlayerSchema = z
    .object({
        id: z.string(),
        name: z.string(),
    })
    .meta({ title: "GamePlayer" })

export const playerChoiceRequestSchema = z
    .object({
        id: z.string(),
        type: z.literal("choice"),
        targetPlayer: gamePlayerSchema,
        reason: z.enum(["startTurnHitOrStay", "firstTurnHit", "flopThreeHit"]),
        choices: z.array(z.string()),
    })
    .meta({ title: "PlayerChoiceRequest" })

export const playerSelectionRequestSchema = z
    .object({
        id: z.string(),
        type: z.literal("playerSelection"),
        targetPlayer: gamePlayerSchema,
        reason: z.enum(["flopThree", "freeze"]),
        players: z.array(gamePlayerSchema),
    })
    .meta({ title: "PlayerSelectionRequest" })

export const playerRequestSchema = z
    .discriminatedUnion("type", [
        playerChoiceRequestSchema,
        playerSelectionRequestSchema,
    ])
    .meta({ title: "PlayerRequest" })

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

export const gameSnapshotSchema = z
    .object({
        players: z.array(gamePlayerSchema),
        unfulfilledRequests: z.array(playerRequestSchema),
        rounds: z.array(roundSnapshotSchema),
        summary: gameSummarySchema,
    })
    .meta({ title: "GameSnapshot" })
