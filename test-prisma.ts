// test-prisma.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
console.log("DATABASE_URL:", process.env.DATABASE_URL);
prisma.user
  .findMany()
  .then(console.log)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
