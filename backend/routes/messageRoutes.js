import express from "express";
import multer from "multer";
import {
  sendMessage,
  getMessages,
  sendImageMessage,
} from "../controllers/messageController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });


router.post("/", protect, sendMessage);


router.post("/image", protect, upload.single("image"), sendImageMessage);


router.get("/:receiverId", protect, getMessages);

export default router;
