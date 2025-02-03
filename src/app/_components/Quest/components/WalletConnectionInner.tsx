"use client";

import { useConnect, useDisconnect, useAccount } from 'wagmi';
import { Button } from "../../ui/button";
import { SignInButton } from "../../ui/sign-inButton";
import { CookieDebug } from "../../debug/CookieDebug";
import { useEffect, useRef, useState } from 'react';
import { EligibilityCheck } from './EligibilityCheck';
import { useTokenManagement } from '../hooks/useTokenManagement';

export const WalletConnectionInner = () => {
    const { connect, connectors, status: connectStatus } = useConnect();
    const { disconnect } = useDisconnect();
    const { address: userAddress, isConnected } = useAccount();
    const [showWalletList, setShowWalletList] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { selectedToken } = useTokenManagement();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowWalletList(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleConnect = async (connector: any) => {
        try {
            await connect({ connector });
            setShowWalletList(false);
        } catch (error) {
            console.error('Failed to connect:', error);
        }
    };

    const copyAddressToClipboard = () => {
        if (userAddress) {
            navigator.clipboard.writeText(userAddress)
                .then(() => {
                    console.log('Address copied to clipboard!');
                })
                .catch(err => {
                    console.error('Failed to copy address:', err);
                });
        }
    };

    return (
        <div className="space-y-4">
            {!isConnected ? (
                <div className="space-y-2 relative">
                    <Button
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-lg shadow-blue-500/20"
                        onClick={() => setShowWalletList(!showWalletList)}
                    >
                        Connect Wallet
                    </Button>

                    {showWalletList && (
                        <div
                            ref={dropdownRef}
                            className="absolute z-50 w-full mt-2 py-1 bg-black/90 border border-blue-500/30 rounded-lg shadow-xl backdrop-blur-sm"
                        >
                            {connectors.map((connector) => (
                                <button
                                    key={connector.id}
                                    onClick={() => handleConnect(connector)}
                                    className="w-full px-4 py-3 text-left text-white hover:bg-blue-500/20 transition-colors duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{connector.name}</span>
                                        {connectStatus === 'pending' &&
                                            <span className="text-xs text-blue-500">
                                                Connecting...
                                            </span>
                                        }
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <SignInButton />
                    {process.env.NODE_ENV === 'development' && <CookieDebug />}
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="p-2 bg-black/40 border border-blue-500/30 rounded-md">
                        <p className="text-sm text-gray-400">Connected Wallet:</p>
                        <p className="text-sm text-gray-300 break-all">{userAddress}</p>
                    </div>

                    {/*EligibilityCheck*/}
                    <EligibilityCheck selectedToken={selectedToken} />

                    <div className="flex gap-2">
                        <Button
                            className="flex-1 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white shadow-lg shadow-purple-500/20"
                            onClick={copyAddressToClipboard}
                        >
                            Copy Address
                        </Button>
                        <Button
                            className="flex-1 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-lg shadow-red-500/20"
                            onClick={() => disconnect()}
                        >
                            Disconnect
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};