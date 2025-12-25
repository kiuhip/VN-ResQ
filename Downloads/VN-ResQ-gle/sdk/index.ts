import axios, { AxiosInstance } from 'axios';
import { IncidentModule } from './modules/incident.module';
import { TeamModule } from './modules/team.module';
import { AIModule } from './modules/ai.module';

export class VNResQ {
  private client: AxiosInstance;

  public incident: IncidentModule;
  public teams: TeamModule;
  public ai: AIModule;

  constructor(apiKey: string, options?: { baseUrl?: string }) {
    const baseUrl = options?.baseUrl || 'http://localhost:3000/api';

    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    this.incident = new IncidentModule(this.client, baseUrl);
    this.teams = new TeamModule(this.client);
    this.ai = new AIModule(this.client);
  }
}

// Export types for consumers
export * from './modules/incident.module';
export * from './modules/team.module';
export * from './modules/ai.module';
