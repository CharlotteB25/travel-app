// app.ts
import express, { Express } from "express";
import path from "path";
import history from "connect-history-api-fallback";
import { registerRoutes } from "./routes";
import { registerMiddleware } from "./middleware";
import fs from "fs";

const app: Express = express();

registerMiddleware(app);
registerRoutes(app);

const clientDir = path.join(process.cwd(), "app", "dist");
app.use(
  history({
    rewrites: [{ from: /^\/api\/.*$/, to: (ctx: any) => ctx.parsedUrl.path }],
    disableDotRule: true,
  })
);

console.log("[SPA] cwd:", process.cwd());
console.log("[SPA] clientDir:", clientDir);
console.log(
  "[SPA] index exists:",
  fs.existsSync(path.join(clientDir, "index.html"))
);

app.use(express.static(clientDir, { index: "index.html", maxAge: "1h" }));

app.get("/health", (_req, res) => res.send("ok"));

export default app;
