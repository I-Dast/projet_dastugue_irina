import { Request, Response } from "express";
import db from "../models";

const Pollutions = db.pollutions;

// Les catégories doivent correspondre aux choix proposés par le formulaire Angular.
const POLLUTION_TYPES = new Set([
  "Plastique",
  "Chimique",
  "Dépôt sauvage",
  "Eau",
  "Air",
  "Autre"
]);

interface PollutionCreateRequest {
  titreDeclarationDePollution: string;
  typePollution: string;
  description: string;
  dateObservation: string;
  lieu: string;
  latitude: number;
  longitude: number;
  photoUrl: string;
}

/**
 * Récupère la liste de toutes les mesures de pollution depuis la base PostgreSQL.
 */
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Pollutions.findAll({
      order: [["id", "ASC"]]
    });
    res.status(200).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      message: "Erreur lors de la récupération des données de pollution: " + message
    });
  }
};

// Crée une déclaration après validation des champs envoyés par le formulaire.
export const create = async (req: Request, res: Response): Promise<void> => {
  const parsed = parsePollutionRequest(req.body);
  if (!parsed.valid) {
    res.status(400).json({ message: parsed.message });
    return;
  }

  try {
    const pollution = await Pollutions.create(parsed.pollution);
    res.status(201).json(pollution);
  } catch (error: unknown) {
    // L'erreur détaillée reste dans les logs serveur ; le client reçoit un message générique.
    console.error("Erreur lors de la création d'une pollution :", error);
    res.status(500).json({ message: "Impossible de créer la déclaration de pollution." });
  }
};

// Remplace les champs d'une déclaration existante après vérification de son identifiant.
export const update = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ message: "L'identifiant de pollution est invalide." });
    return;
  }

  const parsed = parsePollutionRequest(req.body);
  if (!parsed.valid) {
    res.status(400).json({ message: parsed.message });
    return;
  }

  try {
    const pollution = await Pollutions.findByPk(id);
    if (!pollution) {
      res.status(404).json({ message: `Aucune pollution trouvée avec l'id=${id}.` });
      return;
    }

    await pollution.update(parsed.pollution);
    res.status(200).json(pollution);
  } catch (error: unknown) {
    // L'erreur détaillée reste dans les logs serveur ; le client reçoit un message générique.
    console.error(`Erreur lors de la modification de la pollution id=${id} :`, error);
    res.status(500).json({ message: "Impossible de modifier la déclaration de pollution." });
  }
};

// Supprime une déclaration après vérification de son identifiant.
export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ message: "L'identifiant de pollution est invalide." });
    return;
  }

  try {
    const pollution = await Pollutions.findByPk(id);
    if (!pollution) {
      res.status(404).json({ message: `Aucune pollution trouvée avec l'id=${id}.` });
      return;
    }

    await pollution.destroy();
    res.status(204).send();
  } catch (error: unknown) {
    // L'erreur détaillée reste dans les logs serveur ; le client reçoit un message générique.
    console.error(`Erreur lors de la suppression de la pollution id=${id} :`, error);
    res.status(500).json({ message: "Impossible de supprimer la déclaration de pollution." });
  }
};

// Valide la forme des données avant de laisser Sequelize les envoyer à PostgreSQL.
function parsePollutionRequest(
  value: unknown
):
  | { valid: true; pollution: PollutionCreateRequest }
  | { valid: false; message: string } {
  if (typeof value !== "object" || value === null) {
    return { valid: false, message: "Le corps de la requête doit être un objet JSON." };
  }

  const body = value as Record<string, unknown>;
  const title = body.titreDeclarationDePollution;
  const type = body.typePollution;
  const description = body.description;
  const date = body.dateObservation;
  const place = body.lieu;
  const latitude = body.latitude;
  const longitude = body.longitude;
  const photoUrl = body.photoUrl;

  if (
    !isNonEmptyString(title) ||
    !isNonEmptyString(type) ||
    !isNonEmptyString(description) ||
    !isNonEmptyString(date) ||
    !isNonEmptyString(place) ||
    typeof photoUrl !== "string"
  ) {
    return {
      valid: false,
      message: "Le titre, le type, la description, la date et le lieu sont obligatoires."
    };
  }

  if (!POLLUTION_TYPES.has(type)) {
    return { valid: false, message: "Le type de pollution n'est pas reconnu." };
  }

  if (
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    typeof longitude !== "number" ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return {
      valid: false,
      message: "La latitude ou la longitude est invalide."
    };
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    return { valid: false, message: "La date doit respecter le format AAAA-MM-JJ." };
  }

  return {
    valid: true,
    pollution: {
      titreDeclarationDePollution: title.trim(),
      typePollution: type,
      description: description.trim(),
      dateObservation: date,
      lieu: place.trim(),
      latitude,
      longitude,
      photoUrl: photoUrl.trim()
    }
  };
}

// Distingue une chaîne exploitable d'une valeur absente ou composée d'espaces.
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Récupère une mesure de pollution par son identifiant.
 */
export const getById = async (req: Request, res: Response): Promise<void> => {
  const paramId = req.params.id;
  const rawId = Array.isArray(paramId) ? paramId[0] : paramId;
  const id = Number(rawId);

  // Refuse les valeurs non numériques, nulles, négatives ou trop grandes avant Sequelize.
  if (!rawId || !/^[1-9]\d*$/.test(rawId) || !Number.isSafeInteger(id)) {
    res.status(400).json({ message: "L'identifiant de pollution est invalide." });
    return;
  }

  try {
    const data = await Pollutions.findByPk(id);
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({
        message: `Aucune pollution trouvée avec l'id=${id}.`
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      message: `Erreur lors de la récupération de la pollution id=${id}: ` + message
    });
  }
};

export default { getAll, getById, create, update, remove };
