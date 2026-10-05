// A tiny static file server for tests (no dependencies). Serves a directory the way GitHub Pages does:
// index.html for folders, a real 404 page for missing files, common content types.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, normalize, extname, resolve } from "node:path";

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".md": "text/markdown; charset=utf-8" };

// opts.intercept(url, res) may answer a request itself (return true), e.g. to simulate a server error.
export async function startStaticServer(root, port = 0, opts = {}) {
  root = resolve(root);
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://x");
      if (opts.intercept && await opts.intercept(url, res, req)) return;
      let path = normalize(join(root, decodeURIComponent(url.pathname)));
      if (path !== root && !path.startsWith(root + "/")) { res.writeHead(403).end(); return; }
      let s = await stat(path).catch(() => null);
      if (s && s.isDirectory()) {
        if (!url.pathname.endsWith("/")) { res.writeHead(301, { Location: url.pathname + "/" + url.search }).end(); return; }
        path = join(path, "index.html"); s = await stat(path).catch(() => null);
      }
      if (!s) { res.writeHead(404, { "content-type": "text/html; charset=utf-8" }).end("<!doctype html><title>404</title><h1>404 Not Found</h1>"); return; }
      res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream", "cache-control": "no-cache" });
      res.end(await readFile(path));
    } catch (e) { res.writeHead(500).end(); }
  });
  await new Promise(r => server.listen(port, "127.0.0.1", r));
  const { port: p } = server.address();
  return { url: `http://localhost:${p}`, port: p, close: () => new Promise(r => server.close(r)) };
}
