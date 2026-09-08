import { prisma } from "./server/src/config/prisma";

async function checkColumns() {
  try {
    console.log("Checking columns in 'User' table...");
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User';
    `;
    console.log("Columns:", result);
    process.exit(0);
  } catch (error) {
    console.error("Column check failed:", error);
    process.exit(1);
  }
}

checkColumns();
