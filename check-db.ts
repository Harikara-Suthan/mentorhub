import { prisma } from "./server/src/config/prisma";

async function checkDb() {
  try {
    console.log("Checking DB connection...");
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log("DB Connection successful:", result);
    process.exit(0);
  } catch (error) {
    console.error("DB Connection failed:", error);
    process.exit(1);
  }
}

checkDb();
