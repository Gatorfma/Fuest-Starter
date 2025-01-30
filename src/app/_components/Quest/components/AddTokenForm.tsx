import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { type Token } from '../types';

interface AddTokenFormProps {
    newToken: Token;
    setNewToken: (token: Token) => void;
    addToken: () => Promise<void>;
}

export const AddTokenForm: React.FC<AddTokenFormProps> = ({
    newToken,
    setNewToken,
    addToken
}) => {
    return (
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
    );
};