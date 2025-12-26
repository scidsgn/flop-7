import { FlopCard, FlopNumberCard, countCardScore, printCards } from "./cards"
import { Deck, fullDeckSize } from "./deck"
import { Player } from "./player"
import { closeReadline, question } from "./question"

type GamePlayer = {
    player: Player
    cards: FlopCard[]
    flopThreeCounter: number
    scoreSoFar: number
    state: "active" | "busted" | "frozen" | "stayed" | "won"
}

const players: GamePlayer[] = [
    {
        player: {
            id: "p1",
            name: "gordon freeman",
        },
        cards: [],
        flopThreeCounter: 0,
        scoreSoFar: 0,
        state: "active",
    },
    {
        player: {
            id: "p2",
            name: "glados",
        },
        cards: [],
        flopThreeCounter: 0,
        scoreSoFar: 0,
        state: "active",
    },
    {
        player: {
            id: "p3",
            name: "option 3",
        },
        cards: [],
        flopThreeCounter: 0,
        scoreSoFar: 0,
        state: "active",
    },
]
let currentPlayerIndex = 0
const flopThreePlayerIndexQueue: number[] = []

const deck = new Deck()

function summarizeRound() {
    console.log(`\n====================================================\n`)

    for (const player of players) {
        const points =
            player.state === "busted" ? 0 : countCardScore(player.cards)

        console.log(`${player.player.name}: ${points} pts`)
    }

    console.log(
        "\nthank you for participating in this aperture science computer-aided enrichment activity",
    )
}

async function addToHand(card: FlopCard) {
    const player = players[currentPlayerIndex]
    player.cards.push(card)
    console.log(`Card added to hand (${countCardScore(player.cards)} pts):`)
    printCards(player.cards)

    const numberCardsCount = player.cards.filter(
        (c) => c.type === "number",
    ).length
    if (numberCardsCount >= 7) {
        player.state = "won"
        console.log(`${player.player.name} flopped 7!`)

        summarizeRound()
        return
    }

    if (player.flopThreeCounter > 0) {
        await hitMoreDuringFlop3()
        return
    }

    await performRemainingActions()
}

async function performRemainingActions() {
    const player = players[currentPlayerIndex]

    const actionCards = player.cards.filter(
        (c) => c.type === "freeze" || c.type === "flopThree",
    )
    if (actionCards.length > 0) {
        const actionCard = actionCards[0]
        player.cards = player.cards.filter((c) => c !== actionCard)
        console.log(`You have an action card ${actionCard.type}`)

        if (actionCard.type === "freeze") {
            await freeze()
        } else {
            await flopThree()
        }

        return
    }

    await goToNextPlayerIsh()
}

async function goToNextPlayerIsh() {
    console.log("next player i guess")

    const countActivePlayers = players.filter(
        (p) => p.state === "active",
    ).length
    if (countActivePlayers === 0) {
        console.log("No active players remaining in game, round over")
        summarizeRound()
        return
    }

    while (flopThreePlayerIndexQueue.length > 0) {
        const index = flopThreePlayerIndexQueue.shift()
        if (index === undefined) {
            break
        }

        const player = players[index]

        if (player.state !== "active") {
            continue
        }

        currentPlayerIndex = index
        await performRemainingActions()
        return
    }

    const nextIndexStart = (currentPlayerIndex + 1) % players.length
    const nextPlayersQueue = [
        ...players.slice(nextIndexStart),
        ...players.slice(0, nextIndexStart),
    ]

    const nextPlayer = nextPlayersQueue.find((p) => p.state === "active")
    if (!nextPlayer) {
        console.log("No active players remaining in game, round over")
        summarizeRound()
        return
    }
    currentPlayerIndex = players.indexOf(nextPlayer)

    await startTurn()
}

async function handleNumberCard(card: FlopNumberCard) {
    const player = players[currentPlayerIndex]

    const alreadyHasThatCard = player.cards.some(
        (c) => c.type === "number" && c.value === card.value,
    )
    if (alreadyHasThatCard) {
        const secondChance = player.cards.find((c) => c.type === "secondChance")
        if (!secondChance) {
            await bust()
        } else {
            player.cards = player.cards.filter((c) => c !== secondChance)
            console.log(
                "You already have that card, but you have a 2nd chance!\nYour cards are now:",
            )
            printCards(player.cards)

            if (player.flopThreeCounter > 0) {
                await hitMoreDuringFlop3()
                return
            }

            await performRemainingActions()
        }
        return
    }

    await addToHand(card)
}

async function bust() {
    const player = players[currentPlayerIndex]

    console.log("BUST!")

    player.state = "busted"

    await goToNextPlayerIsh()
}

async function flopThree() {
    const player = players[currentPlayerIndex]

    const activePlayerNames = players
        .filter((p) => p.state === "active")
        .map((p) => p.player.name)
    const selectedName = await question(
        `Which player to flop 3 to, ${player.player.name}?`,
        activePlayerNames,
    )

    if (selectedName !== player.player.name) {
        const selectedPlayer = players.find(
            (p) => p.player.name === selectedName,
        )
        if (!selectedPlayer) {
            console.log("what?? try again")
            await flopThree()
            return
        }

        flopThreePlayerIndexQueue.push(currentPlayerIndex)
        selectedPlayer.flopThreeCounter = 3
        currentPlayerIndex = players.indexOf(selectedPlayer)

        await hitMoreDuringFlop3()
    } else {
        player.flopThreeCounter = 3

        await hitMoreDuringFlop3()
    }
}

async function freeze() {
    const player = players[currentPlayerIndex]

    // TODO should the player be allowed to freeze themselves if there are other options?
    const freezablePlayerNames = players
        .filter((p) => p !== player)
        .filter((p) => p.state === "active")
        .map((p) => p.player.name)

    if (freezablePlayerNames.length === 0) {
        const points = countCardScore(player.cards)
        console.log("No one left to freeze, so that's it for you!")
        console.log(`You got ${points} points!`)

        player.state = "frozen"

        summarizeRound()

        return
    }

    const selectedName = await question(
        `Which player to freeze, ${player.player.name}?`,
        freezablePlayerNames,
    )
    const selectedPlayer = players.find((p) => p.player.name === selectedName)
    if (!selectedPlayer) {
        console.log("what?? try again")
        await freeze()
        return
    }

    selectedPlayer.state = "frozen"
    console.log(`${selectedPlayer.player.name}, you have been FROZEN!`)
    console.log(
        `${selectedPlayer.player.name}, you got ${countCardScore(selectedPlayer.cards)} points!`,
    )

    await performRemainingActions()
}

function reshuffleDeck() {
    console.log("Deck reshuffled!")
    deck.reshuffle()
}

async function hit() {
    const player = players[currentPlayerIndex]

    if (deck.remainingCards === 0) {
        reshuffleDeck()
    }

    const card = deck.grab()
    console.log("You grabbed:")
    printCards([card])

    player.flopThreeCounter -= 1

    switch (card.type) {
        case "number": {
            await handleNumberCard(card)
            break
        }
        case "flopThree": {
            if (player.flopThreeCounter > 0) {
                await addToHand(card)
            } else {
                await flopThree()
            }
            break
        }
        case "freeze": {
            if (player.flopThreeCounter > 0) {
                await addToHand(card)
            } else {
                await freeze()
            }
            break
        }
        case "secondChance":
        case "addModifier":
        case "multiplyModifier": {
            await addToHand(card)
            break
        }
    }
}

async function hitMoreDuringFlop3() {
    const player = players[currentPlayerIndex]
    await question(`Hit? (${player.flopThreeCounter} remaining) `, ["hit"])

    await hit()
}

async function stay() {
    const player = players[currentPlayerIndex]
    const points = countCardScore(player.cards)
    console.log(`Stay you shall! You get ${points} points!`)

    player.state = "stayed"

    await goToNextPlayerIsh()
}

async function debug() {
    console.log("sneaky...\n")

    const chosenCard = await question(
        "Select which card to put on top of deck",
        ["number", "freeze", "flopThree", "secondChance"],
    )

    if (chosenCard === "number") {
        const chosenValue = await question("Value?", ["0", "1", "2", "3", "4"])

        deck.pushDebug({
            type: "number",
            value: +chosenValue,
        } as FlopNumberCard)
    } else {
        deck.pushDebug({ type: chosenCard })
    }

    await startTurn()
}

async function startTurn() {
    const player = players[currentPlayerIndex]
    console.log(`\n====================================================\n`)
    console.log(`Now it's ${player.player.name}'s turn.`)
    console.log(
        `${deck.remainingCards} cards remaining in the deck out of ${fullDeckSize}`,
    )
    console.log(`Your cards (${countCardScore(player.cards)} pts):`)
    printCards(player.cards)

    const hitOrStay = await question("Hit or stay?", ["hit", "stay", "debug"])
    if (hitOrStay === "hit") {
        await hit()
    } else if (hitOrStay === "debug") {
        await debug()
    } else {
        await stay()
    }
}

async function main() {
    await startTurn()

    closeReadline()
}

main()
