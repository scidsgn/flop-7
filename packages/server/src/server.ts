import cors from "@elysiajs/cors"
import node from "@elysiajs/node"
import { GameEvent, RoomEvent } from "@flop-7/protocol/events"
import Elysia, { file, sse } from "elysia"
import { isAbsolute, join, relative, resolve } from "node:path"
import { z } from "zod"

import { Room } from "./room"

const room = new Room()

new Elysia({ adapter: node() })
    .use(cors())
    .get("/info", ({ status }) => status(200))
    .get("/assets/*", ({ params, status }) => {
        const rootPath = join(__dirname, "../assets")
        const assetPath = params["*"]
        const fullAssetPath = resolve(rootPath, assetPath)

        const relativePath = relative(rootPath, fullAssetPath)
        if (relativePath.startsWith("..") || isAbsolute(relativePath)) {
            return status(404)
        }

        return file(fullAssetPath)
    })
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
            } satisfies RoomEvent,
        })

        for await (const event of room.eventStream) {
            yield sse({
                event: "message",
                data: event satisfies RoomEvent,
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
                payload: {
                    ...game.snapshot,
                    ruleSystem: game.ruleSystem.info,
                },
            } satisfies GameEvent,
        })

        for await (const event of game.events.asyncStream) {
            yield sse({
                event: "message",
                data: event satisfies GameEvent,
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
