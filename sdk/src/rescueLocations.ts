import { ResQClient } from "./client";
import {
  RescueLocationSchema,
  RescueLocationCreateInputSchema,
  RescueLocation,
  RescueLocationCreateInput,
} from "./types";

export class RescueLocationsSDK {
  private client: ResQClient;

  constructor(client: ResQClient) {
    this.client = client;
  }

  /**
   * List all rescue locations (safe zones, medical hubs, etc.)
   */
  async list(): Promise<RescueLocation[]> {
    const data = await this.client.request<unknown>({
      method: "GET",
      path: "/locations",
    });
    return (Array.isArray(data) ? data : []).map((item) =>
      RescueLocationSchema.parse(item)
    );
  }

  /**
   * Get specific rescue location detail
   */
  async get(id: string): Promise<RescueLocation> {
    const data = await this.client.request<unknown>({
      method: "GET",
      path: `/locations/${id}`,
    });
    return RescueLocationSchema.parse(data);
  }

  /**
   * Register a new rescue location
   */
  async create(input: RescueLocationCreateInput): Promise<RescueLocation> {
    const validData = RescueLocationCreateInputSchema.parse(input);
    const data = await this.client.request<unknown>({
      method: "POST",
      path: "/locations",
      body: validData,
    });
    return RescueLocationSchema.parse(data);
  }
}
