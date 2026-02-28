import type { VariantProps } from "cva"
import type { ButtonHTMLAttributes } from "react"

import { cva } from "./cva.ts"

const buttonVariants = cva({
    base: [
        "h-11 rounded-md px-4 py-2 text-xl font-semibold outline-4 outline-black/20",
        "bg-neutral-700 text-neutral-50 hover:bg-neutral-600",
        "scale-100 transition-[scale,background-color] duration-100 active:scale-95",
        "disabled:scale-100! disabled:bg-transparent disabled:text-neutral-500 disabled:inset-ring-2 disabled:inset-ring-neutral-500/30",
        "cursor-pointer disabled:cursor-not-allowed",
    ],
    variants: {
        primary: {
            true: "bg-neutral-200 text-neutral-950 hover:bg-neutral-50",
            false: "",
        },
    },
})

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants>

export const Button = ({ primary, className, ...props }: ButtonProps) => {
    return (
        <button className={buttonVariants({ primary, className })} {...props} />
    )
}
