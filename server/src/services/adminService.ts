import { prisma, Role } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { hashPassword } from "../utils/password";
import { whatsAppClient } from "../whatsapp/client";
import { getWhatsAppRuleConfig } from "../whatsapp/ruleEngine";

export interface ListUsersParams {
  search?: string;
  role?: string;
  isActive?: string;
  page?: number;
  pageSize?: number;
}

export async function listUsers(params: ListUsersParams) {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));

  const where: Record<string, any> = {};

  if (params.role && params.role !== "ALL") {
    where.role = params.role as Role;
  }

  if (params.isActive !== undefined && params.isActive !== "ALL") {
    where.isActive = params.isActive === "true";
  }

  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    where.OR = [
      { email: { contains: s, mode: "insensitive" } },
      { mentor: { fullName: { contains: s, mode: "insensitive" } } },
      { student: { fullName: { contains: s, mode: "insensitive" } } },
      { student: { registerNumber: { contains: s, mode: "insensitive" } } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        mentor: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            designation: true,
            employeeId: true,
            department: { select: { id: true, name: true, code: true } },
          },
        },
        student: {
          select: {
            id: true,
            fullName: true,
            registerNumber: true,
            rollNumber: true,
            phone: true,
            year: true,
            section: true,
            department: { select: { id: true, name: true, code: true } },
            mentor: { select: { id: true, fullName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: users.map((u) => ({
      ...u,
      displayName: u.mentor?.fullName || u.student?.fullName || u.email.split("@")[0],
      department: u.mentor?.department || u.student?.department || null,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export interface CreateUserData {
  email: string;
  password?: string;
  role: Role;
  fullName?: string;
  phone?: string;
  departmentId?: string;
  employeeId?: string;
  designation?: string;
  registerNumber?: string;
  rollNumber?: string;
  year?: string;
  section?: string;
  batch?: string;
  mentorId?: string;
}

export async function createUser(data: CreateUserData) {
  const email = data.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.badRequest("A user with this email address already exists.");
  }

  const rawPassword = data.password && data.password.trim().length >= 6 ? data.password.trim() : "Welcome@123";
  const passwordHash = await hashPassword(rawPassword);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        role: data.role,
        isActive: true,
      },
    });

    if (data.role === Role.MENTOR || data.role === Role.HOD) {
      if (!data.fullName) throw ApiError.badRequest("Full Name is required for Faculty/HOD users");
      if (!data.departmentId) throw ApiError.badRequest("Department is required for Faculty/HOD users");

      const mentor = await tx.mentor.create({
        data: {
          userId: user.id,
          fullName: data.fullName.trim(),
          phone: data.phone?.trim() || null,
          designation: data.designation?.trim() || (data.role === Role.HOD ? "Head of Department" : "Assistant Professor"),
          employeeId: data.employeeId?.trim() || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
          departmentId: data.departmentId,
        },
        include: { department: true },
      });
      return { user, profile: mentor };
    }

    if (data.role === Role.STUDENT) {
      if (!data.fullName) throw ApiError.badRequest("Full Name is required for Student");
      if (!data.departmentId) throw ApiError.badRequest("Department is required for Student");
      if (!data.registerNumber) throw ApiError.badRequest("Register Number is required for Student");

      const regNum = data.registerNumber.trim();
      const existingStudent = await tx.student.findUnique({ where: { registerNumber: regNum } });
      if (existingStudent) throw ApiError.badRequest("A student with this register number already exists");

      let mentorId = data.mentorId;
      if (!mentorId) {
        const deptMentor = await tx.mentor.findFirst({ where: { departmentId: data.departmentId } });
        if (deptMentor) {
          mentorId = deptMentor.id;
        } else {
          const anyMentor = await tx.mentor.findFirst();
          if (!anyMentor) throw ApiError.badRequest("At least one faculty mentor must exist to assign student");
          mentorId = anyMentor.id;
        }
      }

      const student = await tx.student.create({
        data: {
          userId: user.id,
          fullName: data.fullName.trim(),
          registerNumber: regNum,
          rollNumber: data.rollNumber?.trim() || regNum,
          admissionNumber: `ADM-${regNum}`,
          email,
          phone: data.phone?.trim() || null,
          departmentId: data.departmentId,
          mentorId,
          year: data.year || "1",
          semester: data.year ? Number(data.year) * 2 : 1,
          section: data.section || "A",
          batch: data.batch || `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`,
          degree: "B.E.",
          attendancePercentage: 90.0,
          cgpa: 8.0,
          arrearCount: 0,
        },
        include: { department: true, mentor: true },
      });
      return { user, profile: student };
    }

    return { user, profile: null };
  });
}

export async function updateUser(
  userId: string,
  data: {
    email?: string;
    role?: Role;
    isActive?: boolean;
    password?: string;
    fullName?: string;
    phone?: string;
    departmentId?: string;
    designation?: string;
  }
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { mentor: true, student: true },
  });
  if (!user) throw ApiError.notFound("User not found");

  const updateData: Record<string, any> = {};
  if (data.email && data.email.trim().toLowerCase() !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email.trim().toLowerCase() } });
    if (existing && existing.id !== userId) {
      throw ApiError.badRequest("Email already in use by another user");
    }
    updateData.email = data.email.trim().toLowerCase();
  }

  if (data.role && data.role !== user.role) {
    updateData.role = data.role;
  }

  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }

  if (data.password && data.password.trim().length >= 6) {
    updateData.passwordHash = await hashPassword(data.password.trim());
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  if (user.mentor && (data.fullName || data.phone || data.departmentId || data.designation)) {
    await prisma.mentor.update({
      where: { id: user.mentor.id },
      data: {
        ...(data.fullName ? { fullName: data.fullName.trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone?.trim() || null } : {}),
        ...(data.departmentId ? { departmentId: data.departmentId } : {}),
        ...(data.designation ? { designation: data.designation.trim() } : {}),
      },
    });
  }

  if (user.student && (data.fullName || data.phone || data.departmentId)) {
    await prisma.student.update({
      where: { id: user.student.id },
      data: {
        ...(data.fullName ? { fullName: data.fullName.trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone?.trim() || null } : {}),
        ...(data.departmentId ? { departmentId: data.departmentId } : {}),
      },
    });
  }

  return updatedUser;
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found");

  return prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: { id: true, email: true, role: true, isActive: true, updatedAt: true },
  });
}

export async function listFaculty(params: { search?: string; departmentId?: string }) {
  const where: Record<string, any> = {};

  if (params.departmentId && params.departmentId !== "ALL") {
    where.departmentId = params.departmentId;
  }

  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    where.OR = [
      { fullName: { contains: s, mode: "insensitive" } },
      { employeeId: { contains: s, mode: "insensitive" } },
      { designation: { contains: s, mode: "insensitive" } },
      { user: { email: { contains: s, mode: "insensitive" } } },
    ];
  }

  const mentors = await prisma.mentor.findMany({
    where,
    include: {
      user: { select: { id: true, email: true, role: true, isActive: true } },
      department: { select: { id: true, name: true, code: true } },
      _count: {
        select: {
          students: true,
          meetings: true,
        },
      },
    },
    orderBy: { fullName: "asc" },
  });

  return mentors.map((m) => ({
    id: m.id,
    userId: m.userId,
    fullName: m.fullName,
    email: m.user?.email || null,
    phone: m.phone,
    designation: m.designation,
    employeeId: m.employeeId,
    qualification: m.qualification,
    experienceYears: m.experience ? parseInt(m.experience, 10) || null : null,
    specialization: m.specialization,
    department: m.department,
    isActive: m.user?.isActive ?? true,
    role: m.user?.role || Role.MENTOR,
    assignedMenteesCount: m._count.students,
    meetingsLoggedCount: m._count.meetings,
  }));
}

export async function createFaculty(data: {
  fullName: string;
  email: string;
  phone?: string;
  designation: string;
  departmentId: string;
  employeeId?: string;
  qualification?: string;
  experienceYears?: number;
  specialization?: string;
  isHOD?: boolean;
  password?: string;
}) {
  const email = data.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.badRequest("A user with this email already exists");

  const rawPassword = data.password && data.password.trim().length >= 6 ? data.password.trim() : "Faculty@123";
  const passwordHash = await hashPassword(rawPassword);
  const role = data.isHOD ? Role.HOD : Role.MENTOR;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        role,
        isActive: true,
      },
    });

    const mentor = await tx.mentor.create({
      data: {
        userId: user.id,
        fullName: data.fullName.trim(),
        phone: data.phone?.trim() || null,
        designation: data.designation.trim(),
        employeeId: data.employeeId?.trim() || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        departmentId: data.departmentId,
        qualification: data.qualification?.trim() || null,
        experience: data.experienceYears ? `${data.experienceYears} Years` : null,
        specialization: data.specialization?.trim() || null,
      },
      include: { department: true },
    });

    return { ...mentor, user: { id: user.id, email: user.email, role: user.role, isActive: user.isActive } };
  });
}

export async function getFacultyById(mentorId: string) {
  const mentor = await prisma.mentor.findUnique({
    where: { id: mentorId },
    include: {
      department: true,
      user: { select: { id: true, email: true, role: true, isActive: true, createdAt: true } },
      students: {
        select: {
          id: true,
          fullName: true,
          registerNumber: true,
          rollNumber: true,
          year: true,
          section: true,
          cgpa: true,
          attendancePercentage: true,
          arrearCount: true,
        },
        orderBy: { fullName: "asc" },
      },
      meetings: {
        orderBy: { meetingDate: "desc" },
        take: 10,
        select: {
          id: true,
          meetingDate: true,
          meetingType: true,
          discussionSummary: true,
        },
      },
      _count: {
        select: {
          students: true,
          meetings: true,
          issues: true,
        },
      },
    },
  });

  if (!mentor) throw ApiError.notFound("Faculty profile not found");

  const mentorData = mentor as any;
  return {
    ...mentor,
    assignedMenteesCount: mentorData._count?.students ?? 0,
    meetingsLoggedCount: mentorData._count?.meetings ?? 0,
    issuesCount: mentorData._count?.issues ?? 0,
  };
}

export async function updateFaculty(
  mentorId: string,
  data: {
    fullName?: string;
    phone?: string;
    email?: string;
    designation?: string;
    departmentId?: string;
    employeeId?: string;
    qualification?: string;
    experienceYears?: number;
    experience?: string;
    specialization?: string;
    employmentStatus?: string;
    cabinNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    bio?: string;
    isActive?: boolean;
    role?: Role;
    assignedStudentIds?: string[];
  }
) {
  const currentMentor = await prisma.mentor.findUnique({
    where: { id: mentorId },
    include: {
      department: true,
      user: { select: { id: true, email: true, role: true, isActive: true } },
      students: { select: { id: true } },
    },
  });
  if (!currentMentor) throw ApiError.notFound("Faculty member not found");

  const payload: Record<string, any> = {};

  if (data.fullName !== undefined) {
    const name = String(data.fullName).trim();
    if (!name) throw ApiError.badRequest("Full Name cannot be empty");
    payload.fullName = name;
  }

  if (data.employeeId !== undefined) {
    const empId = String(data.employeeId).trim();
    if (!empId) throw ApiError.badRequest("Faculty ID cannot be empty");
    const existing = await prisma.mentor.findFirst({
      where: { employeeId: empId, NOT: { id: mentorId } },
    });
    if (existing) {
      throw ApiError.badRequest(`Faculty ID '${empId}' is already assigned to ${existing.fullName}`);
    }
    payload.employeeId = empId;
  }

  if (data.phone !== undefined) payload.phone = data.phone?.trim() || null;
  if (data.designation !== undefined) payload.designation = data.designation?.trim() || null;
  if (data.employmentStatus !== undefined) payload.employmentStatus = data.employmentStatus?.trim() || null;
  if (data.cabinNumber !== undefined) payload.cabinNumber = data.cabinNumber?.trim() || null;
  if (data.address !== undefined) payload.address = data.address?.trim() || null;
  if (data.city !== undefined) payload.city = data.city?.trim() || null;
  if (data.state !== undefined) payload.state = data.state?.trim() || null;
  if (data.bio !== undefined) payload.bio = data.bio?.trim() || null;
  if (data.qualification !== undefined) payload.qualification = data.qualification?.trim() || null;
  if (data.specialization !== undefined) payload.specialization = data.specialization?.trim() || null;

  if (data.experienceYears !== undefined) {
    payload.experience = data.experienceYears ? `${data.experienceYears} Years` : null;
  } else if (data.experience !== undefined) {
    payload.experience = data.experience?.trim() || null;
  }

  if (data.departmentId !== undefined && data.departmentId !== currentMentor.departmentId) {
    const dept = await prisma.department.findUnique({ where: { id: data.departmentId } });
    if (!dept) throw ApiError.badRequest("Selected department does not exist");
    payload.departmentId = data.departmentId;
  }

  if (currentMentor.userId) {
    const userUpdate: Record<string, any> = {};
    if (data.email !== undefined) {
      const email = data.email.trim().toLowerCase();
      if (email && email !== currentMentor.user?.email) {
        const existingUser = await prisma.user.findFirst({
          where: { email, NOT: { id: currentMentor.userId } },
        });
        if (existingUser) throw ApiError.badRequest("Email already in use by another account");
        userUpdate.email = email;
      }
    }
    if (data.isActive !== undefined) {
      userUpdate.isActive = Boolean(data.isActive);
    }
    if (data.role !== undefined) {
      userUpdate.role = data.role;
    }
    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({
        where: { id: currentMentor.userId },
        data: userUpdate,
      });
    }
  }

  if (Array.isArray(data.assignedStudentIds)) {
    await prisma.student.updateMany({
      where: { id: { in: data.assignedStudentIds } },
      data: { mentorId },
    });
  }

  const changedFields: string[] = [];
  const previousValues: Record<string, any> = {};
  const newValues: Record<string, any> = {};

  for (const [key, val] of Object.entries(payload)) {
    const prev = (currentMentor as any)[key];
    if (prev !== val) {
      changedFields.push(key);
      previousValues[key] = prev;
      newValues[key] = val;
    }
  }
  if (data.email && data.email !== currentMentor.user?.email) {
    changedFields.push("email");
    previousValues["email"] = currentMentor.user?.email;
    newValues["email"] = data.email;
  }
  if (data.isActive !== undefined && data.isActive !== currentMentor.user?.isActive) {
    changedFields.push("isActive");
    previousValues["isActive"] = currentMentor.user?.isActive;
    newValues["isActive"] = data.isActive;
  }

  const updatedMentor = await prisma.mentor.update({
    where: { id: mentorId },
    data: payload,
    include: {
      department: true,
      user: { select: { id: true, email: true, role: true, isActive: true } },
    },
  });

  return { mentor: updatedMentor, changes: { changedFields, previousValues, newValues } };
}

export async function listHODs() {
  const departments = await prisma.department.findMany({
    include: {
      mentors: {
        include: {
          user: { select: { id: true, email: true, role: true, isActive: true } },
          _count: { select: { students: true } },
        },
      },
      _count: { select: { students: true, mentors: true } },
    },
    orderBy: { name: "asc" },
  });

  return departments.map((d) => {
    const hod = d.mentors.find((m) => m.user?.role === Role.HOD);
    return {
      department: {
        id: d.id,
        name: d.name,
        code: d.code,
        studentCount: d._count.students,
        mentorCount: d._count.mentors,
      },
      hod: hod
        ? {
            id: hod.id,
            userId: hod.userId,
            fullName: hod.fullName,
            email: hod.user?.email,
            phone: hod.phone,
            designation: hod.designation,
            employeeId: hod.employeeId,
            isActive: hod.user?.isActive ?? true,
          }
        : null,
      availableFaculty: d.mentors.map((m) => ({
        id: m.id,
        fullName: m.fullName,
        email: m.user?.email,
        designation: m.designation,
        isCurrentHOD: m.user?.role === Role.HOD,
      })),
    };
  });
}

export async function assignHOD(departmentId: string, mentorId: string) {
  const mentor = await prisma.mentor.findUnique({
    where: { id: mentorId },
    include: { user: true, department: true },
  });
  if (!mentor) throw ApiError.notFound("Faculty member not found");

  return prisma.$transaction(async (tx) => {
    // If faculty is from a different department, move them to target department
    if (mentor.departmentId !== departmentId) {
      await tx.mentor.update({
        where: { id: mentorId },
        data: { departmentId },
      });
    }

    // Demote any existing HOD of this department to MENTOR
    const existingHODs = await tx.mentor.findMany({
      where: {
        departmentId,
        user: { role: Role.HOD },
        id: { not: mentorId },
      },
      include: { user: true },
    });

    for (const h of existingHODs) {
      if (h.userId) {
        await tx.user.update({
          where: { id: h.userId },
          data: { role: Role.MENTOR },
        });
      }
    }

    // Promote designated faculty to HOD
    if (mentor.userId) {
      await tx.user.update({
        where: { id: mentor.userId },
        data: { role: Role.HOD },
      });
    }

    return {
      success: true,
      message: `${mentor.fullName} is now appointed as Head of Department for ${mentor.department?.name || departmentId}`,
    };
  });
}

export async function getHODById(idOrMentorId: string) {
  let mentor = await prisma.mentor.findFirst({
    where: {
      OR: [{ id: idOrMentorId }, { userId: idOrMentorId }],
    },
    include: {
      department: {
        include: {
          _count: { select: { students: true, mentors: true } },
        },
      },
      user: { select: { id: true, email: true, role: true, isActive: true, createdAt: true } },
      students: { select: { id: true, fullName: true, registerNumber: true } },
    },
  });

  if (!mentor) {
    const dept = await prisma.department.findUnique({
      where: { id: idOrMentorId },
      include: {
        mentors: {
          where: { user: { role: Role.HOD } },
          include: {
            user: { select: { id: true, email: true, role: true, isActive: true, createdAt: true } },
          },
        },
        _count: { select: { students: true, mentors: true } },
      },
    });
    if (dept && dept.mentors[0]) {
      mentor = {
        ...dept.mentors[0],
        department: dept,
      } as any;
    }
  }

  if (!mentor) throw ApiError.notFound("HOD profile not found");

  return {
    ...mentor,
    studentCount: mentor.department?._count?.students || 0,
    facultyCount: mentor.department?._count?.mentors || 0,
  };
}

export async function updateHOD(
  id: string,
  data: {
    fullName?: string;
    employeeId?: string;
    email?: string;
    phone?: string;
    designation?: string;
    departmentId?: string;
    departmentCode?: string;
    departmentName?: string;
    isActive?: boolean;
  }
) {
  let mentor = await prisma.mentor.findFirst({
    where: { OR: [{ id }, { userId: id }] },
    include: { user: true, department: true },
  });
  if (!mentor) {
    const dept = await prisma.department.findUnique({
      where: { id },
      include: { mentors: { where: { user: { role: Role.HOD } }, include: { user: true } } },
    });
    if (dept && dept.mentors[0]) mentor = dept.mentors[0] as any;
  }
  if (!mentor) throw ApiError.notFound("HOD profile not found");

  const result = await updateFaculty(mentor.id, {
    fullName: data.fullName,
    employeeId: data.employeeId,
    email: data.email,
    phone: data.phone,
    designation: data.designation,
    departmentId: data.departmentId,
    isActive: data.isActive,
  });

  if (data.departmentCode || data.departmentName) {
    await prisma.department.update({
      where: { id: mentor.departmentId },
      data: {
        ...(data.departmentName ? { name: data.departmentName.trim() } : {}),
        ...(data.departmentCode ? { code: data.departmentCode.trim().toUpperCase() } : {}),
      },
    });
    result.changes.changedFields.push("department");
  }

  return result;
}

export async function listDepartments() {
  const departments = await prisma.department.findMany({
    include: {
      mentors: {
        where: { user: { role: Role.HOD } },
        select: { id: true, fullName: true, phone: true, employeeId: true, user: { select: { email: true } } },
      },
      _count: { select: { students: true, mentors: true } },
    },
    orderBy: { name: "asc" },
  });

  return departments.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    studentCount: d._count.students,
    mentorCount: d._count.mentors,
    hod: d.mentors[0] || null,
  }));
}

export async function getDepartmentById(id: string) {
  const dept = await prisma.department.findUnique({
    where: { id },
    include: {
      mentors: {
        include: {
          user: { select: { id: true, email: true, role: true, isActive: true } },
          _count: { select: { students: true } },
        },
      },
      students: {
        take: 20,
        select: { id: true, fullName: true, registerNumber: true, rollNumber: true, year: true, section: true, cgpa: true, attendancePercentage: true },
        orderBy: { fullName: "asc" },
      },
      _count: { select: { students: true, mentors: true } },
    },
  });
  if (!dept) throw ApiError.notFound("Department not found");

  const hod = dept.mentors.find((m) => m.user?.role === Role.HOD) || dept.mentors[0] || null;

  return {
    ...dept,
    hod,
    studentCount: dept._count.students,
    mentorCount: dept._count.mentors,
  };
}

export async function createDepartment(data: { name: string; code: string }) {
  const name = data.name.trim();
  const code = data.code.trim().toUpperCase();

  const existing = await prisma.department.findFirst({
    where: {
      OR: [{ name: { equals: name, mode: "insensitive" } }, { code: { equals: code, mode: "insensitive" } }],
    },
  });

  if (existing) {
    throw ApiError.badRequest("A department with this name or code already exists");
  }

  return prisma.department.create({
    data: { name, code },
  });
}

export async function updateDepartment(departmentId: string, data: { name?: string; code?: string }) {
  const dept = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!dept) throw ApiError.notFound("Department not found");

  const payload: Record<string, any> = {};
  if (data.name !== undefined) {
    const name = data.name.trim();
    if (!name) throw ApiError.badRequest("Department name cannot be empty");
    payload.name = name;
  }
  if (data.code !== undefined) {
    const code = data.code.trim().toUpperCase();
    if (!code) throw ApiError.badRequest("Department code cannot be empty");
    payload.code = code;
  }

  const changedFields: string[] = [];
  const previousValues: Record<string, any> = {};
  const newValues: Record<string, any> = {};
  for (const [key, val] of Object.entries(payload)) {
    if ((dept as any)[key] !== val) {
      changedFields.push(key);
      previousValues[key] = (dept as any)[key];
      newValues[key] = val;
    }
  }

  const updatedDept = await prisma.department.update({
    where: { id: departmentId },
    data: payload,
  });

  return { department: updatedDept, changes: { changedFields, previousValues, newValues } };
}

export async function listPrograms(): Promise<any[]> {
  const record = await prisma.report.findFirst({
    where: { type: "INSTITUTION_PROGRAMS" },
  });
  if (record?.filters && Array.isArray(record.filters)) {
    return record.filters as any[];
  }
  return [
    { id: "p1", code: "BE-CSE", name: "B.E. Computer Science & Engineering", degree: "Undergraduate (B.E)", duration: "4 Years (8 Semesters)", intake: 120, reg: "Regulation 2021", hodName: "Dr. Priya Raman", status: "Active" },
    { id: "p2", code: "BTECH-AIDS", name: "B.Tech. Artificial Intelligence & Data Science", degree: "Undergraduate (B.Tech)", duration: "4 Years (8 Semesters)", intake: 60, reg: "Regulation 2021", hodName: "Dr. Rajesh Kannan", status: "Active" },
    { id: "p3", code: "BE-ECE", name: "B.E. Electronics & Communication Engineering", degree: "Undergraduate (B.E)", duration: "4 Years (8 Semesters)", intake: 60, reg: "Regulation 2021", hodName: "Dr. Ananya Sen", status: "Active" },
    { id: "p4", code: "ME-CSE", name: "M.E. Computer Science & Engineering", degree: "Postgraduate (M.E)", duration: "2 Years (4 Semesters)", intake: 18, reg: "Regulation 2022", hodName: "Dr. Priya Raman", status: "Active" },
  ];
}

export async function updateProgram(programId: string, data: any) {
  const programs: any[] = await listPrograms();
  const index = programs.findIndex((p: any) => p && (p.id === programId || p.code === programId));
  const prev = index >= 0 ? programs[index] : null;

  if (index >= 0) {
    programs[index] = Object.assign({}, programs[index], data);
  } else {
    programs.push(Object.assign({ id: programId }, data));
  }

  const existing = await prisma.report.findFirst({ where: { type: "INSTITUTION_PROGRAMS" } });
  if (existing) {
    await prisma.report.update({
      where: { id: existing.id },
      data: { filters: programs as any },
    });
  } else {
    await prisma.report.create({
      data: {
        type: "INSTITUTION_PROGRAMS",
        title: "Institution Degree Programs Directory",
        generatedBy: "ADMIN",
        filters: programs as any,
      },
    });
  }

  const updatedItem = programs[index >= 0 ? index : programs.length - 1] || {};
  return { program: updatedItem, changes: { changedFields: Object.keys(data || {}), previousValues: prev, newValues: data } };
}

export async function listClasses(): Promise<any[]> {
  const record = await prisma.report.findFirst({
    where: { type: "INSTITUTION_CLASSES" },
  });
  if (record?.filters && Array.isArray(record.filters)) {
    return record.filters as any[];
  }
  return [
    { id: "c1", year: "1", sec: "A", dept: "CSE", advisor: "Dr. Priya Raman", students: 58, hall: "LH-101", academicYear: "2025-2026", semester: 2 },
    { id: "c2", year: "1", sec: "B", dept: "CSE", advisor: "Prof. Rajesh Kannan", students: 60, hall: "LH-102", academicYear: "2025-2026", semester: 2 },
    { id: "c3", year: "2", sec: "A", dept: "CSE", advisor: "Dr. Ananya Sen", students: 56, hall: "LH-201", academicYear: "2025-2026", semester: 4 },
    { id: "c4", year: "2", sec: "B", dept: "CSE", advisor: "Prof. Karthik S", students: 57, hall: "LH-202", academicYear: "2025-2026", semester: 4 },
    { id: "c5", year: "3", sec: "A", dept: "CSE", advisor: "Dr. Meenakshi Sundaram", students: 54, hall: "LH-301", academicYear: "2025-2026", semester: 6 },
    { id: "c6", year: "3", sec: "B", dept: "CSE", advisor: "Dr. Arvind Swamy", students: 55, hall: "LH-302", academicYear: "2025-2026", semester: 6 },
    { id: "c7", year: "4", sec: "A", dept: "CSE", advisor: "Prof. Sangeetha R", students: 52, hall: "LH-401", academicYear: "2025-2026", semester: 8 },
    { id: "c8", year: "4", sec: "B", dept: "CSE", advisor: "Dr. Vignesh Kumar", students: 53, hall: "LH-402", academicYear: "2025-2026", semester: 8 },
  ];
}

export async function updateClass(classId: string, data: any) {
  const classes: any[] = await listClasses();
  const index = classes.findIndex((c: any) => c && (c.id === classId || `${c.year}-${c.sec}` === classId));
  const prev = index >= 0 ? classes[index] : null;

  if (index >= 0) {
    classes[index] = Object.assign({}, classes[index], data);
  } else {
    classes.push(Object.assign({ id: classId }, data));
  }

  const existing = await prisma.report.findFirst({ where: { type: "INSTITUTION_CLASSES" } });
  if (existing) {
    await prisma.report.update({
      where: { id: existing.id },
      data: { filters: classes as any },
    });
  } else {
    await prisma.report.create({
      data: {
        type: "INSTITUTION_CLASSES",
        title: "Institution Classes and Sections Directory",
        generatedBy: "ADMIN",
        filters: classes as any,
      },
    });
  }

  const updatedItem = classes[index >= 0 ? index : classes.length - 1] || {};
  return { classItem: updatedItem, changes: { changedFields: Object.keys(data || {}), previousValues: prev, newValues: data } };
}

export async function listAuditLogs(params: { search?: string; entity?: string; action?: string; page?: number; pageSize?: number }) {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 25));

  const where: Record<string, any> = {};

  if (params.entity && params.entity !== "ALL") {
    where.entity = params.entity;
  }

  if (params.action && params.action !== "ALL") {
    where.action = { contains: params.action, mode: "insensitive" };
  }

  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    where.OR = [
      { action: { contains: s, mode: "insensitive" } },
      { entity: { contains: s, mode: "insensitive" } },
      { entityId: { contains: s, mode: "insensitive" } },
      { user: { email: { contains: s, mode: "insensitive" } } },
      { ipAddress: { contains: s, mode: "insensitive" } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    items: logs.map((l) => ({
      id: l.id,
      action: l.action,
      entity: l.entity,
      entityId: l.entityId,
      actor: l.user?.email || "System",
      actorRole: l.user?.role || "SYSTEM",
      metadata: l.metadata,
      ipAddress: l.ipAddress || "127.0.0.1",
      userAgent: l.userAgent,
      createdAt: l.createdAt,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getSystemSettings() {
  const whatsAppConfig = await getWhatsAppRuleConfig();
  const gatewayStatus = whatsAppClient.getConfigStatus();

  return {
    institution: {
      name: "MentorHUB Engineering & Technology Institute",
      code: "MHUB-ENG",
      domain: "mentorhub.edu",
      academicYear: "2025-2026",
      currentSemester: "Even Semester",
      naacStatus: "Accredited (Grade A++)",
    },
    security: {
      passwordPolicy: "Minimum 6 characters",
      sessionTimeoutMinutes: 120,
      requireEmailVerification: false,
      rbacMode: "Enforced (ADMIN, HOD, MENTOR, STUDENT)",
    },
    alertRules: whatsAppConfig,
    whatsAppGateway: gatewayStatus,
  };
}

export async function updateSystemSettings(data: {
  attendanceRiskThreshold?: number;
  feeDueAlertDaysBefore?: number;
  meetingReminderHoursBefore?: number;
  enableAttendanceAlerts?: boolean;
  enableFeeAlerts?: boolean;
  enableMeetingReminders?: boolean;
  enableArrearAlerts?: boolean;
  enableOverdueActionAlerts?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}) {
  const existing = await prisma.whatsAppRuleConfig.findFirst({ where: { id: "GLOBAL" } });

  const updatePayload: Record<string, any> = {
    ...(data.attendanceRiskThreshold !== undefined ? { attendanceRiskThreshold: Number(data.attendanceRiskThreshold) } : {}),
    ...(data.feeDueAlertDaysBefore !== undefined ? { feeDueAlertDaysBefore: Number(data.feeDueAlertDaysBefore) } : {}),
    ...(data.meetingReminderHoursBefore !== undefined ? { meetingReminderHoursBefore: Number(data.meetingReminderHoursBefore) } : {}),
    ...(data.enableAttendanceAlerts !== undefined ? { enableAttendanceAlerts: Boolean(data.enableAttendanceAlerts) } : {}),
    ...(data.enableFeeAlerts !== undefined ? { enableFeeAlerts: Boolean(data.enableFeeAlerts) } : {}),
    ...(data.enableMeetingReminders !== undefined ? { enableMeetingReminders: Boolean(data.enableMeetingReminders) } : {}),
    ...(data.enableArrearAlerts !== undefined ? { enableArrearAlerts: Boolean(data.enableArrearAlerts) } : {}),
    ...(data.enableOverdueActionAlerts !== undefined ? { enableOverdueActionAlerts: Boolean(data.enableOverdueActionAlerts) } : {}),
    ...(data.quietHoursStart ? { quietHoursStart: data.quietHoursStart } : {}),
    ...(data.quietHoursEnd ? { quietHoursEnd: data.quietHoursEnd } : {}),
  };

  if (existing) {
    return prisma.whatsAppRuleConfig.update({
      where: { id: "GLOBAL" },
      data: updatePayload,
    });
  } else {
    return prisma.whatsAppRuleConfig.create({
      data: {
        id: "GLOBAL",
        attendanceRiskThreshold: updatePayload.attendanceRiskThreshold ?? 75.0,
        feeDueAlertDaysBefore: updatePayload.feeDueAlertDaysBefore ?? 7,
        meetingReminderHoursBefore: updatePayload.meetingReminderHoursBefore ?? 24,
        enableAttendanceAlerts: updatePayload.enableAttendanceAlerts ?? true,
        enableFeeAlerts: updatePayload.enableFeeAlerts ?? true,
        enableMeetingReminders: updatePayload.enableMeetingReminders ?? true,
        enableArrearAlerts: updatePayload.enableArrearAlerts ?? true,
        enableOverdueActionAlerts: updatePayload.enableOverdueActionAlerts ?? true,
        quietHoursStart: updatePayload.quietHoursStart ?? "21:00",
        quietHoursEnd: updatePayload.quietHoursEnd ?? "08:00",
      },
    });
  }
}

export async function batchAssignMentee(studentIds: string[], mentorId: string) {
  const mentor = await prisma.mentor.findUnique({ where: { id: mentorId } });
  if (!mentor) throw ApiError.notFound("Mentor not found");

  const updated = await prisma.student.updateMany({
    where: { id: { in: studentIds } },
    data: { mentorId },
  });

  return {
    success: true,
    updatedCount: updated.count,
    mentorName: mentor.fullName,
  };
}
