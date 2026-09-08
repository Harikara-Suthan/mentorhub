import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const hods = await prisma.user.findMany({ where: { role: 'HOD', isActive: true }, include: { mentor: true } });
  for (const h of hods) {
    console.log(h.email, h.mentor?.fullName, h.passwordHash);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
