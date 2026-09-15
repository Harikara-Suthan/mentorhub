import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { Role } from "../config/prisma";
import * as adminController from "../controllers/adminController";

const router = Router();

// Universal security boundary: ALL admin routes require authentication and strictly ADMIN role
router.use(authenticate);
router.use(authorize(Role.ADMIN));

// Admin Dashboard Overview (Institution-wide real PostgreSQL metrics)
router.get("/dashboard", adminController.getDashboard);

// User Management (Full CRUD, activation, deactivation, restore)
router.get("/users", adminController.listUsers);
router.post("/users", adminController.createUser);
router.patch("/users/:id", adminController.updateUser);
router.post("/users/:id/status", adminController.toggleUserStatus);

// Faculty / Mentor Directory & Management
router.get("/faculty", adminController.listFaculty);
router.get("/faculty/:id", adminController.getFacultyById);
router.post("/faculty", adminController.createFaculty);
router.put("/faculty/:id", adminController.updateFaculty);
router.patch("/faculty/:id", adminController.updateFaculty);
router.post("/faculty/:id/status", adminController.toggleFacultyStatus);

// HOD Administration
router.get("/hods", adminController.listHODs);
router.get("/hods/:id", adminController.getHODById);
router.put("/hods/:id", adminController.updateHOD);
router.patch("/hods/:id", adminController.updateHOD);
router.post("/hods/assign", adminController.assignHOD);

// Academic Departments
router.get("/departments", adminController.listDepartments);
router.get("/departments/:id", adminController.getDepartmentById);
router.post("/departments", adminController.createDepartment);
router.put("/departments/:id", adminController.updateDepartment);
router.patch("/departments/:id", adminController.updateDepartment);

// Programs & Classes Management
router.get("/programs", adminController.listPrograms);
router.put("/programs/:id", adminController.updateProgram);
router.patch("/programs/:id", adminController.updateProgram);
router.get("/classes", adminController.listClasses);
router.put("/classes/:id", adminController.updateClass);
router.patch("/classes/:id", adminController.updateClass);

// Audit & Security Ledger
router.get("/audit-logs", adminController.listAuditLogs);

// Institutional Configuration & Rule Settings
router.get("/system-settings", adminController.getSystemSettings);
router.put("/system-settings", adminController.updateSystemSettings);

// Student Cohort Operations
router.post("/students/batch-assign-mentor", adminController.batchAssignMentee);

export default router;
