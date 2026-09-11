import cors from "cors";
import express from "express";
import gridRoutes from "./routes/gridRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const createApp = (io) => {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(express.json({ limit: "1mb" }));

  if (io) {
    app.use((req, res, next) => {
      req.io = io;
      next();
    });
  }

  app.get("/health", (req, res) => {
    res.json({ success: true, message: "Server is healthy" });
  });

  app.use("/api/grid", gridRoutes);
  app.use("/api/users", userRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
