export interface Alert {
    id: number;
    type: string;
    location: string;
    status: string;
    description: string;
    lat: number;
    lng: number;
    timestamp: string;
}

const API_URL = 'http://localhost:8000/api';

export async function fetchAlerts(): Promise<Alert[]> {
    try {
        const res = await fetch(`${API_URL}/alerts`);
        if (!res.ok) {
            throw new Error('Failed to fetch alerts');
        }
        return res.json();
    } catch (error) {
        console.error("Error fetching alerts:", error);
        return [];
    }
}
