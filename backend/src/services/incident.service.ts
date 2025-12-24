import { PrismaClient } from '@prisma/client';
import { aiService } from './ai.service';
import { geocodingService } from './geocoding.service';
import { streamService } from './stream.service';

const prisma = new PrismaClient();

export class IncidentService {

    async createFromText(source: string, text: string, overrides?: any) {
        // 1. Extract info via AI
        const extraction = overrides || await aiService.extractInfoFromText(text);

        // 2. Verified Geocoding Layer
        // If AI found a location text, try to get precise GPS via Nominatim
        let lat = extraction.latitude;
        let lng = extraction.longitude;
        let finalLocation = extraction.location_text;

        if (extraction.location_text && extraction.location_text !== 'Unknown') {
            // Use searchable_address if AI provided a cleaner one, else use location_text
            const addressToSearch = (extraction as any).searchable_address || extraction.location_text;
            const geo = await geocodingService.getCoordinates(addressToSearch);
            if (geo) {
                lat = geo.lat;
                lng = geo.lon;
                // Don't overwrite locationText unless it's empty, 
                // because we usually want to keep the specific house number/ngõ found by AI
            }
        }

        // 3. Create record
        const incident = await prisma.incident.create({
            data: {
                source,
                locationText: finalLocation,
                incidentType: extraction.incident_type,
                peopleCount: extraction.people_count,
                urgency: extraction.urgency,
                description: extraction.description,
                status: 'open',
                latitude: lat,
                longitude: lng,
            }
        });

        // 4. Real-time Broadcast
        streamService.broadcastIncident(incident);

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
