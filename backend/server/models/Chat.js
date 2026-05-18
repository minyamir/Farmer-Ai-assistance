import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userText: String,
  aiText: String,
  language: String,
  image: String,
  audio: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Chat", chatSchema);