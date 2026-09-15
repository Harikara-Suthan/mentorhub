import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as studentService from "../services/studentService";
import { createStudentSchema, updateStudentSchema } from "../validators/studentValidators";
import { logAudit } from "../middleware/audit";
import { ApiError } from "../utils/ApiError";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (req.user!.role !== "STUDENT") {
    throw ApiError.badRequest("Only students can access /students/me");
  }
  const student = await studentService.getStudentByUserId(req.user!.userId);
  res.json({ success: true, data: student });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { search, departmentId, year, section, mentorId, riskLevel, semester, attendance, arrears, academicStatus, feeStatus, page, pageSize } = req.query;
  const result = await studentService.listStudents(
    req.user!,
    {
      search: search as string,
      departmentId: departmentId as string,
      year: year as string,
      section: section as string,
      mentorId: mentorId as string,
      riskLevel: riskLevel as string,
      semester: semester as string,
      attendance: attendance as string,
      arrears: arrears as string,
      academicStatus: academicStatus as string,
      feeStatus: feeStatus as string,
    },
    page ? Number(page) : 1,
    pageSize ? Number(pageSize) : 20
  );
  res.json({ success: true, data: result });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.getStudentById(req.user!, req.params.id);
  await logAudit(req, "Student Viewed", "Student", req.params.id);
  res.json({ success: true, data: student });
});

export const getFees = asyncHandler(async (req: Request, res: Response) => {
  const fees = await studentService.getStudentFees(req.user!, req.params.id);
  await logAudit(req, "Student Fees Viewed", "Student", req.params.id);
  res.json({ success: true, data: fees });
});

export const addFee = asyncHandler(async (req: Request, res: Response) => {
  const fee = await studentService.addStudentFee(req.user!, req.params.id, req.body);
  await logAudit(req, "Student Fee Added", "Student", req.params.id);
  res.status(201).json({ success: true, data: fee });
});

export const updateFee = asyncHandler(async (req: Request, res: Response) => {
  const fee = await studentService.updateStudentFee(req.user!, req.params.id, req.params.feeId, req.body);
  await logAudit(req, "Student Fee Updated", "Student", req.params.id);
  res.json({ success: true, data: fee });
});

export const deleteFee = asyncHandler(async (req: Request, res: Response) => {
  await studentService.deleteStudentFee(req.user!, req.params.id, req.params.feeId);
  await logAudit(req, "Student Fee Deleted", "Student", req.params.id);
  res.json({ success: true, message: "Fee record removed successfully" });
});

export const getFinancial = asyncHandler(async (req: Request, res: Response) => {
  const financial = await studentService.getStudentFinancialDetails(req.user!, req.params.id);
  await logAudit(req, "Student Financial Details Viewed", "Student", req.params.id);
  res.json({ success: true, data: financial });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = createStudentSchema.parse(req.body);
  const student = await studentService.createStudent(req.user!, data);
  await logAudit(req, "Student Created", "Student", student.id);
  res.status(201).json({ success: true, data: student });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = updateStudentSchema.parse(req.body);
  const result = await studentService.updateStudent(req.user!, req.params.id, data);
  const student = result.student;

  const actionName = req.user?.role === "ADMIN" ? "ADMIN_EDIT_STUDENT" : "Student Updated";
  await logAudit(req, actionName, "Student", req.params.id, {
    actorEmail: req.user?.email,
    actorRole: req.user?.role,
    studentName: student.fullName,
    registerNumber: student.registerNumber,
    rollNumber: student.rollNumber,
    changedFields: result.changes.changedFields,
    previousValues: result.changes.previousValues,
    newValues: result.changes.newValues,
    updatedAt: new Date().toISOString(),
  });

  res.json({ success: true, data: student });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await studentService.deleteStudent(req.user!, req.params.id);
  await logAudit(req, "Student Deleted", "Student", req.params.id);
  res.json({ success: true, message: "Student removed successfully" });
});
