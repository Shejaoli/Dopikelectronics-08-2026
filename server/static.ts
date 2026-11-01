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
