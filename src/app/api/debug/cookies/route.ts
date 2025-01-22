import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth-token');

    return NextResponse.json({
        hasAuthToken: !!authToken,
        tokenLength: authToken?.value?.length ?? 0,
    });
}