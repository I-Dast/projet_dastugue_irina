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
const host = databaseUrl
  ? new URL(databaseUrl).hostname
  : process.env.DB_HOST || "localhost";
const isLocalHost = host === "localhost" || host === "127.0.0.1";

export const config: AppConfig = {
  BDD: {
    host: process.env.DB_HOST || "dpg-dbhmiqutlv9c7395tk70-a",
    port: process.env.DB_PORT || "5432",
    user: process.env.DB_USER || "pollution_user",
    password: process.env.DB_PASSWORD || "jBJbqzABIL35qQCDmcI9MKTANOLlqxAG",
    bdname: process.env.DB_NAME || "pollution_db_68bs"
  }
};

export const { BDD } = config;
export default config;
