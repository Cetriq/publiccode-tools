/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@samhallskodex/core'],
  async redirects() {
    return [
      {
        source: '/register',
        destination: '/kom-igang/automation',
        permanent: true,
      },
      {
        source: '/add-repo',
        destination: '/kom-igang',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
