import express from "express"
const router = express.Router();

import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessage, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";


router.get("/users", protectRoute, getUsersForSidebar)
router.get("/:id", protectRoute, getMessage)

router.post("/send/:id", protectRoute, sendMessage)
export default router;