import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({path: './.env'});
}

const {DB_NAME, DB_USERNAME, DB_PASSWORD} = process.env;


if (!DB_NAME || !DB_USERNAME || !DB_PASSWORD) {
  throw new Error('Please provide database name, database username and password');
}

const sequelize = new Sequelize({
  dialect: 'postgres',
  database: DB_NAME,
  username: DB_USERNAME,
  password: DB_PASSWORD,
});


export default sequelize;