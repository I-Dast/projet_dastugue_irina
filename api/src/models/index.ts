import { Sequelize } from "sequelize";
import { BDD } from "../config";
import definePollutions, { PollutionModel } from "./pollutions.model";
import defineUsers, { UserModel } from "./users.model";

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
  : new Sequelize(BDD.database, BDD.user, BDD.password, {
      ...sequelizeOptions,
      host: BDD.host,
      port: BDD.port
    });

export interface Database {
  Sequelize: typeof Sequelize;
  sequelize: Sequelize;
  pollutions: PollutionModel;
  users: UserModel;
}

export const db: Database = {
  Sequelize,
  sequelize,
  // Le modèle pollution décrit les déclarations au format attendu par l'application Angular.
  pollutions: definePollutions(sequelize),
  // Le modèle user stocke les comptes créés par l'API d'inscription.
  users: defineUsers(sequelize)
};

export default db;
