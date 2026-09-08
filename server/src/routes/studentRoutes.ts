import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import * as studentController from "../controllers/studentController";

const router = Router();
router.use(authenticate);

router.get("/me", studentController.getMe);
router.get("/", studentController.list);
router.get("/:id", studentController.getById);
router.get("/:id/fees", studentController.getFees);
router.post("/:id/fees", authorize("HOD", "ADMIN"), studentController.addFee);
router.put("/:id/fees/:feeId", authorize("HOD", "ADMIN"), studentController.updateFee);
router.delete("/:id/fees/:feeId", authorize("HOD", "ADMIN"), studentController.deleteFee);
router.get("/:id/financial", studentController.getFinancial);
router.post("/", authorize("MENTOR", "HOD"), studentController.create);
router.put("/:id", studentController.update);
router.delete("/:id", authorize("MENTOR", "HOD"), studentController.remove);

export default router;
