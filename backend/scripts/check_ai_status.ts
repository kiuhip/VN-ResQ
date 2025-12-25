import { aiService } from '../src/services/ai.service';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkAI() {
    console.log("🔍 Checking AI vs Regex...");
    const text = "cháy lớn ở đại học bách khoa";
    console.log(`📝 Input: "${text}"`);

    try {
        const result = await aiService.extractInfoFromText(text);
        console.log("\n📦 Full Result:");
        console.log(JSON.stringify(result, null, 2));

        // Logic check: AI outputs full JSON, Regex fallback typically has specific markers or limited fields
        // In the code: aiService adds console.log("🤖 Gemini Processing:") and "📦 AI Response:"
        // Regex fallback adds "⚠️ Using Regex Fallback. Extracted:"

        console.log("\n💡 Analysis:");
        if (result.incident_type === "General Report") {
            console.log("➡️ Result matches Regex Fallback signature ('General Report').");
        } else {
            console.log("➡️ Result matches AI Extraction signature (Specific Incident Type).");
        }
    } catch (error: any) {
        console.error("❌ Test failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Message:", error.message || error);
        }
    }
}

checkAI();
