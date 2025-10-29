// app.ts
import express, { Express } from "express";
import path from "path";
import history from "connect-history-api-fallback";
import { registerRoutes } from "./routes";
import { registerMiddleware } from "./middleware";
import fs from "fs";

const app: Express = express();

// 1) Global middleware
registerMiddleware(app);

// 2) API routes first
registerRoutes(app);

// 3) SPA: resolve at runtime from working directory
const clientDir = path.join(process.cwd(), "dist"); // <-- runtime path

//sanity check
console.log("[SPA] cwd:", process.cwd());
console.log("[SPA] clientDir:", clientDir);
console.log(
  "[SPA] index exists:",
  fs.existsSync(path.join(clientDir, "index.html"))
);

// Helpful diagnostics (keep for a deploy or two)
console.log("[SPA] cwd:", process.cwd());
console.log("[SPA] clientDir:", clientDir);
console.log(
  "[SPA] index exists:",
  fs.existsSync(path.join(clientDir, "index.html"))
);

// History fallback (exclude API)
app.use(
  history({
    rewrites: [{ from: /^\/api\/.*$/, to: (ctx: any) => ctx.parsedUrl.path }],
    disableDotRule: true,
  })
);

// Serve static files
app.use(express.static(clientDir, { index: "index.html", maxAge: "1h" }));

// Health
app.get("/health", (_req, res) => res.send("ok"));

export default app;
