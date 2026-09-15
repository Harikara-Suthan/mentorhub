import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as dashboardService from "../services/dashboardService";

export const adminDashboard = asyncHandler(async (req: Request, res: Response) => {
  const data = await dashboardService.getAdminDashboard(req.user!);
  res.json({ success: true, data });
});

export const mentorDashboard = asyncHandler(async (req: Request, res: Response) => {
  const data = await dashboardService.getMentorDashboard(req.user!);
  res.json({ success: true, data });
});

export const hodDashboard = asyncHandler(async (req: Request, res: Response) => {
  const { departmentId, year, section, mentorId } = req.query;
  const data = await dashboardService.getHodDashboard(req.user!, {
    departmentId: departmentId as string,
    year: year as string,
    section: section as string,
    mentorId: mentorId as string,
  });
  res.json({ success: true, data });
});

export const studentDashboard = asyncHandler(async (req: Request, res: Response) => {
  const data = await dashboardService.getStudentDashboard(req.user!);
  res.json({ success: true, data });
});
