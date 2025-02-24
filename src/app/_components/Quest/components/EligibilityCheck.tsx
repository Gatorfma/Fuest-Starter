"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Button } from "../../../../components/ui/button";
import { type Token, type Rule } from '../types';

interface EligibilityCheckProps {
    selectedToken: Token | null;
    rules: Rule[];
    checkEligibility: (selectedToken: Token | null, addressToCheck: string) => void;
    updateRules: (selectedToken: Token | null) => void;
}

export const EligibilityCheck: React.FC<EligibilityCheckProps> = ({
    selectedToken,
    rules,
    checkEligibility,
    updateRules
}) => {
    const { address: userAddress, isConnected } = useAccount();
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        if (selectedToken) {
            updateRules(selectedToken);
        }
    }, [selectedToken]);

    const handleCheck = async () => {
        if (!userAddress || !selectedToken) return;

        setIsChecking(true);
        try {
            await checkEligibility(selectedToken, userAddress);
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="space-y-4">
            <Button
                className={`w-full ${!isConnected || !selectedToken
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800'
                    } text-white shadow-lg shadow-green-500/20`}
                onClick={handleCheck}
                disabled={!isConnected || !selectedToken || isChecking || rules.length === 0}
            >
                {isChecking ? (
                    <div className="flex items-center gap-2">
                        <span className="animate-spin">⚡</span>
                        Checking Eligibility...
                    </div>
                ) : (
                    'Check Connected Wallet'
                )}
            </Button>

            {status && (
                <div className={`p-4 rounded-lg ${status.includes('eligible')
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-red-500/10 border border-red-500/30'
                    }`}>
                    <p className={`whitespace-pre-line text-sm ${status.includes('eligible') ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {status}
                    </p>
                </div>
            )}
        </div>
    );
};