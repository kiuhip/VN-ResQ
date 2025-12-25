import axios from 'axios';

async function testGeocoding() {
    const address = "55 Trần Duy Hưng, Hà Nội";
    console.log(`🌍 Testing Geocoding for: "${address}"`);

    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
        
        // Nominatim requires a User-Agent
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'VN-ResQ-System/1.0' }
        });

        if (res.data && res.data.length > 0) {
            console.log("✅ Success! Found:", res.data[0].display_name);
            console.log(`📍 Lat: ${res.data[0].lat}, Lon: ${res.data[0].lon}`);
        } else {
            console.log("❌ Not found via Nominatim.");
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

testGeocoding();
