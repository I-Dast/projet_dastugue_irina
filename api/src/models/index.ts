import { Sequelize } from "sequelize";
import { BDD } from "../config";
import definePollutions, { PollutionModel } from "./pollutions.model";

const sequelizeOptions = {
  dialect: "postgres" as const,
  dialectOptions: BDD.ssl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : {},
  define: {
    timestamps: false
  }
};

const sequelize = BDD.url
  ? new Sequelize(BDD.url, {
      ...sequelizeOptions,
      protocol: "postgres"
    })
  : new Sequelize(BDD.database, {
      ...sequelizeOptions,
      host: BDD.host,
      port: BDD.port,
      username: BDD.user,
      password: BDD.password
    });

export interface Database {
  Sequelize: typeof Sequelize;
  sequelize: Sequelize;
  pollutions: PollutionModel;
}

export const db: Database = {
  Sequelize,
  sequelize,
  pollutions: definePollutions(sequelize, Sequelize)
};

export default db;
