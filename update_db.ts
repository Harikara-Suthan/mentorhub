import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const deps = await prisma.department.findMany();
  console.log("DEPARTMENTS:", deps);
  const mentors = await prisma.mentor.findMany({ include: { user: true, department: true } });
  console.log("MENTORS:", mentors.map(m => ({ id: m.id, name: m.fullName, dep: m.department?.name, role: m.user?.role })));
  const users = await prisma.user.findMany({ where: { role: 'HOD' }, include: { mentor: true }});
  console.log("HOD USERS:", users.map(u => ({ id: u.id, email: u.email, name: u.mentor?.fullName })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
