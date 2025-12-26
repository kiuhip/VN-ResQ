import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class VolunteerService {
  async create(data: any) {
    return prisma.volunteer.create({ data });
  }

  async getAll() {
    return prisma.volunteer.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async updateStatus(id: string, status: string, lat?: number, lng?: number) {
    const data: any = { status };
    if (lat && lng) {
      data.latitude = lat;
      data.longitude = lng;
    }
    return prisma.volunteer.update({
      where: { id },
      data,
    });
  }
}

export const volunteerService = new VolunteerService();
