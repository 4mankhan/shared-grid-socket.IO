import Cell from "../models/Cell.js";
import User from "../models/User.js";
import { getGridDimensions } from "../utils/gridInitializer.js";
import {
  isValidCoordinate,
  isValidHexColor,
} from "../utils/validation.js";

const getClaimCooldownMs = () =>
  parseInt(process.env.CLAIM_COOLDOWN_MS || "5000", 10);

const connectedUsers = new Map();

const broadcastOnlineCount = (io) => {
  io.emit("online_users", {
    count: connectedUsers.size,
    users: Array.from(connectedUsers.values()).map((user) => ({
      username: user.username,
      color: user.color,
    })),
  });
};

export const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("user_join", async ({ userId, username, color }) => {
      if (!userId || !username) {
        return;
      }

      connectedUsers.set(socket.id, { userId, username, color });

      socket.broadcast.emit("user_event", {
        type: "USER_JOINED",
        username,
        color,
        timestamp: new Date().toISOString(),
      });

      broadcastOnlineCount(io);
    });

    socket.on("claim_cell", async (payload, callback) => {
      try {
        const { row, column, userId, color } = payload || {};
        const { rows, columns } = getGridDimensions();

        if (!userId) {
          callback?.({ success: false, message: "User ID is required" });
          return;
        }

        if (
          !isValidCoordinate(row, rows) ||
          !isValidCoordinate(column, columns)
        ) {
          callback?.({ success: false, message: "Invalid cell coordinates" });
          return;
        }

        if (!isValidHexColor(color)) {
          callback?.({ success: false, message: "Invalid color format" });
          return;
        }

        const user = await User.findById(userId);

        if (!user) {
          callback?.({ success: false, message: "User not found" });
          return;
        }

        const cooldownMs = getClaimCooldownMs();

        if (user.lastClaimAt) {
          const elapsed = Date.now() - user.lastClaimAt.getTime();

          if (elapsed < cooldownMs) {
            const remaining = Math.ceil((cooldownMs - elapsed) / 1000);
            callback?.({
              success: false,
              message: `Please wait ${remaining}s before claiming another cell`,
            });
            return;
          }
        }

        const updatedCell = await Cell.findOneAndUpdate(
          {
            row,
            column,
            $or: [{ owner: null }, { owner: { $exists: false } }],
          },
          {
            $set: {
              owner: user.username,
              color,
              updatedAt: new Date(),
            },
          },
          { new: true }
        ).lean();

        if (!updatedCell) {
          callback?.({ success: false, message: "Cell already claimed" });
          return;
        }

        user.lastClaimAt = new Date();
        user.color = color;
        await user.save();

        const cellPayload = {
          row: updatedCell.row,
          column: updatedCell.column,
          owner: updatedCell.owner,
          color: updatedCell.color,
          updatedAt: updatedCell.updatedAt,
        };

        io.emit("cell_updated", cellPayload);
        io.emit("activity", {
          type: "CELL_CLAIMED",
          message: `${user.username} claimed cell (${row}, ${column})`,
          username: user.username,
          row,
          column,
          timestamp: new Date().toISOString(),
        });

        callback?.({ success: true, cell: cellPayload });
      } catch (error) {
        console.error("Socket claim_cell error:", error);
        callback?.({ success: false, message: "Failed to claim cell" });
      }
    });

    socket.on("disconnect", () => {
      const user = connectedUsers.get(socket.id);

      if (user) {
        connectedUsers.delete(socket.id);

        io.emit("user_event", {
          type: "USER_LEFT",
          username: user.username,
          timestamp: new Date().toISOString(),
        });

        broadcastOnlineCount(io);
      }

      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
