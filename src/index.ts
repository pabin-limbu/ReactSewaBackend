import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";

const app = express(); // create express server.
app.use(express.json()); // use middleware to parse every incoming request to json.
app.use(cors());
app.get("/test", async (req: Request, res: Response) => {
  res.json({ message: "hello" });
});
