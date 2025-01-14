//GatorBaba
"use client";

import { useState, useEffect } from 'react';
import './page.css';
import { trpc } from '~/utils/trpc';
import { type Token } from "~/server/db/schema";
import { AnimatedBackground } from "./_components/animated-background"
import { Button } from "./_components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./_components/ui/card"
import { Input } from "./_components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./_components/ui/select"
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from '@wagmi/connectors'
import { SignInButton } from "./_components/ui/sign-inButton";
import { useAuth } from './_components/AuthContext';




interface AbiFunction {
    name: string;
    type: string;
    inputs: { type: string; name: string }[];
    outputs: { type: string }[];
    stateMutability?: string;
}

interface Rule {
    functionName: string;
    operator: string;
    value: number;
    displayName: string;
}

const parseAbiForRules = (abi: string): AbiFunction[] => {
    try {
        const parsedAbi = JSON.parse(abi);
        return parsedAbi.filter((item: AbiFunction) => {
            // Basic function check
            if (item.type !== 'function') return false;

            // Must be view or pure function
            if (item.stateMutability !== 'view' && item.stateMutability !== 'pure') return false;

            // Check outputs
            if (!item.outputs || item.outputs.length === 0) return false;
            const outputType = item.outputs[0]?.type;
            if (!outputType) return false;

            // Check if output is numeric
            const isNumericOutput = [
                'uint256', 'uint128', 'uint64', 'uint32', 'uint16', 'uint8',
                'int256', 'int128', 'int64', 'int32', 'int16', 'int8',
                'uint', 'int'
            ].includes(outputType);

            // Skip string-returning functions
            if (!isNumericOutput || outputType === 'string') return false;

            // Check inputs - must have 0 or 1 input
            if (!item.inputs) return true;
            if (item.inputs.length === 0) return true;

            // If 1 input, it must be an address
            return item.inputs.length === 1 && item.inputs[0]?.type === 'address';
        });
    } catch (error) {
        console.error('Error parsing ABI:', error);
        return [];
    }
};

// Function to format function name for display
const formatFunctionName = (name: string): string => {
    return name
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
        .trim();
};

const Quest = () => {
    const [userAddress, setUserAddress] = useState("");
    const [inputAddress, setInputAddress] = useState("");
    const [status, setStatus] = useState("");


    const { address, isConnected } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();

    const { isAuthenticated, setAuthState } = useAuth();


    // Token management states
    const [tokens, setTokens] = useState<Token[]>([]);
    const [selectedToken, setSelectedToken] = useState<Token | null>(null);
    const [newToken, setNewToken] = useState<Token>({
        id: 0,
        name: '',
        address: '',
        abi: ''
    });
    const [showAddToken, setShowAddToken] = useState(false);

    // State for custom rules
    const [rules, setRules] = useState<Rule[]>([]);

    // Add tRPC hooks
    const { data: dbTokens } = trpc.tokens.getAll.useQuery<{ id: number; name: string; address: string; abi: string; }[]>();

    const utils = trpc.useContext();

    const addTokenMutation = trpc.tokens.addToken.useMutation({
        onSuccess: (data) => {
            if (data) {
                setSelectedToken(data);
                setShowAddToken(false);
                setNewToken({ id: 0, name: '', address: '', abi: '' });
                setStatus("Token added successfully!");
            } else {
                setStatus("Error: No data returned from the mutation.");
            }
            utils.tokens.getAll.invalidate(); // Invalidate the getAll query
        },
        onError: (error) => {
            setStatus(`Error adding token: ${error.message}`);
        }
    });

    const deleteTokenMutation = trpc.tokens.deleteToken.useMutation({
        onSuccess: () => {
            utils.tokens.getAll.invalidate(); // Invalidate the getAll query
        },
        onError: (error) => {
            setStatus(`Error deleting token: ${error.message}`);
        }
    });

    // Replace localStorage effects with database effect
    useEffect(() => {
        if (dbTokens) {
            setTokens(dbTokens);
            setSelectedToken(dbTokens.length > 0 && dbTokens[0] ? dbTokens[0] : null);

        }
    }, [dbTokens]);

    // Update the rules useEffect to use the same Token type
    useEffect(() => {
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
    }, [selectedToken]);

    useEffect(() => {
        if (address) {
            setUserAddress(address);
            setStatus("");
        } else {
            setUserAddress("");
        }
    }, [address]);


    const addToken = async () => {
        try {
            if (!isAuthenticated) {
                setStatus("Please sign in with Ethereum to add tokens");
                return;
            }
            // Validate inputs
            if (!newToken.name || !newToken.address || !newToken.abi) {
                setStatus("Please fill in all token details");
                return;
            }

            if (!/^(0x)?[0-9a-fA-F]{40}$/.test(newToken.address)) {
                setStatus("Invalid contract address format");
                return;
            }

            // Parse and validate ABI
            const parsedAbi = JSON.parse(newToken.abi);
            if (!Array.isArray(parsedAbi)) {
                setStatus("Invalid ABI format: must be an array of function descriptions");
                return;
            }

            // Add token to database
            await addTokenMutation.mutateAsync({
                name: newToken.name,
                address: newToken.address.toLowerCase(),
                abi: JSON.stringify(parsedAbi)
            });

        } catch (error: any) {
            console.error("Error adding token:", error);
            setStatus(`Error adding token: ${error.message}`);
        }
    };

    const removeToken = async (tokenId: number) => {
        try {
            if (!isAuthenticated) {
                setStatus("Please sign in with Ethereum to remove tokens");
                return;
            }

            await deleteTokenMutation.mutateAsync(tokenId);
            if (selectedToken?.id === tokenId) {
                const remainingTokens = tokens.filter(t => t.id !== tokenId);
                setSelectedToken(remainingTokens[0] || null);
            }
        } catch (error: any) {
            setStatus(`Error removing token: ${error.message}`);
        }
    };

    const copyAddressToClipboard = () => {
        if (userAddress) {
            navigator.clipboard.writeText(userAddress)
                .then(() => {
                    setStatus('Address copied to clipboard!');
                    setTimeout(() => setStatus(''), 2000);
                })
                .catch(err => {
                    console.error('Failed to copy address:', err);
                    setStatus('Failed to copy address');
                });
        }
    };

    const connectWallet = async () => {
        try {
            await connect({
                connector: injected()
            });
        } catch (error) {
            console.error("Error connecting wallet:", error);
            setStatus("Failed to connect wallet. Please try again.");
        }
    };

    const handleSwitchWallet = async () => {
        try {
            await disconnect();
            await connect({
                connector: injected()
            });
        } catch (error) {
            console.error("Error switching wallet:", error);
            setStatus("An error occurred while switching wallet. Please try again.");
        }
    };


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

    const handleConnectedWalletCheck = () => {
        if (!userAddress) {
            setStatus("Please connect your wallet first.");
            return;
        }
        if (!selectedToken) {
            setStatus("Please select a token first.");
            return;
        }

        checkEligibilityMutation.mutate({
            selectedToken,
            addressToCheck: userAddress,
            rules
        });
    };

    const handleInputAddressCheck = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedToken) {
            setStatus("Please select a token first.");
            return;
        }

        checkEligibilityMutation.mutate({
            selectedToken,
            addressToCheck: inputAddress,
            rules
        });
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-black to-blue-950">
            <AnimatedBackground />
            <div className="w-full max-w-md relative">
                {/* Glow effects */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>

                <Card className="relative bg-black/60 backdrop-blur-xl border-[#0466c8]/50 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                            Quest Eligibility Checker
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Token Selection */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-blue-400">Token Selection</h3>
                            {tokens.length === 0 ? (
                                <p className="text-sm text-gray-400">
                                    No tokens added yet. Please add a token to begin.
                                </p>
                            ) : (
                                <>
                                    <Select
                                        value={selectedToken?.name || ''}
                                        onValueChange={(value) => {
                                            const selected = tokens.find(t => t.name === value);
                                            setSelectedToken(selected || null);
                                        }}
                                    >
                                        <SelectTrigger className="w-full bg-black/40 border-blue-500/30 text-gray-300">
                                            <SelectValue placeholder="Select a token" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tokens.map((token) => (
                                                <SelectItem key={token.name} value={token.name}>
                                                    {token.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedToken && (
                                        <Button
                                            className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-lg shadow-red-500/20"
                                            onClick={() => removeToken(selectedToken.id)}
                                            disabled={!isAuthenticated}
                                        >
                                            {!isAuthenticated ? "Sign in to Remove Token" : "Remove Selected Token"}
                                        </Button>
                                    )}
                                </>
                            )}
                            <Button
                                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white shadow-lg shadow-emerald-500/20"
                                onClick={() => setShowAddToken(!showAddToken)}
                                disabled={!isAuthenticated}
                            >
                                {!isAuthenticated
                                    ? "Sign in to Add Token"
                                    : showAddToken
                                        ? "Cancel"
                                        : "Add New Token"
                                }
                            </Button>
                        </div>

                        {showAddToken && (
                            <div className="space-y-4">
                                <Input
                                    type="text"
                                    placeholder="Token Name"
                                    value={newToken.name}
                                    onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                                    className="bg-black/40 border-blue-500/30 text-gray-300 placeholder:text-gray-500"
                                />
                                <Input
                                    type="text"
                                    placeholder="Contract Address"
                                    value={newToken.address}
                                    onChange={(e) => setNewToken({ ...newToken, address: e.target.value })}
                                    className="bg-black/40 border-blue-500/30 text-gray-300 placeholder:text-gray-500"
                                />
                                <textarea
                                    placeholder="Contract ABI (JSON format)"
                                    value={newToken.abi}
                                    onChange={(e) => setNewToken({ ...newToken, abi: e.target.value })}
                                    className="w-full min-h-[100px] bg-black/40 border border-blue-500/30 rounded-md p-2 text-gray-300 placeholder:text-gray-500 focus:border-blue-400 transition-colors"
                                />
                                <Button
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-lg shadow-blue-500/20"
                                    onClick={addToken}
                                >
                                    Add Token
                                </Button>
                            </div>
                        )}

                        {/* Wallet Connection */}
                        <div className="space-y-4">
                            {!userAddress ? (
                                <div className="space-y-2">
                                    <Button
                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-lg shadow-blue-500/20"
                                        onClick={connectWallet}
                                    >
                                        Connect Wallet
                                    </Button>
                                    <SignInButton />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="p-2 bg-black/40 border border-blue-500/30 rounded-md">
                                        <p className="text-sm text-gray-400">Connected Wallet:</p>
                                        <p className="text-sm text-gray-300 break-all">{userAddress}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            className="flex-1 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white shadow-lg shadow-purple-500/20"
                                            onClick={copyAddressToClipboard}
                                        >
                                            Copy Address
                                        </Button>
                                        <Button
                                            className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 text-white shadow-lg shadow-cyan-500/20"
                                            onClick={handleConnectedWalletCheck}
                                        >
                                            Check Eligibility
                                        </Button>
                                        <Button
                                            className="flex-1 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-lg shadow-red-500/20"
                                            onClick={handleSwitchWallet}
                                        >
                                            Switch Wallet
                                        </Button>
                                    </div>
                                    <SignInButton />
                                </div>
                            )}
                        </div>

                        {/* Check Random Address */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-blue-400">Check Any Address</h3>
                            <form onSubmit={handleInputAddressCheck} className="space-y-2">
                                <Input
                                    type="text"
                                    placeholder="Enter wallet address to check"
                                    value={inputAddress}
                                    onChange={(e) => setInputAddress(e.target.value)}
                                    className="w-full bg-black/40 border-blue-500/30 text-gray-300 placeholder:text-gray-500"
                                />
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white shadow-lg shadow-green-500/20"
                                    disabled={!selectedToken}
                                >
                                    Check Address Eligibility
                                </Button>
                            </form>
                        </div>

                        {/* Eligibility Rules */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-blue-400">
                                Customize Eligibility Rules
                            </h3>
                            {rules.length === 0 ? (
                                <p className="text-sm text-gray-400">
                                    No rules available. Please select a token first.
                                </p>
                            ) : (
                                rules.map((rule, index) => (
                                    <div key={rule.functionName} className="flex items-center gap-2">
                                        <span className="text-gray-300">{rule.displayName}:</span>
                                        <Select
                                            value={rule.operator}
                                            onValueChange={(value) => {
                                                const newRules = [...rules];
                                                newRules[index] = { ...rule, operator: value };
                                                setRules(newRules);
                                            }}
                                        >
                                            <SelectTrigger className="w-24 bg-black/40 border-blue-500/30 text-gray-300">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="greater-than-equal">≥</SelectItem>
                                                <SelectItem value="less-than-equal">≤</SelectItem>
                                                <SelectItem value="greater-than">{'>'}</SelectItem>
                                                <SelectItem value="less-than">{'<'}</SelectItem>
                                                <SelectItem value="equal">=</SelectItem>
                                                <SelectItem value="not-equal">≠</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            type="number"
                                            value={rule.value}
                                            onChange={(e) => {
                                                const newRules = [...rules];
                                                newRules[index] = { ...rule, value: Number(e.target.value) };
                                                setRules(newRules);
                                            }}
                                            className="w-24 bg-black/40 border-blue-500/30 text-gray-300"
                                        />
                                    </div>
                                ))
                            )}
                        </div>

                        {status && (
                            <div className={`p-4 rounded-md ${status.includes("eligible") ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                                {status}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Quest;