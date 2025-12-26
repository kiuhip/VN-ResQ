import { Request, Response } from "express";
import { volunteerService } from "../services/volunteer.service";

export class VolunteerController {
  async create(req: Request, res: Response) {
    try {
      const volunteer = await volunteerService.create(req.body);
      res.status(201).json(volunteer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create volunteer" });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const volunteers = await volunteerService.getAll();
      res.json(volunteers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch volunteers" });
    }
  }
}

export const volunteerController = new VolunteerController();
