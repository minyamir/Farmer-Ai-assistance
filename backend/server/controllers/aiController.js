import gemini from "../services/gemini.js";
import tts from "../services/tts.js";
import Chat from "../models/Chat.js";
import { normalizeLang } from "../services/language.js";

export const handleAI = async (req, res) => {
  try {
    // From Postman/Frontend (speech already converted to text in browser)
    const text = req.body?.text;
    const lang = normalizeLang(req.body?.language); // am / om / en

    // From multer upload.single("image")
    const imagePath = req.file?.path;

    if (!text) {
      return res.status(400).json({ error: "text is required" });
    }

    const aiText = await gemini(text, imagePath, lang);
    const audioUrl = await tts(aiText, lang);

    const chat = await Chat.create({
      userText: text,
      aiText,
      language: lang,
      image: imagePath || null,
      audio: audioUrl
    });

    res.json({
      text: aiText,
      language: lang,
      audio: audioUrl,
      chatId: chat._id
    });
  } catch (err) {
    const status = err?.response?.status;
    const details = err?.response?.data || err?.message;

    console.error("AI processing failed:", status, details);

    res.status(500).json({
      error: "AI processing failed",
      details
    });
  }
};