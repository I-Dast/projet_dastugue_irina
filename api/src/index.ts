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

db.sequelize
  .sync()
  .then(async () => {
    console.log("Synced db.");
    try {
      const count = await db.pollutions.count();
      if (count === 0) {
        await db.pollutions.bulkCreate([
          { ville: "Paris", polluant: "PM2.5", valeur: 28.5, date: "2026-10-18", description: "Qualité de l'air dégradée au centre-ville" },
          { ville: "Lyon", polluant: "NO2", valeur: 42.1, date: "2026-10-18", description: "Pic de pollution lié au trafic routier" },
          { ville: "Marseille", polluant: "O3", valeur: 55.0, date: "2026-10-17", description: "Ozone élevé en zone côtière ensoleillée" },
          { ville: "Strasbourg", polluant: "PM10", valeur: 34.2, date: "2026-10-18", description: "Particules en suspension modérées" },
          { ville: "Bordeaux", polluant: "PM2.5", valeur: 15.3, date: "2026-10-16", description: "Bonne qualité globale de l'air" },
          { ville: "Lille", polluant: "NO2", valeur: 38.7, date: "2026-10-17", description: "Trafic dense aux abords de la rocade" },
          { ville: "Nantes", polluant: "CO2", valeur: 12.0, date: "2026-10-18", description: "Conditions atmosphériques favorables" }
        ]);
        console.log("Jeu de données initial pour la table pollution inséré avec succès.");
      }
    } catch (seedErr: unknown) {
      console.warn("Remarque : impossible d'insérer les données d'initialisation :", seedErr);
    }
  })
  .catch((err: Error) => {
    console.log("Failed to sync db: " + err.message);
  });


initRoutes(app);

// set port, listen on 0.0.0.0 for Render and container environments
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}.`);
});

export default app;
