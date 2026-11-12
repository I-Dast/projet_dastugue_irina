import { DataTypes, Model, ModelStatic, Optional, Sequelize } from "sequelize";

// Seules les données utiles au compte sont modélisées : aucune adresse ni date de naissance n'est conservée.
export interface UserAttributes {
  id: number;
  login: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  passwordHash: string;
}

// L'identifiant est attribué par PostgreSQL et le hash est calculé par le contrôleur.
export interface UserCreationAttributes
  extends Optional<UserAttributes, "id"> {}

// Cette instance représente un utilisateur lu ou créé avec Sequelize.
export interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {}

export type UserModel = ModelStatic<UserInstance>;

// Déclare la table des utilisateurs et empêche les doublons de login ou d'adresse email.
export default function defineUsers(sequelize: Sequelize): UserModel {
  return sequelize.define<UserInstance>(
    "user",
    {
      // Clé primaire auto-incrémentée générée par la base de données.
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false
      },
      prenom: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      telephone: {
        type: DataTypes.STRING,
        allowNull: false
      },
      // Seul le hash est conservé en base, jamais le mot de passe reçu en clair.
      passwordHash: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      tableName: "users",
      freezeTableName: true,
      timestamps: false
    }
  );
}
