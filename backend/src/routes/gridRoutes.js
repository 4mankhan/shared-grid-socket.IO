import { Router } from "express";
import {
  claimCell,
  getGrid,
  getLeaderboard,
} from "../controllers/gridController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", asyncHandler(getGrid));
router.get("/leaderboard", asyncHandler(getLeaderboard));
router.post("/claim", asyncHandler(claimCell));

export default router;
