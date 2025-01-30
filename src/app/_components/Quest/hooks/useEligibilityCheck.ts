import { useState, useEffect } from 'react';
import { trpc } from '~/utils/trpc';
import { type Rule, type Token } from '../types';
import { parseAbiForRules, formatFunctionName } from '../utils/abiUtils';

export const useEligibilityCheck = () => {
    const [rules, setRules] = useState<Rule[]>([]);
    const [inputAddress, setInputAddress] = useState("");
    const [status, setStatus] = useState("");

    const checkEligibilityMutation = trpc.eligibility.checkEligibility.useMutation({
        onSuccess: (data) => {
            if (data.success) {
                setStatus(`Address ${inputAddress} is eligible for ${data.tokenName} token (${data.tokenAddress})!`);
            } else {
                let failureReason = `Address ${inputAddress} is not eligible for ${data.tokenName} token (${data.tokenAddress}) due to:\n`;
                data.failedRules.forEach((result) => {
                    if (result.error) {
                        failureReason += `- ${result.rule.displayName}: ${result.error}\n`;
                    } else {
                        failureReason += `- ${result.rule.displayName} rule not met (requires ${result.rule.operator} ${result.rule.value}, has ${result.value})\n`;
                    }
                });
                setStatus(failureReason);
            }
        },
        onError: (error) => {
            setStatus(`Error checking eligibility: ${error.message}`);
        }
    });

    const updateRules = (selectedToken: Token | null) => {
        if (selectedToken) {
            const eligibleFunctions = parseAbiForRules(selectedToken.abi);
            const newRules = eligibleFunctions.map(func => ({
                functionName: func.name,
                operator: 'greater-than-equal',
                value: 0,
                displayName: formatFunctionName(func.name)
            }));
            setRules(newRules);
        } else {
            setRules([]);
        }
    };

    const checkEligibility = (selectedToken: Token | null, addressToCheck: string) => {
        if (!selectedToken) {
            setStatus("Please select a token first.");
            return;
        }

        checkEligibilityMutation.mutate({
            selectedToken,
            addressToCheck,
            rules
        });
    };

    return {
        rules,
        setRules,
        inputAddress,
        setInputAddress,
        status,
        setStatus,
        checkEligibility,
        updateRules
    };
};