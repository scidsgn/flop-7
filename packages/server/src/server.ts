import cors from "@elysiajs/cors"
import node from "@elysiajs/node"
import Elysia, { sse } from "elysia"
import { z } from "zod"

import { Room } from "./room"

const room = new Room()

new Elysia({ adapter: node() })
    .use(cors())
    .get("/info", ({ status }) => status(200))
    .post(
        "/room/connect",
        ({ body: { name }, cookie: { Secret }, status }) => {
            // TODO ask admin for permission here
            const roomPlayer = room.join(name)
            if (!roomPlayer) {
                return status(401, "")
            }

            Secret?.set({
                value: roomPlayer.secret,
                httpOnly: true,
                maxAge: 24 * 3600,
                sameSite: "none",
                secure: true,
            })

            return {
                id: roomPlayer.id,
                name: roomPlayer.name,
            }
        },
        {
            body: z.object({
                name: z.string(),
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    name: z.string(),
                }),
                401: z.string(),
            },
        },
    )
    .get("/room/events", async function* () {
        yield sse({
            event: "message",
            data: {
                type: "initSnapshot",
                payload: room.snapshot,
            },
        })

        for await (const event of room.eventStream) {
            yield sse({
                event: "message",
                data: event,
            })
        }
    })
    .post("/room/game", ({ status }) => {
        // TODO nasty
        if (room.snapshot.players.length === 0) {
            return status(400)
        }

        room.startGame()

        return status(200)
    })
    .delete("/room/game", ({ status }) => {
        // TODO nasty
        if (!room.game) {
            return status(400)
        }

        room.endGame()

        return status(200)
    })
    .get("/game/events", async function* ({ status }) {
        const game = room.game
        if (!game) {
            return status(404)
        }

        yield sse({
            event: "message",
            data: {
                type: "initSnapshot",
                payload: game.snapshot,
            },
        })

        for await (const event of game.events.asyncStream) {
            yield sse({
                event: "message",
                data: event,
            })
        }
    })
    .post(
        "/game/requests",
        ({
            body: { requestId, playerId, choice },
            cookie: { Secret },
            status,
        }) => {
            const game = room.game
            if (!game) {
                return status(404)
            }
            const playerSecret = Secret?.value
            if (!playerSecret || typeof playerSecret !== "string") {
                return status(403)
            }

            if (!room.validate(playerId, playerSecret)) {
                return status(403)
            }

            const player = game.rounds
                .at(-1)
                ?.players?.find((p) => p.player.id === playerId)
            if (!player) {
                return status(400, "what player")
            }

            game.playerRequests.fulfillRequest(requestId, player, choice)

            return status(200)
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
