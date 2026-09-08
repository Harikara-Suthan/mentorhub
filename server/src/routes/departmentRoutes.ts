import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../config/prisma";

const router = Router();
router.use(authenticate);

// Lightweight lookup endpoints used by frontend dropdowns.
router.get("/", asyncHandler(async (_req, res) => {
  const departments = await prisma.department.findMany({ orderBy: { name: "asc" } });
  res.json({ success: true, data: departments });
}));

router.get("/mentors/all", asyncHandler(async (req, res) => {
  const user = req.user!;
  
  let where: any = {};
  let hodDepartmentId: string | null = null;
  
  if (user.role === "HOD" || user.role === "MENTOR") {
    const currentUserMentor = await prisma.mentor.findUnique({ where: { userId: user.userId } });
    if (currentUserMentor) {
      hodDepartmentId = currentUserMentor.departmentId;
      where = {
        OR: [
          { departmentId: currentUserMentor.departmentId },
          { students: { some: { departmentId: currentUserMentor.departmentId } } }
        ]
      };
    }
  } else if (user.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (student) {
      where = {
        OR: [
          { departmentId: student.departmentId },
          { students: { some: { id: student.id } } }
        ]
      };
    }
  }

  const mentors = await prisma.mentor.findMany({
    where,
    select: { id: true, fullName: true, departmentId: true, employeeId: true, department: true },
    orderBy: { fullName: "asc" },
  });
  
  // Transform to add cross-department flags
  const transformed = mentors.map(m => {
    let isCrossDepartment = false;
    let crossDepartmentLabel = "";
    
    if (hodDepartmentId && m.departmentId !== hodDepartmentId) {
       isCrossDepartment = true;
       // Assuming the HOD's department is known in the frontend, but we can pass a label.
       // E.g. "CSE Faculty — Teaching AI & DS"
       crossDepartmentLabel = `${m.department?.name || 'Other'} Faculty - Cross-Teaching`;
    }
    
    return {
      ...m,
      isCrossDepartment,
      crossDepartmentLabel
    };
  });

  res.json({ success: true, data: transformed });
}));

export default router;
