import axios from 'axios';

export interface GeoPoint {
    lat: number;
    lon: number;
    display_name?: string;
}

export class GeocodingService {
    private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

    async getCoordinates(address: string): Promise<GeoPoint | null> {
        if (!address || address.trim() === '' || address.toLowerCase() === 'unknown' || address.includes("Unknown")) {
            console.log("⚠️ Geocoding Skipped: Address is Unknown/Empty");
            return null;
        }

        try {
            console.log(`🌍 Geocoding Search: "${address}"`);

            // Cleaning address: Remove "Detected Location" prefix if present
            let cleanAddress = address.replace(/^Detected Location\s*/i, '').trim();

            // Append Hanoi/Vietnam if not present to increase accuracy for this project
            if (!cleanAddress.toLowerCase().includes('vietnam')) {
                cleanAddress += ', Vietnam';
            }

            const response = await axios.get(this.NOMINATIM_URL, {
                params: {
                    q: cleanAddress,
                    format: 'json',
                    limit: 1,
                    addressdetails: 1,
                    countrycodes: 'vn' // Limit search to Vietnam
                },
                headers: {
                    'User-Agent': 'VN-ResQ-Disaster-Management/1.0'
                }
            });

            if (response.data && response.data.length > 0) {
                const result = response.data[0];
                console.log(`✅ Found Coordinates: ${result.lat}, ${result.lon} (${result.display_name})`);
                return {
                    lat: parseFloat(result.lat),
                    lon: parseFloat(result.lon),
                    display_name: result.display_name
                };
            }

            console.log(`❌ No coordinates found for: "${cleanAddress}"`);
            return null;

        } catch (error) {
            console.error("❌ Geocoding API Error:", error);
            return null;
        }
    }
}

export const geocodingService = new GeocodingService();
