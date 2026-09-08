import { prisma, Role } from "../config/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken, JwtPayload } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import crypto from "crypto";

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw ApiError.notFound("User not found");

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 3600000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { email, token, expiresAt },
  });

  // In a real app, send an email with the token here
  console.log(`Password reset token for ${email}: ${token}`);
  return { message: "If an account exists, a password reset link has been generated." };
}

export async function resetPassword(token: string, newPass: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw ApiError.badRequest("Invalid or expired token");
  }

  const passwordHash = await hashPassword(newPass);
  await prisma.user.update({
    where: { email: resetToken.email },
    data: { passwordHash },
  });

  await prisma.passwordResetToken.delete({ where: { token } });
  return { message: "Password updated successfully" };
}

export async function createUser(input: {
  email: string;
  role: Role;
  fullName: string;
  departmentId?: string;
  employeeId?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  // Temporary password until user sets their own
  const passwordHash = await hashPassword("TemporaryPassword!123");

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      role: input.role,
    },
  });

  if (input.role === "MENTOR" || input.role === "HOD") {
    if (!input.departmentId) {
      throw ApiError.badRequest("departmentId is required for mentor/HOD accounts");
    }
    await prisma.mentor.create({
      data: {
        userId: user.id,
        fullName: input.fullName,
        employeeId: input.employeeId || "TEMP-" + user.id.slice(0, 5),
        departmentId: input.departmentId,
      },
    });
  }

  return sanitizeUser(user);
}
export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) throw ApiError.unauthorized("Invalid email or password");

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized("Invalid email or password");

  const token = signToken({ userId: user.id, role: user.role, email: user.email });
  const currentUser = await getCurrentUser(user.id);
  return { token, user: currentUser };
}

export async function registerMentorOrHod(input: {
  email: string;
  password: string;
  role: Role;
  fullName: string;
  employeeId?: string;
  departmentId?: string;
  designation?: string;
  phone?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      role: input.role,
    },
  });

  if (input.role === "MENTOR") {
    if (!input.employeeId || !input.departmentId) {
      throw ApiError.badRequest("employeeId and departmentId are required for mentor accounts");
    }
    await prisma.mentor.create({
      data: {
        userId: user.id,
        fullName: input.fullName,
        employeeId: input.employeeId,
        departmentId: input.departmentId,
        designation: input.designation,
        phone: input.phone,
      },
    });
  }

  const token = signToken({ userId: user.id, role: (user as any).role, email: (user as any).email });
  return { token, user: sanitizeUser(user) };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { mentor: true, student: true },
  });
  if (!user) throw ApiError.notFound("User not found");

  const sanitized = sanitizeUser(user);

  // If student, attach department and mentor details
  if (user.student) {
    const student = await prisma.student.findUnique({
      where: { id: user.student.id },
      include: { department: true, mentor: true },
    });
    if (student) {
      // Return student with masked bank account by default
      sanitized.student = {
        ...student,
        maskedAccountNumber: maskAccountNumber(student.accountNumber),
      };
      if (!sanitized.profilePicture && student.profilePicture) {
        sanitized.profilePicture = student.profilePicture;
      }
    }
  }

  // If mentor or HOD, attach department details
  if (user.mentor) {
    const mentor = await prisma.mentor.findUnique({
      where: { id: user.mentor.id },
      include: { department: true },
    });
    const menteeCount = await prisma.student.count({ where: { mentorId: user.mentor.id } });
    sanitized.mentor = {
      ...mentor,
      menteeCount,
    };
    if (!sanitized.profilePicture && mentor?.profilePicture) {
      sanitized.profilePicture = mentor.profilePicture;
    }
  }

  return sanitized;
}

export async function changePassword(userId: string, currentPass: string, newPass: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found");

  const valid = await comparePassword(currentPass, user.passwordHash);
  if (!valid) throw ApiError.badRequest("Current password is not correct");

  if (!newPass || newPass.length < 6) {
    throw ApiError.badRequest("New password must be at least 6 characters long");
  }

  const passwordHash = await hashPassword(newPass);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { message: "Password updated successfully" };
}

export async function updateOwnProfile(userId: string, role: string, data: Record<string, any>) {
  if (data.profilePicture !== undefined) {
    await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: data.profilePicture },
    });
  }

  if (role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound("Student record not found");

    // Whitelist only editable personal fields for student
    const allowed = {
      phone: data.phone ?? student.phone,
      emergencyContact: data.emergencyContact ?? student.emergencyContact,
      address: data.address ?? student.address,
      city: data.city ?? student.city,
      state: data.state ?? student.state,
      bio: data.bio ?? student.bio,
      skills: Array.isArray(data.skills) ? data.skills : student.skills,
      profilePicture: data.profilePicture !== undefined ? data.profilePicture : student.profilePicture,
    };

    await prisma.student.update({
      where: { id: student.id },
      data: allowed,
    });
    return getCurrentUser(userId);
  } else if (role === "MENTOR" || role === "HOD") {
    const mentor = await prisma.mentor.findUnique({ where: { userId } });
    if (!mentor) throw ApiError.notFound("Faculty profile not found");

    const allowed = {
      phone: data.phone ?? mentor.phone,
      qualification: data.qualification ?? mentor.qualification,
      specialization: data.specialization ?? mentor.specialization,
      address: data.address ?? mentor.address,
      city: data.city ?? mentor.city,
      state: data.state ?? mentor.state,
      bio: data.bio ?? mentor.bio,
      profilePicture: data.profilePicture !== undefined ? data.profilePicture : mentor.profilePicture,
    };

    await prisma.mentor.update({
      where: { id: mentor.id },
      data: allowed,
    });
    return getCurrentUser(userId);
  }

  throw ApiError.badRequest("Unsupported role for profile update");
}

export async function listStaff(user: JwtPayload, departmentId?: string) {
  let where: Record<string, any> = {};
  
  if (user.role === "HOD") {
    const hod = await prisma.mentor.findUnique({ where: { userId: user.userId } });
    if (!hod) throw ApiError.forbidden("No HOD profile found");
    
    where = {
      OR: [
        { departmentId: hod.departmentId },
        { students: { some: { departmentId: hod.departmentId } } }
      ]
    };
    
    if (departmentId) {
      // Ensure the requested department is the HOD's department, otherwise return empty or just scope it
      where = {
        AND: [
          { departmentId },
          where
        ]
      };
    }
  } else if (user.role === "MENTOR" || user.role === "STUDENT") {
     throw ApiError.forbidden("Access denied");
  } else {
    if (departmentId) where.departmentId = departmentId;
  }

  const staff = await prisma.mentor.findMany({
    where,
    include: { department: true },
    orderBy: { fullName: "asc" },
  });

  // Attach mentee counts
  const enriched = await Promise.all(
    staff.map(async (m: any) => {
      const menteeCount = await prisma.student.count({ where: { mentorId: m.id } });
      return { ...m, menteeCount };
    })
  );

  return enriched;
}

export async function updateStaffRecord(staffId: string, data: Record<string, any>) {
  const existing = await prisma.mentor.findUnique({ where: { id: staffId } });
  if (!existing) throw ApiError.notFound("Staff member not found");

  const updated = await prisma.mentor.update({
    where: { id: staffId },
    data: {
      designation: data.designation ?? existing.designation,
      phone: data.phone ?? existing.phone,
      departmentId: data.departmentId ?? existing.departmentId,
      qualification: data.qualification ?? existing.qualification,
      specialization: data.specialization ?? existing.specialization,
      employmentStatus: data.employmentStatus ?? existing.employmentStatus,
    },
    include: { department: true },
  });

  return updated;
}

export function maskAccountNumber(num?: string | null): string {
  if (!num) return "XXXX XXXX 0000";
  const str = String(num).replace(/\s+/g, "");
  const last4 = str.slice(-4);
  return `XXXX XXXX ${last4}`;
}

function sanitizeUser(user: { passwordHash?: string; [key: string]: unknown }) {
  const { passwordHash, ...rest } = user;
  return rest;
}
