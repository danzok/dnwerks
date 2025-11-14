/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  reactCompiler: false, // Disable React compiler to prevent variable hoisting issues
  compiler: {
    // Remove react operations that might cause issues
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig