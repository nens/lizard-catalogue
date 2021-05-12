const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const env_prefix = process.env.PROXY_PREFIX || 'PROXY';
  const url = process.env[env_prefix + '_URL'] || 'https://nxt3.staging.lizard.net/';
  const apiKey = process.env[env_prefix + '_API_KEY'];

  let proxyMiddleware;
  console.log(`Proxying to ${url}.`);

  if (!apiKey) {
    console.log('Without authentication.');
    proxyMiddleware = createProxyMiddleware({
      target: url,
      changeOrigin: true,
    });
  } else {
    // Use HTTP basic auth, works with Lizard only
    proxyMiddleware = createProxyMiddleware({
      target: url,
      changeOrigin: true,
      auth: `__key__:${apiKey}`,
    });
  }

  app.use('/api', proxyMiddleware);
  app.use('/bootstrap', proxyMiddleware);
  app.use('/wms', proxyMiddleware);
  app.use('/proxy', proxyMiddleware);
};