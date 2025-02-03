import dynamic from 'next/dynamic';

const DynamicWalletConnection = dynamic(
    () => import('./WalletConnectionInner').then(mod => mod.WalletConnectionInner),
    {
        ssr: false,
        loading: () => (
            <div className="space-y-4">
                <div className="space-y-2">
                    <button className="w-full bg-gradient-to-r from-blue-500 to-blue-700 opacity-50 text-white shadow-lg shadow-blue-500/20 p-2 rounded-md">
                        Loading Wallet Connection...
                    </button>
                </div>
            </div>
        )
    }
);

export { DynamicWalletConnection as WalletConnection };