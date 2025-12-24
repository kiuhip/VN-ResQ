import axios from 'axios';

export interface GeoPoint {
    lat: number;
    lon: number;
    display_name?: string;
}

export class GeocodingService {
    private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

    async getCoordinates(address: string): Promise<GeoPoint | null> {
        if (!address || address.toLowerCase() === 'unknown') return null;

        try {
            console.log(`🌍 Geocoding: "${address}"`);
            
            // Append Hanoi/Vietnam if not present to increase accuracy for this project
            const query = address.toLowerCase().includes('vietnam') ? address : `${address}, Hanoi, Vietnam`;

            const response = await axios.get(this.NOMINATIM_URL, {
                params: {
                    q: query,
                    format: 'json',
                    limit: 1,
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': 'VN-ResQ-Disaster-Management/1.0'
                }
            });

            if (response.data && response.data.length > 0) {
                const result = response.data[0];
                console.log(`✅ Found: ${result.display_name}`);
                return {
                    lat: parseFloat(result.lat),
                    lon: parseFloat(result.lon),
                    display_name: result.display_name
                };
            }

            console.log(`❌ No coordinates found for: "${address}"`);
            return null;

        } catch (error) {
            console.error("❌ Geocoding API Error:", error);
            return null;
        }
    }
}

export const geocodingService = new GeocodingService();
