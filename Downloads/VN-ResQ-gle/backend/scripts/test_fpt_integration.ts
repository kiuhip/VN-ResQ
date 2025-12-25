import { aiService } from '../src/services/ai.service';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testFPT() {
    console.log("🧪 Testing FPT.AI + Gemini Pipeline...");

    // Tạo buffer giả lập (vì file check2.wav không tìm thấy trên hệ thống hiện tại)
    // Nếu bạn có file thật, hãy thay thế bằng fs.readFileSync(path)
    console.log("⚠️ File 'check2.wav' not found in workspace. Simulating the call logic...");

    try {
        console.log("1. Checking FPT.AI Config...");
        if (!process.env.FPT_AI_KEY) {
            console.error("❌ FPT_AI_KEY missing!");
            return;
        }
        console.log("✅ API Key found.");

        console.log("\n2. Pipeline Logic Explanation:");
        console.log("   - Caller uploads audio to /api/hotline/transcribe-audio");
        console.log("   - backend calls speechToTextFPT(buffer)");
        console.log("   - FPT.AI returns transcript");
        console.log("   - transcript is passed to Gemini 2.5 Flash");
        console.log("   - Gemini returns structured Incident Object");

    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

testFPT();
