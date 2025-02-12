import type { NextConfig } from 'next'

type CustomExperimentalConfig = {
    authInterrupts?: boolean
}

type CustomNextConfig = NextConfig & {
    experimental?: CustomExperimentalConfig
}

const nextConfig: CustomNextConfig = {
    experimental: {
        authInterrupts: true,
    },
}

export default nextConfig