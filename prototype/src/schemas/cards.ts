import { z } from "zod"

export const flopNumberCardSchema = z
    .object({
        type: z.literal("number"),
        value: z.number(),
    })
    .meta({ title: "FlopNumberCard" })

export const flopActionCardSchema = z
    .object({
        type: z.union([z.literal("freeze"), z.literal("flopThree")]),
    })
    .meta({ title: "FlopActionCard" })

export const flopSecondChanceCardSchema = z
    .object({
        type: z.literal("secondChance"),
    })
    .meta({ title: "FlopSecondChanceCard" })

export const flopAddModifierCardSchema = z
    .object({
        type: z.literal("addModifier"),
        add: z.number(),
    })
    .meta({ title: "FlopAddModifierCard" })

export const flopMultiplyModifierCardSchema = z
    .object({
        type: z.literal("multiplyModifier"),
        multiplier: z.number(),
    })
    .meta({ title: "FlopMultiplyModifierCard" })

export const flopCardSchema = z
    .discriminatedUnion("type", [
        flopActionCardSchema,
        flopAddModifierCardSchema,
        flopNumberCardSchema,
        flopMultiplyModifierCardSchema,
        flopSecondChanceCardSchema,
    ])
    .meta({
        title: "FlopCard",
    })
