import { prisma, PlacementStatus, InternshipStatus, Severity, IssueCategory, ActionStatus } from "../src/config/prisma";
import bcrypt from "bcryptjs";

const FIRST_NAMES = ["Arun", "Priya", "Karthik", "Divya", "Ram", "Sneha", "Vijay", "Anitha", "Suresh", "Meena",
  "Ravi", "Kavya", "Naveen", "Pooja", "Ganesh", "Lakshmi", "Sathish", "Deepa", "Manoj", "Swathi",
  "Praveen", "Nisha", "Dinesh", "Aishwarya", "Bala", "Revathi", "Senthil", "Gayathri", "Arjun", "Vidya",
  "Rahul", "Preethi", "Sanjay", "Harini", "Vikram", "Sindhu", "Mahesh", "Ramya", "Ashwin", "Keerthana",
  "Prakash", "Bhavani", "Yogesh", "Anjali", "Kiran", "Sowmya", "Rajesh", "Nithya", "Gopal", "Shalini"];
const LAST = "Kumar";

const ISSUE_TEMPLATES: Array<{ category: IssueCategory; description: string; severity: Severity }> = [
  { category: "ATTENDANCE", description: "Attendance has dropped below 75% this semester.", severity: "HIGH" },
  { category: "ACADEMIC_PERFORMANCE", description: "Struggling with core subject coursework.", severity: "MEDIUM" },
  { category: "ARREAR_SUBJECTS", description: "Two pending arrear subjects from previous semester.", severity: "HIGH" },
  { category: "PLACEMENT_READINESS", description: "Needs aptitude and interview preparation.", severity: "MEDIUM" },
  { category: "INTERNSHIP_STATUS", description: "Has not yet started a required internship.", severity: "LOW" },
  { category: "FINANCIAL_CONCERNS", description: "Family reported difficulty with fee payment.", severity: "MEDIUM" },
  { category: "PERSONAL_WELLBEING", description: "Student reported feeling overwhelmed with workload.", severity: "HIGH" },
  { category: "DISCIPLINE", description: "Late submission pattern noted by faculty.", severity: "LOW" },
];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}
function randomDateWithinLastMonths(months: number) {
  const now = new Date();
  const past = new Date();
  past.setMonth(past.getMonth() - months);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

async function main() {
  console.log("Seeding database...");

  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.intervention.deleteMany();
  await prisma.riskAssessment.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.studentIssue.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.student.deleteMany();
  await prisma.mentor.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  const passwordHash = await bcrypt.hash("Password@123", 10);

  // --- Departments ---
  const cse = await prisma.department.create({ data: { name: "Computer Science & Engineering", code: "CSE" } });
  const aids = await prisma.department.create({ data: { name: "AI & Data Science", code: "AIDS" } });
  const departments = [cse, aids];

  // --- HOD ---
  const hodUser = await prisma.user.create({ data: { email: "hod@university.edu", passwordHash, role: "HOD" } });
  console.log("HOD login: hod@university.edu / Password@123");

  // --- Mentors ---
  const mentorNames = ["Dr. Priya Raman", "Dr. Suresh Babu", "Dr. Kavitha Nair", "Dr. Anand Rao", "Dr. Meera Iyer"];
  const mentors = [];
  for (let i = 0; i < mentorNames.length; i++) {
    const email = `mentor${i + 1}@university.edu`;
    const user = await prisma.user.create({ data: { email, passwordHash, role: "MENTOR" } });
    const mentor = await prisma.mentor.create({
      data: {
        userId: user.id,
        fullName: mentorNames[i],
        employeeId: `EMP10${i + 1}`,
        designation: "Assistant Professor",
        departmentId: departments[i % 2].id,
        phone: `98765${10000 + i}`,
      },
    });
    mentors.push(mentor);
    console.log(`Mentor login: ${email} / Password@123`);
  }

  // --- Students (50) ---
  const students = [];
  for (let i = 0; i < 50; i++) {
    const dept = departments[i % 2];
    const mentor = mentors[i % mentors.length];
    const year = pick(["I", "II", "III", "IV"]);
    const section = pick(["A", "B"]);
    const attendance = randInt(58, 98);
    const cgpa = Number((randInt(50, 95) / 10).toFixed(1));
    const arrears = attendance < 75 ? randInt(1, 4) : randInt(0, 1);

    const admYear = 2021 + (year === "IV" ? 0 : year === "III" ? 1 : year === "II" ? 2 : 3);
    const yy = String(admYear).slice(-2);
    const rollSeq = String((i % 25) + 1).padStart(2, "0");
    const rollNumber = `${yy}${dept.code}${rollSeq}`;
    const regSeq = String(1001 + i).slice(-3);
    const registerNumber = `7240${yy}${dept.code === "CSE" ? "104" : "243"}${regSeq}`;

    const student = await prisma.student.create({
      data: {
        fullName: `${pick(FIRST_NAMES)} ${LAST}`,
        registerNumber,
        rollNumber,
        year,
        section,
        departmentId: dept.id,
        mentorId: mentor.id,
        parentName: `Parent of Student ${i + 1}`,
        parentContact: `9${randInt(100000000, 999999999)}`,
        email: `student${i + 1}@university.edu`,
        phone: `9${randInt(100000000, 999999999)}`,
        dateOfBirth: new Date(2003 + randInt(0, 3), randInt(0, 11), randInt(1, 28)),
        admissionYear: admYear,
        attendancePercentage: attendance,
        cgpa,
        arrearCount: arrears,
        placementStatus: pick<PlacementStatus>(["NOT_ELIGIBLE", "ELIGIBLE", "IN_PROGRESS", "PLACED"]),
        internshipStatus: pick<InternshipStatus>(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]),
        certificationCount: randInt(0, 5),
      },
    });
    students.push(student);
  }

  // Give 5 students a login for the student portal demo
  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: { email: students[i].email!, passwordHash, role: "STUDENT" },
    });
    await prisma.student.update({ where: { id: students[i].id }, data: { userId: user.id } });
    console.log(`Student login: ${students[i].email} / Password@123`);
  }

  // --- Meetings, issues, action items, risk assessments (100+ meetings) ---
  let meetingCount = 0;
  for (const student of students) {
    const numMeetings = randInt(1, 4);
    for (let m = 0; m < numMeetings; m++) {
      const meetingDate = randomDateWithinLastMonths(6);
      const followUp = new Date(meetingDate);
      followUp.setDate(followUp.getDate() + randInt(7, 21));

      const meeting = await prisma.meeting.create({
        data: {
          studentId: student.id,
          mentorId: student.mentorId,
          meetingDate,
          meetingType: pick(["INDIVIDUAL", "GROUP"]),
          discussionSummary: `Discussed academic progress, attendance (${student.attendancePercentage}%), and arrear status (${student.arrearCount}).`,
          studentConcerns: student.attendancePercentage < 75 ? "Attendance has been difficult to maintain due to coursework load." : "No major concerns raised.",
          mentorSuggestions: student.attendancePercentage < 75 ? "Recommended remedial classes and weekly attendance monitoring." : "Continue current progress; keep up placement preparation.",
          nextFollowUpDate: followUp,
          aiSummary: `Student is ${student.attendancePercentage < 75 ? "experiencing attendance and academic challenges" : "progressing steadily"}. ${student.arrearCount > 0 ? `${student.arrearCount} arrear subject(s) pending.` : "No arrears."}`,
          aiKeyConcerns: student.attendancePercentage < 75 ? ["Attendance below 85%", "Academic difficulty"] : ["General progress review"],
          aiImportantPoints: ["Attendance status reviewed", "Arrear status reviewed", "Placement/internship status reviewed"],
          aiRecommendedActions: student.attendancePercentage < 75
            ? ["Enroll in remedial sessions", "Monitor attendance weekly", "Schedule follow-up in 14 days"]
            : ["Continue placement preparation", "Schedule routine follow-up"],
          aiStatus: "COMPLETED",
        },
      });
      meetingCount++;

      // Issues (weighted by student risk profile)
      const numIssues = student.attendancePercentage < 70 ? randInt(1, 3) : randInt(0, 1);
      for (let k = 0; k < numIssues; k++) {
        const template = pick(ISSUE_TEMPLATES);
        await prisma.studentIssue.create({
          data: {
            studentId: student.id,
            meetingId: meeting.id,
            mentorId: student.mentorId,
            category: template.category,
            description: template.description,
            severity: template.severity,
            status: pick(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
            isRestricted: template.category === "PERSONAL_WELLBEING",
          },
        });
      }

      // Action items
      const numActions = randInt(1, 2);
      for (let a = 0; a < numActions; a++) {
        const target = new Date(meetingDate);
        target.setDate(target.getDate() + randInt(5, 30));
        const isPast = target < new Date();
        const status: ActionStatus = isPast ? pick(["COMPLETED", "OVERDUE"]) : pick(["PENDING", "IN_PROGRESS"]);
        await prisma.actionItem.create({
          data: {
            studentId: student.id,
            meetingId: meeting.id,
            mentorId: student.mentorId,
            actionType: pick(["STUDENT_ACTION", "MENTOR_ACTION"]),
            description: pick([
              "Attend remedial mathematics classes",
              "Complete aptitude training module",
              "Submit pending assignment",
              "Meet placement cell for resume review",
              "Clear arrear subject registration",
              "Weekly attendance check-in with mentor",
            ]),
            assignedTo: student.fullName,
            targetCompletionDate: target,
            status,
            completedDate: status === "COMPLETED" ? target : null,
          },
        });
      }
    }

    // Risk assessment snapshot per student
    const attendancePts = student.attendancePercentage < 65 ? 25 : student.attendancePercentage < 75 ? 20 : student.attendancePercentage < 85 ? 15 : 0;
    const arrearPts = Math.min(student.arrearCount * 10, 25);
    const score = Math.min(100, attendancePts + arrearPts + randInt(0, 20));
    const level = score >= 70 ? "CRITICAL" : score >= 50 ? "HIGH" : score >= 25 ? "MEDIUM" : "LOW";
    await prisma.riskAssessment.create({
      data: {
        studentId: student.id,
        riskScore: score,
        riskLevel: level,
        breakdown: [
          { label: "Attendance", detail: `${student.attendancePercentage}%`, points: attendancePts },
          { label: "Arrears", detail: `${student.arrearCount} arrear(s)`, points: arrearPts },
        ] as any,
        generatedBy: "AI",
      },
    });
  }

  console.log(`Created ${students.length} students and ${meetingCount} meetings.`);

  // --- Notifications ---
  for (const mentor of mentors) {
    await prisma.notification.create({
      data: {
        userId: mentor.userId,
        type: "MONTHLY_REMINDER",
        title: "Monthly mentoring records due",
        message: "Please complete the mentoring records for this month.",
      },
    });
  }
  await prisma.notification.create({
    data: {
      userId: hodUser.id,
      type: "GENERAL",
      title: "Welcome to Mentor Assistant AI",
      message: "Department analytics and mentor activity reports are ready to review.",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
