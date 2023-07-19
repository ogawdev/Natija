import dotenv from "dotenv";
dotenv.config();

export const config: {
  port: string | undefined;
  mongoUrl: string | undefined;
  token: string | undefined;
} = {
  port: process.env.PORT,
  mongoUrl: process.env.MONGO_URL,
  token: process.env.TOKEN,
};