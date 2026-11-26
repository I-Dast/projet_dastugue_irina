import { randomBytes } from "node:crypto";

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  url?: string;
  ssl: boolean;
}

export interface AppConfig {
  BDD: DatabaseConfig;
  adminLogin?: string;
  adminPassword?: string;
  authTokenSecret: string;
}

const databaseUrl = process.env.DATABASE_URL;
const parsedDatabaseUrl = databaseUrl ? new URL(databaseUrl) : undefined;

export const config: AppConfig = {
  adminLogin: process.env.ADMIN_LOGIN,
  adminPassword: process.env.ADMIN_PASSWORD,
  authTokenSecret:
    process.env.AUTH_TOKEN_SECRET || randomBytes(32).toString("hex"),
  BDD: {
    host: process.env.DB_HOST || parsedDatabaseUrl?.hostname || "localhost",
    port: Number(process.env.DB_PORT || parsedDatabaseUrl?.port || 5432),
    user: process.env.DB_USER || parsedDatabaseUrl?.username || "postgres",
    password: process.env.DB_PASSWORD || parsedDatabaseUrl?.password || "",
    database:
      process.env.DB_NAME ||
      parsedDatabaseUrl?.pathname.replace(/^\/+/, "") ||
      "pollution_db",
    url: databaseUrl,
    ssl: process.env.DB_SSL === "true"
  }
};

export const { BDD } = config;
export default config;
