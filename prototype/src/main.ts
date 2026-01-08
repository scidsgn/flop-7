import { Game } from "./game"
import { GameRoundFlow } from "./game-round-flow"

const game = new Game([
    {
        id: "p1",
        name: "GLaDOS",
    },
    {
        id: "p2",
        name: "Gordon Freeman",
    },
])

game.events.asyncStream.forEach((update) =>
    console.log(`${JSON.stringify(update, null, 2)}\n`),
)

const round = game.startRound()

const main = async () => {
    const flow = new GameRoundFlow(game, round)

    await flow.startTurn()

    game.playerRequests.close()
}

main()
