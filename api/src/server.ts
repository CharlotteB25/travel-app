import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app";
import type { Server } from "http";

const port = Number(process.env.PORT) | 3000;
const mongoUri = process.env.MONGO_CONNECTION;

let server: Server;

// ✅ Always listen first so Render detects an open port
server = app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});

// Optional: simple health endpoint (add this in app.ts if not present)
// app.get("/", (_req, res) => res.status(200).send("OK"));

async function connectWithRetry() {
  if (!mongoUri) {
    console.error("❌ No MongoDB connection string (MONGO_CONNECTION missing)");
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connect failed — retrying in 5s", err);
    setTimeout(connectWithRetry, 5000);
  }
}

connectWithRetry();

const stopServer = async () => {
  try {
    await mongoose.connection.close();
  } catch {}
  server.close(() => {
    console.log("🛑 Server closed");
    process.exit(0);
  });
};

process.on("SIGINT", stopServer);
process.on("SIGTERM", stopServer);
