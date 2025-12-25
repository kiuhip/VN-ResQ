import { aiService } from '../src/services/ai.service';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log("🚀 V2 Verification Script Starting...");

async function test() {
    console.log("Checking for 'Trần Duy Hưng' logic...");
    const text = "cháy ở số 55 đường Trần duy hưng";
    try {
        const result = await aiService.extractInfoFromText(text);
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
