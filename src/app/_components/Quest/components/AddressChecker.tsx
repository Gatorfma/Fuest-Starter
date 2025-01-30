import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { type Token } from '../types';

interface AddressCheckerProps {
    inputAddress: string;
    setInputAddress: (address: string) => void;
    handleInputAddressCheck: (e: React.FormEvent<HTMLFormElement>) => void;
    selectedToken: Token | null;
}

export const AddressChecker: React.FC<AddressCheckerProps> = ({
    inputAddress,
    setInputAddress,
    handleInputAddressCheck,
    selectedToken
}) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-400">Check Any Address</h3>
            <form onSubmit={handleInputAddressCheck} className="space-y-2">
                <Input
                    type="text"
                    placeholder="Enter wallet address to check"
                    value={inputAddress}
                    onChange={(e) => setInputAddress(e.target.value)}
                    className="w-full bg-black/40 border-blue-500/30 text-gray-300 placeholder:text-gray-500"
                />
                <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white shadow-lg shadow-green-500/20"
                    disabled={!selectedToken}
                >
                    Check Address Eligibility
                </Button>
            </form>
        </div>
    );
};