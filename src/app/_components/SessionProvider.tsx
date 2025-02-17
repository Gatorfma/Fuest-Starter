'use client'

import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

interface SessionProviderProps {
    children: ReactNode
    isAuthorized: boolean
}

export function SessionProvider({ children, isAuthorized }: SessionProviderProps) {
    const router = useRouter()

    useEffect(() => {
        if (!isAuthorized && window.location.pathname !== '/unauthorized') {
            router.replace('/unauthorized')
        }
    }, [isAuthorized, router])

    return <>{children}</>
}