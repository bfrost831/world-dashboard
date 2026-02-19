/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@deck.gl/core', '@deck.gl/layers', '@deck.gl/mapbox'],
};

module.exports = nextConfig;
