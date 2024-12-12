"use client";

import { useState, useEffect } from 'react';
import { Contract, BrowserProvider, formatUnits } from 'ethers';
import './page.css';
import { trpc } from '~/utils/trpc';

interface Token {
    id: string;
    name: string;
    address: string;
    abi: string;
}

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

    // Token management states
    const [tokens, setTokens] = useState<Token[]>([]);
    const [selectedToken, setSelectedToken] = useState<Token | null>(null);
    const [newToken, setNewToken] = useState<Token>({
        id: '',
        name: '',
        address: '',
        abi: ''
    });
    const [showAddToken, setShowAddToken] = useState(false);

    // State for custom rules
    const [balanceAmount, setBalanceAmount] = useState(10000);
    const [balanceOperator, setBalanceOperator] = useState("greater-than-equal");
    const [transferCount, setTransferCount] = useState(5);
    const [transferOperator, setTransferOperator] = useState("greater-than-equal");
    const [rules, setRules] = useState<Rule[]>([]);

    // Load tokens from localStorage on component mount
    useEffect(() => {
        const savedTokens = localStorage.getItem('tokens');
        if (savedTokens) {
            const parsedTokens = JSON.parse(savedTokens);
            setTokens(parsedTokens);
            if (parsedTokens.length > 0) {
                setSelectedToken(parsedTokens[0]);
            }
        }
    }, []);

    // Save tokens to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('tokens', JSON.stringify(tokens));
    }, [tokens]);

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

    const addToken = () => {
        try {
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
            let parsedAbi;
            try {
                parsedAbi = JSON.parse(newToken.abi);
                if (!Array.isArray(parsedAbi)) {
                    setStatus("Invalid ABI format: must be an array of function descriptions");
                    return;
                }

                // Generate rules from ABI
                const eligibleFunctions = parseAbiForRules(newToken.abi);
                const newRules: Rule[] = eligibleFunctions.map(func => ({
                    functionName: func.name,
                    operator: 'greater-than-equal',
                    value: 0,
                    displayName: formatFunctionName(func.name)
                }));

                // Check for duplicate tokens
                if (tokens.some(token =>
                    token.name.toLowerCase() === newToken.name.toLowerCase() ||
                    token.address.toLowerCase() === newToken.address.toLowerCase()
                )) {
                    setStatus("A token with this name or address already exists");
                    return;
                }

                // Add new token
                const updatedTokens = [...tokens, {
                    ...newToken,
                    address: newToken.address.toLowerCase(),
                    abi: JSON.stringify(parsedAbi)
                }];

                setTokens(updatedTokens);
                setShowAddToken(false);
                setNewToken({ id: '', name: '', address: '', abi: '' });


                const addedToken = {
                    ...newToken,
                    address: newToken.address.toLowerCase(),
                    abi: JSON.stringify(parsedAbi)
                };
                setSelectedToken(addedToken);
                setRules(newRules);
                setStatus("Token added successfully!");
            } catch (error) {
                setStatus("Invalid ABI JSON format. Please check the JSON structure.");
                return;
            }
        } catch (error: any) {
            console.error("Error adding token:", error);
            setStatus(`Error adding token: ${error.message}`);
        }
    };

    const removeToken = (tokenName: string) => {
        const updatedTokens = tokens.filter(token => token.name !== tokenName);
        setTokens(updatedTokens);
        if (selectedToken?.name === tokenName) {
            setSelectedToken(updatedTokens[0] || null);
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
        if (window.ethereum) {
            try {
                const provider = new BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                setUserAddress(accounts[0]);
                setStatus("");
            } catch (error) {
                console.error("Error connecting wallet:", error);
                setStatus("Failed to connect wallet. Please try again.");
            }
        } else {
            alert("MetaMask not detected. Please install MetaMask to connect.");
        }
    };

    const handleSwitchWallet = async () => {
        try {
            const provider = new BrowserProvider(window.ethereum);
            await provider.send("wallet_requestPermissions", [{ eth_accounts: {} }]);
            connectWallet();
        } catch (error) {
            console.error("Error switching wallet:", error);
            setStatus("An error occurred while switching wallet. Please try again.");
        }
    };



    const checkRule = (value: number, target: number, operator: string) => {
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

    const checkEligibilityMutation = trpc.eligibility.checkEligibility.useMutation({
        onSuccess: (data) => {
            if (data.success) {
                setStatus(`Address ${inputAddress} is eligible for ${data.tokenName} token (${data.tokenAddress})!`);
            } else {
                let failureReason = `Address ${inputAddress} is not eligible for ${data.tokenName} token (${data.tokenAddress}) due to:\n`;
                data.results.forEach((result) => {
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
        <div className="quest-container">
            <div className="quest-card">
                <h2>Quest Eligibility Checker</h2>

                <div className="token-management-section">
                    <h3>Token Selection</h3>
                    {tokens.length === 0 ? (
                        <div className="no-tokens-message">
                            <p>No tokens added yet. Please add a token to begin.</p>
                        </div>
                    ) : (
                        <div className="token-selection">
                            <select
                                value={selectedToken?.name || ''}
                                onChange={(e) => {
                                    const selected = tokens.find(t => t.name === e.target.value);
                                    setSelectedToken(selected || null);
                                }}
                                className="token-select"
                            >
                                <option value="">Select a token</option>
                                {tokens.map((token) => (
                                    <option key={token.name} value={token.name}>
                                        {token.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        className="secondary-btn"
                        onClick={() => setShowAddToken(!showAddToken)}
                        style={{ marginTop: '1rem' }}
                    >
                        {showAddToken ? 'Cancel' : 'Add New Token'}
                    </button>

                    {showAddToken && (
                        <div className="add-token-form">
                            <input
                                type="text"
                                placeholder="Token Name"
                                value={newToken.name}
                                onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Contract Address"
                                value={newToken.address}
                                onChange={(e) => setNewToken({ ...newToken, address: e.target.value })}
                            />
                            <textarea
                                placeholder="Contract ABI (JSON format)"
                                value={newToken.abi}
                                onChange={(e) => setNewToken({ ...newToken, abi: e.target.value })}
                                className="abi-input"
                            />
                            <button
                                className="primary-btn"
                                onClick={addToken}
                            >
                                Add Token
                            </button>
                        </div>
                    )}

                    {tokens.length > 0 && (
                        <div className="token-list">
                            <h4>Managed Tokens:</h4>
                            {tokens.map((token) => (
                                <div key={token.name} className="token-item">
                                    <span>{token.name}</span>
                                    <button
                                        className="remove-token-btn"
                                        onClick={() => removeToken(token.name)}
                                        title="Remove Token"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="wallet-section">
                    {!userAddress ? (
                        <button onClick={connectWallet} className="primary-btn">
                            Connect Wallet
                        </button>
                    ) : (
                        <div className="wallet-details">
                            <div className="wallet-address-container">
                                <span className="wallet-address-label">Connected Wallet:</span>
                                <div className="wallet-address-display">
                                    <span className="full-address">{userAddress}</span>
                                    <div className="address-actions">
                                        <button
                                            onClick={copyAddressToClipboard}
                                            className="copy-btn"
                                            title="Copy Address"
                                        >
                                            📋
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="wallet-actions">
                                <button onClick={handleSwitchWallet} className="secondary-btn">
                                    Switch Wallet
                                </button>
                            </div>
                        </div>
                    )}

                    {userAddress && (
                        <button
                            onClick={handleConnectedWalletCheck}
                            className="primary-btn"
                            disabled={!userAddress || !selectedToken}
                        >
                            Check My Eligibility
                        </button>
                    )}
                </div>

                <form onSubmit={handleInputAddressCheck} className="address-form">
                    <input
                        type="text"
                        placeholder="Enter wallet address to check"
                        value={inputAddress}
                        onChange={(e) => setInputAddress(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="primary-btn"
                        disabled={!selectedToken}
                    >
                        Check Address Eligibility
                    </button>
                </form>

                <div className="rules-section">
                    <h3>Customize Eligibility Rules</h3>
                    {rules.length === 0 ? (
                        <p>No rules available. Please select a token first.</p>
                    ) : (
                        rules.map((rule, index) => (
                            <div key={rule.functionName} className="rule-row">
                                <label>{rule.displayName}:</label>
                                <select
                                    value={rule.operator}
                                    onChange={(e) => {
                                        const newRules = [...rules];
                                        newRules[index] = {
                                            ...rule,
                                            operator: e.target.value
                                        };
                                        setRules(newRules);
                                    }}
                                >
                                    <option value="greater-than-equal">{'≥'}</option>
                                    <option value="less-than-equal">{'≤'}</option>
                                    <option value="greater-than">{'>'}</option>
                                    <option value="less-than">{'<'}</option>
                                    <option value="equal">{'='}</option>
                                    <option value="not-equal">{'≠'}</option>
                                </select>
                                <input
                                    type="number"
                                    value={rule.value}
                                    onChange={(e) => {
                                        const newRules = [...rules];
                                        newRules[index] = {
                                            ...rule,
                                            value: Number(e.target.value)
                                        };
                                        setRules(newRules);
                                    }}
                                />
                            </div>
                        ))
                    )}
                </div>

                <div className="status-section">
                    <p className={`status-message ${status.includes("eligible") ? "status-success" : status ? "status-failure" : ""}`}>
                        {status}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Quest;