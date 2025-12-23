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

        // 🚨 AUTO-SEED: Nếu chưa có đội nào (lần đầu chạy), tự tạo 3 đội mẫu
        if (availableTeams.length === 0) {
            console.log("No teams found. Seeding mock teams...");
            await prisma.team.createMany({
                data: [
                    { name: 'Đội Cứu Hộ Alpha (Hoàn Kiếm)', type: 'state', status: 'idle', latitude: 21.0285, longitude: 105.8542 },
                    { name: 'Đội Cứu Hộ Bravo (Đống Đa)', type: 'state', status: 'idle', latitude: 21.0080, longitude: 105.8200 },
                    { name: 'Đội Tình Nguyện Charlie (Hai Bà Trưng)', type: 'private', status: 'idle', latitude: 21.0050, longitude: 105.8500 }
                ]
            });
            // Query lại sau khi tạo
            availableTeams = await prisma.team.findMany({ where: { status: 'idle' } });
        }

        // 3. Tìm đội gần nhất
        let nearestTeam = null;
        let minDistance = Infinity;

        // Nếu incident chưa có tọa độ, chọn đội đầu tiên (hoặc random)
        const targetLat = incident.latitude || 21.0285; // Mặc định về Hoàn Kiếm nếu null
        const targetLng = incident.longitude || 105.8542;

        for (const team of availableTeams) {
            const distance = this.calculateDistance(targetLat, targetLng, team.latitude, team.longitude);
            if (distance < minDistance) {
                minDistance = distance;
                nearestTeam = team;
            }
        }

        if (!nearestTeam) throw new Error("No available teams found");

        // 4. Phân công (Transaction để đảm bảo tính nhất quán)
        const result = await prisma.$transaction(async (tx) => {
            // Tạo Assignment
            const assignment = await tx.assignment.create({
                data: {
                    incidentId: incident.id,
                    teamId: nearestTeam.id,
                    status: 'assigned'
                }
            });

            // Update Team status -> busy
            await tx.team.update({
                where: { id: nearestTeam.id },
                data: { status: 'busy' }
            });

            // Update Incident status -> assigned
            await tx.incident.update({
                where: { id: incident.id },
                data: { status: 'assigned' }
            });

            return { assignment, team: nearestTeam, distance: minDistance };
        });

        return result;
    }
}

export const dispatchService = new DispatchService();
