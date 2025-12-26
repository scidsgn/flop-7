import { z } from "zod"

export const playerSchema = z.object({
    id: z.string(),
    name: z.string(),
})

export type Player = z.infer<typeof playerSchema>
