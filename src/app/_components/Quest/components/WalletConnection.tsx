import { Button } from "../../ui/button";
import { SignInButton } from "../../ui/sign-inButton";
import { CookieDebug } from "../../debug/CookieDebug";

interface WalletConnectionProps {
    userAddress: string;
    connectWallet: () => Promise<void>;
    handleConnectedWalletCheck: () => void;
    handleSwitchWallet: () => Promise<void>;
    copyAddressToClipboard: () => void;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({
    userAddress,
    connectWallet,
    handleConnectedWalletCheck,
    handleSwitchWallet,
    copyAddressToClipboard
}) => {
    return (
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
                    {process.env.NODE_ENV === 'development' && <CookieDebug />}
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
    );
};