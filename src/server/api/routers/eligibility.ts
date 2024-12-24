import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { Contract, JsonRpcProvider, formatUnits } from 'ethers';
import { TRPCError } from "@trpc/server";
import { env } from "../../../../env.mjs";

const checkRule = (value: number, target: number, operator: string): boolean => {
  switch (operator) {
    case "greater-than-equal":
      return value >= target;
    case "less-than-equal":
      return value <= target;
    case "greater-than":
      return value > target;
    case "less-than":
      return value < target;
    case "equal":
      return value === target;
    case "not-equal":
      return value !== target;
    default:
      return false;
  }
};

export const eligibilityRouter = createTRPCRouter({
  checkEligibility: publicProcedure
    .input(z.object({
      selectedToken: z.object({
        id: z.number(),
        name: z.string(),
        address: z.string(),
        abi: z.string()
      }),
      addressToCheck: z.string().regex(/^(0x)?[0-9a-fA-F]{40}$/),
      rules: z.array(z.object({
        functionName: z.string(),
        operator: z.string(),
        value: z.number(),
        displayName: z.string()
      }))
    }))
    .mutation(async ({ input: { selectedToken, addressToCheck, rules } }) => {
      try {
        const provider = new JsonRpcProvider(env.RPC_URL);

        const contract = new Contract(
          selectedToken.address,
          JSON.parse(selectedToken.abi),
          provider
        );

        const failedRules = [];
        let tokenDecimals = 18;

        try {
          const decimalsFunction = contract['decimals'];
          if (typeof decimalsFunction === 'function') {
            const decimalsResult = await decimalsFunction();
            tokenDecimals = Number(decimalsResult);
          }
        } catch (error) {
          console.warn("Using default decimals (18)");
        }

        for (const rule of rules) {
          try {
            const functionAbi = JSON.parse(selectedToken.abi).find(
              (item: any) => item.name === rule.functionName
            );

            if (!functionAbi) {
              throw new Error(`Function ${rule.functionName} not found in ABI`);
            }

            const contractFunction = contract[rule.functionName];
            if (typeof contractFunction !== 'function') {
              throw new Error(`Function ${rule.functionName} not found in contract`);
            }

            let result;
            if (functionAbi.inputs?.length === 1 && functionAbi.inputs[0].type === 'address') {
              result = await contractFunction(addressToCheck);
            } else {
              result = await contractFunction();
            }

            const value = functionAbi.outputs?.[0]?.type === 'uint8'
              ? Number(result)
              : parseFloat(formatUnits(result, tokenDecimals));

            const isEligible = checkRule(value, rule.value, rule.operator);

            if (!isEligible) {
              failedRules.push({
                rule,
                success: false,
                value,
                error: null
              });
            }
          } catch (error: any) {
            failedRules.push({
              rule,
              success: false,
              error: error.message
            });
          }
        }

        return {
          success: failedRules.length === 0,
          tokenName: selectedToken.name,
          tokenAddress: selectedToken.address,
          failedRules
        };

      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Error checking eligibility: ${error.message}`
        });
      }
    }),
});