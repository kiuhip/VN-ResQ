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

        // 🚨 AUTO-SEED: Cập nhật seeding với năng lực (capabilities)
        if (availableTeams.length === 0) {
            console.log("No teams found. Seeding mock teams with capabilities...");
            await prisma.team.createMany({
                data: [
                    { name: 'Đội Phản Ứng Nhanh (Hoàn Kiếm)', type: 'state', status: 'idle', latitude: 21.0285, longitude: 105.8542, capabilities: 'medical,rescue' } as any,
                    { name: 'Đội Xuồng Máy Cứu Hộ (Sông Hồng)', type: 'state', status: 'idle', latitude: 21.0400, longitude: 105.8600, capabilities: 'boat,rescue,heavy_lifting' } as any,
                    { name: 'Đội Tình Nguyện Tiếp Tế (Đống Đa)', type: 'private', status: 'idle', latitude: 21.0080, longitude: 105.8200, capabilities: 'food,medical' } as any,
                    { name: 'Đội Cứu Hộ Đặc Nhiệm (Cầu Giấy)', type: 'state', status: 'idle', latitude: 21.0362, longitude: 105.7906, capabilities: 'boat,medical,rescue' } as any
                ]
            });
            availableTeams = await prisma.team.findMany({ where: { status: 'idle' } });
        }

        // 3. Tìm đội phù hợp nhất (Capability-Aware)
        let bestTeam = null;
        let bestScore = -Infinity;

        const targetLat = incident.latitude || 21.0285;
        const targetLng = incident.longitude || 105.8542;

        for (const team of availableTeams) {
            const distance = this.calculateDistance(targetLat, targetLng, team.latitude, team.longitude);
            const distanceFactor = Math.max(0, 10 - distance); // Điểm cao nếu gần (trong bán kính 10km)
            
            let capabilityScore = 0;
            const teamCaps = ((team as any).capabilities || "").split(',');

            // Logic tính điểm ưu tiên:
            // Nếu là ngập lụt -> ưu tiên đội có xuồng (boat)
            const isFlood = incident.incidentType === 'flooding' || 
                           incident.description?.toLowerCase().includes('ngập') ||
                           incident.description?.toLowerCase().includes('lũ') ||
                           incident.description?.toLowerCase().includes('xuồng') ||
                           incident.description?.toLowerCase().includes('thuyền');

            if (isFlood) {
                if (teamCaps.includes('boat')) capabilityScore += 25; // Tăng trọng số ưu tiên
            }

            // Nếu có người bị thương -> ưu tiên đội có y tế (medical)
            if (incident.description?.toLowerCase().includes('thương') || 
                incident.description?.toLowerCase().includes('nạn') ||
                incident.description?.toLowerCase().includes('máu')) {
                if (teamCaps.includes('medical')) capabilityScore += 15;
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
            const assignment = await tx.assignment.create({
                data: {
                    incidentId: incident.id,
                    teamId: bestTeam.id,
                    status: 'assigned'
                }
            });

            await tx.team.update({
                where: { id: bestTeam.id },
                data: { status: 'busy' }
            });

            await tx.incident.update({
                where: { id: incident.id },
                data: { status: 'assigned' }
            });

            return { assignment, team: bestTeam, score: bestScore };
        });

        return result;
    }
}

export const dispatchService = new DispatchService();
