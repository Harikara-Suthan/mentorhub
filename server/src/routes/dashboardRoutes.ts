import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import * as dashboardController from "../controllers/dashboardController";

const router = Router();
router.use(authenticate);

router.get("/admin", authorize("ADMIN"), dashboardController.adminDashboard);
router.get("/mentor", authorize("MENTOR"), dashboardController.mentorDashboard);
router.get("/hod", authorize("HOD"), dashboardController.hodDashboard);
router.get("/student", authorize("STUDENT"), dashboardController.studentDashboard);

export default router;
