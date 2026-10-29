/** @type {import('next').NextConfig} */
const repo = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.replace(/.*?\//, '') : '';
const isGitHubPages = process.env.GITHUB_PAGES === 'true' || !!process.env.GITHUB_REPOSITORY;
const basePath = isGitHubPages && repo ? `/${repo}` : '';

const nextConfig = {
  ...(isGitHubPages ? { output: 'export' } : {}),
  images: {
    unoptimized: true,
  },
  ...(basePath
    ? {
        basePath,
        assetPrefix: `${basePath}/`,
      }
    : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
