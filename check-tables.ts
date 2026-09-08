import { prisma } from "./server/src/config/prisma";

async function checkTables() {
  try {
    console.log("Checking for 'User' table...");
    // PostgreSQL specific query to check table existence
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'User'
      );
    `;
    console.log("Table 'User' exists:", result);
    process.exit(0);
  } catch (error) {
    console.error("Table check failed:", error);
    process.exit(1);
  }
}

checkTables();
