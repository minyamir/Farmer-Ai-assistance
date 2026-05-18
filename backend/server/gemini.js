import axios from "axios";
import fs from "fs";

export default async function gemini(text, imagePath, lang) {
  let imagePart = null;

  if (imagePath) {
    const base64 = fs.readFileSync(imagePath, { encoding: "base64" });
    imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64
      }
    };
  }

  // 2026 SYSTEM INSTRUCTIONS SCHEMA
  const systemInstruction = {
    role: "system", // Added role for clarity in v1beta
    parts: [{
      text: `You are a senior Ethiopian Agricultural Extension Officer. 
      Your goal is to help smallholder farmers diagnose crop and cattle diseases.
      1. Always respond in natural, rural Amharic (not formal academic Amharic).
      2. Use specific Ethiopian agricultural terms (e.g., 'Wag' for rust, 'Kichit' for stunted growth).
      3. If an image is provided, identify local pests like the Desert Locust or Fall Armyworm.
      4. Provide detailed, step-by-step organic or low-cost solutions.
      5. Respond in the language provided: ${lang}.`
    }]
  };

  const body = {
    system_instruction: systemInstruction,
    contents: [
      {
        role: "user", // Explicitly defining the user role
        parts: [
          { text: `Farmer Input: ${text}` },
          ...(imagePart ? [imagePart] : [])
        ]
      }
    ],
    generationConfig: {
  temperature: 0.8, // ትንሽ ከፍ አድርገው ለተሻለ አገላለጽ
  maxOutputTokens: 2048, // ቢያንስ ወደ 2048 ይደግ
  topP: 0.95,
}
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`;

  try {
    const res = await axios.post(url, body);

    // FIX: Check if candidates exist before accessing [0]
    if (!res.data.candidates || res.data.candidates.length === 0) {
      console.warn("Gemini Warning: No response candidate returned. Check safety filters.");
      
      // Check if it was blocked by safety
      if (res.data.promptFeedback?.blockReason) {
        return `I'm sorry, I cannot answer this. Reason: ${res.data.promptFeedback.blockReason}`;
      }
      
      return "The AI couldn't generate a response. Please try rephrasing your question.";
    }

    // Safely extract the text
    const responseText = res.data.candidates[0].content?.parts?.[0]?.text;
    
    if (!responseText) {
      return "The AI responded but the content was empty. Please check your image quality.";
    }

    return responseText;

  } catch (err) {
    // Better Error Logging to see EXACTLY what Google says
    const errorDetail = err.response?.data?.error?.message || err.message;
    console.error("--- Gemini API Error Details ---");
    console.error("Status:", err.response?.status);
    console.error("Message:", errorDetail);
    
    throw new Error(`Gemini Error: ${errorDetail}`);
  }
}