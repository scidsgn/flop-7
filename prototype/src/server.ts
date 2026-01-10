import node from "@elysiajs/node"
import Elysia, { sse } from "elysia"
import { z } from "zod"

import { Game } from "./game"
import { GameEvents } from "./game-events"
import { GameRoundFlow } from "./game-round-flow"
import { ServerPlayerRequests } from "./player-requests/server-player-requests"

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
)

const flow = new GameRoundFlow()
flow.runRound(game, game.startRound())

new Elysia({ adapter: node() })
    .get("/game", () => game.snapshot)
    .get("/game/events", async function* () {
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
    })
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
