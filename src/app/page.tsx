"use client";

import { useEffect } from 'react';
import { AnimatedBackground } from "./_components/animated-background";
import { Card, CardContent, CardHeader, CardTitle } from "./_components/ui/card";
import { TokenSelection } from './_components/Quest/components/TokenSelection';
import { AddTokenForm } from './_components/Quest/components/AddTokenForm';
import { WalletConnection } from './_components/Quest/components/WalletConnection';
import { AddressChecker } from './_components/Quest/components/AddressChecker';
import { EligibilityRules } from './_components/Quest/components/EligibilityRules';
import { StatusMessage } from './_components/Quest/components/StatusMessage';
import { useTokenManagement } from './_components/Quest/hooks/useTokenManagement';
import { useWalletConnection } from './_components/Quest/hooks/useWalletConnection';
import { useEligibilityCheck } from './_components/Quest/hooks/useEligibilityCheck';

const Quest = () => {
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
        userAddress,
        connectWallet,
        handleSwitchWallet,
        copyAddressToClipboard,
        status: walletStatus,
        setStatus: setWalletStatus
    } = useWalletConnection();

    const {
        rules,
        setRules,
        inputAddress,
        setInputAddress,
        status: eligibilityStatus,
        setStatus: setEligibilityStatus,
        checkEligibility,
        updateRules
    } = useEligibilityCheck();

    useEffect(() => {
        updateRules(selectedToken);
    }, [selectedToken]);

    const handleConnectedWalletCheck = () => {
        if (!userAddress) {
            setWalletStatus("Please connect your wallet first.");
            return;
        }
        checkEligibility(selectedToken, userAddress);
    };

    const handleInputAddressCheck = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        checkEligibility(selectedToken, inputAddress);
    };

    // Combine all status messages, showing the most recent one
    const status = tokenStatus || walletStatus || eligibilityStatus;

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-black to-blue-950">
            <AnimatedBackground />
            <div className="w-full max-w-md relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                <Card className="relative bg-black/60 backdrop-blur-xl border-[#0466c8]/50 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                            Quest Eligibility Checker
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                        <WalletConnection
                            userAddress={userAddress}
                            connectWallet={connectWallet}
                            handleConnectedWalletCheck={handleConnectedWalletCheck}
                            handleSwitchWallet={handleSwitchWallet}
                            copyAddressToClipboard={copyAddressToClipboard}
                        />
                        <AddressChecker
                            inputAddress={inputAddress}
                            setInputAddress={setInputAddress}
                            handleInputAddressCheck={handleInputAddressCheck}
                            selectedToken={selectedToken}
                        />
                        <EligibilityRules
                            rules={rules}
                            setRules={setRules}
                        />
                        <StatusMessage status={status} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Quest;