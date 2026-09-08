import { z } from "zod";

export const createStudentSchema = z.object({
  fullName: z.string().min(1),
  registerNumber: z.string().min(1),
  rollNumber: z.string().optional().nullable(),
  year: z.string().min(1),
  section: z.string().min(1),
  departmentId: z.string().min(1),
  mentorId: z.string().min(1),
  parentName: z.string().optional(),
  parentContact: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional().or(z.string().optional()),
  admissionYear: z.number().int().optional(),
  attendancePercentage: z.number().min(0).max(100).optional(),
  cgpa: z.number().min(0).max(10).optional(),
  arrearCount: z.number().int().min(0).optional(),
  placementStatus: z.enum(["NOT_ELIGIBLE", "ELIGIBLE", "IN_PROGRESS", "PLACED"]).optional(),
  internshipStatus: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]).optional(),
  certificationCount: z.number().int().min(0).optional(),
});

export const updateStudentSchema = createStudentSchema.partial();
