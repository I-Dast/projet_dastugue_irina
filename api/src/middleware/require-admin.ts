import { NextFunction, Request, Response } from "express";
import db from "../models";
import { verifyAdminToken } from "../controllers/admin-auth";

export default async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authorization = req.get("authorization");
  const match = authorization && /^Bearer ([^\s]+)$/.exec(authorization);
  const userId = match ? verifyAdminToken(match[1]) : null;
  if (userId === null) {
    res.status(401).json({ message: "Authentification administrateur requise." });
    return;
  }

  try {
    const user = await db.users.findByPk(userId);
    if (!user || !user.isAdmin) {
      res.status(403).json({ message: "Accès réservé aux administrateurs." });
      return;
    }

    next();
  } catch (error: unknown) {
    console.error("Erreur lors de la vérification des droits administrateur :", error);
    res.status(500).json({
      message: "Impossible de vérifier les droits administrateur."
    });
  }
}
