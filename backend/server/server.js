import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";

// Import our new utility functions
import gemini from "./gemini.js";
import tts from "./tts.js";

dotenv.config();
const app = express();
const __dirname = path.resolve();

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🌍 MongoDB Connected"))
  .catch(err => console.error("DB Error:", err));

// Ensure this matches where your 'uploads' folder actually is
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const upload = multer({ dest: path.join(__dirname, "uploads") });

const Chat = mongoose.model("Chat", new mongoose.Schema({
  userText: String, aiText: String, language: String, image: String, audio: String, createdAt: { type: Date, default: Date.now }
}));

function normalizeLang(lang) {
  const l = String(lang || "en").toLowerCase();
  if (l.startsWith("am")) return "am";
  if (l.startsWith("om") || l.startsWith("or")) return "om";
  return "en";
}

app.post("/api/ai", upload.single("image"), async (req, res) => {
  try {
    const { text, language } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });

    const lang = normalizeLang(language);
    const aiText = await gemini(text, req.file?.path, lang);
    const audioUrl = await tts(aiText, lang);

    const chat = await Chat.create({
      userText: text, aiText, language: lang, image: req.file?.path || null, audio: audioUrl
    });

    res.json({ text: aiText, language: lang, audio: audioUrl, chatId: chat._id });
  }catch (err) {
    // This tells us EXACTLY where the 404 is coming from
    console.error("--- ERROR LOG ---");
    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);
    console.error("Message:", err.message);
    
    res.status(500).json({ 
      error: "AI processing failed", 
      details: err.message,
      status: err.response?.status 
    });
  }
});

app.listen(process.env.PORT || 5000, () => console.log("🚀 Server running on port 5000"));