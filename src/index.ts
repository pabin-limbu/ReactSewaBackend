import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("connected to database")); // connect mongo db with connection string and make sure the connection string are string.

const app = express(); // create express server.
app.use(express.json()); // use middleware to parse every incoming request to json.
app.use(cors());

app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "health ok!" }); // the convention to check if the server is running .
});
app.use("/api/my/user", myUserRoute);

app.listen(7000, () => {
  console.log("Server started on localhost:7000");
});
