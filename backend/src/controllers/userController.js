import User from "../models/User.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { isValidHexColor, sanitizeUsername } from "../utils/validation.js";

const DEFAULT_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f43f5e",
];

const pickRandomColor = () => {
  const index = Math.floor(Math.random() * DEFAULT_COLORS.length);
  return DEFAULT_COLORS[index];
};

export const createUser = async (req, res) => {
  const username = sanitizeUsername(req.body.username);
  const requestedColor = req.body.color;

  if (!username) {
    return errorResponse(
      res,
      "Username must be between 2 and 24 characters",
      400
    );
  }

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    return errorResponse(res, "Username already taken", 409);
  }

  const color =
    requestedColor && isValidHexColor(requestedColor)
      ? requestedColor
      : pickRandomColor();

  const user = await User.create({ username, color });

  return successResponse(
    res,
    {
      user: {
        id: user._id,
        username: user.username,
        color: user.color,
        createdAt: user.createdAt,
      },
    },
    201
  );
};

export const getUserStats = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId).lean();

  if (!user) {
    return errorResponse(res, "User not found", 404);
  }

  const Cell = (await import("../models/Cell.js")).default;
  const claimedCount = await Cell.countDocuments({ owner: user.username });

  return successResponse(res, {
    user: {
      id: user._id,
      username: user.username,
      color: user.color,
      claimedCount,
      createdAt: user.createdAt,
    },
  });
};
