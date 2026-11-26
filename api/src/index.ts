import "dotenv/config";
import express, { Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import db from "./models";
import initRoutes from "./routes";
import userController from "./controllers/user.controllers";

const app: Application = express();

const corsOptions: CorsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
  exposedHeaders: "Authorization"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// health checks
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to Pollution API." });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

initRoutes(app);

const start = async (): Promise<void> => {
  try {
    await db.sequelize.authenticate();
    // Sequelize réconcilie les tables existantes avec les modèles et crée celles qui manquent.
    await db.sequelize.sync({ alter: true });
    // Migration PostgreSQL idempotente : supprime aussi les anciennes valeurs déjà stockées dans ces colonnes.
    // Cette suppression est définitive ; IF EXISTS permet de redémarrer sans erreur après la migration.
    await db.sequelize.query(
      'ALTER TABLE "users" DROP COLUMN IF EXISTS "adresse", DROP COLUMN IF EXISTS "dateNaissance"'
    );
    await db.sequelize.query(
      'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN NOT NULL DEFAULT FALSE'
    );
    await userController.ensureAdminAccount();
    console.log("Connexion PostgreSQL établie; tables des modèles synchronisées.");

    const count = await db.pollutions.count();
    if (count === 0) {
      await db.pollutions.bulkCreate([
        // Ces exemples fictifs sont insérés uniquement dans une table vide.
        {
          titreDeclarationDePollution: "Emballages plastiques sur les berges de l’Ill",
          typePollution: "Plastique",
          description: "Exemple fictif : quelques bouteilles et emballages sont visibles dans l’herbe près du chemin. Aucun déchet n’a été collecté.",
          dateObservation: "2026-11-24",
          lieu: "Quai des Bateliers, Strasbourg",
          latitude: 48.5811,
          longitude: 7.7525,
          photoUrl: "",
          indiceDangerosite: 18
        },
        {
          titreDeclarationDePollution: "Encombrants déposés près d’un conteneur",
          typePollution: "Dépôt sauvage",
          description: "Exemple fictif : un matelas et des planches sont déposés à côté d’un point de collecte, sans bloquer la circulation.",
          dateObservation: "2026-11-22",
          lieu: "Rue de la Plaine-des-Bouchers, Strasbourg",
          latitude: 48.5547,
          longitude: 7.7418,
          photoUrl: "",
          indiceDangerosite: 42
        },
        {
          titreDeclarationDePollution: "Eau trouble dans le canal de la Bruche",
          typePollution: "Eau",
          description: "Exemple fictif : une coloration trouble est observée depuis la berge après de fortes pluies. La source n’est pas déterminée.",
          dateObservation: "2026-11-21",
          lieu: "Canal de la Bruche, Strasbourg",
          latitude: 48.5791,
          longitude: 7.7046,
          photoUrl: "",
          indiceDangerosite: 55
        },
        {
          titreDeclarationDePollution: "Fumée persistante près d’un axe routier",
          typePollution: "Air",
          description: "Exemple fictif : une fumée inhabituelle est signalée près d’un axe routier. Son origine n’a pas été vérifiée.",
          dateObservation: "2026-11-20",
          lieu: "Avenue du Rhin, Strasbourg",
          latitude: 48.5654,
          longitude: 7.78,
          photoUrl: "",
          indiceDangerosite: 35
        },
        {
          titreDeclarationDePollution: "Tache irisée d’origine inconnue sur l’eau",
          typePollution: "Chimique",
          description: "Exemple fictif : une tache irisée est visible à la surface de l’eau. La substance n’est pas identifiée et aucun prélèvement n’a été réalisé.",
          dateObservation: "2026-11-19",
          lieu: "Bassin Vauban, Strasbourg",
          latitude: 48.578,
          longitude: 7.724,
          photoUrl: "",
          indiceDangerosite: 70
        }
      ]);
      console.log("Jeu de démonstration inséré dans pollutions.");
    }

    const port = Number(process.env.PORT) || 3000;
    const host = "0.0.0.0";
    app.listen(port, host, () => {
      console.log(`API disponible sur http://${host}:${port}.`);
    });
  } catch (err: unknown) {
    console.error("Impossible de démarrer l'API :", err);
    process.exitCode = 1;
  }
};

void start();

export default app;
