/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cap stale-while-revalidate on ISR pages (s-maxage=60, swr=540) so a
  // low-traffic team page can't serve day-old scores.
  expireTime: 600,
};

export default nextConfig;
