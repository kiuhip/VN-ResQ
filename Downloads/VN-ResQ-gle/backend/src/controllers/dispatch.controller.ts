import { Request, Response } from 'express';
import { dispatchService } from '../services/dispatch.service';

export class DispatchController {

    async dispatch(req: Request, res: Response) {
        try {
            const { incidentId } = req.body;

            if (!incidentId) {
                return res.status(400).json({ error: 'Missing incidentId' });
            }

            const result = await dispatchService.dispatchTeamToIncident(incidentId);

            res.json({
                message: 'Dispatch successful',
                assignment: result.assignment,
                team: result.team,
                distance_km: result.distance.toFixed(2)
            });

        } catch (error: any) {
            console.error("Dispatch Error:", error.message);
            res.status(400).json({ error: error.message || 'Failed to dispatch' });
        }
    }
}

export const dispatchController = new DispatchController();
