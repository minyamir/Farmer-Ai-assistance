import * as googleTTS from 'google-tts-api';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default async function tts(text, lang) {
  try {
    // 1. Split text into chunks (Google's limit is 200 chars)
    const results = googleTTS.getAllAudioUrls(text, {
      lang: lang === 'om' ? 'en' : lang, // fallback
      slow: false,
      host: 'https://translate.google.com',
      splitPunct: '. ', // Splits at sentences
    });

    const fileName = `reply-${Date.now()}.mp3`;
    const filePath = path.join(path.resolve(), 'uploads', fileName);
    const writer = fs.createWriteStream(filePath);

    // 2. Download and merge chunks into ONE file
    for (const chunk of results) {
      const response = await axios({
        url: chunk.url,
        method: 'GET',
        responseType: 'stream',
      });
      response.data.pipe(writer, { end: false }); // Don't close stream yet
      
      // Small delay to prevent Google from blocking you
      await new Promise(resolve => response.data.on('end', resolve));
    }

    writer.end(); // Close file after all chunks are written
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error("TTS Merge Error:", error.message);
    throw error;
  }
}