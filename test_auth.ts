import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { isActive: true }, include: { mentor: true, student: true } });
  
  let hodCount = 0;
  let mentorCount = 0;
  let studentCount = 0;
  let adminCount = 0;
  
  const needReset = [];

  for (const u of users) {
    if (u.role === 'HOD') hodCount++;
    else if (u.role === 'MENTOR') mentorCount++;
    else if (u.role === 'STUDENT') studentCount++;
    else if (u.role === 'ADMIN') adminCount++;

    const isDefault = await bcrypt.compare('password123', u.passwordHash).catch(() => false);
    if (isDefault) {
      needReset.push({ id: u.id, email: u.email, role: u.role, name: u.mentor?.fullName || u.student?.fullName || 'Admin' });
    }
  }

  console.log(`\nActive Roles: ADMIN: ${adminCount}, HOD: ${hodCount}, MENTOR: ${mentorCount}, STUDENT: ${studentCount}`);
  console.log(`\nAccounts requiring password reset/setup (${needReset.length}):`);
  
  const grouped = needReset.reduce((acc, curr) => {
    if (!acc[curr.role]) acc[curr.role] = [];
    acc[curr.role].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  for (const [role, list] of Object.entries(grouped)) {
    console.log(`- ${role}: ${list.length} accounts`);
    if (role === 'HOD' || role === 'ADMIN') {
      for (const item of list) console.log(`    ${item.name} (${item.email})`);
    }
  }

}
main().catch(console.error).finally(() => prisma.$disconnect());
