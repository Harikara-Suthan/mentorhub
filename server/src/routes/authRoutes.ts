import { Router } from "express";
import * as authController from "../controllers/authController";
import { authenticate, authorize } from "../middleware/auth";
import { Role } from "../config/prisma";

const router = Router();

router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/users", authenticate, authorize(Role.ADMIN), authController.createUser);
router.post("/register", authController.register);
router.get("/me", authenticate, authController.me);
router.put("/profile", authenticate, authController.updateProfile);
router.post("/change-password", authenticate, authController.changePassword);
router.get("/staff", authenticate, authController.listStaff);
router.put("/staff/:id", authenticate, authController.updateStaff);

// Google OAuth Login
router.get("/google/url", authController.googleUrl);
router.get("/google/callback", authController.googleCallback);
router.post("/firebase-google", authController.firebaseGoogleLogin);

export default router;
