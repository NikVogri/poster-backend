import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { __dev__, __test__ } from "../config/environment";

if (__dev__ || __test__) {
  dotenv.config({ path: "./.env" });
}

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error("Please provide a database url");
  1;
}

const sequelize = new Sequelize(DATABASE_URL, {
  logging: __dev__,
});

export default sequelize;
