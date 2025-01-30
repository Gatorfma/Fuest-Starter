import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { trpc } from '~/utils/trpc';
import { type Token } from '../types';
import { useAuth } from '../../AuthContext';

interface TokenManagementReturn {
    tokens: Token[];
    selectedToken: Token | null;
    setSelectedToken: Dispatch<SetStateAction<Token | null>>;
    newToken: Token;
    setNewToken: Dispatch<SetStateAction<Token>>;
    showAddToken: boolean;
    setShowAddToken: Dispatch<SetStateAction<boolean>>;
    addToken: () => Promise<void>;
    removeToken: (tokenId: number) => Promise<void>;
    status: string;
    setStatus: Dispatch<SetStateAction<string>>;
    isAuthenticated: boolean;
}

export const useTokenManagement = (): TokenManagementReturn => {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [selectedToken, setSelectedToken] = useState<Token | null>(null);
    const [newToken, setNewToken] = useState<Token>({
        id: 0,
        name: '',
        address: '',
        abi: ''
    });
    const [showAddToken, setShowAddToken] = useState(false);
    const [status, setStatus] = useState("");
    const { isAuthenticated } = useAuth();
    const utils = trpc.useContext();

    const { data: dbTokens } = trpc.tokens.getAll.useQuery();

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
            utils.tokens.getAll.invalidate();
        },
        onError: (error) => {
            setStatus(`Error adding token: ${error.message}`);
        }
    });

    const deleteTokenMutation = trpc.tokens.deleteToken.useMutation({
        onSuccess: () => {
            utils.tokens.getAll.invalidate();
        },
        onError: (error) => {
            setStatus(`Error deleting token: ${error.message}`);
        }
    });

    const addToken = async () => {
        try {
            if (!isAuthenticated) {
                setStatus("Please sign in with Ethereum to add tokens");
                return;
            }
            if (!newToken.name || !newToken.address || !newToken.abi) {
                setStatus("Please fill in all token details");
                return;
            }

            if (!/^(0x)?[0-9a-fA-F]{40}$/.test(newToken.address)) {
                setStatus("Invalid contract address format");
                return;
            }

            const parsedAbi = JSON.parse(newToken.abi);
            if (!Array.isArray(parsedAbi)) {
                setStatus("Invalid ABI format: must be an array of function descriptions");
                return;
            }

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

    useEffect(() => {
        if (dbTokens) {
            setTokens(dbTokens);
            setSelectedToken(dbTokens.length > 0 && dbTokens[0] ? dbTokens[0] : null);
        }
    }, [dbTokens]);

    return {
        tokens,
        selectedToken,
        setSelectedToken,
        newToken,
        setNewToken,
        showAddToken,
        setShowAddToken,
        addToken,
        removeToken,
        status,
        setStatus,
        isAuthenticated
    };
};