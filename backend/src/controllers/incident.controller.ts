import { Request, Response } from 'express';
import { incidentService } from '../services/incident.service';

export class IncidentController {

    async create(req: Request, res: Response) {
        try {
            const { text, source } = req.body;
            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }
            const incident = await incidentService.createFromText(source || 'form', text);
            res.status(201).json(incident);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const incidents = await incidentService.getAll();
            res.json(incidents);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export const incidentController = new IncidentController();
