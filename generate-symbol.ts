import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generate() {
  try {
    console.log("Generating Harpstar symbol...");
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            text: 'A meticulous, sacred geometric symbol that harbors the essence of all global cultures, indigenous traditions, and ancient sciences. It is a unifying mandala, intricate, glowing with ethereal light, combining African, Mayan, Vedic, Celtic, and Kabbalistic motifs into a single, harmonious, futuristic yet ancient sigil. Dark background, gold and iridescent accents, highly detailed, symmetrical, spiritual.',
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        fs.writeFileSync('public/harpstar-symbol.png', Buffer.from(base64Data, 'base64'));
        console.log("Successfully saved public/harpstar-symbol.png");
        return;
      }
    }
    console.log("No image data found in response.");
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

generate();
