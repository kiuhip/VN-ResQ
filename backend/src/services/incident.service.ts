import { PrismaClient } from '@prisma/client';
import { aiService } from './ai.service';

const prisma = new PrismaClient();

export class IncidentService {

    async createFromText(source: string, text: string) {
        // 1. Extract info via AI
        const extraction = await aiService.extractInfoFromText(text);

        // 2. Create record
        const incident = await prisma.incident.create({
            data: {
                source,
                locationText: extraction.location_text,
                incidentType: extraction.incident_type,
                peopleCount: extraction.people_count,
                urgency: extraction.urgency,
                description: extraction.description,
                status: 'open',
                // Latitude/Longitude would need Geocoding service.
                // We'll leave them null for now or implement geocoding later.
            }
        });

        return incident;
    }

    async getAll() {
        return prisma.incident.findMany({
            orderBy: { createdAt: 'desc' },
            include: { assignments: true }
        });
    }

    async getById(id: string) {
        return prisma.incident.findUnique({
            where: { id },
            include: { assignments: true }
        });
    }
}

export const incidentService = new IncidentService();
