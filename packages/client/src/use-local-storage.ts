import { useCallback, useState } from "react"
import type { ZodType } from "zod"

export function useLocalStorage<T>(
    key: string,
    schema: ZodType<T>,
    defaultValue: NoInfer<T>,
): [T, (v: T) => void] {
    const [value, setValue] = useState(() => {
        try {
            const rawValue = window.localStorage.getItem(key)
            if (!rawValue) {
                return defaultValue
            }

            const jsonValue = JSON.parse(rawValue)
            const result = schema.safeParse(jsonValue)
            if (!result.success) {
                return defaultValue
            }

            return result.data
        } catch {
            return defaultValue
        }
    })

    const set = useCallback(
        (value: T) => {
            const result = schema.safeParse(value)
            if (!result.success) {
                return
            }

            const jsonValue = JSON.stringify(result.data)
            window.localStorage.setItem(key, jsonValue)

            setValue(result.data)
        },
        [key, schema],
    )

    return [value, set]
}
