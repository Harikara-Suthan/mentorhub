import { prisma } from "./server/src/config/prisma";

async function checkUserExists(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    console.log(`User ${email} exists:`, !!user);
    process.exit(0);
  } catch (error) {
    console.error("Error checking user:", error);
    process.exit(1);
  }
}

checkUserExists("sabarivasan051@gmail.com");
