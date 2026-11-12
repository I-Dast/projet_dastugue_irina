import { Application, Router } from "express";
import pollutionController from "../controllers/pollution.controllers";

export default (app: Application): void => {
  const router = Router();

  // Route GET /api/pollutions
  router.get("/", pollutionController.getAll);

  // Route GET /api/pollutions/:id
  router.get("/:id", pollutionController.getById);

  // Route POST /api/pollutions : crée une déclaration et laisse PostgreSQL générer son identifiant.
  router.post("/", pollutionController.create);

  // Route PUT /api/pollutions/:id : remplace les données de la déclaration ciblée.
  router.put("/:id", pollutionController.update);

  // Route DELETE /api/pollutions/:id : supprime la déclaration ciblée.
  router.delete("/:id", pollutionController.remove);

  // Exposition sous /api/pollutions et /api/pollution (singulier et pluriel)
  app.use("/api/pollutions", router);
  app.use("/api/pollution", router);
};
