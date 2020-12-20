import app from "./app";
import { __test__ } from "./config/environment";
import sequelize from "./helpers/database";
import ForgotPassword from "./models/ForgotPassword";
import Page from "./models/Page";
import User from "./models/User";

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  // Make sure sequelize is connected correctly
  await sequelize.authenticate();

  if (!__test__) {
    User.sync();
    Page.sync();
    ForgotPassword.sync();
  }

  console.log("Server started on port " + PORT);
});
