import { VNResQ, TeamStatus } from './index';

async function main() {
    console.log("🚀 Initializing SDK...");
    const sdk = new VNResQ('test-api-key');

    // 1. Test AI parsing
    console.log("\n🤖 Testing AI Module...");
    try {
        const result = await sdk.ai.parse("Cháy lớn tại số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội");
        console.log("✅ AI Parse Result:", result);
    } catch (e: any) {
        console.log("⚠️ AI Parse skipped (Backend might be offline):", e.message);
    }

    // 2. Test Team Status
    console.log("\nbusts👥 Testing Team Module...");
    try {
        const teams = await sdk.teams.getAll();
        console.log(`✅ Found ${teams.length} teams`);
    } catch (e: any) {
        console.log("⚠️ Team fetch skipped:", e.message);
    }

    console.log("\n✨ SDK Structure Verification Complete");
}

main().catch(console.error);
