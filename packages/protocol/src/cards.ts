import { z } from "zod"

export const flopNumberCardSchema = z.object({
    type: z.literal("number"),
    value: z.number(),
    asset: z.string(),
})

export const flopActionCardSchema = z.object({
    type: z.union([z.literal("freeze"), z.literal("flopThree")]),
    asset: z.string(),
})

export const flopSecondChanceCardSchema = z.object({
    type: z.literal("secondChance"),
    asset: z.string(),
})

export const flopAddModifierCardSchema = z.object({
    type: z.literal("addModifier"),
    add: z.number(),
    asset: z.string(),
})

export const flopMultiplyModifierCardSchema = z.object({
    type: z.literal("multiplyModifier"),
    multiplier: z.number(),
    asset: z.string(),
})

export const flopCardSchema = z.discriminatedUnion("type", [
    flopActionCardSchema,
    flopAddModifierCardSchema,
    flopNumberCardSchema,
    flopMultiplyModifierCardSchema,
    flopSecondChanceCardSchema,
])

export type FlopCard = z.infer<typeof flopCardSchema>
export type FlopCardOfType<Type extends FlopCard["type"]> = Extract<
    FlopCard,
    { type: Type }
>
