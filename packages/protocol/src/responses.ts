import z from "zod"

export const ruleSystemInfoSchema = z.object({
    id: z.string(),
    name: z.string(),
    assets: z.object({
        cardBack: z.string(),
    }),
})

export type RuleSystemInfo = z.infer<typeof ruleSystemInfoSchema>

export const ruleSystemsResponseSchema = z.object({
    ruleSystems: z.array(ruleSystemInfoSchema),
})

export type RuleSystemsReponse = z.infer<typeof ruleSystemsResponseSchema>
