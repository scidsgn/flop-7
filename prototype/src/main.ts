import { Game } from "./game"
import { GameEvents } from "./game-events"
import { GameRoundFlow } from "./game-round-flow"
import { CliPlayerRequests } from "./player-requests/cli-player-requests"

const events = new GameEvents()
const playerRequests = new CliPlayerRequests(events)
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

game.events.asyncStream.forEach((update) =>
    console.log(`${JSON.stringify(update, null, 2)}\n`),
)

const round = game.startRound()

const main = async () => {
    const flow = new GameRoundFlow()

    await flow.runRound(game, round)

    playerRequests.close()
}

main()
