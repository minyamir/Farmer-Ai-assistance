import express from "express";
import multer from "multer";
import { handleAI } from "../controllers/aiController.js";

const router = express.Router();

const upload = multer({ dest: "server/uploads/" });

router.post("/", upload.single("image"), handleAI);

export default router;