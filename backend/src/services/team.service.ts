import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TeamService {
    async getAll() {
        const count = await prisma.team.count();
        if (count === 0) {
            console.log("No teams found in DB. Seeding mock teams...");
            await prisma.team.createMany({
                data: [
                    { name: 'Đội Phản Ứng Nhanh (Hoàn Kiếm)', type: 'state', status: 'idle', latitude: 21.0285, longitude: 105.8542, capabilities: 'medical,rescue' } as any,
                    { name: 'Đội Xuồng Máy Cứu Hộ (Sông Hồng)', type: 'state', status: 'idle', latitude: 21.0400, longitude: 105.8600, capabilities: 'boat,rescue,heavy_lifting' } as any,
                    { name: 'Đội Tình Nguyện Tiếp Tế (Đống Đa)', type: 'private', status: 'idle', latitude: 21.0080, longitude: 105.8200, capabilities: 'food,medical' } as any,
                    { name: 'Đội Cứu Hộ Đặc Nhiệm (Cầu Giấy)', type: 'state', status: 'idle', latitude: 21.0362, longitude: 105.7906, capabilities: 'boat,medical,rescue' } as any
                ]
            });
        }
        const teams = await prisma.team.findMany();
        return teams.map(t => ({
            ...t,
            capabilities: typeof t.capabilities === 'string' 
                ? (t.capabilities as string).split(',').map(s => s.trim())
                : t.capabilities || []
        }));
    }
}

export const teamService = new TeamService();
