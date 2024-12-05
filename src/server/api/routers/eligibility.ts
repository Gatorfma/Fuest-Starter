import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { Contract, BrowserProvider, formatUnits } from 'ethers';
import { TokenSchema, RuleSchema, EligibilityCheckSchema } from "~/server/db/index";

export const eligibilityRouter = createTRPCRouter({
  checkEligibility: publicProcedure
    .input(EligibilityCheckSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const token = await ctx.db.token.findUnique({
          where: { id: input.tokenId }
        });

        if (!token) {
          throw new Error("Token not found");
        }

        const provider = new BrowserProvider(window.ethereum);
        
        // Parse ABI
        const parsedAbi = JSON.parse(token.abi);
        
        // Create contract instance
        const contract = new Contract(
          token.address,
          parsedAbi,
          provider
        );

        const ruleResults = [];

        // Check each rule
        for (const rule of input.rules) {
          try {
            const functionAbi = parsedAbi.find(
              (item: any) => item.name === rule.functionName
            );

            if (!functionAbi) {
              throw new Error(`Function ${rule.functionName} not found in ABI`);
            }

            // Get the function
            const contractFunction = contract[rule.functionName as keyof typeof contract];
            if (!contractFunction || typeof contractFunction !== 'function') {
                throw new Error(`Function ${rule.functionName} not found or is not callable`);
            }

            // Then use it with type assertion
            let result;
            if (functionAbi.inputs?.length === 1 && functionAbi.inputs[0].type === 'address') {
                result = await (contractFunction as (address: string) => Promise<bigint>)(input.address);
            } else {
                result = await (contractFunction as () => Promise<bigint>)();
            }

            // Get output type
            const outputType = functionAbi.outputs[0].type;
            
            // Convert result based on output type
            let value;
            if (outputType === 'uint8') {
              value = Number(result);
            } else {
              value = Number(formatUnits(result, outputType === 'uint256' ? 18 : 0));
            }

            // Check if rule is satisfied
            const isEligible = checkRule(value, rule.value, rule.operator);

            ruleResults.push({
              rule,
              success: isEligible,
              value,
              error: null
            });

          } catch (error: any) {
            ruleResults.push({
              rule,
              success: false,
              error: `Error checking ${rule.displayName}: ${error.message}`
            });
          }
        }

        return {
          success: ruleResults.every(r => r.success),
          results: ruleResults,
          tokenName: token.name,
          tokenAddress: token.address
        };

      } catch (error: any) {
        throw new Error(`Error checking eligibility: ${error.message}`);
      }
    }),
});

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