"use client";

import { useState } from 'react';
import { Contract, BrowserProvider, formatUnits } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../app/config.js';
import './page.css';

const Quest = () => {
    const [userAddress, setUserAddress] = useState("");
    const [inputAddress, setInputAddress] = useState("");
    const [status, setStatus] = useState("");

    // State for custom rules
    const [balanceAmount, setBalanceAmount] = useState(10000);
    const [balanceOperator, setBalanceOperator] = useState("greater-than-equal");
    const [transferCount, setTransferCount] = useState(5);
    const [transferOperator, setTransferOperator] = useState("greater-than-equal");

    // Function to connect wallet
    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                setUserAddress(accounts[0]);
                setStatus("");
            } catch (error) {
                console.error("Error connecting wallet:", error);
            }
        } else {
            alert("MetaMask not detected. Please install MetaMask to connect.");
        }
    };

    // Function to switch wallets by resetting the account
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

    // Function to check eligibility
    const checkQuestEligibility = async (addressToCheck: string) => {
        if (!addressToCheck || !/^(0x)?[0-9a-fA-F]{40}$/.test(addressToCheck)) {
            setStatus("Please enter a valid wallet address.");
            return;
        }

        try {
            const provider = new BrowserProvider(window.ethereum);
            const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

            // Check token balance
            const balance = await contract.balanceOf?.(addressToCheck);
            if (balance === undefined) {
                setStatus("Error: Contract method 'balanceOf' is undefined.");
                return;
            }
            const formattedBalance = parseFloat(formatUnits(balance, 18));

            // Apply balance rule
            const balanceEligible = checkRule(formattedBalance, balanceAmount, balanceOperator);

            // Check transfer count in the last 1000 blocks
            const currentBlock = await provider.getBlockNumber();
            const filter = contract.filters.Transfer?.(addressToCheck, null);
            if (!filter) {
                setStatus("Error: Transfer event filter is undefined.");
                return;
            }

            const events = await contract.queryFilter(filter, currentBlock - 1000, currentBlock);
            const transferCountActual = events.length;

            // Apply transfer count rule
            const transfersEligible = checkRule(transferCountActual, transferCount, transferOperator);

            // Determine eligibility and set detailed status
            if (balanceEligible && transfersEligible) {
                setStatus(`Address ${addressToCheck} is eligible for the quest!`);
            } else {
                let failureReason = `Address ${addressToCheck} is not eligible for the quest due to:`;
                if (!balanceEligible) {
                    failureReason += `\n- Balance rule not met (requires ${balanceOperator} ${balanceAmount}, has ${formattedBalance})`;
                }
                if (!transfersEligible) {
                    failureReason += `\n- Transfer rule not met (requires ${transferOperator} ${transferCount}, has ${transferCountActual})`;
                }
                setStatus(failureReason);
            }
        } catch (error) {
            console.error("Error checking eligibility:", error);
            setStatus("An error occurred. Please try again.");
        }
    };

    // Helper function to evaluate rules
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
            default:
                return false;
        }
    };

    const handleConnectedWalletCheck = () => {
        if (!userAddress) {
            setStatus("Please connect your wallet first.");
            return;
        }
        checkQuestEligibility(userAddress);
    };

    const handleInputAddressCheck = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        checkQuestEligibility(inputAddress);
    };

    return (
        <div className="container">
            <h2>Check Quest Eligibility</h2>

            {/* Connect or Switch MetaMask Wallet */}
            <button onClick={connectWallet}>
                {userAddress ? (
                    <span className="connected-address">Connected: {userAddress}</span>
                ) : (
                    "Connect Wallet"
                    )}
            </button>
            {userAddress && (
                <button onClick={handleSwitchWallet} style={{ marginTop: '1rem' }}>
                    Switch Wallet
                </button>
            )}

            {/* Check Eligibility for Connected Wallet */}
            <button onClick={handleConnectedWalletCheck} disabled={!userAddress} style={{ marginTop: '1rem' }}>
                Check Eligibility for Connected Wallet
            </button>

            {/* Form to Enter Any Address Manually */}
            <form onSubmit={handleInputAddressCheck} style={{ marginTop: '1rem' }}>
                <input
                    type="text"
                    placeholder="Enter any wallet address"
                    value={inputAddress}
                    onChange={(e) => setInputAddress(e.target.value)}
                />
                <button type="submit">Check Eligibility for Entered Address</button>
            </form>

            {/* Custom Rule Settings */}
            <div className="rules-section">
                <h3>Set Custom Rules</h3>
                <div>
                    <label>Balance:</label>
                    <select value={balanceOperator} onChange={(e) => setBalanceOperator(e.target.value)}>
                        <option value="greater-than-equal">{'≥'}</option>
                        <option value="less-than-equal">{'≤'}</option>
                        <option value="greater-than">{'>'}</option>
                        <option value="less-than">{'<'}</option>
                    </select>
                    <input
                        type="number"
                        value={balanceAmount}
                        onChange={(e) => setBalanceAmount(Number(e.target.value))}
                    />
                </div>

                <div>
                    <label>Transfer Count:</label>
                    <select value={transferOperator} onChange={(e) => setTransferOperator(e.target.value)}>
                        <option value="greater-than-equal">{'≥'}</option>
                        <option value="less-than-equal">{'≤'}</option>
                        <option value="greater-than">{'>'}</option>
                        <option value="less-than">{'<'}</option>
                    </select>
                    <input
                        type="number"
                        min={0}
                        value={transferCount}
                        onChange={(e) => setTransferCount(Number(e.target.value))}
                    />
                </div>
            </div>

            <p className={status.includes("eligible") ? "status-success" : "status-failure"}>{status}</p>
        </div>
    );
};

export default Quest;
