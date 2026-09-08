import { prisma } from "./server/src/config/prisma";

async function checkOtherTables() {
  try {
    console.log("Checking for 'Mentor' and 'Student' tables...");
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('Mentor', 'Student');
    `;
    console.log("Tables found:", result);
    process.exit(0);
  } catch (error) {
    console.error("Table check failed:", error);
    process.exit(1);
  }
}

checkOtherTables();
