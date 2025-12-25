import { Request, Response } from 'express';
import { teamService } from '../services/team.service';

export class TeamController {
    async getAll(req: Request, res: Response) {
        try {
            const teams = await teamService.getAll();
            res.json(teams);
        } catch (error) {
            console.error("Failed to fetch teams:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async updateLocation(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { latitude, longitude } = req.body;
            const team = await teamService.updateLocation(id, latitude, longitude);
            res.json(team);
        } catch (error) {
            console.error("Failed to update location:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async updateStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const team = await teamService.updateStatus(id, status);
            res.json(team);
        } catch (error) {
            console.error("Failed to update status:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getAssignments(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const assignments = await teamService.getAssignments(id);
            res.json(assignments);
        } catch (error) {
            console.error("Failed to get assignments:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export const teamController = new TeamController();
