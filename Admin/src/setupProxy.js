const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/email",
    createProxyMiddleware({
      target: "http://localhost:5173",
      onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers["Cross-Origin-Opener-Policy"] = "same-origin";
        proxyRes.headers["Cross-Origin-Embedder-Policy"] = "require-corp";
      },
    })
  );
};
