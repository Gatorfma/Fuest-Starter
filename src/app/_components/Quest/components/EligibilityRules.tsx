import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Input } from "../../ui/input";
import { type Rule } from '../types';

interface EligibilityRulesProps {
    rules: Rule[];
    setRules: (rules: Rule[]) => void;
}

export const EligibilityRules: React.FC<EligibilityRulesProps> = ({
    rules,
    setRules
}) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-400">
                Customize Eligibility Rules
            </h3>
            {rules.length === 0 ? (
                <p className="text-sm text-gray-400">
                    No rules available. Please select a token first.
                </p>
            ) : (
                rules.map((rule, index) => (
                    <div key={rule.functionName} className="flex items-center gap-2">
                        <span className="text-gray-300">{rule.displayName}:</span>
                        <Select
                            value={rule.operator}
                            onValueChange={(value) => {
                                const newRules = [...rules];
                                newRules[index] = { ...rule, operator: value };
                                setRules(newRules);
                            }}
                        >
                            <SelectTrigger className="w-24 bg-black/40 border-blue-500/30 text-gray-300">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="greater-than-equal">≥</SelectItem>
                                <SelectItem value="less-than-equal">≤</SelectItem>
                                <SelectItem value="greater-than">{'>'}</SelectItem>
                                <SelectItem value="less-than">{'<'}</SelectItem>
                                <SelectItem value="equal">=</SelectItem>
                                <SelectItem value="not-equal">≠</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            type="number"
                            value={rule.value}
                            onChange={(e) => {
                                const newRules = [...rules];
                                newRules[index] = { ...rule, value: Number(e.target.value) };
                                setRules(newRules);
                            }}
                            className="w-24 bg-black/40 border-blue-500/30 text-gray-300"
                        />
                    </div>
                ))
            )}
        </div>
    );
};