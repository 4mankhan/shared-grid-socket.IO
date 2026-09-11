import Cell from "../models/Cell.js";
import User from "../models/User.js";
import { getGridDimensions } from "../utils/gridInitializer.js";
import { errorResponse, successResponse } from "../utils/response.js";
import {
  isValidCoordinate,
  isValidHexColor,
} from "../utils/validation.js";

const getClaimCooldownMs = () =>
  parseInt(process.env.CLAIM_COOLDOWN_MS || "5000", 10);

export const getGrid = async (req, res) => {
  const { rows, columns } = getGridDimensions();
  const cells = await Cell.find({}, "row column owner color updatedAt")
    .sort({ row: 1, column: 1 })
    .lean();

  const claimedCount = cells.filter((cell) => cell.owner).length;

  return successResponse(res, {
    rows,
    columns,
    totalCells: rows * columns,
    claimedCells: claimedCount,
    availableCells: rows * columns - claimedCount,
    cells,
  });
};

export const getLeaderboard = async (req, res) => {
  const leaderboard = await Cell.aggregate([
    { $match: { owner: { $ne: null } } },
    {
      $group: {
        _id: "$owner",
        count: { $sum: 1 },
        color: { $last: "$color" },
      },
    },
    { $sort: { count: -1 } },
    {
      $project: {
        _id: 0,
        username: "$_id",
        count: 1,
        color: 1,
      },
    },
  ]);

  return successResponse(res, { leaderboard });
};

export const claimCell = async (req, res) => {
  const { row, column, userId, color } = req.body;
  const { rows, columns } = getGridDimensions();

  if (!userId) {
    return errorResponse(res, "User ID is required", 400);
  }

  if (!isValidCoordinate(row, rows) || !isValidCoordinate(column, columns)) {
    return errorResponse(res, "Invalid cell coordinates", 400);
  }

  if (!isValidHexColor(color)) {
    return errorResponse(res, "Invalid color format", 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    return errorResponse(res, "User not found", 404);
  }

  const cooldownMs = getClaimCooldownMs();

  if (user.lastClaimAt) {
    const elapsed = Date.now() - user.lastClaimAt.getTime();

    if (elapsed < cooldownMs) {
      const remaining = Math.ceil((cooldownMs - elapsed) / 1000);
      return errorResponse(
        res,
        `Please wait ${remaining}s before claiming another cell`,
        429
      );
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
    return res.status(409).json({
      success: false,
      message: "Cell already claimed",
    });
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

  req.io.emit("cell_updated", cellPayload);
  req.io.emit("activity", {
    type: "CELL_CLAIMED",
    message: `${user.username} claimed cell (${row}, ${column})`,
    username: user.username,
    row,
    column,
    timestamp: new Date().toISOString(),
  });

  return successResponse(res, { cell: cellPayload });
};
