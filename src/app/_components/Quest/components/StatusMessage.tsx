interface StatusMessageProps {
    status: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ status }) => {
    if (!status) return null;

    const isEligible = status.includes("is eligible for");
    const isNotEligible = status.includes("is not eligible for");

    return (
        <div className={`p-4 rounded-md ${isEligible
            ? "bg-green-500/20 text-green-300 border border-green-500/30"
            : isNotEligible
                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
            }`}>
            <p className="whitespace-pre-line">{status}</p>
        </div>
    );
};