import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve build-time Brotli variants for fingerprinted JavaScript and CSS.
  // These files are byte-for-byte tied to the hashed asset URL, so they remain
  // safe to cache for a year while cutting the transfer size substantially.
  app.use("/assets", (req, res, next) => {
    if (!/(^|,)\s*br(?:\s*;|,|$)/i.test(req.get("accept-encoding") || "")) {
      return next();
    }
    const assetName = path.basename(req.path);
    if (!/\.(?:css|js)$/.test(assetName)) return next();

    const compressedPath = path.join(distPath, "assets", `${assetName}.br`);
    if (!fs.existsSync(compressedPath)) return next();

    res.setHeader("Content-Type", assetName.endsWith(".css") ? "text/css; charset=utf-8" : "text/javascript; charset=utf-8");
    res.setHeader("Content-Encoding", "br");
    res.setHeader("Vary", "Accept-Encoding");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.sendFile(compressedPath);
  });

  // Serve uploads with NO long-term caching
  app.use("/uploads", express.static(path.join(distPath, "uploads"), {
    maxAge: 0,
    etag: true,
    lastModified: true,
  }));

  // Serve other static assets with caching
  app.use(
    express.static(distPath, {
      maxAge: "1d",
      immutable: false,
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        // Vite fingerprints bundled assets, so they can be cached until their
        // content hash changes. Keep the HTML shell and named public files
        // revalidating so deployments and product images update promptly.
        const relativePath = path.relative(path.join(distPath, "assets"), filePath);
        if (!relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    }),
  );

  app.use("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
