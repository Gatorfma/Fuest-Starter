import { AbiFunction } from '../types';

export const parseAbiForRules = (abi: string): AbiFunction[] => {
    try {
        const parsedAbi = JSON.parse(abi);
        return parsedAbi.filter((item: AbiFunction) => {
            if (item.type !== 'function') return false;
            if (item.stateMutability !== 'view' && item.stateMutability !== 'pure') return false;
            if (!item.outputs || item.outputs.length === 0) return false;
            const outputType = item.outputs[0]?.type;
            if (!outputType) return false;

            const isNumericOutput = [
                'uint256', 'uint128', 'uint64', 'uint32', 'uint16', 'uint8',
                'int256', 'int128', 'int64', 'int32', 'int16', 'int8',
                'uint', 'int'
            ].includes(outputType);

            if (!isNumericOutput || outputType === 'string') return false;
            if (!item.inputs) return true;
            if (item.inputs.length === 0) return true;
            return item.inputs.length === 1 && item.inputs[0]?.type === 'address';
        });
    } catch (error) {
        console.error('Error parsing ABI:', error);
        return [];
    }
};

export const formatFunctionName = (name: string): string => {
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
};