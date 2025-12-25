import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DispatchService {

    // Công thức tính khoảng cách giữa 2 điểm tọa độ (Haversine)
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Bán kính trái đất (km)
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Khoảng cách (km)
    }

    async dispatchTeamToIncident(incidentId: string) {
        // 1. Lấy thông tin sự cố
        const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
        if (!incident) throw new Error("Incident not found");

        if (incident.status !== 'open') throw new Error("Incident already assigned or resolved");

        // 2. Lấy danh sách đội cứu hộ đang rảnh
        let availableTeams = await prisma.team.findMany({
            where: { status: 'idle' }
        });



        // 3. Tìm đội phù hợp nhất (Capability-Aware)
        let bestTeam = null;
        let bestScore = -Infinity;
        let bestDistance = 0;

        const targetLat = incident.latitude || 21.0285;
        const targetLng = incident.longitude || 105.8542;

        for (const team of availableTeams) {
            const distance = this.calculateDistance(targetLat, targetLng, team.latitude, team.longitude);
            const distanceFactor = Math.max(0, 20 - distance); // Updated: Wider radius (20km score range)

            let capabilityScore = 0;
            const teamCaps = ((team as any).capabilities || "").split(',');
            let logReasons = [];

            // Logic tính điểm ưu tiên:
            // Nếu là ngập lụt -> ưu tiên đội có xuồng (boat)
            const isFlood = incident.incidentType === 'flooding' ||
                incident.description?.toLowerCase().includes('ngập') ||
                incident.description?.toLowerCase().includes('lũ') ||
                incident.description?.toLowerCase().includes('xuồng') ||
                incident.description?.toLowerCase().includes('thuyền');

            if (isFlood) {
                if (teamCaps.includes('boat')) {
                    capabilityScore += 25; // Tăng trọng số ưu tiên
                    logReasons.push("Has Boat (+25)");
                }
            }

            // Nếu có người bị thương -> ưu tiên đội có y tế (medical)
            if (incident.description?.toLowerCase().includes('thương') ||
                incident.description?.toLowerCase().includes('nạn') ||
                incident.description?.toLowerCase().includes('máu')) {
                if (teamCaps.includes('medical')) {
                    capabilityScore += 15;
                    logReasons.push("Has Medical (+15)");
                }
            }

            const totalScore = distanceFactor + capabilityScore;
            console.log(`Team ${team.name}: Dist=${(distance ?? 0).toFixed(1)}km (Score ${(distanceFactor ?? 0).toFixed(1)}) | Caps=${capabilityScore} [${logReasons.join(', ')}] | Total=${(totalScore ?? 0).toFixed(1)}`);

            if (totalScore > bestScore) {
                bestScore = totalScore;
                bestTeam = team;
                bestDistance = distance;
            }
        }

        if (!bestTeam) throw new Error("No suitable teams found");

        // 4. Phân công
        const result = await prisma.$transaction(async (tx) => {
            // 5. Fetch Route from OSRM
            // 5. Fetch Route from OSRM
            let routeData = null;
            let eta = null;
            try {
                const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${bestTeam.longitude},${bestTeam.latitude};${targetLng},${targetLat}?overview=full&geometries=geojson`;
                console.log("🗺️ Fetching Route:", osrmUrl);
                // Note: Need axios locally or fetch
                const axios = require('axios');
                const routeRes = await axios.get(osrmUrl);

                if (routeRes.data.routes && routeRes.data.routes.length > 0) {
                    const coordinates = routeRes.data.routes[0].geometry.coordinates; // [[lng, lat], ...]
                    const duration = routeRes.data.routes[0].duration; // seconds

                    // OSRM returns [lng, lat], we need to store it. 
                    routeData = JSON.stringify(coordinates);
                    eta = Math.round(duration);

                    console.log(`✅ Route found: ${coordinates.length} pts, ETA: ${Math.round(duration / 60)}m`);
                }
            } catch (e: any) {
                console.error("⚠️ OSRM Route Failed (Falling back to straight line):", e.message);
            }

            const assignment = await tx.assignment.create({
                data: {
                    incidentId: incident.id,
                    teamId: bestTeam.id,
                    status: 'assigned',
                    route: routeData,
                    progressIndex: 0,
                    etaSeconds: eta
                } as any
            });

            await tx.team.update({
                where: { id: bestTeam.id },
                data: { status: 'busy' }
            });

            await tx.incident.update({
                where: { id: incident.id },
                data: { status: 'assigned' }
            });

            return { assignment, team: bestTeam, score: bestScore, distance: bestDistance };
        });

        return result;
    }
}

export const dispatchService = new DispatchService();
