import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AssignmentController {
    async updateStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status, progressIndex, route } = req.body;

            const data: any = {};
            if (status) data.status = status;
            if (progressIndex !== undefined) data.progressIndex = progressIndex;
            if (route) data.route = route;

            const assignment = await prisma.assignment.update({
                where: { id },
                data
            });
            res.json(assignment);
        } catch (error) {
            console.error("Failed to update assignment:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export const assignmentController = new AssignmentController();
