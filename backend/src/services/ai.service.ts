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
            // Prompt chuyên biệt cho Gemini
            const prompt = `
            Analyze this emergency report and extract details into JSON format.
            Report: "${text}"

            JSON Fields required:
            - location_text: (string) Location description from the text (Vietnamese).
            - incident_type: (string) e.g., Fire, Flood, Accident, Rescue.
            - people_count: (number) Estimated people involved (default 1).
            - urgency: (string) "low", "medium", "high", or "critical".
            - description: (string) Brief summary.
            - latitude: (number) Best guess GPS latitude for this location in Vietnam (especially Hanoi). VITAL: If precise location is known, give accurate coords. If city/district is known, give center coords. If totally unknown, return null.
            - longitude: (number) Best guess GPS longitude.

            Output ONLY raw JSON. No markdown blocking.
            `;

            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            let textResponse = response.text();

            // Clean up Markdown code blocks if Gemini adds them
            textResponse = textResponse.replace(/^```json/g, '').replace(/^```/g, '').trim();

            console.log("📦 Gemini Raw Response:", textResponse);

            const raw = JSON.parse(textResponse);

            return {
                location_text: raw.location_text || "Unknown",
                incident_type: raw.incident_type || "General",
                people_count: typeof raw.people_count === 'number' ? raw.people_count : 1,
                urgency: raw.urgency || "medium",
                description: raw.description || text,
                latitude: typeof raw.latitude === 'number' ? raw.latitude : undefined,
                longitude: typeof raw.longitude === 'number' ? raw.longitude : undefined,
            } as IncidentExtraction;

        } catch (error: any) {
            console.error("❌ Gemini API Failed:", error);
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

            // Mặc định mock
            return {
                location_text: "Unknown Location (AI Error)",
                incident_type: "Unclassified",
                people_count: 1,
                urgency: "high",
                description: text,
                latitude: undefined,
                longitude: undefined,
            };
        }
    }

    async scoreUrgency(details: any): Promise<string> {
        return details.urgency || 'medium';
    }
}

export const aiService = new AIService();
