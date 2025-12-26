import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ResourceService {
  async create(data: any) {
    return prisma.resource.create({ data });
  }

  async getAll() {
    return prisma.resource.findMany({
      orderBy: { updatedAt: "desc" },
    });
  }

  async updateQuantity(id: string, quantity: number) {
    return prisma.resource.update({
      where: { id },
      data: { quantity },
    });
  }
}

export const resourceService = new ResourceService();
