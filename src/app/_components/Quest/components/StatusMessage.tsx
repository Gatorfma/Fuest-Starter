interface StatusMessageProps {
    status: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ status }) => {
    if (!status) return null;

    return (
        <div className={`p-4 rounded-md ${status.includes("eligible")
                ? "bg-green-500/20 text-green-300"
                : "bg-red-500/20 text-red-300"
            }`}>
            {status}
        </div>
    );
};