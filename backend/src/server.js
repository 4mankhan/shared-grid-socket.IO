import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import createApp from "./app.js";
import { connectDatabase } from "./config/database.js";
import { initializeGrid } from "./utils/gridInitializer.js";
import { registerSocketHandlers } from "./sockets/socketHandler.js";

const PORT = process.env.PORT || 3001;

const bootstrap = async () => {
  await connectDatabase();
  await initializeGrid();

  const httpServer = createServer();

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const app = createApp(io);
  httpServer.on("request", app);

  registerSocketHandlers(io);

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
