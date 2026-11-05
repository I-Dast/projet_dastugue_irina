import { Application, Router } from "express";
import userController from "../controllers/user.controllers";

// Expose la vérification fictive des identifiants à l'adresse choisie pour le TP.
export default (app: Application): void => {
  const router = Router();

  router.post("/", userController.authenticate);
  app.use("/api/auth", router);
};
