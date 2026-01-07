import { Game } from "./game"
import { GameRoundFlow } from "./game-round-flow"
import { PlayerRequests } from "./player-requests"

const playerRequests = new PlayerRequests()
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
)

game.deck.updateStream.forEach((update) =>
    console.log(`DECK: ${JSON.stringify(update, null, 2)}\n`),
)

const round = game.startRound()
round.updateStream.forEach((update) =>
    console.log(`BOARD: ${JSON.stringify(update, null, 2)}\n`),
)

const main = async () => {
    const flow = new GameRoundFlow(game, round)

    await flow.startTurn()

    playerRequests.close()
}

main()
