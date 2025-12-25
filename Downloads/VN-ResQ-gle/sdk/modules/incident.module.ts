import axios, { AxiosInstance } from 'axios';

export interface IncidentData {
    text: string;
    source?: string;
    // overrides
    latitude?: number;
    longitude?: number;
}

export class IncidentModule {
    private client: AxiosInstance;
    private baseUrl: string;

    constructor(client: AxiosInstance, baseUrl: string) {
        this.client = client;
        this.baseUrl = baseUrl;
    }

    async report(data: IncidentData): Promise<any> {
        const response = await this.client.post('/incidents', data);
        return response.data;
    }

    async getAll(): Promise<any[]> {
        const response = await this.client.get('/incidents');
        return response.data;
    }

    async getById(id: string): Promise<any> {
        const response = await this.client.get(`/incidents/${id}`);
        return response.data;
    }

    subscribe(callback: (data: any) => void, filter?: { north: number, south: number, east: number, west: number }) {
        const url = new URL(`${this.baseUrl}/incidents/stream`);
        if (filter) {
            url.searchParams.append('north', filter.north.toString());
            url.searchParams.append('south', filter.south.toString());
            url.searchParams.append('east', filter.east.toString());
            url.searchParams.append('west', filter.west.toString());
        }

        // Note: Creating EventSource in nodejs environment might need 'eventsource' package polyfill 
        // but assuming browser or polyfilled env.
        const eventSource = new EventSource(url.toString());

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            callback(data);
        };

        eventSource.onerror = (err) => {
            console.error("SSE Connection failed:", err);
            eventSource.close();
        };

        return () => eventSource.close();
    }
}
