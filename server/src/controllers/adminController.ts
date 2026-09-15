import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as adminService from "../services/adminService";
import * as dashboardService from "../services/dashboardService";
import { logAudit } from "../middleware/audit";
import { Role } from "../config/prisma";

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const data = await dashboardService.getAdminDashboard(req.user!);
  res.json({ success: true, data });
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { search, role, isActive, page, pageSize } = req.query;
  const data = await adminService.listUsers({
    search: search as string,
    role: role as string,
    isActive: isActive as string,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
  });
  res.json({ success: true, data });
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, role, fullName, phone, departmentId, employeeId, designation, registerNumber, rollNumber, year, section, batch, mentorId } = req.body;
  const result = await adminService.createUser({
    email,
    password,
    role: role as Role,
    fullName,
    phone,
    departmentId,
    employeeId,
    designation,
    registerNumber,
    rollNumber,
    year,
    section,
    batch,
    mentorId,
  });

  await logAudit(req, "ADMIN_CREATE_USER", "User", result.user.id, {
    email: result.user.email,
    role: result.user.role,
  });

  res.status(201).json({ success: true, data: result });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, role, isActive, password, fullName, phone, departmentId, designation } = req.body;
  const user = await adminService.updateUser(id, {
    email,
    role: role as Role,
    isActive,
    password,
    fullName,
    phone,
    departmentId,
    designation,
  });

  await logAudit(req, "ADMIN_UPDATE_USER", "User", id, {
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  });

  res.json({ success: true, data: user });
});

export const toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const user = await adminService.toggleUserStatus(id, Boolean(isActive));

  await logAudit(req, isActive ? "ADMIN_RESTORE_USER" : "ADMIN_DEACTIVATE_USER", "User", id, {
    email: user.email,
    isActive: user.isActive,
  });

  res.json({ success: true, data: user });
});

export const listFaculty = asyncHandler(async (req: Request, res: Response) => {
  const { search, departmentId } = req.query;
  const data = await adminService.listFaculty({
    search: search as string,
    departmentId: departmentId as string,
  });
  res.json({ success: true, data });
});

export const createFaculty = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, phone, designation, departmentId, employeeId, qualification, experienceYears, specialization, isHOD, password } = req.body;
  const mentor = await adminService.createFaculty({
    fullName,
    email,
    phone,
    designation,
    departmentId,
    employeeId,
    qualification,
    experienceYears,
    specialization,
    isHOD,
    password,
  });

  await logAudit(req, "ADMIN_CREATE_FACULTY", "Mentor", mentor.id, {
    fullName: mentor.fullName,
    email: mentor.user?.email,
    departmentId,
  });

  res.status(201).json({ success: true, data: mentor });
});

export const getFacultyById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const faculty = await adminService.getFacultyById(id);
  res.json({ success: true, data: faculty });
});

export const updateFaculty = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await adminService.updateFaculty(id, req.body);
  const mentor = result.mentor;

  await logAudit(req, "ADMIN_EDIT_MENTOR", "Mentor", id, {
    actorEmail: req.user?.email,
    actorRole: req.user?.role,
    mentorName: mentor.fullName,
    employeeId: mentor.employeeId,
    departmentId: mentor.departmentId,
    departmentName: mentor.department?.name,
    changedFields: result.changes.changedFields,
    previousValues: result.changes.previousValues,
    newValues: result.changes.newValues,
    updatedAt: new Date().toISOString(),
  });

  res.json({ success: true, data: mentor });
});

export const toggleFacultyStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const result = await adminService.updateFaculty(id, { isActive: Boolean(isActive) });
  const mentor = result.mentor;

  await logAudit(req, isActive ? "ADMIN_RESTORE_FACULTY" : "ADMIN_DEACTIVATE_FACULTY", "Mentor", id, {
    actorEmail: req.user?.email,
    actorRole: req.user?.role,
    mentorName: mentor.fullName,
    isActive,
    updatedAt: new Date().toISOString(),
  });

  res.json({ success: true, data: mentor });
});

export const listHODs = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.listHODs();
  res.json({ success: true, data });
});

export const getHODById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await adminService.getHODById(id);
  res.json({ success: true, data });
});

export const updateHOD = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await adminService.updateHOD(id, req.body);
  const hod = result.mentor;

  await logAudit(req, "ADMIN_EDIT_HOD", "HOD", id, {
    actorEmail: req.user?.email,
    actorRole: req.user?.role,
    hodName: hod.fullName,
    employeeId: hod.employeeId,
    departmentId: hod.departmentId,
    changedFields: result.changes.changedFields,
    previousValues: result.changes.previousValues,
    newValues: result.changes.newValues,
    updatedAt: new Date().toISOString(),
  });

  res.json({ success: true, data: hod });
});

export const assignHOD = asyncHandler(async (req: Request, res: Response) => {
  const { departmentId, mentorId } = req.body;
  const result = await adminService.assignHOD(departmentId, mentorId);

  await logAudit(req, "ADMIN_ASSIGN_HOD", "Department", departmentId, {
    mentorId,
  });

  res.json({ success: true, data: result });
});

export const listDepartments = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.listDepartments();
  res.json({ success: true, data });
});

export const getDepartmentById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await adminService.getDepartmentById(id);
  res.json({ success: true, data });
});

export const createDepartment = asyncHandler(async (req: Request, res: Response) => {
  const { name, code } = req.body;
  const department = await adminService.createDepartment({ name, code });

  await logAudit(req, "ADMIN_CREATE_DEPARTMENT", "Department", department.id, {
    name: department.name,
    code: department.code,
  });

  res.status(201).json({ success: true, data: department });
});

export const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, code } = req.body;
  const result = await adminService.updateDepartment(id, { name, code });
  const department = result.department;

  await logAudit(req, "ADMIN_EDIT_DEPARTMENT", "Department", id, {
    actorEmail: req.user?.email,
    actorRole: req.user?.role,
    departmentName: department.name,
    departmentCode: department.code,
    changedFields: result.changes.changedFields,
    previousValues: result.changes.previousValues,
    newValues: result.changes.newValues,
    updatedAt: new Date().toISOString(),
  });

  res.json({ success: true, data: department });
});

export const listPrograms = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.listPrograms();
  res.json({ success: true, data });
});

export const updateProgram = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await adminService.updateProgram(id, req.body);
  const prog = (result.program || {}) as any;

  await logAudit(req, "ADMIN_EDIT_PROGRAM", "Program", id, {
    actorEmail: req.user?.email,
    actorRole: req.user?.role,
    programCode: prog.code || id,
    programName: prog.name,
    changedFields: result.changes.changedFields,
    previousValues: result.changes.previousValues,
    newValues: result.changes.newValues,
    updatedAt: new Date().toISOString(),
  });

  res.json({ success: true, data: result.program });
});

export const listClasses = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.listClasses();
  res.json({ success: true, data });
});

export const updateClass = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await adminService.updateClass(id, req.body);
  const cls = (result.classItem || {}) as any;

  await logAudit(req, "ADMIN_EDIT_CLASS", "Class", id, {
    actorEmail: req.user?.email,
    actorRole: req.user?.role,
    year: cls.year,
    sec: cls.sec,
    dept: cls.dept,
    changedFields: result.changes.changedFields,
    previousValues: result.changes.previousValues,
    newValues: result.changes.newValues,
    updatedAt: new Date().toISOString(),
  });

  res.json({ success: true, data: result.classItem });
});

export const listAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const { search, entity, action, page, pageSize } = req.query;
  const data = await adminService.listAuditLogs({
    search: search as string,
    entity: entity as string,
    action: action as string,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
  });
  res.json({ success: true, data });
});

export const getSystemSettings = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getSystemSettings();
  res.json({ success: true, data });
});

export const updateSystemSettings = asyncHandler(async (req: Request, res: Response) => {
  const updated = await adminService.updateSystemSettings(req.body);

  await logAudit(req, "ADMIN_UPDATE_SYSTEM_SETTINGS", "SystemSettings", "GLOBAL", req.body);

  res.json({ success: true, data: updated });
});

export const batchAssignMentee = asyncHandler(async (req: Request, res: Response) => {
  const { studentIds, mentorId } = req.body;
  const result = await adminService.batchAssignMentee(studentIds, mentorId);

  await logAudit(req, "ADMIN_BATCH_ASSIGN_MENTEE", "Mentor", mentorId, {
    studentCount: studentIds.length,
    studentIds,
  });

  res.json({ success: true, data: result });
});
