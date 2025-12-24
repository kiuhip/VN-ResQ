import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "AIzaSyCshZWIUO8fGJnq_yLLSlRkmStEmHacaE4";

export const genAI = new GoogleGenerativeAI(apiKey);

// Dùng model Pro (Stable) để tránh lỗi 404
export const geminiModel = genAI.getGenerativeModel({
    model: "gemini-pro",
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ]
});

// TẮT MOCK MODE để dùng AI thật
export const isMock = false;
