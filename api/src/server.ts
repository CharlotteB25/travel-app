import "dotenv/config";

import mongoose from "mongoose";
import app from "./app";
import { Server } from "http";

const port: number = parseInt(process.env.PORT ?? "3002");

//connect to mongo
if (process.env.MONGO_CONNECTION) {
  mongoose
    .connect(process.env.MONGO_CONNECTION)
    .then(() => {
      console.log("Connected to MongoDB");

      // start server
      const server = app.listen(port, () => {
        console.log(`Server is running on port http://localhost:${port}`);
      });

      /*  const newDocument = new Trip({
        title: "Winter Vacation",
        description: "Skiing with my family",
        location: "Austria",
        startDate: new Date(),
        endDate: new Date(),
        activity: ["skiing", "walking"],
        expenses: [100, 200, 50],
        notes: "Enjoyed hiking the most",
      });

      newDocument
        .save()
        .then((doc) => {
          console.log("Document saved:", doc);
        })
        .catch((err) => {
          console.error("Error saving document:", err);
        });
 */
      process.on("SIGINT", () => stopServer(server));
      process.on("SIGTERM", () => stopServer(server));
    })
    .catch((error) => console.error(error));
} else {
  throw new Error("No MongoDB connection string");
}
// stop server
const stopServer = (server: Server) => {
  mongoose.connection.close();
  server.close(() => {
    console.log("Server closed");
    process.exit();
  });
};
