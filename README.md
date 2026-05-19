# 🌾 Farmer AI Assistance (የገበሬው ረዳት ኤአይ)

Farmer AI Assistance is an intelligent, voice-first agricultural support platform designed to empower local farmers, bridge the digital divide, and promote sustainable agriculture in Ethiopia. 

By leveraging the **MERN Stack** and cutting-edge **Multimodal Cloud AI**, the platform offers instant, interactive support in **Amharic (አማርኛ)**, **Afan Oromo (Afaan Oromoo)**, and **English**, tailored specifically for low-literacy environments.

---

## 🚀 Key Features

* **🎙️ Voice-to-Voice Multilingual Support:** Designed specifically for regional languages (Amharic, Afan Oromo, English). Farmers can talk to the AI and receive verbal responses natively.
* **📸 Plant & Cattle Disease Detection:** Farmers can upload or take real-time photos of sick crops or livestock. The AI diagnoses the issue and provides organic treatment steps.
* **🌱 Smart Farming & Crop Recommendations:** Personalized suggestions on fertilizer use, planting timelines, and soil management based on local Ethiopian agricultural data.
* **🌤️ Hyper-Local Weather Tracking:** Clear, simplified weather insights to help farmers plan their harvesting and planting cycles.
* **📜 Chat History:** Saves past diagnostics offline/online via MongoDB so farmers can re-access previous advice easily.

---

## 🛠️ Architecture & Tech Stack

This project is built 100% on **Free & Open-Tier** cloud services, making it perfectly optimized for student deployment.

* **Frontend:** React.js, Vite, Tailwind CSS (Clean, high-contrast, big-button mobile UI)
* **Backend:** Node.js, Express.js, Multer (Handles simultaneous binary audio and image streams)
* **Database:** MongoDB Atlas (Saves multi-language chat records)
* **AI Core Pipeline (Serverless Cloud):**
  * **Speech-to-Text (Ears):** OpenAI Whisper via Hugging Face Inference API
  * **Vision & Reasoning (Brain):** Gemini 1.5 Flash via Google AI Studio
  * **Text-to-Speech (Mouth):** Meta Massively Multilingual Speech (MMS) via Hugging Face Inference API

---

## 📁 Project Structure

```text
farmer-assist-ai/
├── client/          # React Frontend (Vite + Tailwind)
├── server/          # Node.js + Express Backend
└── shared/          # Unified Language codes (am/om/en) used by both sides
