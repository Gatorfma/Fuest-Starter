"use client";

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./_components/ui/card";
import { TokenSelection } from './_components/Quest/components/TokenSelection';
import { AddTokenForm } from './_components/Quest/components/AddTokenForm';
import { WalletConnection } from './_components/Quest/components/WalletConnection';
import { AddressChecker } from './_components/Quest/components/AddressChecker';
import { EligibilityCheck } from './_components/Quest/components/EligibilityCheck';
import { StatusMessage } from './_components/Quest/components/StatusMessage';
import { useTokenManagement } from './_components/Quest/hooks/useTokenManagement';
import { useEligibilityCheck } from './_components/Quest/hooks/useEligibilityCheck';
import { useState } from 'react';
import { type Rule } from './_components/Quest/types';

const Quest = () => {
    const [rules, setRules] = useState<Rule[]>([]);

    const {
        tokens,
        selectedToken,
        setSelectedToken,
        newToken,
        setNewToken,
        showAddToken,
        setShowAddToken,
        addToken,
        removeToken,
        status: tokenStatus,
        setStatus: setTokenStatus,
        isAuthenticated
    } = useTokenManagement();

    const {
        inputAddress,
        setInputAddress,
        status: eligibilityStatus,
        checkEligibility,
        updateRules
    } = useEligibilityCheck(rules, setRules);

    useEffect(() => {
        updateRules(selectedToken);
    }, [selectedToken]);

    const handleInputAddressCheck = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        checkEligibility(selectedToken, inputAddress);
    };

    const status = tokenStatus || eligibilityStatus;

    return (
        <main className="relative min-h-screen w-full bg-gradient-to-b from-[#000814] via-[#001d3d] to-[#000814]">
            <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center px-4 py-8">
                <div className="w-full max-w-md relative">
                    {/* Gradient border effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-lg blur opacity-75" />

                    {/* Main Card */}
                    <Card className="relative bg-black/60 backdrop-blur-xl border-[#0466c8]/50 shadow-2xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                                Quest Eligibility Checker
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <WalletConnection />

                            <div className="space-y-4">
                                <TokenSelection
                                    tokens={tokens}
                                    selectedToken={selectedToken}
                                    setSelectedToken={setSelectedToken}
                                    showAddToken={showAddToken}
                                    setShowAddToken={setShowAddToken}
                                    removeToken={removeToken}
                                    isAuthenticated={isAuthenticated}
                                />

                                {showAddToken && (
                                    <AddTokenForm
                                        newToken={newToken}
                                        setNewToken={setNewToken}
                                        addToken={addToken}
                                    />
                                )}
                            </div>

                            {selectedToken && (
                                <>
                                    <EligibilityCheck
                                        selectedToken={selectedToken}
                                        rules={rules}
                                        checkEligibility={checkEligibility}
                                        updateRules={updateRules}
                                    />

                                    <AddressChecker
                                        selectedToken={selectedToken}
                                        rules={rules}
                                        setRules={setRules}
                                    />
                                </>
                            )}

                            {status && (
                                <StatusMessage status={status} />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
};

export default Quest;