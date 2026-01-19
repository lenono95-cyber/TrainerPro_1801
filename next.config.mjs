/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.watchOptions = {
            ...config.watchOptions,
            ignored: ['**/_backup/**', '**/node_modules/**'],
        };
        return config;
    },
    eslint: {
        dirs: ['src'],
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
