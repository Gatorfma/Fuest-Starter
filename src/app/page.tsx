"use client";

import { useState, useEffect } from 'react';
import { Contract, BrowserProvider, formatUnits } from 'ethers';
import './page.css';

interface Token {
    name: string;
    address: string;
    abi: string;
}

const Quest = () => {
    const [userAddress, setUserAddress] = useState("");
    const [inputAddress, setInputAddress] = useState("");
    const [status, setStatus] = useState("");

    // Token management states
    const [tokens, setTokens] = useState<Token[]>([]);
    const [selectedToken, setSelectedToken] = useState<Token | null>(null);
    const [newToken, setNewToken] = useState<Token>({
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

    const addToken = () => {
      try {
          // Validate inputs
          if (!newToken.name || !newToken.address || !newToken.abi) {
              setStatus("Please fill in all token details");
              return;
          }
  
          // Validate address format
          if (!/^(0x)?[0-9a-fA-F]{40}$/.test(newToken.address)) {
              setStatus("Invalid contract address format");
              return;
          }
  
          // Validate ABI is valid JSON and has required methods
          let parsedAbi;
          try {
              parsedAbi = JSON.parse(newToken.abi);
              
              // Check if ABI is an array
              if (!Array.isArray(parsedAbi)) {
                  setStatus("Invalid ABI format: must be an array of function descriptions");
                  return;
              }
  
              // Check for balanceOf function
              const hasBalanceOf = parsedAbi.some(item => 
                  item.type === 'function' &&
                  item.name === 'balanceOf' &&
                  item.inputs?.length === 1 &&
                  item.inputs[0].type === 'address' &&
                  item.outputs?.length === 1 &&
                  (item.outputs[0].type === 'uint256' || item.outputs[0].type === 'uint')
              );
  
              // Check for Transfer event
              const hasTransfer = parsedAbi.some(item =>
                  item.type === 'event' &&
                  item.name === 'Transfer' &&
                  item.inputs?.length === 3 &&
                  item.inputs[0].type === 'address' &&
                  item.inputs[1].type === 'address' &&
                  (item.inputs[2].type === 'uint256' || item.inputs[2].type === 'uint')
              );
  
              if (!hasBalanceOf) {
                  setStatus("ABI must include a valid 'balanceOf(address)' function that returns uint256");
                  return;
              }
  
              if (!hasTransfer) {
                  setStatus("ABI must include a valid 'Transfer(address,address,uint256)' event");
                  return;
              }
          } catch (error) {
              setStatus("Invalid ABI JSON format. Please check the JSON structure.");
              return;
          }
  
          // Check for duplicate names or addresses
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
              address: newToken.address.toLowerCase(), // Normalize address
              abi: JSON.stringify(parsedAbi) // Store normalized ABI
          }];
          
          setTokens(updatedTokens);
          setShowAddToken(false);
          setNewToken({ name: '', address: '', abi: '' });
          setSelectedToken(newToken); // Automatically select the newly added token
          setStatus("Token added successfully!");
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

    const checkQuestEligibility = async (addressToCheck: string) => {
      if (!selectedToken) {
          setStatus("Please select a token first");
          return;
      }
  
      if (!addressToCheck || !/^(0x)?[0-9a-fA-F]{40}$/.test(addressToCheck)) {
          setStatus("Please enter a valid wallet address.");
          return;
      }
  
      try {
          const provider = new BrowserProvider(window.ethereum);
          
          // Parse the ABI string to JSON
          let parsedAbi;
          try {
              parsedAbi = JSON.parse(selectedToken.abi);
          } catch (error) {
              setStatus("Invalid ABI format for selected token");
              return;
          }
  
          // Create contract instance with type assertion
          const contract = new Contract(
              selectedToken.address,
              parsedAbi,
              provider
          ) as Contract & {
              balanceOf(address: string): Promise<bigint>;
              filters: {
                  Transfer(from: string | null, to: string | null): any;
              };
              queryFilter(filter: any, fromBlock: number, toBlock: number): Promise<any[]>;
          };
  
          try {
              // Verify contract methods exist
              if (typeof contract.balanceOf !== 'function') {
                  setStatus("Contract does not have a valid balanceOf function");
                  return;
              }
  
              if (!contract.filters || typeof contract.filters.Transfer !== 'function') {
                  setStatus("Contract does not have a valid Transfer event filter");
                  return;
              }
  
              // Get balance with error handling
              let balance;
              try {
                  balance = await contract.balanceOf(addressToCheck);
              } catch (error: any) {
                  setStatus(`Error fetching balance: ${error.message}`);
                  return;
              }
  
              const formattedBalance = parseFloat(formatUnits(balance, 18));
  
              // Apply balance rule
              const balanceEligible = checkRule(formattedBalance, balanceAmount, balanceOperator);
  
              // Check transfer count with error handling
              const currentBlock = await provider.getBlockNumber();
              let transferEvents;
              try {
                  const filter = contract.filters.Transfer(addressToCheck, null);
                  transferEvents = await contract.queryFilter(
                      filter,
                      currentBlock - 1000,
                      currentBlock
                  );
              } catch (error: any) {
                  setStatus(`Error fetching transfer history: ${error.message}`);
                  return;
              }
  
              const transferCountActual = transferEvents.length;
  
              // Apply transfer count rule
              const transfersEligible = checkRule(transferCountActual, transferCount, transferOperator);
  
              // Set status based on eligibility
              if (balanceEligible && transfersEligible) {
                  setStatus(`Address ${addressToCheck} is eligible for the quest with ${selectedToken.name}!`);
              } else {
                  let failureReason = `Address ${addressToCheck} is not eligible for the quest with ${selectedToken.name} due to:`;
                  if (!balanceEligible) {
                      failureReason += `\n- Balance rule not met (requires ${balanceOperator} ${balanceAmount}, has ${formattedBalance})`;
                  }
                  if (!transfersEligible) {
                      failureReason += `\n- Transfer rule not met (requires ${transferOperator} ${transferCount}, has ${transferCountActual})`;
                  }
                  setStatus(failureReason);
              }
          } catch (error: any) {
              console.error("Contract interaction error:", error);
              setStatus(`Contract interaction error: ${error.message}`);
          }
      } catch (error: any) {
          console.error("Error checking eligibility:", error);
          setStatus(`Error checking eligibility: ${error.message}`);
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
                                onChange={(e) => setNewToken({...newToken, name: e.target.value})}
                            />
                            <input
                                type="text"
                                placeholder="Contract Address"
                                value={newToken.address}
                                onChange={(e) => setNewToken({...newToken, address: e.target.value})}
                            />
                            <textarea
                                placeholder="Contract ABI (JSON format)"
                                value={newToken.abi}
                                onChange={(e) => setNewToken({...newToken, abi: e.target.value})}
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
                    <div className="rule-row">
                        <label>Balance:</label>
                        <select 
                            value={balanceOperator} 
                            onChange={(e) => setBalanceOperator(e.target.value)}
                        >
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

                    <div className="rule-row">
                        <label>Transfer Count:</label>
                        <select 
                            value={transferOperator} 
                            onChange={(e) => setTransferOperator(e.target.value)}
                        >
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