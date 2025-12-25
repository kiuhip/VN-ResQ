
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🧹 Cleaning up duplicate teams...");
    const { count } = await prisma.team.deleteMany({});
    console.log(`✅ Deleted ${count} teams.`);
    console.log("👉 Please restart the backend to re-seed exactly 4 fresh teams.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
