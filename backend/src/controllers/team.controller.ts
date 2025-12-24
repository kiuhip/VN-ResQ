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
}

export const teamController = new TeamController();
