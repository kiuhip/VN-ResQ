import { VNResQSDK } from './index';

async function testSDK() {
  const sdk = new VNResQSDK('http://localhost:3000/api');

  console.log("🚀 Testing VN-ResQ SDK...");

  try {
    // 1. Test Report
    console.log("\n1. Reporting an incident via SDK...");
    const newIncident = await sdk.reportIncident({
      text: "Tai nạn xe máy tại cổng Parabol Đại học Bách Khoa Hà Nội",
      source: "partner_app_001"
    });
    console.log("✅ Success! Incident ID:", newIncident.id);
    console.log("📍 Location Extracted:", newIncident.locationText);

    // 2. Test Fetch All
    console.log("\n2. Fetching all incidents via SDK...");
    const incidents = await sdk.getAllIncidents();
    console.log(`✅ Success! Found ${incidents.length} incidents.`);

  } catch (error) {
    console.error("❌ SDK Test Failed:", error);
  }
}

testSDK();
