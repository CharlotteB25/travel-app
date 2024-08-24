import { Router } from "express";
import { getCurrentUser, getDashboard, updateUser } from "./User.controller";

const router = Router();
router.get("/users/current", getCurrentUser);
router.get("/users/current/dashboard", getDashboard);
router.patch("/users/:id", updateUser);

export default router;
