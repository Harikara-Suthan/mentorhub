import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const departments = await prisma.department.findMany();
  const depMap = new Map(departments.map(d => [d.id, d.name]));
  const depCodeMap = new Map(departments.map(d => [d.name, d.id]));

  // 1. Verify HODs
  const hods = await prisma.user.findMany({
    where: { role: 'HOD', isActive: true },
    include: { mentor: true }
  });
  console.log("=== HODs ===");
  for (const h of hods) {
    console.log(`HOD: ${h.mentor?.fullName} -> ${h.mentor?.departmentId ? depMap.get(h.mentor.departmentId) : 'None'}`);
  }

  // 2. Verify Faculty
  const faculty = await prisma.user.findMany({
    where: { role: 'MENTOR', isActive: true },
    include: { mentor: true }
  });
  console.log("\n=== Faculty ===");
  const facByDep: Record<string, any[]> = {};
  for (const f of faculty) {
    const depName = f.mentor?.departmentId ? depMap.get(f.mentor.departmentId) : 'Unknown';
    if (!facByDep[depName]) facByDep[depName] = [];
    facByDep[depName].push(f.mentor?.fullName);
  }
  for (const [dep, names] of Object.entries(facByDep)) {
    console.log(`${dep}: ${names.length} faculty -> ${names.join(', ')}`);
  }

  // 3. Verify Class Structure & Students
  const students = await prisma.student.findMany({
    include: { mentor: { include: { department: true } } }
  });
  console.log("\n=== Students & Cohorts ===");
  const cohorts = new Set<string>();
  let firstYearInSH = 0;
  let firstYearNotInSH = 0;
  let upperYearInSH = 0;
  let upperYearInRightDep = 0;
  
  let crossAssigned = 0;

  const cohortsMap: Record<string, number> = {};

  for (const s of students) {
    const depName = depMap.get(s.departmentId);
    const cohortStr = `${depName} | ${s.batch} | Year ${s.year}`;
    cohorts.add(cohortStr);
    cohortsMap[cohortStr] = (cohortsMap[cohortStr] || 0) + 1;

    if (s.year === '1') {
      if (depName === 'S&H') firstYearInSH++;
      else firstYearNotInSH++;
    } else {
      if (depName === 'S&H') upperYearInSH++;
      else upperYearInRightDep++;
    }

    if (s.mentor && s.mentor.departmentId !== s.departmentId) {
      crossAssigned++;
    }
  }

  console.log(`Total Students: ${students.length}`);
  console.log(`1st Year in S&H: ${firstYearInSH}`);
  console.log(`1st Year NOT in S&H (ERROR): ${firstYearNotInSH}`);
  console.log(`Upper Year in S&H (ERROR): ${upperYearInSH}`);
  console.log(`Upper Year in actual department: ${upperYearInRightDep}`);
  
  console.log(`\nCohorts Found (${cohorts.size}):`);
  for (const [c, count] of Object.entries(cohortsMap)) {
    console.log(`- ${c} : ${count} students`);
  }

  console.log(`\nCross-assigned mentors (Mentor Dep != Student Dep): ${crossAssigned}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
