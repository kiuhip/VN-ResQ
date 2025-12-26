import { Request, Response } from "express";
import { resourceService } from "../services/resource.service";

export class ResourceController {
  async create(req: Request, res: Response) {
    try {
      const resource = await resourceService.create(req.body);
      res.status(201).json(resource);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create resource" });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const resources = await resourceService.getAll();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch resources" });
    }
  }

  async updateQuantity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const resource = await resourceService.updateQuantity(id, quantity);
      res.json(resource);
    } catch (error) {
      res.status(500).json({ error: "Failed to update resource" });
    }
  }
}

export const resourceController = new ResourceController();
