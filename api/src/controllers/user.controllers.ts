import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { Request, Response } from "express";
import { UniqueConstraintError } from "sequelize";
import db from "../models";
import type { UserInstance } from "../models/users.model";

const Users = db.users;

// Le formulaire Angular envoie ces champs lors d'une inscription.
interface UserSignupRequest {
  login: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
}

interface UserCredentials {
  login: string;
  password: string;
}

// Liste les comptes sans jamais inclure les hashes de mots de passe dans la réponse.
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await Users.findAll({
      attributes: { exclude: ["passwordHash"] },
      order: [["id", "ASC"]]
    });

    res.status(200).json(users);
  } catch (error: unknown) {
    // L'erreur détaillée reste dans les logs serveur ; le client reçoit un message générique.
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    res.status(500).json({ message: "Impossible de récupérer les utilisateurs." });
  }
};

// Crée un compte après validation des champs et hachage du mot de passe.
export const create = async (req: Request, res: Response): Promise<void> => {
  const signup = parseSignupRequest(req.body);
  if (!signup) {
    res.status(400).json({ message: "Les informations d'inscription sont invalides." });
    return;
  }

  try {
    const passwordHash = await hashPassword(signup.password);
    const user = await Users.create({
      login: signup.login.trim(),
      nom: signup.nom.trim(),
      prenom: signup.prenom.trim(),
      email: signup.email.trim().toLowerCase(),
      telephone: signup.telephone.trim(),
      passwordHash
    });

    res.status(201).json(toPublicUser(user));
  } catch (error: unknown) {
    if (error instanceof UniqueConstraintError) {
      res.status(409).json({
        message: "Ce login ou cette adresse email est déjà utilisé."
      });
      return;
    }

    // L'erreur détaillée reste dans les logs serveur ; le client reçoit un message générique.
    console.error("Erreur lors de la création d'un utilisateur :", error);
    res.status(500).json({ message: "Impossible de créer l'utilisateur." });
  }
};

// Authentifie un login sans créer de session ni de jeton : cette route simule la connexion du TP.
export const authenticate = async (req: Request, res: Response): Promise<void> => {
  const credentials = parseCredentials(req.body);
  if (!credentials) {
    res.status(400).json({ message: "Le login et le mot de passe sont obligatoires." });
    return;
  }

  try {
    const user = await Users.findOne({ where: { login: credentials.login } });
    if (!user || !(await verifyPassword(credentials.password, user.passwordHash))) {
      res.status(401).json({ message: "Login ou mot de passe incorrect." });
      return;
    }

    res.status(200).json(toPublicUser(user));
  } catch (error: unknown) {
    // L'erreur détaillée reste dans les logs serveur ; le client reçoit un message générique.
    console.error("Erreur lors de l'authentification d'un utilisateur :", error);
    res.status(500).json({ message: "Impossible de vérifier les identifiants." });
  }
};

// Supprime un compte après vérification de son identifiant.
export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ message: "L'identifiant utilisateur est invalide." });
    return;
  }

  try {
    const user = await Users.findByPk(id);
    if (!user) {
      res.status(404).json({ message: `Aucun utilisateur trouvé avec l'id=${id}.` });
      return;
    }

    await user.destroy();
    res.status(204).send();
  } catch (error: unknown) {
    // L'erreur détaillée reste dans les logs serveur ; le client reçoit un message générique.
    console.error(`Erreur lors de la suppression de l'utilisateur id=${id} :`, error);
    res.status(500).json({ message: "Impossible de supprimer l'utilisateur." });
  }
};

// Vérifie le format et les champs obligatoires même si l'API est appelée sans passer par Angular.
function parseSignupRequest(value: unknown): UserSignupRequest | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const body = value as Record<string, unknown>;
  // Liste blanche : les champs personnels supprimés et tout champ inconnu sont ignorés.
  const fields = [
    "login",
    "nom",
    "prenom",
    "email",
    "telephone",
    "password"
  ] as const;

  const values = fields.map((field) => body[field]);
  if (
    !values.every(
      (field): field is string =>
        typeof field === "string" && field.trim().length > 0
    )
  ) {
    return null;
  }

  const [login, nom, prenom, email, telephone, password] = values;
  const signup: UserSignupRequest = {
    login,
    nom,
    prenom,
    email,
    telephone,
    password
  };

  if (
    signup.login.trim().length < 3 ||
    signup.password.length < 8 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signup.email.trim())
  ) {
    return null;
  }

  return signup;
}

// Vérifie le format minimal des identifiants avant toute recherche en base.
function parseCredentials(value: unknown): UserCredentials | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const body = value as Record<string, unknown>;
  if (
    typeof body.login !== "string" ||
    body.login.trim().length === 0 ||
    typeof body.password !== "string" ||
    body.password.length === 0
  ) {
    return null;
  }

  return { login: body.login.trim(), password: body.password };
}

// Scrypt dérive un hash coûteux à calculer à partir d'un sel aléatoire propre à chaque compte.
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await derivePassword(password, salt);
  return `scrypt:${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

// Dérive la même taille de clé pour l'inscription et la vérification des identifiants.
function derivePassword(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
}

// Vérifie le hash encodé sans comparer les octets avec une comparaison à temps variable.
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, saltHex, hashHex, ...extraParts] = storedHash.split(":");
  if (
    algorithm !== "scrypt" ||
    saltHex === undefined ||
    hashHex === undefined ||
    extraParts.length > 0 ||
    !/^[\da-f]{32}$/i.test(saltHex) ||
    !/^[\da-f]{128}$/i.test(hashHex)
  ) {
    return false;
  }

  const salt = Buffer.from(saltHex, "hex");
  const expectedHash = Buffer.from(hashHex, "hex");
  const actualHash = await derivePassword(password, salt);
  return timingSafeEqual(actualHash, expectedHash);
}

// Construit la réponse utilisateur sans inclure le hash stocké en base.
function toPublicUser(user: UserInstance) {
  return {
    id: user.id,
    login: user.login,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    telephone: user.telephone
  };
}

export default { create, getAll, remove, authenticate };
