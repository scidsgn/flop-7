import type { FlopCard } from "@flop-7/protocol/cards"
import type { ImgHTMLAttributes } from "react"
import { twMerge } from "tailwind-merge"

import { useGame } from "../game.store.ts"

type CardProps = {
    card: FlopCard
}

export const Card = ({ card }: CardProps) => {
    const serverUrl = useGame((state) => state.serverUrl)
    if (!serverUrl) return null

    return <CardImg src={`${serverUrl}/assets${card.asset}`} />
}

const CardImg = (props: ImgHTMLAttributes<HTMLImageElement>) => (
    <img
        className={twMerge("h-24 w-16", props.className)}
        {...props}
        alt={props.alt}
    />
)
