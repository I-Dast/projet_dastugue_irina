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
}

const databaseUrl = process.env.DATABASE_URL;
const parsedDatabaseUrl = databaseUrl ? new URL(databaseUrl) : undefined;

export const config: AppConfig = {
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
