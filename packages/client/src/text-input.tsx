import type { InputHTMLAttributes } from "react"

import { cx } from "./cva.ts"

type TextInputProps = InputHTMLAttributes<HTMLInputElement>

export const TextInput = ({ className, ...props }: TextInputProps) => {
    return (
        <input
            className={cx(
                "rounded-md bg-black px-4 py-2 text-xl text-neutral-50 inset-ring-2 inset-ring-neutral-600 outline-4 outline-black/20 placeholder:text-neutral-500 focus:inset-ring-neutral-400",
                className,
            )}
            {...props}
        />
    )
}
