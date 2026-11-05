import "dotenv/config";
import express, { Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import db from "./models";
import initRoutes from "./routes";

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
    // Sequelize crée les tables manquantes déclarées par les modèles, sans remplacer les tables existantes.
    await db.sequelize.sync();
    // Migration PostgreSQL idempotente : supprime aussi les anciennes valeurs déjà stockées dans ces colonnes.
    // Cette suppression est définitive ; IF EXISTS permet de redémarrer sans erreur après la migration.
    await db.sequelize.query(
      'ALTER TABLE "users" DROP COLUMN IF EXISTS "adresse", DROP COLUMN IF EXISTS "dateNaissance"'
    );
    console.log("Connexion PostgreSQL établie; tables des modèles synchronisées.");

    const count = await db.pollutions.count();
    if (count === 0) {
      await db.pollutions.bulkCreate([
        // Quelques déclarations de démonstration sont insérées uniquement dans une table vide.
        {
          titreDeclarationDePollution: "Déchets plastiques en centre-ville",
          typePollution: "Plastique",
          description: "Des déchets plastiques ont été observés près d'un espace public.",
          dateObservation: "2026-10-18",
          lieu: "Paris",
          latitude: 48.8566,
          longitude: 2.3522,
          photoUrl: ""
        },
        {
          titreDeclarationDePollution: "Dépôt sauvage près de la route",
          typePollution: "Dépôt sauvage",
          description: "Plusieurs encombrants ont été déposés au bord de la route.",
          dateObservation: "2026-10-18",
          lieu: "Lyon",
          latitude: 45.764,
          longitude: 4.8357,
          photoUrl: ""
        },
        {
          titreDeclarationDePollution: "Pollution de l'eau",
          typePollution: "Eau",
          description: "Une pollution de l'eau a été signalée près de la berge.",
          dateObservation: "2026-10-17",
          lieu: "Strasbourg",
          latitude: 48.5734,
          longitude: 7.7521,
          photoUrl: ""
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
    console.error("Impossible de démarrer l'API avec PostgreSQL :", err);
    process.exitCode = 1;
  }
};

void start();

export default app;
