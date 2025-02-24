import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Button } from "../../../../components/ui/button";
import { type Token } from '../types';
import { usePathname } from 'next/navigation';

interface TokenSelectionProps {
    tokens: Token[];
    selectedToken: Token | null;
    setSelectedToken: (token: Token | null) => void;
    showAddToken: boolean;
    setShowAddToken: (show: boolean) => void;
    removeToken: (id: number) => Promise<void>;
    isAuthenticated: boolean;
}

export const TokenSelection: React.FC<TokenSelectionProps> = ({
    tokens,
    selectedToken,
    setSelectedToken,
    showAddToken,
    setShowAddToken,
    removeToken,
    isAuthenticated
}) => {
    const pathname = usePathname();
    const isTokensPage = pathname === '/tokens';

    return (
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
                    {isTokensPage && selectedToken && (
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
            {isTokensPage && (
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
            )}
        </div>
    );
};