import express, { RequestHandler } from "express";
import cors from "cors";
import bodyParser from "body-parser";

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (_, res): RequestHandler => {
  return res.send('as many as u see') as any;
});

app.listen(PORT, () => {
  // Connect to the database

  console.log("connected to database...");

  console.log("Server started on port " + PORT);
});
