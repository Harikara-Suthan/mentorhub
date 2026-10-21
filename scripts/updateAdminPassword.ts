import { prisma } from "../server/src/config/prisma";
import { hashPassword, comparePassword } from "../server/src/utils/password";

async function main() {
  const email = "admin@mentorhub.test";
  const newPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (!newPassword || newPassword.trim().length === 0) {
    console.error("ERROR: ADMIN_INITIAL_PASSWORD environment variable is not provided.");
    process.exit(1);
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingAdmin) {
    console.error(`ERROR: Admin account with email ${email} not found in PostgreSQL.`);
    process.exit(1);
  }

  if (existingAdmin.role !== "ADMIN") {
    console.error(`ERROR: User ${email} does not have role ADMIN (found: ${existingAdmin.role}).`);
    process.exit(1);
  }

  const newHash = await hashPassword(newPassword.trim());

  await prisma.user.update({
    where: { email },
    data: {
      passwordHash: newHash,
      isActive: true,
    },
  });

  // Verify that the updated password successfully verifies with comparePassword
  const updatedAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (!updatedAdmin) {
    console.error("ERROR: Verification query failed.");
    process.exit(1);
  }

  const isValid = await comparePassword(newPassword.trim(), updatedAdmin.passwordHash);
  if (!isValid) {
    console.error("ERROR: Password comparison verification failed.");
    process.exit(1);
  }

  console.log("SUCCESS: Admin password updated and verified in PostgreSQL.");
}

main()
  .catch((err) => {
    console.error("Unexpected error:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
