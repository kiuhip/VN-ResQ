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

        const tryGeocode = async (query: string): Promise<GeoPoint | null> => {
            try {
                const response = await axios.get(this.NOMINATIM_URL, {
                    params: {
                        q: query,
                        format: 'json',
                        limit: 1,
                        addressdetails: 1,
                        countrycodes: 'vn'
                    },
                    headers: { 'User-Agent': 'VN-ResQ-Disaster-Management/1.0' },
                    timeout: 5000
                });

                if (response.data && response.data.length > 0) {
                    const result = response.data[0];
                    return {
                        lat: parseFloat(result.lat),
                        lon: parseFloat(result.lon),
                        display_name: result.display_name
                    };
                }
            } catch (error) {
                // Ignore transient errors in retrieval loop
            }
            return null;
        };

        // 1. Clean up "Detected Location" and common prefixes
        let cleanAddress = address
            .replace(/^Detected Location\s*/i, '')
            .replace(/^(tại|ở|địa chỉ|khu vực|vị trí)\s+/i, '') // Remove location prepositions
            .trim();

        // 2. Strategy List to try in order
        const strategies = [];

        // Strategy A: Input + "Hanoi" (Most specific for this project)
        // Strip "số", "nhà số" for search engine friendliness
        const streetOnly = cleanAddress.replace(/^(số|nhà số)\s*/i, '').trim();
        strategies.push(`${streetOnly}, Hanoi`);

        // Strategy B: Original Clean Input + "Hanoi" (If user typed "So 20..." explicitly)
        if (streetOnly !== cleanAddress) {
            strategies.push(`${cleanAddress}, Hanoi`);
        }

        // Strategy C: Street Only + "Vietnam" (Fallback)
        strategies.push(`${streetOnly}, Vietnam`);

        console.log(`🌍 Geocoding Strategies for "${address}":`, strategies);

        for (const query of strategies) {
            const result = await tryGeocode(query);
            if (result) {
                console.log(`✅ Found Coordinates via "${query}": ${result.lat}, ${result.lon}`);
                return result;
            }
        }

        console.log(`❌ No coordinates found for: "${address}" after ${strategies.length} attempts.`);
        return null;
    }
}

export const geocodingService = new GeocodingService();
