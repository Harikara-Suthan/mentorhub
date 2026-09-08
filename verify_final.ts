import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany({ include: { department: true }});
  const firstYearNonSH = students.filter(s => s.year === '1' && s.department.name !== 'S&H');
  const upperYearSH = students.filter(s => s.year !== '1' && s.department.name === 'S&H');
  
  if (firstYearNonSH.length > 0) {
    console.error("Found 1st year students not in S&H!", firstYearNonSH.length);
  } else {
    console.log("All 1st year students are correctly in S&H.");
  }
  
  if (upperYearSH.length > 0) {
    console.error("Found upper year students in S&H!", upperYearSH.length);
  } else {
    console.log("No upper year students are in S&H.");
  }
  
  const noMentor = students.filter(s => !s.mentorId);
  console.log("Students without mentor:", noMentor.length);

  const mentors = await prisma.mentor.findMany({ include: { students: { include: { department: true } }, department: true }});
  
  let crossAssigned = 0;
  for (const m of mentors) {
    for (const s of m.students) {
      if (s.departmentId !== m.departmentId) crossAssigned++;
    }
  }
  console.log("Cross-department mentor assignments:", crossAssigned);

}
main().catch(console.error).finally(() => prisma.$disconnect());
