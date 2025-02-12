import { SignInButton } from '~/app/_components/ui/sign-inButton'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Unauthorized - Please Sign In',
    description: 'You need to be signed in to access this page',
}

export default function UnauthorizedPage() {
    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#000814] via-[#001d3d] to-[#000814]">
            <div className="w-full max-w-md p-8 space-y-4 bg-black/60 backdrop-blur-xl border border-[#0466c8]/50 rounded-lg shadow-2xl">
                <h1 className="text-2xl font-bold text-center text-red-500">
                    401 - Unauthorized
                </h1>
                <p className="text-center text-gray-300">
                    Please log in to access this page.
                </p>
                <SignInButton />
            </div>
        </main>
    )
}