import { Router } from "express";
import { createUser, getUserStats } from "../controllers/userController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.post("/", asyncHandler(createUser));
router.get("/:userId/stats", asyncHandler(getUserStats));

export default router;
