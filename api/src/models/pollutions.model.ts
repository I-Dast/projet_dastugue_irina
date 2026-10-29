import { Sequelize, DataTypes, Model, Optional, ModelStatic } from "sequelize";

export interface PollutionAttributes {
  id: number;
  ville: string;
  valeur: number;
  polluant: string;
  date: string;
  description?: string | null;
}

export interface PollutionCreationAttributes
  extends Optional<PollutionAttributes, "id" | "description"> {}

export interface PollutionInstance
  extends Model<PollutionAttributes, PollutionCreationAttributes>,
    PollutionAttributes {}

export type PollutionModel = ModelStatic<PollutionInstance>;

export default function definePollutions(
  sequelize: Sequelize,
  _seq?: typeof Sequelize
): PollutionModel {
  const Pollutions = sequelize.define<PollutionInstance>(
    "pollution",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      ville: {
        type: DataTypes.STRING,
        allowNull: false
      },
      valeur: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      polluant: {
        type: DataTypes.STRING,
        allowNull: false
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      tableName: "pollution",
      freezeTableName: true,
      timestamps: false
    }
  );

  return Pollutions;
}

