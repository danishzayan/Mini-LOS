/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production';
    return [
      {
        source: '/api/v1/:path*',
        destination: isProd
          ? 'https://mini-los.onrender.com/api/v1/:path*'
          : 'http://localhost:8000/api/v1/:path*',
      },
    ];
  },
}

module.exports = nextConfig
