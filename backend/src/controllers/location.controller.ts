import { Request, Response } from "express";

const MOCK_LOCATIONS = [
  {
    id: "1",
    text: "Safe Zone A - Hanoi Highschool",
    latitude: 21.0285,
    longitude: 105.8542,
    urgency: "low",
    incidentType: "flood",
  },
  {
    id: "2",
    text: "Medical Hub Alpha",
    latitude: 21.0333,
    longitude: 105.8333,
    urgency: "high",
    incidentType: "medical",
  },
  {
    id: "3",
    text: "Food Distribution Center",
    latitude: 21.0111,
    longitude: 105.8111,
    urgency: "medium",
    incidentType: "food",
  },
];

export const locationController = {
  getAll: (req: Request, res: Response) => {
    res.json(MOCK_LOCATIONS);
  },
  getById: (req: Request, res: Response) => {
    const loc = MOCK_LOCATIONS.find((l) => l.id === req.params.id);
    if (!loc) return res.status(404).json({ message: "Location not found" });
    res.json(loc);
  },
  create: (req: Request, res: Response) => {
    const newLoc = { id: Math.random().toString(36).substr(2, 9), ...req.body };
    res.status(201).json(newLoc);
  },
};
