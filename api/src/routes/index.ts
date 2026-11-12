import { Application } from "express";
import authRoutes from "./auth.routes";
import pollutionRoutes from "./pollution.routes";
import userRoutes from "./user.routes";

export default (app: Application): void => {
  authRoutes(app);
  pollutionRoutes(app);
  userRoutes(app);
};
