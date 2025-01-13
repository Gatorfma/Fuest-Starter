import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { generateNonce } from 'siwe';
import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/app/_components/ui/dropdown-menu";

export function SignInButton() {
    const { address, chain } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [signedInAddress, setSignedInAddress] = useState<string | null>(null);


    const prepareSiweMessage = api.auth.prepareSiweMessage.useMutation();
    const verifySiweMessage = api.auth.verifySiweMessage.useMutation();

    // Load signed-in status from localStorage on component mount
    useEffect(() => {
        const stored = localStorage.getItem('siwe_address');
        if (stored) {
            setSignedInAddress(stored);
        }
    }, []);

    const handleSignIn = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!address || !chain) {
                throw new Error("Wallet not connected");
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
                setSignedInAddress(verification.address);
                localStorage.setItem('siwe_address', verification.address);
            }
        } catch (error: any) {
            console.error("Error during sign-in:", error);
            setError(error.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = () => {
        setSignedInAddress(null);
        localStorage.removeItem('siwe_address');
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
                disabled={loading || !address}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/20"
            >
                {loading ? "Signing in..." : "Sign-in with Ethereum"}
            </Button>
            {error && (
                <p className="text-sm text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}