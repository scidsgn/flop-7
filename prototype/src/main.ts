import { Game } from "./game"
import { GameRoundFlow } from "./game-round-flow"
import { PlayerDecisionsManager } from "./player-decisions/player-decisions-manager"

const playerDecisions = new PlayerDecisionsManager()
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
    playerDecisions,
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

    playerDecisions.close()
}

main()
