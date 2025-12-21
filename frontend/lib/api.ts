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
        const res = await fetch(`${API_URL}/incidents/`);
        if (!res.ok) {
            throw new Error('Failed to fetch alerts');
        }
        const data = await res.json();
        // Map Incident to Alert
        return data.map((item: any) => ({
            id: item.id,
            type: item.incident_type || 'Unknown',
            location: item.location_desc || '',
            status: item.status,
            description: item.description || '',
            lat: item.lat,
            lng: item.lng,
            timestamp: item.created_at,
            priority: item.priority,
            victim_count: item.num_people
        }));
    } catch (error) {
        console.error("Error fetching alerts:", error);
        return [];
    }
}

export async function fetchResources(): Promise<Resource[]> {
    try {
        const res = await fetch(`${API_URL}/teams/`);
        if (!res.ok) {
            throw new Error('Failed to fetch resources');
        }
        const data = await res.json();
        // Map RescueTeam to Resource
        return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            type: 'Team', // Default type
            location: `${item.current_lat}, ${item.current_lng}`,
            lat: item.current_lat,
            lng: item.current_lng,
            status: item.status,
            contact: item.phone
        }));
    } catch (error) {
        console.error("Error fetching resources:", error);
        return [];
    }
}
