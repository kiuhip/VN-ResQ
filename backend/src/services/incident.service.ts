import { PrismaClient } from '@prisma/client';
import { aiService } from './ai.service';

const prisma = new PrismaClient();

export class IncidentService {

    async createFromText(source: string, text: string) {
        // 1. Extract info via AI (including GPS coordinates if available)
        const extraction = await aiService.extractInfoFromText(text);

        // 2. Create record with coordinates from AI
        const incident = await prisma.incident.create({
            data: {
                source,
                locationText: extraction.location_text,
                incidentType: extraction.incident_type,
                peopleCount: extraction.people_count,
                urgency: extraction.urgency,
                description: extraction.description,
                status: 'open',
                latitude: extraction.latitude,   // From AI extraction
                longitude: extraction.longitude, // From AI extraction
            }
        });

        return incident;
    }

    async getAll() {
        return prisma.incident.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                assignments: {
                    include: {
                        team: true
                    }
                }
            }
        });
    }

    async getById(id: string) {
        return prisma.incident.findUnique({
            where: { id },
            include: {
                assignments: {
                    include: {
                        team: true
                    }
                }
            }
        });
    }
}

export const incidentService = new IncidentService();
