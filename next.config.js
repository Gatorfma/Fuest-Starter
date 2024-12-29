/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
const isProd = process.env.NODE_ENV === 'production';

if (!isProd) {
    await import("./src/env.js");
}

/** @type {import("next").NextConfig} */
const config = {};

export default config;