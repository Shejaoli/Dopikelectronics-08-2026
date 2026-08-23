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
    }),
  );

  app.use("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
