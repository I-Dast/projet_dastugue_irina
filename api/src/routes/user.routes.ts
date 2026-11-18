import { Application, Router } from "express";
import userController from "../controllers/user.controllers";
import requireAdmin from "../middleware/require-admin";

// Expose la création de comptes à l'adresse demandée par le sujet.
export default (app: Application): void => {
  const router = Router();

  // La création est publique ; consulter et supprimer les comptes est réservé à l'administration.
  router.get("/", requireAdmin, userController.getAll);
  router.post("/", userController.create);
  router.delete("/:id", requireAdmin, userController.remove);
  app.use("/api/users", router);
};
