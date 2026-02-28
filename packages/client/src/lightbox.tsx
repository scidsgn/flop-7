import type { ReactNode } from "react"

type LightboxProps = {
    children?: ReactNode
}

export const Lightbox = ({ children }: LightboxProps) => {
    return (
        <div
            className="fixed inset-2 flex flex-col items-center justify-center gap-8 rounded-lg bg-neutral-900"
            style={{
                boxShadow: "inset 0px 0px 256px var(--color-neutral-800)",
            }}
        >
            {children}
        </div>
    )
}
