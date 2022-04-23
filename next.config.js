/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

const withTM = require('next-transpile-modules')([
  '@awsui/components-react',
  '@awsui/global-styles',
  '@awsui/collection-hooks',
  '@awsui/design-tokens',
]);

module.exports = withTM(nextConfig);
