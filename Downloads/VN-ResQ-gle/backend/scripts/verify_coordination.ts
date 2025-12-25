import { incidentService } from '../src/services/incident.service';
import { dispatchService } from '../src/services/dispatch.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCoordination() {
    console.log("🌊 Testing Resource-Aware Coordination...");

    // 1. Clear existing teams to force re-seeding with new capabilities
    await prisma.assignment.deleteMany();
    await prisma.team.deleteMany();
    console.log("Cleanup: Teams and Assignments cleared.");

    // 2. Report a FLOODING incident
    console.log("\nStep 1: Reporting a flood incident...");
    const floodIncident = await incidentService.createFromText('test', "Có người bị kẹt trong nhà do nước lũ dâng cao tại khu vực Chương Dương Độ, Hoàn Kiếm. Cần xuồng cứu hộ khẩn cấp!");
    console.log("✅ Incident Created:", floodIncident.id, "-", floodIncident.locationText);
    console.log("Type:", floodIncident.incidentType);

    // 3. Dispatch
    console.log("\nStep 2: Dispatching the best team...");
    const result = await dispatchService.dispatchTeamToIncident(floodIncident.id);
    
    console.log("✅ Assignment Result:");
    console.log("- Assigned Team:", result.team.name);
    console.log("- Team Capabilities:", (result.team as any).capabilities);
    console.log("- Match Score:", (result as any).score);

    if ((result.team as any).capabilities.includes('boat')) {
        console.log("\n🚀 SUCCESS: The system correctly prioritized the BOAT team for a flooding incident!");
    } else {
        console.log("\n⚠️ WARNING: The system might not have prioritized the boat team correctly.");
    }
}

verifyCoordination()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
