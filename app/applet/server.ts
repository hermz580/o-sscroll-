import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

app.use(express.json());

app.post("/api/reading", async (req: Request, res: Response) => {
  try {
    const { name, origin, date, time, pdfText } = req.body;

    const systemInstruction = `You are an expert astrologer reading from the higher heavens.
Generate a deep, insightful, and lovely reading about the user's inner essence,
aligning their birth alignment with their current position in space and time.
Speak with a "higher voice".`;

    const userDataText = `User Information:
Name: ${name || 'Unknown'}
Origin: ${origin || 'Unknown'}
Date of Birth: ${date || 'Unknown'}
Time of Birth: ${time || 'Unknown'}

Additional Information from document:
${pdfText || 'None provided'}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite-preview",
      contents: [{ parts: [{ text: userDataText }] }],
      config: {
        systemInstruction: systemInstruction,
      },
    });

    res.json({ reading: response.candidates?.[0]?.content?.parts?.[0]?.text || '' });
  } catch (error) {
    console.error("Error generating reading:", error);
    res.status(500).json({ error: "Failed to generate reading." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
