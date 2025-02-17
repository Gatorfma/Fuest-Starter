"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../_components/ui/card";
import { Button } from "../_components/ui/button";
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <main className="relative min-h-screen w-full bg-gradient-to-b from-[#000814] via-[#001d3d] to-[#000814]">
            <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center px-4 py-8">
                <div className="w-full max-w-md relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-lg blur opacity-75" />
                    <Card className="relative bg-black/60 backdrop-blur-xl border-[#0466c8]/50 shadow-2xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                                401 - Unauthorized
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-center text-gray-300 mb-4">
                                Please connect your wallet and sign in to access this page.
                            </p>
                            <div className="flex justify-center">
                                <Button
                                    onClick={() => router.push('/')}
                                    className="bg-blue-500/50 hover:bg-blue-600"
                                >
                                    Go to Connect Page
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}