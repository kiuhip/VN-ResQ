import { aiService } from '../src/services/ai.service';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testAI() {
    console.log("🧪 Testing Gemini AI Extraction Specific Case...");
    
    // Test Case: User reported issue
    const text = "cháy ở số 55 đường Trần duy hưng";
    console.log(`\n📝 Input: "${text}"`);
    
    try {
        const result = await aiService.extractInfoFromText(text);
        console.log("✅ AI Extraction Result:");
        console.log(JSON.stringify(result, null, 2));

        if (result.location_text.toLowerCase().includes("trần duy hưng")) {
             console.log("🎯 Street Name Validation: PASSED");
        } else {
             console.log("❌ Street Name Validation: FAILED (Expected 'Trần Duy Hưng' in location_text)");
        }

    } catch (error) {
        console.error("❌ AI Test Failed:", error);
    }
}

testAI();
