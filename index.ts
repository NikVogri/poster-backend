import app from "./app";
import sequelize from "./helpers/database";

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  // Make sure sequelize is connected correctly
  await sequelize.authenticate();
  console.log("Server started on port " + PORT);
});
