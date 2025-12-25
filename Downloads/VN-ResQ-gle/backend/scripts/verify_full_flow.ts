import { incidentService } from '../src/services/incident.service';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function verifyFullFlow() {
    console.log("🚀 Testing Full Flow: AI Extraction + Dynamic Geocoding");
    
    // Using the user's failing case but with a more natural reporting sentence
    const text = "Tôi thấy có khói bốc lên tại số 55 đường Trần Duy Hưng, khả năng là cháy nhà.";
    console.log(`\n💬 Message: "${text}"`);
    
    try {
        const incident = await incidentService.createFromText('test-flow', text);
        
        console.log("\n✅ FLOW RESULT:");
        console.log(`- Extracted Location: ${incident.locationText}`);
        console.log(`- Final Coordinates: ${incident.latitude}, ${incident.longitude}`);
        console.log(`- Incident Type: ${incident.incidentType}`);
        
        if (incident.latitude && incident.longitude) {
            console.log("\n🎯 GEOCONDING SUCCESS: The pin will show correctly on the Map!");
        } else {
            console.log("\n❌ GEOCONDING FAILED.");
        }

    } catch (error) {
        console.error("❌ Flow Test Failed:", error);
    }
}

verifyFullFlow();
