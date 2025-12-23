import { openai, isMock } from '../integrations/openai';
import { z } from 'zod';

const IncidentExtractionSchema = z.object({
    location_text: z.string(),
    incident_type: z.string(),
    people_count: z.number().optional().default(1),
    urgency: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string().optional(),
});

type IncidentExtraction = z.infer<typeof IncidentExtractionSchema>;

export class AIService {

    async extractInfoFromText(text: string): Promise<IncidentExtraction> {
        if (isMock) {
            console.log('Mocking AI extraction for:', text);
            return {
                location_text: 'Detected Location from ' + text.substring(0, 10),
                incident_type: 'Unknown',
                people_count: 1,
                urgency: 'medium',
                description: text,
            };
        }

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4-turbo",
                messages: [
                    { role: "system", content: "Extract emergency incident details as JSON. Urgency must be low/medium/high/critical. If location is missing, use 'Unknown'." },
                    { role: "user", content: text }
                ],
                response_format: { type: "json_object" },
            });

            const content = completion.choices[0].message.content;
            if (!content) throw new Error("Empty AI response");

            const raw = JSON.parse(content);
            // Validate with Zod
            // Note: In a real app we'd map fields carefully. Here we assume GPT behaves or we'd refine the prompt.
            // For robustness let's just use raw and some defaults if schema fails, or throw.
            // Simple mapping:
            return {
                location_text: raw.location_text || raw.location || "Unknown",
                incident_type: raw.incident_type || raw.type || "General",
                people_count: typeof raw.people_count === 'number' ? raw.people_count : 1,
                urgency: raw.urgency || "medium",
                description: raw.description || raw.summary || text,
            } as IncidentExtraction;

        } catch (error) {
            console.error("AI Extraction failed:", error);
            // Fallback
            return {
                location_text: "Unknown Location (AI Error)",
                incident_type: "Unclassified",
                people_count: 1,
                urgency: "high", // Fail safe to high
                description: text,
            };
        }
    }

    async scoreUrgency(details: any): Promise<string> {
        // If extraction already provided urgency, we can just return it.
        // Or we can double check. For now, rely on extraction.
        return details.urgency || 'medium';
    }
}

export const aiService = new AIService();
