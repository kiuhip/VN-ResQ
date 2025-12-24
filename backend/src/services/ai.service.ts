import { geminiModel, isMock } from '../integrations/gemini';
import { z } from 'zod';

// Schema Validation (giữ nguyên để tham khảo type)
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

    async extractInfoFromText(text: string): Promise<IncidentExtraction> {
        console.log("🤖 Gemini Processing:", text);

        // REMOVED MOCK LOGIC for Real-World Accuracy
        // if (isMock) { ... }

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
                // Do NOT trust AI coordinates unless specific, rely on Geocoding Service later
                latitude: undefined,
                longitude: undefined,
            } as any;

        } catch (error: any) {
            console.error("❌ Gemini API ERROR:", error?.message || error);

            // Fallback: Smart Regex Extraction
            let extractedLocation = "Unknown";
            const lowerText = text.toLowerCase();

            // Patterns: "tại ...", "ở ...", "số ...", "ngõ ..."
            // We want to capture the phrase after these prepositions.
            const sent = text.replace(/[\n\r]/g, " "); // flatten

            // Try to match "ở [Address]" or "tại [Address]" until a punctuation
            const match = sent.match(/(?:tại|ở|địa chỉ|khu vực|số|ngõ)\s+([^,.;!?]+)/i);

            if (match) {
                // match[0] is like "ở ngõ 48 phố tạ quang bửu"
                // match[1] is "ngõ 48 phố tạ quang bửu"

                // However, sometimes match[1] checks stop at space if not careful, but [^,.;!?]+ grabs until punctuation
                extractedLocation = match[0].replace(/^(tại|ở|địa chỉ|khu vực)\s+/i, '').trim();

                // If it's too short (e.g. "ở đâu"), ignore
                if (extractedLocation.length < 3) extractedLocation = "Unknown";
            } else {
                // Fallback for just "ngõ 48..." without "ở"
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
        console.log("🔊 Gemini Listening to Audio...");

        try {
            const prompt = `
            Listen to this emergency call (Vietnamese). 
            1. Transcribe the speech to text.
            2. Extract key details into JSON.
            3. STRICTLY NO RANDOM COORDINATES.
            
            Return JSON:
            {
                "location_text": "...",
                "incident_type": "...",
                "people_count": ...,
                "urgency": "...",
                "description": "Full Transcript"
            }
            `;

            // Convert Buffer to Base64 for Inline Data
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

            // Clean JSON
            textResponse = textResponse.replace(/^```json/g, '').replace(/^```/g, '').trim();
            console.log("📦 Gemini Audio Analysis:", textResponse);

            const raw = JSON.parse(textResponse);
            return {
                ...raw,
                latitude: undefined, // Force Geocoding Service to find real coords
                longitude: undefined
            };

        } catch (error) {
            console.error("❌ Gemini Audio Failed:", error);
            throw new Error("AI Audio Processing Failed");
        }
    }

    async scoreUrgency(details: any): Promise<string> {
        return details.urgency || 'medium';
    }
}

export const aiService = new AIService();
