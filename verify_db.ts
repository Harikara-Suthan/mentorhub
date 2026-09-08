import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const departments = await prisma.department.findMany({
    include: {
      mentors: { include: { user: true } },
      students: true
    }
  });

  for (const dep of departments) {
    if (!['AI & DS', 'CSE', 'S&H'].includes(dep.name)) continue;
    
    console.log(`\n=== ${dep.name} ===`);
    
    const hods = dep.mentors.filter(m => m.user.role === 'HOD');
    console.log("HODs:", hods.map(h => h.fullName));
    
    const faculty = dep.mentors.filter(m => m.user.role === 'MENTOR');
    console.log("Faculty (MENTOR):", faculty.map(f => f.fullName), `(Total: ${faculty.length})`);
    
    const cohorts = new Set();
    dep.students.forEach(s => {
      cohorts.add(`${s.batch} ${s.year} Year`);
    });
    console.log("Class Cohorts:", Array.from(cohorts).sort(), `(Total: ${cohorts.size})`);
    console.log("Total Students:", dep.students.length);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
