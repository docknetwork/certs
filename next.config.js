require('dotenv').config();

const nextConfig = {
  future: { webpack5: true },
  exportTrailingSlash: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.experiments = {
	  asyncWebAssembly: true
	};

    // Important: return the modified config
    return config;
  },
  workboxOpts: {
    swDest: "static/service-worker.js",
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: "https-calls",
          networkTimeoutSeconds: 15,
          expiration: {
            maxEntries: 150,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 1 month
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  },
  env: {
    NEXT_PUBLIC_MAGIC_PUBLIC_KEY: process.env.NEXT_PUBLIC_MAGIC_PUBLIC_KEY,
    NEXT_PUBLIC_WSS_NODE_ADDR: process.env.NEXT_PUBLIC_WSS_NODE_ADDR,
  }
};

module.exports = nextConfig;
