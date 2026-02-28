import type { HTMLAttributes } from "react"

import { cx } from "./cva.ts"

type PanelProps = HTMLAttributes<HTMLDivElement> & { active?: boolean }

export const Panel = ({ className, active = true, ...props }: PanelProps) => {
    return (
        <div
            className={cx(
                "rounded-lg bg-neutral-800 p-8 shadow-xl shadow-black/20 outline-4 outline-black/20",
                !active &&
                    "cursor-not-allowed opacity-50 *:pointer-events-none",
                className,
            )}
            {...props}
        />
    )
}
