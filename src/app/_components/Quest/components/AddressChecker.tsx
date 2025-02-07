import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { type Token } from '../types';
import { EligibilityRules } from './EligibilityRules';
import { useEligibilityCheck } from '../hooks/useEligibilityCheck';

interface AddressCheckerProps {
    inputAddress: string;
    setInputAddress: React.Dispatch<React.SetStateAction<string>>;
    handleInputAddressCheck: (e: React.FormEvent<HTMLFormElement>) => void;
    selectedToken: Token | null;
}

export const AddressChecker: React.FC<AddressCheckerProps> = ({
    selectedToken
}) => {
    const {
        rules,
        setRules,
        inputAddress,
        setInputAddress,
        checkEligibility,
        status
    } = useEligibilityCheck();

    const handleInputAddressCheck = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (selectedToken && inputAddress) {
            checkEligibility(selectedToken, inputAddress);
        }
    };

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
                    disabled={!selectedToken || !inputAddress}
                >
                    Check Address Eligibility
                </Button>
            </form>

            {status && (
                <div className={`p-4 rounded-lg ${status.includes('eligible')
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-red-500/10 border border-red-500/30'
                    }`}>
                    <p className={`whitespace-pre-line text-sm ${status.includes('eligible') ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {status}
                    </p>
                </div>
            )}
        </div>
    );
};