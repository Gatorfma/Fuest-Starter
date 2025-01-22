'use client';

import { useEffect } from 'react';

export const CookieDebug = () => {
    useEffect(() => {
        console.log('Document cookies:', document.cookie);

        fetch('/api/debug/cookies', {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                console.log('Server-side cookies:', data);
            });
    }, []);

    return null;
};