import axios, { AxiosInstance } from 'axios';

export class AIModule {
    private client: AxiosInstance;

    constructor(client: AxiosInstance) {
        this.client = client;
    }

    /**
     * Parse natural language text into structured incident data.
     */
    async parse(text: string): Promise<any> {
        try {
            const response = await this.client.post('/ai/parse', { text });
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to parse text: ${error.message}`);
        }
    }
}
