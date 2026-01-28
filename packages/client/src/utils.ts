export function unreachable(value: never) {
    throw new Error(`Value not handled: ${value}`)
}
