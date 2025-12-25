import axios, { AxiosInstance } from 'axios';

export enum TeamStatus {
    IDLE = 'idle',
    BUSY = 'busy',
    OFFLINE = 'offline'
}

export class TeamModule {
    private client: AxiosInstance;

    constructor(client: AxiosInstance) {
        this.client = client;
    }

    async getAll(): Promise<any[]> {
        const response = await this.client.get('/teams');
        return response.data;
    }

    async updateLocation(teamId: string, latitude: number, longitude: number): Promise<any> {
        const response = await this.client.post(`/teams/${teamId}/location`, { latitude, longitude });
        return response.data;
    }

    async updateStatus(teamId: string, status: TeamStatus): Promise<any> {
        const response = await this.client.post(`/teams/${teamId}/status`, { status });
        return response.data;
    }

    async getAssignments(teamId: string): Promise<any[]> {
        const response = await this.client.get(`/teams/${teamId}/assignments`);
        return response.data;
    }
}
