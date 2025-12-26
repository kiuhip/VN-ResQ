import { ResQClient } from "./client";
import { TeamSchema, Team } from "./types";

export class TeamsSDK {
  private client: ResQClient;

  constructor(client: ResQClient) {
    this.client = client;
  }

  /**
   * List all rescue teams
   */
  async list(): Promise<Team[]> {
    const data = await this.client.request<unknown>({
      method: "GET",
      path: "/teams",
    });
    return (Array.isArray(data) ? data : []).map((item) =>
      TeamSchema.parse(item)
    );
  }

  /**
   * Get detail for a specific team
   */
  async get(id: string): Promise<Team> {
    const data = await this.client.request<unknown>({
      method: "GET",
      path: `/teams/${id}`,
    });
    return TeamSchema.parse(data);
  }

  /**
   * Get current location of a team
   */
  async getLocation(
    id: string
  ): Promise<{ latitude: number; longitude: number } | null> {
    const team = await this.get(id);
    if (team.latitude != null && team.longitude != null) {
      return { latitude: team.latitude, longitude: team.longitude };
    }
    return null;
  }
}
