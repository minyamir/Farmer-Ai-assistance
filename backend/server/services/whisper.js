import axios from "axios";
import fs from "fs";
import FormData from "form-data";

export default async function whisper(audioPath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(audioPath));
  form.append("model", "whisper-1");

  const res = await axios.post(
    "https://api.openai.com/v1/audio/transcriptions",
    form,
    {
      headers: {
        Authorization: `Bearer ${process.env.WHISPER_API_KEY}`,
        ...form.getHeaders()
      }
    }
  );

  return {
    text: res.data.text,
    language: res.data.language || "en"
  };
}