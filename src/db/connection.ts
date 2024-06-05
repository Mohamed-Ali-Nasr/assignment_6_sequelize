import { Sequelize } from "sequelize";
import env from "../utils/validateEnv";

export const sequelize = new Sequelize(
  env.DB_NAME,
  env.DB_USER,
  env.DB_PASSWORD,
  {
    dialect: "mysql",
    host: env.DB_HOST,
    port: env.DB_PORT,
  }
);

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the Database:", error);
  }
};

export const dbConnection = async () => {
  try {
    await sequelize.sync({ alter: true, logging: false });
    console.log("Database Synched successfully.");
  } catch (error) {
    console.error("Error Synching Database:", error);
  }
};
