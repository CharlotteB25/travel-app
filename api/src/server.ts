import "dotenv/config";

import mongoose from "mongoose";
import app from "./app";
import { Server } from "http";
import UserModel from "./modules/User/User.model";
import TripModel from "./modules/Trip/Trip.model";

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

      /*const newDocument = new TripModel({
        title: "Trip to Paris",
        location: "Paris",
        startDate: new Date("2022-01-01"),
        endDate: new Date("2022-01-10"),
        notes: "A trip to Paris",
        expenses: "1000",
        activity: "Sightseeing",
        userId: "66c9d365445b9dcad00e39fd",
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
