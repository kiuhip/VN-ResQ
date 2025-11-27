export interface Alert {
    id: number;
    type: string;
    location: string;
    status: string;
    description: string;
    lat: number;
    lng: number;
    timestamp: string;
    priority?: string;
    incident_type?: string;
    victim_count?: number;
    is_verified?: boolean;
}

export interface Resource {
    id: number;
    name: string;
    type: string;
    location: string;
    lat: number;
    lng: number;
    status: string;
    contact?: string;
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

export async function fetchResources(): Promise<Resource[]> {
    try {
        const res = await fetch(`${API_URL}/resources`);
        if (!res.ok) {
            throw new Error('Failed to fetch resources');
        }
        return res.json();
    } catch (error) {
        console.error("Error fetching resources:", error);
        return [];
    }
}
