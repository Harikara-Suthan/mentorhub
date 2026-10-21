import { prisma } from "../config/prisma";
import { hashPassword } from "../utils/password";

export async function syncAdminAccountPassword() {
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (!adminPassword || adminPassword.trim().length === 0) {
    return;
  }

  const email = "admin@mentorhub.test";

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin && existingAdmin.role === "ADMIN") {
      const passwordHash = await hashPassword(adminPassword.trim());
      await prisma.user.update({
        where: { email },
        data: {
          passwordHash,
          isActive: true,
        },
      });
      console.log(`[Admin Security] Successfully synced password for ${email} in PostgreSQL.`);
    }
  } catch (err: any) {
    console.warn(`[Admin Security] Notice syncing admin password: ${err?.message}`);
  }
}
