const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts = [...(config.resolver.assetExts || []), 'mermaidjs'];

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  punycode: require.resolve('punycode/'),
};

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    return (req, res, next) => {
      if (req.url && req.url.startsWith('/api/ai-proxy')) {
        const urlObj = new URL(req.url, 'http://localhost');
        const target = urlObj.searchParams.get('target');
        if (!target) {
          if (!res.headersSent) res.writeHead(400, { 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'Missing target parameter' }));
          return;
        }

        try {
          const parsed = new URL(target);
          const http = require('http');
          const https = require('https');
          const transport = parsed.protocol === 'https:' ? https : http;

          const chunks = [];
          req.on('data', (chunk) => chunks.push(chunk));
          req.on('end', () => {
            let responded = false;
            const respond = (status, body) => {
              if (responded || res.headersSent) return;
              responded = true;
              res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(body);
            };

            const body = Buffer.concat(chunks);
            const bodyStr = body.toString();

            const options = {
              hostname: parsed.hostname,
              port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
              path: parsed.pathname + parsed.search,
              method: req.method,
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(bodyStr),
              },
              timeout: 240000,
            };

            const proxyReq = transport.request(options, (proxyRes) => {
              const responseChunks = [];
              proxyRes.on('data', (c) => responseChunks.push(c));
              proxyRes.on('end', () => {
                respond(proxyRes.statusCode || 200, Buffer.concat(responseChunks));
              });
            });

            proxyReq.on('error', (err) => {
              respond(502, JSON.stringify({ error: 'AI proxy error: ' + err.message }));
            });

            proxyReq.setTimeout(240000, () => {
              proxyReq.destroy();
              respond(504, JSON.stringify({ error: 'AI proxy timeout' }));
            });

            proxyReq.write(bodyStr);
            proxyReq.end();
          });
        } catch (err) {
          if (!res.headersSent) res.writeHead(500, { 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'Invalid target URL: ' + err.message }));
        }
        return;
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
