import { PrismaClient } from "@prisma/client";
import { aiService } from "./ai.service";
import { geocodingService } from "./geocoding.service";
import { streamService } from "./stream.service";

const prisma = new PrismaClient();

export class IncidentService {
  async createFromText(source: string, text: string, overrides?: any) {
    // 1. Extract info via AI
    const extraction = overrides || (await aiService.extractInfoFromText(text));

    // 2. Verified Geocoding Layer
    // If AI found a location text, try to get precise GPS via Nominatim
    let lat = extraction.latitude;
    let lng = extraction.longitude;
    let finalLocation = extraction.location_text;

    if (extraction.location_text && extraction.location_text !== "Unknown") {
      // Use searchable_address if AI provided a cleaner one, else use location_text
      const addressToSearch =
        (extraction as any).searchable_address || extraction.location_text;
      const geo = await geocodingService.getCoordinates(addressToSearch);
      if (geo) {
        lat = geo.lat;
        lng = geo.lon;
        // Use the official geocoded address as the final location text for better display
        if (geo.display_name) {
          finalLocation = geo.display_name;
        }
      } else {
        console.log("⚠️ Geocoding failed for:", addressToSearch);
      }
    }

    // If still no GPS, mark it clearly
    if (!lat || !lng) {
      if (finalLocation === "Unknown") {
        finalLocation = "⚠️ Unknown Location (Manual Update Required)";
      } else {
        finalLocation = `[NO GPS] ${finalLocation}`;
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
        status: "open",
        latitude: lat,
        longitude: lng,
      },
    });

    // 4. Real-time Broadcast
    streamService.broadcastIncident(incident);

    return incident;
  }

  async getAll() {
    return prisma.incident.findMany({

      orderBy: { createdAt: "desc" },
      include: {
        assignments: {
          orderBy: { createdAt: "desc" },
          include: {
            team: true,
          },
        },
      },
    });
  }

  async getById(id: string) {
    return prisma.incident.findUnique({
      where: { id },
      include: {
        assignments: {
          orderBy: { createdAt: "desc" },
          include: {
            team: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    // 1. Release Team if assigned
    const assignments = await prisma.assignment.findMany({
      where: { incidentId: id, status: { not: "resolved" } },
    });

    for (const assignment of assignments) {
      await prisma.team.update({
        where: { id: assignment.teamId },
        data: { status: "idle" },
      });
    }

    // 2. Delete Incident (Cascade will delete assignments)
    return prisma.incident.delete({
      where: { id },
    });
  }
}

export const incidentService = new IncidentService();
