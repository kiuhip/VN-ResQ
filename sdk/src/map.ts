import { ResQClient } from "./client";

export class MapSDK {
  private client: ResQClient;

  constructor(client: ResQClient) {
    this.client = client;
  }

  /**
   * Get the tile URL for a specific map tile
   */
  getTileUrl(
    provinceId: string,
    z: number,
    x: number,
    y: number,
    apiKey?: string
  ): string {
    const key = apiKey ?? "public";
    return `https://maps.vn-resq.io/${provinceId}/nightly/${z}/${x}/${y}.png?key=${key}`;
  }

  /**
   * Get the Tile Layer configuration for a province
   */
  async getTileLayerConfig(
    provinceId: string,
    apiKey?: string
  ): Promise<{
    urlTemplate: string;
    attribution: string;
    maxZoom: number;
  }> {
    try {
      const response = await this.client.request<{
        urlTemplate: string;
        attribution: string;
        maxZoom: number;
      }>({
        method: "GET",
        path: `/maps/config/${provinceId}`,
        query: apiKey ? { apiKey } : undefined,
      });
      return response;
    } catch (e) {
      // Fallback to default nightly tiles (CartoDB Dark Matter)
      return {
        urlTemplate:
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20,
      };
    }
  }
}
