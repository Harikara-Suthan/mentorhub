import { prisma } from "../config/prisma";

/**
 * Cleans department/program code to a canonical uppercase alphanumeric representation.
 * Preserves the actual database department configuration (e.g., AIDS, CSE, AIML, CYBER, SH, ECE, MECH, IT).
 */
export function cleanDepartmentCode(rawCodeOrName?: string | null): string {
  if (!rawCodeOrName) return "";
  const cleaned = rawCodeOrName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (cleaned === "AID") return "AIDS";
  if (cleaned === "AIANDML" || cleaned === "AI&ML") return "AIML";
  return cleaned;
}

/**
 * Builds a formatted Student Roll Number:
 * Format: YY + DEPARTMENT_CODE + NN (e.g., 24AIDS01, 24CSE05)
 * - YY: College joining / admission year last 2 digits
 * - DEPARTMENT_CODE: Uppercase department code
 * - NN: Student sequence (minimum 2 digits, zero-padded string)
 */
export function formatRollNumber(
  admissionYear: number | string,
  departmentCode: string,
  sequence: number
): string {
  const yy = String(admissionYear).slice(-2);
  const dept = cleanDepartmentCode(departmentCode);
  const nn = String(sequence).padStart(2, "0");
  return `${yy}${dept}${nn}`;
}

/**
 * Validates whether a given string adheres to the standard Roll Number structure (YY + DEPT + NN).
 */
export function isValidRollNumber(rollNumber?: string | null): boolean {
  if (!rollNumber || typeof rollNumber !== "string") return false;
  const trimmed = rollNumber.trim().toUpperCase();
  // Must start with 2 digits (YY), followed by alphanumeric department code (1+ chars), ending with at least 2 digits (NN)
  const regex = /^\d{2}[A-Z0-9]+\d{2,}$/;
  return regex.test(trimmed);
}

/**
 * Automatically generates a unique, sequential Roll Number for a new student based on:
 * Admission Year + Department Code + Next Available Sequence Number.
 */
export async function generateNextRollNumber(
  departmentId: string,
  admissionYear: number
): Promise<string> {
  const dept = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!dept) {
    throw new Error(`Department with ID ${departmentId} not found`);
  }

  const cleanDept = cleanDepartmentCode(dept.code || dept.name);
  if (!cleanDept) {
    throw new Error(`Invalid department code for department ${dept.name}`);
  }

  const yy = String(admissionYear).slice(-2);
  const prefix = `${yy}${cleanDept}`;

  // Find all existing students with roll numbers matching this prefix
  const existingStudents = await prisma.student.findMany({
    where: {
      rollNumber: {
        startsWith: prefix,
        mode: "insensitive",
      },
    },
    select: { rollNumber: true },
  });

  let maxSeq = 0;
  for (const s of existingStudents) {
    if (!s.rollNumber) continue;
    const match = s.rollNumber.trim().toUpperCase().match(new RegExp(`^${prefix}(\\d+)$`));
    if (match && match[1]) {
      const parsedSeq = parseInt(match[1], 10);
      if (!isNaN(parsedSeq) && parsedSeq > maxSeq) {
        maxSeq = parsedSeq;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return `${prefix}${String(nextSeq).padStart(2, "0")}`;
}
