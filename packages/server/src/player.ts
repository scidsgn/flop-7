import { gamePlayerSchema } from "@flop-7/protocol/snapshots"
import { z } from "zod"

export type Player = z.infer<typeof gamePlayerSchema>
