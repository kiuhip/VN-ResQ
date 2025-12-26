import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding teams...');

  // Clear existing teams first to reset demo state
  await prisma.assignment.deleteMany({}); // Delete assignments first due to FK
  await prisma.team.deleteMany({});
  console.log('🗑️  Cleared existing teams and assignments.');

  const teams = [
    {
      id: 'team_alpha', // Simple ID
      name: 'Alpha Team (Cầu Giấy)',
      type: 'state',
      status: 'idle',
      capabilities: 'rescue,medical,boat',
      currentZone: 'Cau Giay',
      latitude: 21.0362,
      longitude: 105.7906,
    },
    {
      id: 'team_bravo',
      name: 'Bravo Team (Ba Đình)',
      type: 'private',
      status: 'idle',
      capabilities: 'food,logistics',
      currentZone: 'Ba Dinh',
      latitude: 21.0341,
      longitude: 105.8202,
    },
    {
      id: 'team_charlie',
      name: 'Charlie Team (Đống Đa)',
      type: 'state',
      status: 'idle',
      capabilities: 'medical',
      currentZone: 'Dong Da',
      latitude: 21.0152,
      longitude: 105.8291,
    },
    {
        id: 'team_delta',
        name: 'Delta Team (Bách Khoa)',
        type: 'state',
        status: 'idle',
        capabilities: 'fire,rescue',
        currentZone: 'Hai Ba Trung',
        latitude: 21.0041,
        longitude: 105.8438,
      }
  ];

  for (const team of teams) {
    const t = await prisma.team.create({
      data: team
    });
    console.log(`✅ Created team: ${t.name} (ID: ${t.id})`);
  }

  console.log(`✅ Successfully seeded ${teams.length} teams.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
