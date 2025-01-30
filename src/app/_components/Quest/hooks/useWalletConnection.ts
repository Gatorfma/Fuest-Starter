import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from '@wagmi/connectors';

interface WalletConnectionReturn {
    userAddress: string;
    isConnected: boolean;
    connectWallet: () => Promise<void>;
    handleSwitchWallet: () => Promise<void>;
    copyAddressToClipboard: () => void;
    handleConnectedWalletCheck: () => void;
    status: string;
    setStatus: Dispatch<SetStateAction<string>>;
}

export const useWalletConnection = (): WalletConnectionReturn => {
    const [userAddress, setUserAddress] = useState("");
    const [status, setStatus] = useState("");
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();

    useEffect(() => {
        if (address) {
            setUserAddress(address);
            setStatus("");
        } else {
            setUserAddress("");
        }
    }, [address]);

    const connectWallet = async () => {
        try {
            await connect({ connector: injected() });
        } catch (error) {
            console.error("Error connecting wallet:", error);
            setStatus("Failed to connect wallet. Please try again.");
        }
    };

    const handleSwitchWallet = async () => {
        try {
            await disconnect();
            await connect({ connector: injected() });
        } catch (error) {
            console.error("Error switching wallet:", error);
            setStatus("An error occurred while switching wallet. Please try again.");
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

    const handleConnectedWalletCheck = () => {
        if (!userAddress) {
            setStatus("Please connect your wallet first.");
            return;
        }
    };

    return {
        userAddress,
        isConnected,
        connectWallet,
        handleSwitchWallet,
        copyAddressToClipboard,
        handleConnectedWalletCheck,
        status,
        setStatus
    };
};