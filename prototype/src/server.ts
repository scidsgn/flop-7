import node from "@elysiajs/node"
import openapi from "@elysiajs/openapi"
import Elysia, { sse } from "elysia"
import { z } from "zod"

import { Game } from "./game"
import { GameEvents } from "./game-events"
import { GameRoundFlow } from "./game-round-flow"
import { ServerPlayerRequests } from "./player-requests/server-player-requests"
import { flopCardSchema } from "./schemas/cards"
import { gameEventsSchema } from "./schemas/events"
import {
    gamePlayerSchema,
    gameSnapshotSchema,
    gameSummarySchema,
    playerChoiceRequestSchema,
    playerRequestSchema,
    playerSelectionRequestSchema,
    roundPlayerSnapshotSchema,
    roundSnapshotSchema,
} from "./schemas/snapshots"

const events = new GameEvents()
const playerRequests = new ServerPlayerRequests(events)
const game = new Game(
    [
        {
            id: "p1",
            name: "GLaDOS",
        },
        {
            id: "p2",
            name: "Gordon Freeman",
        },
    ],
    playerRequests,
    events,
    new GameRoundFlow(),
)

game.startRound()

new Elysia({ adapter: node() })
    .use(
        openapi({
            documentation: {
                info: {
                    title: "Flop 7 Server Documentation",
                    version: "0.1.0",
                },
            },
            mapJsonSchema: {
                zod: z.toJSONSchema,
            },
        }),
    )
    .model({
        FlopCard: flopCardSchema,
        RoundPlayerSnapshot: roundPlayerSnapshotSchema,
        RoundSnapshot: roundSnapshotSchema,
        GamePlayer: gamePlayerSchema,
        PlayerChoiceRequest: playerChoiceRequestSchema,
        PlayerSelectionRequest: playerSelectionRequestSchema,
        PlayerRequest: playerRequestSchema,
        GameSummary: gameSummarySchema,
        GameSnapshot: gameSnapshotSchema,
        GameEvent: gameEventsSchema,
    })
    .get(
        "/game/events",
        async function* () {
            yield sse({
                event: "initSnapshot",
                data: game.snapshot,
            })

            for await (const event of game.events.asyncStream) {
                yield sse({
                    event: event.type,
                    data: event.payload,
                })
            }
        },
        {
            body: gameEventsSchema,
        },
    )
    .post(
        "/game/requests",
        ({ body, status }) => {
            const player = game.rounds
                .at(-1)
                ?.players?.find((p) => p.player.id === body.playerId)
            if (!player) {
                return status(400, "what player")
            }

            playerRequests.fulfillRequest(body.requestId, player, body.choice)

            return "ok"
        },
        {
            body: z.object({
                requestId: z.string(),
                playerId: z.string(),
                choice: z.string(),
            }),
        },
    )
    .listen(3000)
