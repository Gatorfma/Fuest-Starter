'use server'

import { verifySession } from '~/lib/auth'

export async function protectedAction(data: FormData) {
    const session = await verifySession()

    if (!session) {
        return new Response('Unauthorized', {
            status: 401,
            statusText: 'Unauthorized'
        })
    }

    return {
        success: true,
        message: 'Action completed successfully'
    }
}