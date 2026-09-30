/** @type {import('next').NextConfig} */
const nextConfig = {
  // Logotip yuklash (1 MB gacha) uchun server action hajmi
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
};

export default nextConfig;
