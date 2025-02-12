import { cookies } from 'next/headers'

export async function verifySession() {
    const cookieStore = cookies()
    const authToken = cookieStore.get('auth-token')

    if (authToken) {
        try {
            return {
                authenticated: true,
                user: {
                    name: 'User'
                }
            }
        } catch (error) {
            return null
        }
    }

    return null
} 