// app.ts
import express, { Express } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { registerMiddleware } from "./middleware";
import history from "connect-history-api-fallback";

const app: Express = express();

// 1️⃣ Register global middleware
registerMiddleware(app);

// 2️⃣ Register API routes (e.g., /api/users, /api/trips, etc.)
registerRoutes(app);

// 3️⃣ Serve your frontend SPA
// --- Adjust this to your actual build folder (e.g., "../frontend/dist" or "../public")
const clientDir = path.join(__dirname, "../public");

// Use SPA history fallback *after* API routes so /api/* is not rewritten
app.use(
  history({
    rewrites: [{ from: /^\/api\/.*$/, to: (ctx: any) => ctx.parsedUrl.path }],
  })
);

// Serve static files (the built frontend)
app.use(express.static(clientDir, { index: "index.html", maxAge: "1h" }));

// Optional explicit fallback (if you prefer not using the `history` lib):
// app.get(/^\/(?!api\/).*/, (_req, res) => {
//   res.sendFile(path.join(clientDir, "index.html"));
// });

// Optional health check endpoint
app.get("/health", (_req, res) => res.send("ok"));

export default app;
