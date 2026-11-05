import { DataTypes, Model, ModelStatic, Optional, Sequelize } from "sequelize";

// Ces propriétés reprennent les données du formulaire Angular enregistrées par l'API.
export interface PollutionAttributes {
  id: number;
  titreDeclarationDePollution: string;
  typePollution: string;
  description: string;
  dateObservation: string;
  lieu: string;
  latitude: number;
  longitude: number;
  photoUrl: string;
}

// L'identifiant est généré par PostgreSQL lors de la création d'une déclaration.
export interface PollutionCreationAttributes
  extends Optional<PollutionAttributes, "id"> {}

// Cette instance Sequelize expose les champs de la déclaration comme propriétés du modèle.
export interface PollutionInstance
  extends Model<PollutionAttributes, PollutionCreationAttributes>,
    PollutionAttributes {}

export type PollutionModel = ModelStatic<PollutionInstance>;

// Déclare le modèle ORM qui crée et interroge la table associée aux déclarations Angular.
export default function definePollutions(sequelize: Sequelize): PollutionModel {
  return sequelize.define<PollutionInstance>(
    "pollution",
    {
      // Clé primaire auto-incrémentée : le client ne choisit pas l'identifiant.
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      titreDeclarationDePollution: {
        type: DataTypes.STRING,
        allowNull: false
      },
      typePollution: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      // DATEONLY correspond au format YYYY-MM-DD envoyé par le formulaire HTML.
      dateObservation: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      lieu: {
        type: DataTypes.STRING,
        allowNull: false
      },
      latitude: {
        type: DataTypes.DOUBLE,
        allowNull: false
      },
      longitude: {
        type: DataTypes.DOUBLE,
        allowNull: false
      },
      photoUrl: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      // Le pluriel isole le nouveau schéma Angular de l'ancienne table `pollution`.
      tableName: "pollutions",
      freezeTableName: true,
      timestamps: false
    }
  );
}
