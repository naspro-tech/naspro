/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        destination: 'https://naspropvt.vercel.app/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
