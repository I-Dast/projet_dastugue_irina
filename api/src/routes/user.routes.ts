import { Application, Router } from "express";
import userController from "../controllers/user.controllers";

// Expose la création de comptes à l'adresse demandée par le sujet.
export default (app: Application): void => {
  const router = Router();

  // GET renvoie la liste publique ; POST crée un compte.
  router.get("/", userController.getAll);
  router.post("/", userController.create);
  // DELETE supprime le compte identifié dans l'URL.
  router.delete("/:id", userController.remove);
  app.use("/api/users", router);
};
