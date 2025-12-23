import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = "AIzaSyCshZWIUO8fGJnq_yLLSlRkmStEmHacaE4";

export const genAI = new GoogleGenerativeAI(apiKey);

// Dùng model Flash như bạn yêu cầu (Nhanh & Ổn định)
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// TẮT MOCK MODE để dùng AI thật
export const isMock = false;
