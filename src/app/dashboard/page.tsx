import { verifySession } from '~/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const session = await verifySession()

    if (!session) {
        redirect('/unauthorized')
    }

    return (
        <main className="min-h-screen w-full p-8 bg-gradient-to-b from-[#000814] via-[#001d3d] to-[#000814]">
            <div className="max-w-4xl mx-auto space-y-4">
                <h1 className="text-3xl font-bold text-blue-400">
                    Welcome to the Dashboard
                </h1>
                <p className="text-gray-300">
                    Hi, {session.user.name}.
                </p>
            </div>
        </main>
    )
}