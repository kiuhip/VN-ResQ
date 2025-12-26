import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class DispatchService {
  // Công thức tính khoảng cách giữa 2 điểm tọa độ (Haversine)
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Bán kính trái đất (km)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Khoảng cách (km)
  }

  async dispatchTeamToIncident(
    incidentId: string,
    excludeTeamIds: string[] = [],
    allowMultiple: boolean = false
  ) {
    // 1. Lấy thông tin sự cố
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
    });
    if (!incident) throw new Error("Incident not found");

    // Force Dispatch Logic: Only block if 'resolved'
    // If pending or assigned, we cancel the old one and re-dispatch UNLESS allowMultiple is true (Backup Request)
    if (
      !allowMultiple &&
      incident.status !== "open" &&
      incident.status !== "resolved"
    ) {
      console.log(
        `⚠️ Overriding incident status '${incident.status}'. Cleaning up old assignments...`
      );
      const oldAssign = await prisma.assignment.findFirst({
        where: { incidentId: incident.id, status: { not: "resolved" } },
      });

      if (oldAssign) {
        console.log(`♻️  Releasing team ${oldAssign.teamId}`);
        await prisma.team.update({
          where: { id: oldAssign.teamId },
          data: { status: "idle" },
        });
        await prisma.assignment.update({
          where: { id: oldAssign.id },
          data: { status: "cancelled" },
        });

        // If we just cancelled a team, maybe we should exclude it if it was Pending?
        // But the caller (Reject) will pass excludeTeamIds.
      }
    } else if (incident.status === "resolved") {
      throw new Error("Incident is resolved. Cannot dispatch.");
    }

    // 2. Lấy danh sách đội cứu hộ đang rảnh
    let availableTeams = await prisma.team.findMany({
      where: {
        status: "idle",
        id: { notIn: excludeTeamIds },
      },
    });

    // 3. Tìm đội phù hợp nhất (Capability-Aware)
    let bestTeam = null;
    let bestScore = -Infinity;

    const targetLat = incident.latitude || 21.0285;
    const targetLng = incident.longitude || 105.8542;

    for (const team of availableTeams) {
      const distance = this.calculateDistance(
        targetLat,
        targetLng,
        team.latitude,
        team.longitude
      );
      const distanceFactor = Math.max(0, 20 - distance);

      let capabilityScore = 0;
      const teamCaps = (team.capabilities || "").split(",");

      // Logic tính điểm ưu tiên:
      const isFlood =
        incident.incidentType === "flooding" ||
        incident.description?.toLowerCase().includes("ngập") ||
        incident.description?.toLowerCase().includes("lũ");

      if (isFlood && teamCaps.includes("boat")) capabilityScore += 25;

      // Nếu có người bị thương -> ưu tiên đội có y tế (medical)
      if (
        (incident.description?.toLowerCase().includes("thương") ||
          incident.incidentType === "medical") &&
        teamCaps.includes("medical")
      ) {
        capabilityScore += 15;
      }

      const totalScore = distanceFactor + capabilityScore;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestTeam = team;
      }
    }

    if (!bestTeam) throw new Error("No suitable teams found");

    // 4. Phân công
    const result = await prisma.$transaction(async (tx) => {
      // 5. Fetch Route from OSRM
      let routeData = null;
      let eta = null;
      try {
        const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${bestTeam.longitude},${bestTeam.latitude};${targetLng},${targetLat}?overview=full&geometries=geojson`;
        // Note: Need fetch locally
        const response = await fetch(osrmUrl);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const coordinates = data.routes[0].geometry.coordinates;
          const duration = data.routes[0].duration;

          routeData = JSON.stringify(coordinates);
          eta = Math.round(duration);
        }
      } catch (e: any) {
        console.error("⚠️ OSRM Route Failed:", e.message);
      }

      const assignment = await tx.assignment.create({
        data: {
          incidentId: incident.id,
          teamId: bestTeam.id,
          status: "pending", // Wait for accept
          route: routeData,
          progressIndex: 0,
          etaSeconds: eta,
        } as any,
      });

      await tx.team.update({
        where: { id: bestTeam.id },
        data: { status: "busy" }, // Reserve the team
      });

      await tx.incident.update({
        where: { id: incident.id },
        data: { status: "pending" },
      });

      return {
        assignment,
        team: bestTeam,
        score: bestScore,
        distance: 20 - bestScore,
      }; // approximate distance return
    });

    return result;
  }
}

export const dispatchService = new DispatchService();
