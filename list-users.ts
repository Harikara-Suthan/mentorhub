import { prisma } from "./server/src/config/prisma";

async function listUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  });
  console.log("Existing Users:", users);
  process.exit(0);
}

listUsers();
