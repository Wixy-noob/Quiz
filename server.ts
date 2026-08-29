import express from "express";
import path from "path";
import { GoogleGenAI, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initialization for GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 1. Landmark Recognition endpoint
app.post("/api/landmark/recognize", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 data" });
    }

    const ai = getAI();
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    const prompt = `Analyze this photo of an urban landmark, monument, or historical building.
Identify:
1. Exact Landmark Name
2. City and Country
3. Architectural Style & Approximate Era/Year built
4. Confidence level (High / Medium / Low)
5. 3-4 Key Visual Highlights / Hotspots with approximate normalized coordinate positions (x: 0-100%, y: 0-100%) and brief title.
6. Short 2-sentence captivating description for a tourist.

Respond strictly in valid JSON format matching this schema:
{
  "landmarkName": "string",
  "city": "string",
  "country": "string",
  "era": "string",
  "architecturalStyle": "string",
  "confidence": "High" | "Medium" | "Low",
  "shortDescription": "string",
  "hotspots": [
    { "title": "string", "x": number, "y": number, "description": "string" }
  ]
}`;

    // Try gemini-3.1-pro-preview first, fallback to gemini-3.7-flash if needed
    let modelName = "gemini-3.1-pro-preview";
    let response;
    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });
    } catch (primaryErr) {
      console.warn(`Fallback from ${modelName} to gemini-3.7-flash:`, primaryErr);
      response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });
    }

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error recognizing landmark:", error);
    res.status(500).json({ error: error.message || "Failed to recognize landmark" });
  }
});

// 2. Google Search Grounding History & Context endpoint
app.post("/api/landmark/history", async (req, res) => {
  try {
    const { landmarkName, city, country } = req.body;
    if (!landmarkName) {
      return res.status(400).json({ error: "Missing landmarkName" });
    }

    const ai = getAI();
    const query = `Provide in-depth historical facts, secrets, architectural lore, and visiting tips for "${landmarkName}" in ${city || ""}, ${country || ""}. Include historical timeline milestones and interesting cultural trivia.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `You are an expert cultural historian and AR tour guide. Provide well-structured Markdown covering:
- **Historical Overview & Origin**
- **Timeline of Key Milestones** (Year - Event)
- **Architectural Marvels & Hidden Secrets**
- **Visitor Context & Cultural Significance**
Keep tone engaging, authoritative, and evocative.`,
      },
    });

    const markdown = response.text || "No history available.";
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchSources = rawChunks
      .filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        title: chunk.web?.title || "Web Reference",
        url: chunk.web?.uri,
      }));

    res.json({
      success: true,
      historyMarkdown: markdown,
      sources: searchSources,
    });
  } catch (error: any) {
    console.error("Error fetching landmark history:", error);
    res.status(500).json({ error: error.message || "Failed to fetch landmark history" });
  }
});

// 3. AR Voice Guide Text-To-Speech (TTS) endpoint
app.post("/api/landmark/tts", async (req, res) => {
  try {
    const { scriptText, voice = "Zephyr" } = req.body;
    if (!scriptText) {
      return res.status(400).json({ error: "Missing scriptText" });
    }

    const ai = getAI();
    const cleanScript = scriptText.slice(0, 450); // concise AR narration snippet

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: cleanScript }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || "Zephyr" }, // 'Zephyr' | 'Kore' | 'Puck' | 'Fenrir'
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: "No audio generated from TTS" });
    }

    res.json({
      success: true,
      audioBase64: base64Audio,
      sampleRate: 24000,
      format: "pcm_24k",
    });
  } catch (error: any) {
    console.error("Error generating TTS narration:", error);
    res.status(500).json({ error: error.message || "Failed to generate TTS" });
  }
});

// 4. AI Adaptive Tenses Coach endpoint
app.post("/api/tenses/explain", async (req, res) => {
  try {
    const { tenseName, question, selectedAnswer, correctAnswer, formula } = req.body;
    const ai = getAI();

    const prompt = `You are the Madjuka Tensis AI English Tutor.
Tense: ${tenseName}
Formula: ${formula}
Question: "${question}"
User chose: "${selectedAnswer}"
Correct answer: "${correctAnswer}"

Give a friendly, crystal-clear 2-3 sentence explanation in Indonesian (or bilingual Indonesian/English) explaining WHY "${correctAnswer}" is correct, highlighting the time signal (time marker) and verb structure.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    res.json({
      success: true,
      explanation: response.text || "Keep practicing your English tenses!",
    });
  } catch (error: any) {
    console.error("Error generating tenses explanation:", error);
    res.status(500).json({ error: error.message || "Failed to get AI explanation" });
  }
});

// Server bootstrap with Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Madjuka Tensis & Photo Tourism Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
