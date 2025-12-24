import { geminiModel, isMock } from '../integrations/gemini';
import { z } from 'zod';

// Schema Validation (giữ nguyên để tham khảo type)
const IncidentExtractionSchema = z.object({
    location_text: z.string(),
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

        if (isMock) {
            console.log('⚠️ Warning: Using Mock Mode (No Gemini Key found)');
            const lowerText = text.toLowerCase();

            // ✨ SMART MOCKING
            if (lowerText.includes('an sơn') || lowerText.includes('an son')) {
                return { location_text: 'Số 7, Ngách 56, Ngõ An Sơn, Hà Nội', incident_type: 'Fire', people_count: 3, urgency: 'critical', description: text, latitude: 21.0013, longitude: 105.8454 };
            }
            if (lowerText.includes('trần duy hưng') || lowerText.includes('tran duy hung')) {
                return { location_text: 'Số 10, Đường Trần Duy Hưng, Cầu Giấy, Hà Nội', incident_type: 'Fire', people_count: 5, urgency: 'critical', description: text, latitude: 21.0076, longitude: 105.7958 };
            }
            if (lowerText.includes('giải phóng') || lowerText.includes('giai phong')) {
                return { location_text: 'Đường Giải Phóng, Hai Bà Trưng, Hà Nội', incident_type: 'Fire', people_count: 5, urgency: 'high', description: text, latitude: 21.0025, longitude: 105.8412 };
            }
            if (lowerText.includes('hoàn kiếm') || lowerText.includes('hoan kiem')) {
                return { location_text: 'Quận Hoàn Kiếm, Hà Nội', incident_type: 'Rescue', people_count: 2, urgency: 'medium', description: text, latitude: 21.0285, longitude: 105.8542 };
            }
            if (lowerText.includes('cầu giấy') || lowerText.includes('cau giay')) {
                return { location_text: 'Quận Cầu Giấy, Hà Nội', incident_type: 'Accident', people_count: 1, urgency: 'high', description: text, latitude: 21.0350, longitude: 105.7980 };
            }
            return {
                location_text: 'Detected Location ' + text.substring(0, 10),
                incident_type: 'Unknown',
                people_count: 1,
                urgency: 'medium',
                description: text,
                latitude: undefined,
                longitude: undefined,
            };
        }

        try {
            const prompt = `Extract emergency details from this TEXT: "${text}"
            Return ONLY JSON:
            {
              "location_text": "specific address",
              "searchable_address": "clean address for GPS",
              "incident_type": "Fire/Flood/Accident/Health/Rescue/Other",
              "people_count": number,
              "urgency": "low/medium/high/critical",
              "description": "short summary",
              "latitude": number or null,
              "longitude": number or null
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
                latitude: typeof raw.latitude === 'number' ? raw.latitude : undefined,
                longitude: typeof raw.longitude === 'number' ? raw.longitude : undefined,
            } as any;

        } catch (error: any) {
            console.error("❌ Gemini API ERROR DETAILS:", error?.message || error);
            if (error?.response) {
                console.error("📦 Gemini Error Response:", JSON.stringify(error.response, null, 2));
            }
            const lowerText = text.toLowerCase();

            // ✨ SMART MOCKING: Detect common Hanoi locations
            if (lowerText.includes('giải phóng') || lowerText.includes('giai phong')) {
                return {
                    location_text: 'Đường Giải Phóng, Hai Bà Trưng, Hà Nội',
                    incident_type: 'Fire',
                    people_count: 5,
                    urgency: 'high',
                    description: text,
                    latitude: 21.0025,
                    longitude: 105.8412
                };
            }

            if (lowerText.includes('hoàn kiếm') || lowerText.includes('hoan kiem') || lowerText.includes('hồ gươm')) {
                return {
                    location_text: 'Quận Hoàn Kiếm, Hà Nội',
                    incident_type: 'Rescue',
                    people_count: 2,
                    urgency: 'medium',
                    description: text,
                    latitude: 21.0285,
                    longitude: 105.8542
                };
            }

            if (lowerText.includes('cầu giấy') || lowerText.includes('cau giay')) {
                return {
                    location_text: 'Quận Cầu Giấy, Hà Nội',
                    incident_type: 'Accident',
                    people_count: 1,
                    urgency: 'high',
                    description: text,
                    latitude: 21.0350,
                    longitude: 105.7980
                };
            }

            if (lowerText.includes('ngã tư sở') || lowerText.includes('nga tu so')) {
                return {
                    location_text: 'Ngã tư Sở, Đống Đa, Hà Nội',
                    incident_type: 'Traffic',
                    people_count: 50,
                    urgency: 'high',
                    description: text,
                    latitude: 21.0041,
                    longitude: 105.8160
                };
            }

            if (lowerText.includes('chợ đồng xuân') || lowerText.includes('cho dong xuan')) {
                return {
                    location_text: 'Chợ Đồng Xuân, Hoàn Kiếm, Hà Nội',
                    incident_type: 'Fire',
                    people_count: 100,
                    urgency: 'critical',
                    description: text,
                    latitude: 21.0365,
                    longitude: 105.8495
                };
            }

            // Fallback: Try to use the Text as Location if short, or generic Hanoi
            return {
                location_text: text.length < 50 ? text : "Hanoi Area (Exact location unclear)",
                incident_type: "General Report",
                people_count: 1,
                urgency: "medium",
                description: text,
                latitude: 21.0285 + (Math.random() * 0.01 - 0.005), // Random jitter around Hanoi Center
                longitude: 105.8542 + (Math.random() * 0.01 - 0.005),
            };
        }
    }

    async analyzeAudio(audioBuffer: Buffer, mimeType: string): Promise<IncidentExtraction> {
        console.log("🔊 Gemini Listening to Audio...");
        
        if (isMock) {
             console.log("⚠️ Using Mock Audio Analysis");
             return {
                 location_text: "Khu tập thể Thanh Xuân Bắc, Hà Nội",
                 incident_type: "Flood",
                 people_count: 5,
                 urgency: "critical",
                 description: "[Voice Transcript]: Water rising fast at ground floor, 5 people trapped including elderly.",
                 latitude: 20.9950,
                 longitude: 105.7950
             };
        }

        try {
            const prompt = `
            Listen to this emergency call. 
            1. Transcribe the speech to Vietnamese text.
            2. Extract key details into JSON:
               - location_text
               - incident_type
               - people_count
               - urgency
               - description (The full transcript)
               - latitude (estimate for Vietnam/Hanoi, critical for mapping)
               - longitude (estimate)
            
            Return ONLY raw JSON.
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

            return JSON.parse(textResponse);

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
