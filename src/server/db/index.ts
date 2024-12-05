import { z } from "zod";

export const TokenSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    address: z.string(),
    abi: z.string(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional()
});

export const RuleSchema = z.object({
    functionName: z.string(),
    operator: z.string(),
    value: z.number(),
    displayName: z.string()
});

export const EligibilityCheckSchema = z.object({
    tokenId: z.string(),
    address: z.string(),
    rules: z.array(RuleSchema)
});

export type Token = z.infer<typeof TokenSchema>;
export type Rule = z.infer<typeof RuleSchema>;
export type EligibilityCheck = z.infer<typeof EligibilityCheckSchema>;