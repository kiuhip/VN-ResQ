import { Response } from 'express';

interface Client {
    id: string;
    res: Response;
    area?: {
        north: number;
        south: number;
        east: number;
        west: number;
    };
}

export class StreamService {
    private clients: Client[] = [];

    /**
     * Đăng ký một client mới theo mô hình SSE
     */
    addClient(res: Response, area?: any) {
        const id = Date.now().toString();
        const newClient: Client = { id, res, area };
        this.clients.push(newClient);

        // Headers cho SSE
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });

        // Gửi tin nhắn chào mừng
        this.sendToClient(newClient, { type: 'connected', clientId: id });

        return id;
    }

    removeClient(id: string) {
        this.clients = this.clients.filter(c => c.id !== id);
    }

    /**
     * Gửi tin nhắn đến các client dựa trên bộ lọc vị trí (Geo-fencing)
     */
    broadcastIncident(incident: any) {
        this.clients.forEach(client => {
            if (this.isWithinBounds(incident, client.area)) {
                this.sendToClient(client, { type: 'new_incident', data: incident });
            }
        });
    }

    private sendToClient(client: Client, data: any) {
        client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    private isWithinBounds(incident: any, area: any) {
        if (!area) return true; // Không có filter thì gửi hết
        const { lat, lng } = incident;
        if (!lat || !lng) return true;

        return (
            lat <= area.north &&
            lat >= area.south &&
            lng >= area.west &&
            lng <= area.east
        );
    }
}

export const streamService = new StreamService();
