"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../_components/ui/card";
import { TokenSelection } from '../_components/Quest/components/TokenSelection';
import { AddressChecker } from '../_components/Quest/components/AddressChecker';
import { EligibilityCheck } from '../_components/Quest/components/EligibilityCheck';
import { StatusMessage } from '../_components/Quest/components/StatusMessage';
import { useTokenManagement } from '../_components/Quest/hooks/useTokenManagement';
import { useEligibilityCheck } from '../_components/Quest/hooks/useEligibilityCheck';
import { type Rule } from '../_components/Quest/types';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../_components/AuthContext';
import { Button } from "../../components/ui/button";


const EligibilityPage = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();
    const [rules, setRules] = useState<Rule[]>([]);

    const {
        tokens,
        selectedToken,
        setSelectedToken,
        status: tokenStatus
    } = useTokenManagement();

    const {
        status: eligibilityStatus,
        checkEligibility,
        updateRules
    } = useEligibilityCheck(rules, setRules);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        updateRules(selectedToken);
    }, [selectedToken]);

    const handleNavigation = (path: string) => {
        if (path === '/') {
            router.push(path);
            return;
        }

        if (!isAuthenticated) {
            router.push('/unauthorized');
        } else {
            router.push(path);
        }
    };

    const TabNavigation = () => (
        <div className="border-b border-blue-500/30 mb-4">
            <div className="flex">
                <Button
                    onClick={() => handleNavigation('/')}
                    className="px-4 py-2 w-1/3 text-sm font-medium text-gray-400 hover:text-blue-300 hover:border-b-2 hover:border-blue-300"
                >
                    Connect
                </Button>
                <Button
                    onClick={() => handleNavigation('/tokens')}
                    className={`px-4 py-2 w-1/3 text-sm font-medium ${pathname === '/tokens'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-gray-400 hover:text-blue-300 hover:border-b-2 hover:border-blue-300'
                        }`}
                >
                    Tokens
                </Button>
                <Button
                    onClick={() => handleNavigation('/eligibility')}
                    className={`px-4 py-2 w-1/3 text-sm font-medium ${pathname === '/eligibility'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-gray-400 hover:text-blue-300 hover:border-b-2 hover:border-blue-300'
                        }`}
                >
                    Eligibility
                </Button>
            </div>
        </div>
    );

    const status = tokenStatus || eligibilityStatus;

    return (
        <main className="relative min-h-screen w-full bg-gradient-to-b from-[#000814] via-[#001d3d] to-[#000814]">
            <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center px-4 py-8">
                <div className="w-full max-w-md relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-lg blur opacity-75" />
                    <Card className="relative bg-black/60 backdrop-blur-xl border-[#0466c8]/50 shadow-2xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                                Check Eligibility
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <TabNavigation />
                            <TokenSelection
                                tokens={tokens}
                                selectedToken={selectedToken}
                                setSelectedToken={setSelectedToken}
                                showAddToken={false}
                                setShowAddToken={() => { }}
                                removeToken={() => Promise.resolve()}
                                isAuthenticated={isAuthenticated}
                            />
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
                            {status && <StatusMessage status={status} />}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
};

export default EligibilityPage;