import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { generateNonce } from 'siwe';
import { api } from "~/trpc/react";
import { Button } from "../../../components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/app/_components/ui/dropdown-menu";
import { useAuth } from '../AuthContext';

interface SignInButtonProps {
    className?: string;
    onSignIn: () => void;
}


export function SignInButton({ className, onSignIn }: { className?: string; onSignIn: () => void }) {
    const { signedInAddress, setAuthState } = useAuth();
    const { address, chain, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const prepareSiweMessage = api.auth.prepareSiweMessage.useMutation();
    const verifySiweMessage = api.auth.verifySiweMessage.useMutation();
    const SiweSignOut = api.auth.signOut.useMutation();

    useEffect(() => {
        console.log('Wallet State:', {
            address,
            chainId: chain?.id,
            isConnected
        });
    }, [address, chain, isConnected]);


    const handleSignIn = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!isConnected || !address) {
                throw new Error("Please connect your wallet first");
            }

            if (!chain) {
                throw new Error("Please switch to a supported network (Mainnet, Sepolia, or Polygon)");
            }

            const nonce = generateNonce();
            const { message } = await prepareSiweMessage.mutateAsync({
                address,
                chainId: chain.id,
                nonce,
            });

            const signature = await signMessageAsync({
                message,
            });

            const verification = await verifySiweMessage.mutateAsync({
                message,
                signature,
            });

            if (verification.success) {
                setAuthState(verification.address);
            }
        } catch (error: any) {
            console.error("Error during sign-in:", error);
            setError(error.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    const getButtonText = () => {
        if (loading) return "Signing in...";
        if (!isConnected) return "Connect wallet first";
        if (!chain) return "Switch to supported network";
        return "Sign-in with Ethereum";
    };

    const handleSignOut = async () => {
        await SiweSignOut.mutateAsync();
        setAuthState(null);
    };

    // Function to truncate address for display
    const truncateAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    if (signedInAddress) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white shadow-lg shadow-green-500/20"
                    >
                        {truncateAddress(signedInAddress)}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] bg-black/90 border border-green-500/30">
                    <DropdownMenuItem
                        onClick={() => {
                            navigator.clipboard.writeText(signedInAddress);
                        }}
                        className="text-gray-300 hover:text-white hover:bg-green-500/20 cursor-pointer"
                    >
                        Copy Address
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20 cursor-pointer"
                    >
                        Sign Out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <div className="space-y-2">
            <Button
                onClick={handleSignIn}
                disabled={loading || !isConnected || !chain}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/20"
            >
                {getButtonText()}
            </Button>
            {error && (
                <p className="text-sm text-red-500">
                    {error}
                </p>
            )}
            {isConnected && !chain && (
                <p className="text-xs text-yellow-500">
                    Please switch to a supported network (Mainnet, Sepolia, or Polygon)
                </p>
            )}
        </div>
    );
}