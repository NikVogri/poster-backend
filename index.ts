import app from "./app";
import { __test__ } from "./config/environment";
import "reflect-metadata";

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  // connect to database
  console.log("Server started on port " + PORT);
});
