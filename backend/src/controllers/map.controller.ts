import { Request, Response } from "express";

export const mapController = {
  getConfig: (req: Request, res: Response) => {
    // Mock response with a working Dark Mode Tile Layer (CartoDB Dark Matter)
    res.json({
      urlTemplate:
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20,
    });
  },
};
