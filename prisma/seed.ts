// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.weightMeasurement.deleteMany(); // Clear existing data
  await prisma.weightMeasurement.createMany({
    data: [{ weightKg: 70.5 }, { weightKg: 71.2 }, { weightKg: 70.8 }],
  });
  console.log("Database seeded with weight measurements");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
