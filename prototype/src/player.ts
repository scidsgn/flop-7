import { z } from "zod"

import { gamePlayerSchema } from "./schemas/snapshots"

export type Player = z.infer<typeof gamePlayerSchema>
