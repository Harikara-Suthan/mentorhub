import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { JwtPayload } from "../utils/jwt";
import { generateNextRollNumber } from "../utils/rollNumber";

export interface StudentListFilters {
  search?: string;
  departmentId?: string;
  year?: string;
  section?: string;
  mentorId?: string;
  riskLevel?: string;
  semester?: string;
  attendance?: string;
  arrears?: string;
  academicStatus?: string;
  feeStatus?: string;
}

/** Helper to format and role-sanitize fee information from real database records. */
export function formatFeeDetails(student: any, role: string) {
  const feeRecords = student.fees || [];

  if (feeRecords.length === 0) {
    return {
      hasFeeData: false,
      feeStatus: "UNAVAILABLE",
      feeStatusLabel: "Fee information unavailable",
      totalFees: null,
      amountPaid: null,
      outstandingAmount: null,
      academicYear: null,
      semester: null,
      lastPaymentDate: null,
      paymentReference: null,
      feeCategory: null,
      remarks: null,
      fees: [],
    };
  }

  let totalFees = 0;
  let amountPaid = 0;
  for (const f of feeRecords) {
    totalFees += typeof f.totalFees === "number" ? f.totalFees : 0;
    amountPaid += typeof f.amountPaid === "number" ? f.amountPaid : 0;
  }
  const outstandingAmount = Math.max(0, totalFees - amountPaid);

  const latestFee = feeRecords[0];

  let overallStatus = latestFee.status;
  if (totalFees > 0) {
    if (amountPaid >= totalFees) {
      overallStatus = "PAID";
    } else if (amountPaid > 0) {
      overallStatus = "PARTIALLY_PAID";
    } else if (latestFee.dueDate && new Date(latestFee.dueDate) < new Date()) {
      overallStatus = "OVERDUE";
    } else {
      overallStatus = "PENDING";
    }
  }

  const statusLabelMap: Record<string, string> = {
    PAID: "Paid",
    PARTIALLY_PAID: "Partially Paid",
    PENDING: "Pending",
    OVERDUE: "Overdue",
    UNAVAILABLE: "Fee information unavailable",
  };

  // Mentors only see the minimal necessary fee status without raw financial transaction logs
  if (role === "MENTOR") {
    return {
      hasFeeData: true,
      feeStatus: overallStatus,
      feeStatusLabel: statusLabelMap[overallStatus] || overallStatus,
      totalFees: null,
      amountPaid: null,
      outstandingAmount: null,
      academicYear: latestFee.academicYear || null,
      semester: latestFee.semester || null,
      lastPaymentDate: null,
      paymentReference: null,
      feeCategory: latestFee.feeCategory || null,
      remarks: null,
      fees: [],
    };
  }

  // Student (own), HOD (department), Admin (institution-wide)
  const mappedFees = feeRecords.map((f: any) => ({
    id: f.id,
    feeCategory: f.feeCategory || "Tuition & Academic Fees",
    academicYear: f.academicYear || null,
    semester: f.semester || null,
    totalFees: f.totalFees,
    amountPaid: f.amountPaid,
    outstandingAmount: Math.max(0, (f.totalFees || 0) - (f.amountPaid || 0)),
    status: f.status,
    statusLabel: statusLabelMap[f.status] || f.status,
    dueDate: f.dueDate ? f.dueDate.toISOString() : null,
    lastPaymentDate: f.lastPaymentDate ? f.lastPaymentDate.toISOString() : null,
    paymentReference: f.paymentReference || null,
    remarks: f.remarks || null,
    createdAt: f.createdAt ? f.createdAt.toISOString() : null,
  }));

  return {
    hasFeeData: true,
    feeStatus: overallStatus,
    feeStatusLabel: statusLabelMap[overallStatus] || overallStatus,
    totalFees,
    amountPaid,
    outstandingAmount,
    academicYear: latestFee.academicYear || null,
    semester: latestFee.semester || null,
    lastPaymentDate: latestFee.lastPaymentDate ? latestFee.lastPaymentDate.toISOString() : null,
    paymentReference: latestFee.paymentReference || null,
    feeCategory: latestFee.feeCategory || null,
    remarks: latestFee.remarks || null,
    fees: mappedFees,
  };
}

/** Scopes the base student query according to the caller's role. */
async function scopedWhere(user: JwtPayload, filters: StudentListFilters) {
  const where: Record<string, any> = {};

  if (user.role === "MENTOR") {
    const mentor = await prisma.mentor.findUnique({ where: { userId: user.userId } });
    if (!mentor) throw ApiError.forbidden("No mentor profile found");
    where.mentorId = mentor.id;
  } else if (user.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) throw ApiError.forbidden("No student profile found");
    where.id = student.id;
  } else if (user.role === "HOD") {
    const mentor = await prisma.mentor.findUnique({ where: { userId: user.userId } });
    if (!mentor) throw ApiError.forbidden("No HOD mentor profile found");
    where.departmentId = mentor.departmentId;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const deptId = filters.departmentId && filters.departmentId.toUpperCase() !== "ALL" && uuidRegex.test(filters.departmentId) ? filters.departmentId : undefined;
  const mentId = filters.mentorId && filters.mentorId.toUpperCase() !== "ALL" && uuidRegex.test(filters.mentorId) ? filters.mentorId : undefined;
  const yr = filters.year && filters.year.toUpperCase() !== "ALL" ? filters.year : undefined;
  const sec = filters.section && filters.section.toUpperCase() !== "ALL" ? filters.section : undefined;

  if (filters.search) {
    const sVal = filters.search.trim();
    const isNum = !isNaN(Number(sVal));
    const numVal = isNum ? Number(sVal) : null;

    where.OR = [
      { fullName: { contains: sVal, mode: "insensitive" } },
      { registerNumber: { contains: sVal, mode: "insensitive" } },
      { rollNumber: { contains: sVal, mode: "insensitive" } },
      { admissionNumber: { contains: sVal, mode: "insensitive" } },
      { email: { contains: sVal, mode: "insensitive" } },
      { phone: { contains: sVal, mode: "insensitive" } },
      { batch: { contains: sVal, mode: "insensitive" } },
      { year: { contains: sVal, mode: "insensitive" } },
      { section: { contains: sVal, mode: "insensitive" } },
      { degree: { contains: sVal, mode: "insensitive" } },
      { department: { name: { contains: sVal, mode: "insensitive" } } },
      { department: { code: { contains: sVal, mode: "insensitive" } } },
      { mentor: { fullName: { contains: sVal, mode: "insensitive" } } },
      ...(numVal !== null ? [
        { semester: numVal },
        { arrearCount: numVal },
      ] : [])
    ];
  }

  if (deptId) {
    if (user.role === "HOD") {
      // HOD cannot search outside their authorized department
      where.departmentId = where.departmentId ?? deptId;
    } else {
      where.departmentId = deptId;
    }
  }

  if (yr) where.year = yr;
  if (sec) where.section = sec;
  if (mentId && user.role !== "MENTOR") where.mentorId = mentId;

  if (filters.semester && filters.semester.toUpperCase() !== "ALL") {
    const sem = Number(filters.semester);
    if (!isNaN(sem)) {
      where.semester = sem;
    }
  }

  if (filters.attendance === "low") {
    where.attendancePercentage = { lt: 85 };
  }

  if (filters.arrears === "has") {
    where.arrearCount = { gt: 0 };
  }

  if (filters.academicStatus && filters.academicStatus.toUpperCase() !== "ALL") {
    where.academicStatus = { contains: filters.academicStatus, mode: "insensitive" };
  }

  if (filters.riskLevel) {
    const norm = filters.riskLevel.toUpperCase();
    if (["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(norm)) {
      where.riskAssessments = {
        some: {
          riskLevel: norm as any
        }
      };
    }
  }

  if (filters.feeStatus && filters.feeStatus.toUpperCase() !== "ALL") {
    const fs = filters.feeStatus.toUpperCase();
    if (fs === "UNAVAILABLE" || fs === "NOT_AVAILABLE") {
      where.fees = { none: {} };
    } else if (["PAID", "PARTIALLY_PAID", "PENDING", "OVERDUE"].includes(fs)) {
      where.fees = { some: { status: fs as any } };
    }
  }

  return where;
}

export async function listStudents(user: JwtPayload, filters: StudentListFilters, page = 1, pageSize = 20) {
  const where = await scopedWhere(user, filters);

  const [items, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        department: true,
        mentor: { select: { id: true, fullName: true } },
        riskAssessments: { orderBy: { createdAt: "desc" }, take: 1 },
        fees: { select: { id: true, status: true, totalFees: true, amountPaid: true, dueDate: true }, orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { fullName: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.student.count({ where }),
  ]);

  const mapped = items.map((s) => {
    const latestFee = s.fees?.[0];
    let feeStatus = "UNAVAILABLE";
    if (latestFee) {
      feeStatus = latestFee.status;
    }
    return {
      ...s,
      feeStatus,
      latestRisk: s.riskAssessments[0] ?? null,
      riskAssessments: undefined,
      fees: undefined,
    };
  });

  return { items: mapped, total, page, pageSize };
}

export async function getStudentByUserId(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      department: true,
      mentor: { select: { id: true, fullName: true, employeeId: true, phone: true, designation: true, user: { select: { email: true } } } },
      riskAssessments: { orderBy: { createdAt: "desc" }, take: 5 },
      meetings: { orderBy: { meetingDate: "desc" }, take: 10 },
      issues: { orderBy: { createdAt: "desc" }, take: 10 },
      actionItems: { orderBy: { targetCompletionDate: "asc" }, take: 15 },
      fees: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!student) throw ApiError.notFound("Student record not found for this user account");

  const maskedAccountNumber = student.accountNumber
    ? `XXXX XXXX ${String(student.accountNumber).slice(-4)}`
    : null;

  const { accountNumber, ...safeStudent } = student;
  const feeDetails = formatFeeDetails(student, "STUDENT");

  return {
    ...safeStudent,
    maskedAccountNumber,
    feeDetails,
  };
}

export async function getStudentById(user: JwtPayload, studentId: string) {
  const where = await scopedWhere(user, {});
  const student = await prisma.student.findFirst({
    where: { ...where, id: studentId },
    include: {
      department: true,
      mentor: { select: { id: true, fullName: true, employeeId: true, phone: true, designation: true } },
      riskAssessments: { orderBy: { createdAt: "desc" }, take: 5 },
      meetings: { orderBy: { meetingDate: "desc" }, take: 10 },
      issues: { orderBy: { createdAt: "desc" }, take: 10 },
      actionItems: { orderBy: { targetCompletionDate: "asc" }, take: 15 },
      fees: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!student) throw ApiError.notFound("Student not found or not accessible");

  // Always mask sensitive financial account number by default
  const maskedAccountNumber = student.accountNumber
    ? `XXXX XXXX ${String(student.accountNumber).slice(-4)}`
    : "XXXX XXXX 0000";

  const { accountNumber, ...safeStudent } = student;
  const feeDetails = formatFeeDetails(student, user.role);

  return {
    ...safeStudent,
    maskedAccountNumber,
    feeDetails,
  };
}

export async function getStudentFees(user: JwtPayload, studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      fees: { orderBy: { createdAt: "desc" } },
      department: true,
    },
  });
  if (!student) throw ApiError.notFound("Student not found");

  if (user.role === "STUDENT") {
    if (student.userId !== user.userId) {
      throw ApiError.forbidden("Access denied: You can only view your own fee details");
    }
  } else if (user.role === "MENTOR") {
    const mentor = await prisma.mentor.findUnique({ where: { userId: user.userId } });
    if (!mentor || student.mentorId !== mentor.id) {
      throw ApiError.forbidden("Access denied: You can only view fee status for your assigned mentees");
    }
  } else if (user.role === "HOD") {
    const hod = await prisma.mentor.findUnique({ where: { userId: user.userId } });
    if (!hod || hod.departmentId !== student.departmentId) {
      throw ApiError.forbidden("Access denied: You can only view fee details of students in your department");
    }
  }

  return formatFeeDetails(student, user.role);
}

export async function addStudentFee(user: JwtPayload, studentId: string, data: Record<string, any>) {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw ApiError.notFound("Student not found");

  if (user.role === "STUDENT" || user.role === "MENTOR") {
    throw ApiError.forbidden("You do not have permission to record or manage student fees");
  } else if (user.role === "HOD") {
    const hod = await prisma.mentor.findUnique({ where: { userId: user.userId } });
    if (!hod || hod.departmentId !== student.departmentId) {
      throw ApiError.forbidden("Access denied: You can only record fees for students in your department");
    }
  }

  const total = Number(data.totalFees) || 0;
  const paid = Number(data.amountPaid) || 0;
  let status = data.status;
  if (!status) {
    if (paid >= total && total > 0) status = "PAID";
    else if (paid > 0) status = "PARTIALLY_PAID";
    else status = "PENDING";
  }

  return prisma.studentFee.create({
    data: {
      studentId,
      academicYear: data.academicYear || student.academicYear || "2025-2026",
      semester: data.semester ? Number(data.semester) : student.semester,
      feeCategory: data.feeCategory || "Tuition & Academic Fees",
      totalFees: total,
      amountPaid: paid,
      status: status as any,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      lastPaymentDate: data.lastPaymentDate ? new Date(data.lastPaymentDate) : (paid > 0 ? new Date() : undefined),
      paymentReference: data.paymentReference || undefined,
      remarks: data.remarks || undefined,
    },
  });
}

export async function updateStudentFee(user: JwtPayload, studentId: string, feeId: string, data: Record<string, any>) {
  const fee = await prisma.studentFee.findUnique({ where: { id: feeId }, include: { student: true } });
  if (!fee || fee.studentId !== studentId) throw ApiError.notFound("Fee record not found");

  if (user.role === "STUDENT" || user.role === "MENTOR") {
    throw ApiError.forbidden("You do not have permission to edit student fees");
  } else if (user.role === "HOD") {
    const hod = await prisma.mentor.findUnique({ where: { userId: user.userId } });
    if (!hod || hod.departmentId !== fee.student.departmentId) {
      throw ApiError.forbidden("Access denied: You can only edit fees for students in your department");
    }
  }

  const payload: Record<string, any> = {};
  if (data.totalFees !== undefined) payload.totalFees = Number(data.totalFees);
  if (data.amountPaid !== undefined) payload.amountPaid = Number(data.amountPaid);
  if (data.status !== undefined) payload.status = data.status;
  if (data.academicYear !== undefined) payload.academicYear = data.academicYear;
  if (data.semester !== undefined) payload.semester = Number(data.semester);
  if (data.feeCategory !== undefined) payload.feeCategory = data.feeCategory;
  if (data.dueDate !== undefined) payload.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.lastPaymentDate !== undefined) payload.lastPaymentDate = data.lastPaymentDate ? new Date(data.lastPaymentDate) : null;
  if (data.paymentReference !== undefined) payload.paymentReference = data.paymentReference;
  if (data.remarks !== undefined) payload.remarks = data.remarks;

  return prisma.studentFee.update({
    where: { id: feeId },
    data: payload,
  });
}

export async function deleteStudentFee(user: JwtPayload, studentId: string, feeId: string) {
  const fee = await prisma.studentFee.findUnique({ where: { id: feeId }, include: { student: true } });
  if (!fee || fee.studentId !== studentId) throw ApiError.notFound("Fee record not found");

  if (user.role === "STUDENT" || user.role === "MENTOR") {
    throw ApiError.forbidden("You do not have permission to delete student fees");
  } else if (user.role === "HOD") {
    const hod = await prisma.mentor.findUnique({ where: { userId: user.userId } });
    if (!hod || hod.departmentId !== fee.student.departmentId) {
      throw ApiError.forbidden("Access denied: You can only delete fees for students in your department");
    }
  }

  return prisma.studentFee.delete({ where: { id: feeId } });
}

export async function getStudentFinancialDetails(user: JwtPayload, studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { department: true },
  });
  if (!student) throw ApiError.notFound("Student not found");

  // Security check: Only the student themselves or HOD can access raw bank details
  if (user.role === "STUDENT") {
    if (student.userId !== user.userId) {
      throw ApiError.forbidden("Access denied: You can only view your own bank details");
    }
  } else if (user.role === "MENTOR") {
    throw ApiError.forbidden("Faculty mentors do not have permission to view student financial details");
  } else if (user.role === "HOD") {
    const hod = await prisma.mentor.findUnique({ where: { userId: user.userId } });
    if (!hod || hod.departmentId !== student.departmentId) {
      throw ApiError.forbidden("Access denied: You can only view financial details of students in your department");
    }
  }

  return {
    bankName: student.bankName || null,
    accountHolderName: student.accountHolderName || student.fullName,
    accountNumber: student.accountNumber || null,
    ifscCode: student.ifscCode || null,
    branch: (student as any).branch || null,
  };
}

export async function createStudent(user: JwtPayload, data: Record<string, any>) {
  if (user.role === "STUDENT") throw ApiError.forbidden("Students cannot create student records");

  let mentorId = data.mentorId;
  if (user.role === "MENTOR") {
    const mentor = await prisma.mentor.findUnique({ where: { userId: user.userId } });
    if (!mentor) throw ApiError.forbidden("No mentor profile found");
    mentorId = mentor.id; // Mentors can only add students under themselves
  }

  // Handle Roll Number determination
  let rollNumber: string | null = data.rollNumber ? String(data.rollNumber).trim().toUpperCase() : null;
  if (!rollNumber && data.departmentId) {
    const admissionYear = data.admissionYear
      ? Number(data.admissionYear)
      : new Date().getFullYear();
    try {
      rollNumber = await generateNextRollNumber(data.departmentId, admissionYear);
    } catch {
      rollNumber = null;
    }
  }

  if (rollNumber) {
    const existing = await prisma.student.findUnique({ where: { rollNumber } });
    if (existing) {
      if (data.rollNumber) {
        throw ApiError.badRequest(`Roll Number '${rollNumber}' is already assigned to student ${existing.fullName} (${existing.registerNumber})`);
      }
      // If auto-generated conflicted, retry generating next sequence
      try {
        const admissionYear = data.admissionYear ? Number(data.admissionYear) : new Date().getFullYear();
        rollNumber = await generateNextRollNumber(data.departmentId, admissionYear);
      } catch {
        rollNumber = null;
      }
    }
  }

  return prisma.student.create({
    data: {
      fullName: data.fullName,
      registerNumber: data.registerNumber,
      rollNumber: rollNumber || undefined,
      year: data.year,
      section: data.section,
      departmentId: data.departmentId,
      mentorId,
      parentName: data.parentName,
      parentContact: data.parentContact,
      email: data.email || undefined,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      admissionYear: data.admissionYear,
      attendancePercentage: data.attendancePercentage ?? 100,
      cgpa: data.cgpa ?? 0,
      arrearCount: data.arrearCount ?? 0,
      placementStatus: data.placementStatus ?? "NOT_ELIGIBLE",
      internshipStatus: data.internshipStatus ?? "NOT_STARTED",
      certificationCount: data.certificationCount ?? 0,
    },
  });
}

export async function updateStudent(user: JwtPayload, studentId: string, data: Record<string, any>) {
  if (user.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student || student.id !== studentId) {
      throw ApiError.forbidden("You can only edit your own student profile");
    }

    // Permitted fields for student self-service edit
    const allowedFields = [
      "phone",
      "address",
      "city",
      "state",
      "zipCode",
      "emergencyContactName",
      "emergencyContactRelation",
      "emergencyContactPhone",
      "parentName",
      "parentContact",
      "careerGoal",
      "targetRole",
      "skills",
      "certifications",
      "githubUrl",
      "linkedinUrl",
      "portfolioUrl",
      "resumeUrl",
      "bio",
      "interests",
      "profilePicture",
    ];

    const payload: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        payload[key] = data[key];
      }
    }

    if (data.profilePicture !== undefined && student.userId) {
      await prisma.user.update({
        where: { id: student.userId },
        data: { profilePicture: data.profilePicture },
      });
    }

    return prisma.student.update({ where: { id: studentId }, data: payload });
  }

  await getStudentById(user, studentId); // ensures scoped access for mentors/hod

  const payload: Record<string, unknown> = { ...data };
  if (data.dateOfBirth) payload.dateOfBirth = new Date(data.dateOfBirth);
  if (data.email === "") payload.email = null;

  if (data.rollNumber !== undefined) {
    if (data.rollNumber === "" || data.rollNumber === null) {
      payload.rollNumber = null;
    } else {
      const formatted = String(data.rollNumber).trim().toUpperCase();
      const existing = await prisma.student.findFirst({
        where: { rollNumber: formatted, NOT: { id: studentId } }
      });
      if (existing) {
        throw ApiError.badRequest(`Roll Number '${formatted}' is already assigned to student ${existing.fullName} (${existing.registerNumber})`);
      }
      payload.rollNumber = formatted;
    }
  }

  return prisma.student.update({ where: { id: studentId }, data: payload });
}

export async function deleteStudent(user: JwtPayload, studentId: string) {
  if (user.role !== "MENTOR" && user.role !== "HOD") throw ApiError.forbidden();
  await getStudentById(user, studentId);
  return prisma.student.delete({ where: { id: studentId } });
}
