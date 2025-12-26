import { PrismaClient } from "@prisma/client";
import { dispatchService } from "../src/services/dispatch.service";
import { missionService } from "../src/services/mission.service";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Mission Flow Test...");

  // 1. Cleanup
  console.log("🧹 Cleaning up DB...");
  await prisma.missionOffer.deleteMany({});
  await prisma.mission.deleteMany({});
  await prisma.incident.deleteMany({});
  await prisma.team.deleteMany({});

  // 2. Setup Data
  console.log("🌱 Seeding teams & incident...");
  const incident = await prisma.incident.create({
    data: {
      id: "test-incident-1",
      locationText: "Test Location",
      latitude: 21.0,
      longitude: 105.8,
      source: "test",
      incidentType: "fire",
      urgency: "high",
    },
  });

  const teams = [];
  for (let i = 1; i <= 3; i++) {
    teams.push(
      await prisma.team.create({
        data: {
          id: `team-${i}`,
          name: `Team ${i}`,
          type: "state",
          status: "AVAILABLE",
          latitude: 21.0 + i * 0.01,
          longitude: 105.8,
          capabilities: "fire",
        },
      })
    );
  }

  // 3. Auto Dispatch
  console.log("🤖 Running Auto Dispatch...");
  const dispatchResult = await dispatchService.dispatchAuto(incident.id);

  if (dispatchResult.mission.status !== "OFFERED")
    throw new Error("Mission should be OFFERED");
  if (dispatchResult.offers.length !== 3)
    throw new Error(`Expected 3 offers, got ${dispatchResult.offers.length}`);
  console.log("✅ Dispatch created Offers:", dispatchResult.offers.length);

  // 4. Team 1 Accepts
  console.log("⚡ Team 1 accepting...");
  const result1 = await missionService.acceptOffer(
    dispatchResult.mission.id,
    teams[0].id
  );
  if (result1?.assignedTeamId !== teams[0].id)
    throw new Error("Assignment failed");
  console.log("✅ Team 1 Accepted Successfully");

  // 5. Team 2 Tries to Accept (Should Fail)
  console.log("⚡ Team 2 trying to accept (Should Fail)...");
  try {
    await missionService.acceptOffer(dispatchResult.mission.id, teams[1].id);
    throw new Error("Team 2 should have failed!");
  } catch (e: any) {
    if (e.message.includes("Conflict")) {
      console.log("✅ Team 2 Rejected as expected (Conflict)");
    } else {
      throw e;
    }
  }

  // 6. Check Final State
  const finalMission = await prisma.mission.findUnique({
    where: { id: dispatchResult.mission.id },
  });
  const offers = await prisma.missionOffer.findMany({
    where: { missionId: finalMission?.id },
  });

  const acceptedOffer = offers.find((o) => o.teamId === teams[0].id);
  const otherOffer = offers.find((o) => o.teamId === teams[1].id);

  if (acceptedOffer?.status !== "ACCEPTED")
    console.error("❌ Team 1 Offer status wrong");
  if (otherOffer?.status !== "EXPIRED")
    console.error("❌ Team 2 Offer status wrong (should be EXPIRED)");

  if (
    finalMission?.status === "ACCEPTED" &&
    acceptedOffer?.status === "ACCEPTED" &&
    otherOffer?.status === "EXPIRED"
  ) {
    console.log("🎉 ALL TESTS PASSED");
  } else {
    console.log("⚠️ State Check Failed", {
      mission: finalMission?.status,
      offers: offers.map((o) => `${o.teamId}:${o.status}`),
    });
  }
}

main()
  .catch((e) => {
    console.error("❌ Test Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
