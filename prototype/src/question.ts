import { createInterface } from "node:readline/promises"

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
})

export async function question<T extends string>(prompt: string, options: T[]) {
    while (true) {
        const answer = (
            await rl.question(`\n${prompt} [${options.join("/")}] `)
        ).trim()

        if (!(options as string[]).includes(answer)) {
            console.log(`no... give me ${options.join(", ")}`)
        } else {
            return answer as T
        }
    }
}

export function closeReadline() {
    rl.close()
}
