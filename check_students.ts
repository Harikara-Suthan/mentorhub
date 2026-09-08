import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.count();
  const studentUsers = await prisma.user.count({ where: { role: 'STUDENT' } });
  
  console.log(`Students: ${students}, Student Users: ${studentUsers}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
