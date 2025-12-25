import { geminiModel, isMock } from '../integrations/gemini';
import { z } from 'zod';
import axios from 'axios';

// Schema Validation
const IncidentExtractionSchema = z.object({
    location_text: z.string(),
    searchable_address: z.string().optional(),
    incident_type: z.string(),
    people_count: z.number().optional().default(1),
    urgency: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

type IncidentExtraction = z.infer<typeof IncidentExtractionSchema>;

export class AIService {

    async speechToTextFPT(audioBuffer: Buffer): Promise<string> {
        console.log("🎙️ FPT.AI ASR: Processing audio...");
        try {
            const apiKey = process.env.FPT_AI_KEY;
            if (!apiKey) throw new Error("FPT_AI_KEY is missing in .env");

            const response = await axios.post('https://api.fpt.ai/hmi/asr/general', audioBuffer, {
                headers: {
                    'api-key': apiKey,
                    'Content-Type': 'application/octet-stream'
                }
            });

            console.log("📦 FPT.AI Raw Output:", JSON.stringify(response.data));

            if (response.data && response.data.hypotheses && response.data.hypotheses.length > 0) {
                const transcript = response.data.hypotheses[0].utterance;
                console.log("📝 FPT.AI Transcript:", transcript);
                return transcript;
            }

            throw new Error("FPT.AI could not transcribe the audio");
        } catch (error: any) {
            console.error("❌ FPT.AI ASR Error:", error.message);
            throw error;
        }
    }

    async extractInfoFromText(text: string): Promise<IncidentExtraction> {
        console.log("🤖 Gemini Processing:", text);

        try {
            const prompt = `Extract emergency details from this TEXT: "${text}"
            Target Context: Vietnam (Hanoi preferred).
            
            Strict Rules:
            1. 'location_text' MUST be the exact address found in text. If none, return "Unknown".
            2. 'searchable_address' should be a clean string for Geocoding API (e.g. "1 Dai Co Viet, Hai Ba Trung, Hanoi").
            3. Do NOT invent coordinates. Set latitude/longitude to null/undefined unless explicitly stated in text (extremely rare).
            
            Return ONLY JSON:
            {
              "location_text": "raw address or Unknown",
              "searchable_address": "clean address for geocoding",
              "incident_type": "Fire/Flood/Accident/Health/Rescue/Other",
              "people_count": number (default 1),
              "urgency": "low/medium/high/critical",
              "description": "short summary"
            }`;

            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            const textResponse = response.text().replace(/```json|```/g, '').trim();

            console.log("📦 AI Response:", textResponse);
            const raw = JSON.parse(textResponse);

            return {
                location_text: raw.location_text || "Unknown",
                searchable_address: raw.searchable_address || raw.location_text || "Hanoi, Vietnam",
                incident_type: raw.incident_type || "General",
                people_count: typeof raw.people_count === 'number' ? raw.people_count : 1,
                urgency: raw.urgency || "medium",
                description: raw.description || text,
                latitude: undefined,
                longitude: undefined,
            } as any;

        } catch (error: any) {
            console.error("❌ Gemini API ERROR:", error?.message || error);

            // Fallback: Smart Regex Extraction
            let extractedLocation = "Unknown";
            const sent = text.replace(/[\n\r]/g, " ");

            const match = sent.match(/(?:tại|ở|địa chỉ|khu vực|số|ngõ)\s+([^,.;!?]+)/i);

            if (match) {
                extractedLocation = match[0].replace(/^(tại|ở|địa chỉ|khu vực)\s+/i, '').trim();
                if (extractedLocation.length < 3) extractedLocation = "Unknown";
            } else {
                if (text.length < 100 && (text.includes("ngõ") || text.includes("phố") || text.includes("đường"))) {
                    extractedLocation = text;
                }
            }

            console.log("⚠️ Using Regex Fallback. Extracted:", extractedLocation);

            return {
                location_text: extractedLocation,
                searchable_address: extractedLocation !== "Unknown" ? extractedLocation : "Hanoi, Vietnam",
                incident_type: "General Report",
                people_count: 1,
                urgency: "medium",
                description: text,
                latitude: undefined,
                longitude: undefined,
            };
        }
    }

    async analyzeAudio(audioBuffer: Buffer, mimeType: string): Promise<IncidentExtraction> {
        console.log("🔊 Hotline: Analyzing audio message...");

        try {
            // STEP 1: Use FPT.AI for High Accuracy Vietnamese Speech-to-Text
            const transcript = await this.speechToTextFPT(audioBuffer);

            // STEP 2: Use Gemini to extract structured info from the transcript
            const extraction = await this.extractInfoFromText(transcript);

            return {
                ...extraction,
                description: `[FPT.AI Transcription]: ${transcript}\n\n[Summary]: ${extraction.description}`
            };

        } catch (error: any) {
            console.warn("⚠️ FPT.AI Failed, falling back to Gemini Multimodal...", error.message);

            // FALLBACK: Use Gemini Multimodal directly
            try {
                const prompt = `
                Listen to this emergency call (Vietnamese). 
                1. Transcribe the speech to text.
                2. Extract key details into JSON.
                
                Return JSON:
                {
                    "location_text": "...",
                    "incident_type": "...",
                    "people_count": ...,
                    "urgency": "...",
                    "description": "Full Transcript"
                }
                `;

                const audioBase64 = audioBuffer.toString('base64');
                const result = await geminiModel.generateContent([
                    prompt,
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: audioBase64
                        }
                    }
                ]);

                const response = await result.response;
                let textResponse = response.text();
                textResponse = textResponse.replace(/^```json/g, '').replace(/^```/g, '').trim();

                const raw = JSON.parse(textResponse);
                return {
                    ...raw,
                    latitude: undefined,
                    longitude: undefined
                };
            } catch (fallbackError) {
                console.error("❌ All AI Audio Processing Failed");
                throw new Error("Unable to process audio report.");
            }
        }
    }

    async scoreUrgency(details: any): Promise<string> {
        return details.urgency || 'medium';
    }
}

export const aiService = new AIService();
