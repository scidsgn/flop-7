import { z } from "zod"

import { flopCardSchema } from "./cards"
import {
    gameSnapshotSchema,
    playerChoiceRequestSchema,
    playerSelectionRequestSchema,
    roundPlayerSnapshotSchema,
    roundSnapshotSchema,
} from "./snapshots"

function eventSchema<T>(type: string, payload: z.ZodType<T>) {
    return z
        .object({
            type: z.literal(type),
            payload,
        })
        .meta({
            title: `${type.slice(0, 1).toUpperCase()}${type.slice(1)}Event`,
        })
}

export const gameEventsSchema = z
    .discriminatedUnion("type", [
        // Player events
        eventSchema("playerCardAdded", roundPlayerSnapshotSchema),
        eventSchema("playerWon", roundPlayerSnapshotSchema),
        eventSchema("playerFrozen", roundPlayerSnapshotSchema),
        eventSchema("playerBusted", roundPlayerSnapshotSchema),
        eventSchema("playerStayed", roundPlayerSnapshotSchema),
        eventSchema("playerFlopThreeStarted", roundPlayerSnapshotSchema),
        eventSchema(
            "playerFlopThreeCounterDecreased",
            roundPlayerSnapshotSchema,
        ),
        eventSchema(
            "playerCardDiscarded",
            roundPlayerSnapshotSchema.extend({
                card: flopCardSchema,
            }),
        ),
        // Round events
        eventSchema("roundPlayerChange", roundSnapshotSchema),
        eventSchema("roundFinish", roundSnapshotSchema),
        // Deck events
        eventSchema(
            "deckCardGrabbed",
            z.object({
                remainingCards: z.number(),
                totalCards: z.number(),
                card: flopCardSchema,
            }),
        ),
        // Player request events
        eventSchema("choiceRequested", playerChoiceRequestSchema),
        eventSchema("selectionRequested", playerSelectionRequestSchema),
        // Game events
        eventSchema("gameRoundStarted", gameSnapshotSchema),
        eventSchema("gameFinished", gameSnapshotSchema),
        eventSchema("initSnapshot", gameSnapshotSchema),
    ])
    .meta({ title: "GameEvent" })
