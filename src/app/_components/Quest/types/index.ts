export interface AbiFunction {
    name: string;
    type: string;
    inputs: { type: string; name: string }[];
    outputs: { type: string }[];
    stateMutability?: string;
}

export interface Rule {
    functionName: string;
    operator: string;
    value: number;
    displayName: string;
}

export interface Token {
    id: number;
    name: string;
    address: string;
    abi: string;
}