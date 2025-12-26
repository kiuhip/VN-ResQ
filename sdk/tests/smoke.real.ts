import { ResQClient } from "../src/client";
import { IncidentsSDK } from "../src/incidents";
import { MissionsSDK, MissionStatus } from "../src/missions";

// Using http://localhost:3000/api as default for local dev
const BASE_URL = process.env.BASE_URL || "http://localhost:3000/api";
// Default test key if not provided
const API_KEY = process.env.API_KEY || "smoke-test-key";

async function runSmokeTest() {
  console.log(`🚀 Starting SDK Smoke Test (Real Backend)`);
  console.log(`📍 Base URL: ${BASE_URL}\n`);

  const client = new ResQClient({ baseUrl: BASE_URL, apiKey: API_KEY });
  const incidents = new IncidentsSDK(client);
  const missions = new MissionsSDK(client);

  try {
    // 1. Create Incident
    console.log("1️⃣ Creating Incident...");
    const incidentData = {
      text: "Smoke Test Flood Report at " + new Date().toISOString(),
      source: "smoke-test",
    };
    const incident = await incidents.create(incidentData);
    console.log(`   ✅ Created Incident: ${incident.id}`);
    console.log(`      Location: ${incident.locationText}`);

    // 2. List Incidents
    console.log("\n2️⃣ Listing Incidents...");
    const list = await incidents.list({ status: "open" });
    console.log(`   ✅ Found ${list.length} open incidents`);

    // 3. Assign Mission (Auto)
    console.log("\n3️⃣ Assigning Mission (Auto)...");
    try {
      const mission = await missions.assign({
        incidentId: incident.id,
        auto: true,
      });
      console.log(`   ✅ Assigned Mission: ${mission.id}`);
      console.log(`      Team ID: ${mission.teamId}`);

      // 4. Update Mission Status
      console.log("\n4️⃣ Update Mission Status...");
      const updatedMission = await missions.updateStatus(mission.id, {
        status: MissionStatus.EN_ROUTE,
        location: { lat: 21.0, lng: 105.0 },
        note: "Smoke test en route",
      });
      console.log(`   ✅ Mission Status: ${updatedMission.status}`);
    } catch (e: any) {
      console.warn(
        `   ⚠️ Mission Assignment failed (maybe no idle teams?): ${e.message}`
      );
    }
  } catch (error: any) {
    console.error("\n❌ Smoke Test Failed:", error.message);
    if (error.details) {
      console.error("   Details:", JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

runSmokeTest();
