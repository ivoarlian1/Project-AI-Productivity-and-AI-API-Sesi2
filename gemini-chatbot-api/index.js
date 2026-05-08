import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = "gemini-3-flash-preview";

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const port = 3000;
app.listen(port, () => console.log(`Server ready on port http://localhost:${port}`));


app.post("/api/chat", async (req, res) => {
    const { conversation } = req.body;
    try {
        if (!Array.isArray(conversation)) throw new Error("Massage must be an array!");

        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.9,
                systemInstruction: "Jawab hanya menggunakan bahasa indonesia",
            },
        });
        res.status(200).json({ result: response.text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});