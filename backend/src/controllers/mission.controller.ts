import { Request, Response } from "express";
import { missionService } from "../services/mission.service";

export class MissionController {
  async assign(req: Request, res: Response) {
    try {
      const result = await missionService.assign(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await missionService.getById(id);
      if (!result) return res.status(404).json({ error: "Mission not found" });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listOffers(req: Request, res: Response) {
    try {
      const { teamId } = req.query;
      if (!teamId) return res.json([]);
      const pending = await missionService.listPending(String(teamId));
      res.json(pending);
    } catch (e) {
      res.json([]);
    }
  }

  async getActive(req: Request, res: Response) {
    try {
      const { teamId } = req.query;
      if (!teamId) return res.status(400).json({ error: "Missing teamId" });
      const active = await missionService.getActiveMission(String(teamId));
      res.json(active);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch active mission" });
    }
  }

  async accept(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Accept -> 'assigned' (Official Start)
      const result = await missionService.updateStatus(id, "assigned");
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async reject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      // Use logic that handles re-dispatch
      const result = await missionService.rejectAssignment(id, reason);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, note, location } = req.body;
      const result = await missionService.updateStatus(
        id,
        status,
        note,
        location?.lat,
        location?.lng
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async report(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await missionService.report(id, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async requestBackup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await missionService.requestBackup(id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const missionController = new MissionController();
